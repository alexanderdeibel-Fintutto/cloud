import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export type BatchOperationType =
  | 'delete' | 'archive' | 'export' | 'categorize' | 'tag'
  | 'assign' | 'status' | 'approve' | 'reject' | 'send'
  | 'mark-paid' | 'mark-unpaid' | 'reconcile' | 'book';

export interface BatchOperation {
  type: BatchOperationType;
  label: string;
  labelEn: string;
  icon: string;
  requiresConfirmation: boolean;
  confirmMessage?: string;
  allowedModules: string[];
}

export interface BatchResult {
  success: number;
  failed: number;
  errors: { id: string; error: string }[];
  duration: number;
}

const BATCH_OPERATIONS: BatchOperation[] = [
  {
    type: 'delete',
    label: 'Löschen',
    labelEn: 'Delete',
    icon: 'Trash2',
    requiresConfirmation: true,
    confirmMessage: 'Möchten Sie die ausgewählten Einträge wirklich löschen?',
    allowedModules: ['invoices', 'receipts', 'contacts', 'bookings'],
  },
  {
    type: 'archive',
    label: 'Archivieren',
    labelEn: 'Archive',
    icon: 'Archive',
    requiresConfirmation: false,
    allowedModules: ['invoices', 'receipts', 'documents'],
  },
  {
    type: 'export',
    label: 'Exportieren',
    labelEn: 'Export',
    icon: 'Download',
    requiresConfirmation: false,
    allowedModules: ['invoices', 'receipts', 'contacts', 'bookings', 'reports'],
  },
  {
    type: 'categorize',
    label: 'Kategorisieren',
    labelEn: 'Categorize',
    icon: 'Tag',
    requiresConfirmation: false,
    allowedModules: ['receipts', 'bookings', 'transactions'],
  },
  {
    type: 'tag',
    label: 'Tags hinzufügen',
    labelEn: 'Add Tags',
    icon: 'Tags',
    requiresConfirmation: false,
    allowedModules: ['invoices', 'receipts', 'contacts'],
  },
  {
    type: 'assign',
    label: 'Zuweisen',
    labelEn: 'Assign',
    icon: 'UserPlus',
    requiresConfirmation: false,
    allowedModules: ['invoices', 'receipts', 'tasks'],
  },
  {
    type: 'status',
    label: 'Status ändern',
    labelEn: 'Change Status',
    icon: 'RefreshCw',
    requiresConfirmation: false,
    allowedModules: ['invoices', 'receipts', 'tasks'],
  },
  {
    type: 'approve',
    label: 'Genehmigen',
    labelEn: 'Approve',
    icon: 'CheckCircle',
    requiresConfirmation: false,
    allowedModules: ['invoices', 'receipts', 'bookings'],
  },
  {
    type: 'reject',
    label: 'Ablehnen',
    labelEn: 'Reject',
    icon: 'XCircle',
    requiresConfirmation: true,
    confirmMessage: 'Möchten Sie die ausgewählten Einträge wirklich ablehnen?',
    allowedModules: ['invoices', 'receipts', 'bookings'],
  },
  {
    type: 'send',
    label: 'Versenden',
    labelEn: 'Send',
    icon: 'Send',
    requiresConfirmation: true,
    confirmMessage: 'Möchten Sie die ausgewählten Rechnungen versenden?',
    allowedModules: ['invoices'],
  },
  {
    type: 'mark-paid',
    label: 'Als bezahlt markieren',
    labelEn: 'Mark as Paid',
    icon: 'CheckSquare',
    requiresConfirmation: false,
    allowedModules: ['invoices'],
  },
  {
    type: 'mark-unpaid',
    label: 'Als unbezahlt markieren',
    labelEn: 'Mark as Unpaid',
    icon: 'Square',
    requiresConfirmation: false,
    allowedModules: ['invoices'],
  },
  {
    type: 'reconcile',
    label: 'Abstimmen',
    labelEn: 'Reconcile',
    icon: 'Link',
    requiresConfirmation: false,
    allowedModules: ['transactions', 'bank'],
  },
  {
    type: 'book',
    label: 'Verbuchen',
    labelEn: 'Book',
    icon: 'BookOpen',
    requiresConfirmation: true,
    confirmMessage: 'Möchten Sie die ausgewählten Belege verbuchen?',
    allowedModules: ['receipts'],
  },
];

export function useBatchOperations<T extends { id: string }>(module: string) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<BatchResult | null>(null);

  // Get available operations for this module
  const availableOperations = BATCH_OPERATIONS.filter(op =>
    op.allowedModules.includes(module)
  );

  // Toggle item selection
  const toggleItem = useCallback((id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Select all items
  const selectAll = useCallback((items: T[]) => {
    setSelectedItems(new Set(items.map(item => item.id)));
  }, []);

  // Deselect all items
  const deselectAll = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  // Toggle select all
  const toggleSelectAll = useCallback((items: T[]) => {
    if (selectedItems.size === items.length) {
      deselectAll();
    } else {
      selectAll(items);
    }
  }, [selectedItems.size, selectAll, deselectAll]);

  // Check if item is selected
  const isSelected = useCallback((id: string) => {
    return selectedItems.has(id);
  }, [selectedItems]);

  // Execute batch operation
  const executeBatch = useCallback(async (
    operation: BatchOperationType,
    handler: (ids: string[]) => Promise<{ success: boolean; error?: string }[]>,
    options?: { additionalData?: Record<string, unknown> }
  ): Promise<BatchResult> => {
    if (selectedItems.size === 0) {
      toast.error('Keine Einträge ausgewählt');
      return { success: 0, failed: 0, errors: [], duration: 0 };
    }

    setIsProcessing(true);
    const startTime = Date.now();
    const ids = Array.from(selectedItems);

    try {
      const results = await handler(ids);

      const successCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;
      const errors = results
        .map((r, i) => ({ id: ids[i], error: r.error || '' }))
        .filter(e => e.error);

      const result: BatchResult = {
        success: successCount,
        failed: failedCount,
        errors,
        duration: Date.now() - startTime,
      };

      setLastResult(result);

      if (successCount > 0) {
        toast.success(`${successCount} Einträge erfolgreich verarbeitet`);
      }
      if (failedCount > 0) {
        toast.error(`${failedCount} Einträge fehlgeschlagen`);
      }

      // Clear selection after successful operation
      if (failedCount === 0) {
        deselectAll();
      }

      return result;
    } catch (error) {
      const result: BatchResult = {
        success: 0,
        failed: ids.length,
        errors: [{ id: 'batch', error: (error as Error).message }],
        duration: Date.now() - startTime,
      };
      setLastResult(result);
      toast.error('Batch-Operation fehlgeschlagen');
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedItems, deselectAll]);

  // Batch delete
  const batchDelete = useCallback(async (
    deleteHandler: (id: string) => Promise<boolean>
  ) => {
    return executeBatch('delete', async (ids) => {
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            const success = await deleteHandler(id);
            return { success };
          } catch (error) {
            return { success: false, error: (error as Error).message };
          }
        })
      );
      return results;
    });
  }, [executeBatch]);

  // Batch update status
  const batchUpdateStatus = useCallback(async (
    status: string,
    updateHandler: (id: string, status: string) => Promise<boolean>
  ) => {
    return executeBatch('status', async (ids) => {
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            const success = await updateHandler(id, status);
            return { success };
          } catch (error) {
            return { success: false, error: (error as Error).message };
          }
        })
      );
      return results;
    });
  }, [executeBatch]);

  // Batch export
  const batchExport = useCallback(async (
    items: T[],
    format: 'csv' | 'json' | 'pdf',
    filename: string
  ) => {
    const selectedData = items.filter(item => selectedItems.has(item.id));

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(selectedData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const headers = Object.keys(selectedData[0] || {});
      const rows = selectedData.map(item =>
        headers.map(h => {
          const val = (item as Record<string, unknown>)[h];
          return typeof val === 'string' ? `"${val}"` : String(val ?? '');
        }).join(',')
      );
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    toast.success(`${selectedData.length} Einträge exportiert`);
    return { success: selectedData.length, failed: 0, errors: [], duration: 0 };
  }, [selectedItems]);

  return {
    selectedItems,
    selectedCount: selectedItems.size,
    isProcessing,
    lastResult,
    availableOperations,
    toggleItem,
    selectAll,
    deselectAll,
    toggleSelectAll,
    isSelected,
    executeBatch,
    batchDelete,
    batchUpdateStatus,
    batchExport,
    operations: BATCH_OPERATIONS,
  };
}
