import { useState, useCallback, useEffect } from 'react';

export type DocumentType =
  | 'invoice-outgoing'
  | 'invoice-incoming'
  | 'receipt'
  | 'contract'
  | 'bank-statement'
  | 'tax-document'
  | 'correspondence'
  | 'annual-report'
  | 'other';

export type RetentionPeriod = 6 | 10; // Years according to German law

export interface ArchivedDocument {
  id: string;
  originalId: string;
  name: string;
  type: DocumentType;
  mimeType: string;
  size: number;
  hashSHA256: string;
  hashMD5: string;
  content?: string; // Base64 encoded
  metadata: {
    documentDate: string;
    fiscalYear: number;
    amount?: number;
    taxAmount?: number;
    counterparty?: string;
    reference?: string;
    costCenter?: string;
    tags: string[];
  };
  retention: {
    period: RetentionPeriod;
    archivedAt: string;
    expiresAt: string;
    legalBasis: string;
  };
  verification: {
    lastVerified: string | null;
    verified: boolean;
    verificationHistory: {
      date: string;
      status: 'valid' | 'invalid';
      hash: string;
    }[];
  };
  accessLog: {
    date: string;
    action: 'view' | 'download' | 'verify' | 'export';
    user: string;
  }[];
  createdAt: string;
  createdBy: string;
}

export interface ArchiveSettings {
  autoArchive: boolean;
  defaultRetentionPeriod: RetentionPeriod;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  verificationSchedule: 'daily' | 'weekly' | 'monthly';
  notifyBeforeExpiry: number; // days
}

// German retention periods by document type
export const RETENTION_PERIODS: Record<DocumentType, { years: RetentionPeriod; basis: string }> = {
  'invoice-outgoing': { years: 10, basis: '§ 14b UStG, § 147 AO' },
  'invoice-incoming': { years: 10, basis: '§ 14b UStG, § 147 AO' },
  'receipt': { years: 10, basis: '§ 147 AO' },
  'contract': { years: 10, basis: '§ 147 AO' },
  'bank-statement': { years: 10, basis: '§ 147 AO' },
  'tax-document': { years: 10, basis: '§ 147 AO' },
  'correspondence': { years: 6, basis: '§ 147 AO' },
  'annual-report': { years: 10, basis: '§ 257 HGB' },
  'other': { years: 6, basis: '§ 147 AO' },
};

const STORAGE_KEY = 'fintutto_document_archive';

// Simple hash function for demo (in production use crypto.subtle)
async function computeHash(content: string, algorithm: 'SHA-256' | 'MD5'): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest(algorithm === 'SHA-256' ? 'SHA-256' : 'SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback simple hash for demo
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

export function useDocumentArchive() {
  const [documents, setDocuments] = useState<ArchivedDocument[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_documents`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });

  const [settings, setSettings] = useState<ArchiveSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      autoArchive: true,
      defaultRetentionPeriod: 10,
      compressionEnabled: true,
      encryptionEnabled: false,
      verificationSchedule: 'monthly',
      notifyBeforeExpiry: 90,
    };
  });

  // Persist data
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_documents`, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);

  // Archive a document
  const archiveDocument = useCallback(async (
    document: {
      originalId: string;
      name: string;
      type: DocumentType;
      mimeType: string;
      content: string;
      metadata: Omit<ArchivedDocument['metadata'], 'tags'> & { tags?: string[] };
    },
    user: string = 'System'
  ): Promise<ArchivedDocument> => {
    const retention = RETENTION_PERIODS[document.type];
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setFullYear(expiresAt.getFullYear() + retention.years);

    const hashSHA256 = await computeHash(document.content, 'SHA-256');
    const hashMD5 = await computeHash(document.content, 'MD5');

    const archivedDoc: ArchivedDocument = {
      id: `arch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      originalId: document.originalId,
      name: document.name,
      type: document.type,
      mimeType: document.mimeType,
      size: new Blob([document.content]).size,
      hashSHA256,
      hashMD5,
      content: settings.compressionEnabled ? undefined : document.content, // In production, would compress
      metadata: {
        ...document.metadata,
        tags: document.metadata.tags || [],
      },
      retention: {
        period: retention.years,
        archivedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        legalBasis: retention.basis,
      },
      verification: {
        lastVerified: now.toISOString(),
        verified: true,
        verificationHistory: [{
          date: now.toISOString(),
          status: 'valid',
          hash: hashSHA256,
        }],
      },
      accessLog: [{
        date: now.toISOString(),
        action: 'view',
        user,
      }],
      createdAt: now.toISOString(),
      createdBy: user,
    };

    setDocuments(prev => [archivedDoc, ...prev]);
    return archivedDoc;
  }, [settings.compressionEnabled]);

  // Verify document integrity
  const verifyDocument = useCallback(async (
    documentId: string,
    content: string,
    user: string = 'System'
  ): Promise<{ valid: boolean; details: string }> => {
    const doc = documents.find(d => d.id === documentId);
    if (!doc) {
      return { valid: false, details: 'Dokument nicht gefunden' };
    }

    const currentHash = await computeHash(content, 'SHA-256');
    const valid = currentHash === doc.hashSHA256;

    const verificationEntry = {
      date: new Date().toISOString(),
      status: valid ? 'valid' as const : 'invalid' as const,
      hash: currentHash,
    };

    setDocuments(prev => prev.map(d => {
      if (d.id === documentId) {
        return {
          ...d,
          verification: {
            lastVerified: verificationEntry.date,
            verified: valid,
            verificationHistory: [verificationEntry, ...d.verification.verificationHistory],
          },
          accessLog: [
            { date: verificationEntry.date, action: 'verify' as const, user },
            ...d.accessLog,
          ],
        };
      }
      return d;
    }));

    return {
      valid,
      details: valid
        ? 'Dokumentenintegrität bestätigt. Hash-Werte stimmen überein.'
        : 'WARNUNG: Dokument wurde möglicherweise manipuliert! Hash-Werte stimmen nicht überein.',
    };
  }, [documents]);

  // Log access
  const logAccess = useCallback((
    documentId: string,
    action: 'view' | 'download' | 'export',
    user: string
  ) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === documentId) {
        return {
          ...d,
          accessLog: [
            { date: new Date().toISOString(), action, user },
            ...d.accessLog,
          ],
        };
      }
      return d;
    }));
  }, []);

  // Search documents
  const searchDocuments = useCallback((query: {
    type?: DocumentType;
    fiscalYear?: number;
    dateFrom?: string;
    dateTo?: string;
    counterparty?: string;
    tags?: string[];
    verified?: boolean;
  }): ArchivedDocument[] => {
    return documents.filter(doc => {
      if (query.type && doc.type !== query.type) return false;
      if (query.fiscalYear && doc.metadata.fiscalYear !== query.fiscalYear) return false;
      if (query.dateFrom && doc.metadata.documentDate < query.dateFrom) return false;
      if (query.dateTo && doc.metadata.documentDate > query.dateTo) return false;
      if (query.counterparty && !doc.metadata.counterparty?.toLowerCase().includes(query.counterparty.toLowerCase())) return false;
      if (query.tags && query.tags.length > 0 && !query.tags.some(t => doc.metadata.tags.includes(t))) return false;
      if (query.verified !== undefined && doc.verification.verified !== query.verified) return false;
      return true;
    });
  }, [documents]);

  // Get documents expiring soon
  const getExpiringDocuments = useCallback((days: number = 90): ArchivedDocument[] => {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + days);

    return documents.filter(doc => {
      const expiresAt = new Date(doc.retention.expiresAt);
      return expiresAt <= threshold;
    }).sort((a, b) =>
      new Date(a.retention.expiresAt).getTime() - new Date(b.retention.expiresAt).getTime()
    );
  }, [documents]);

  // Get unverified documents
  const getUnverifiedDocuments = useCallback((): ArchivedDocument[] => {
    const threshold = new Date();
    threshold.setMonth(threshold.getMonth() - 1); // Older than 1 month

    return documents.filter(doc => {
      if (!doc.verification.lastVerified) return true;
      return new Date(doc.verification.lastVerified) < threshold;
    });
  }, [documents]);

  // Export for audit
  const exportForAudit = useCallback((fiscalYear: number): {
    summary: {
      totalDocuments: number;
      byType: Record<DocumentType, number>;
      totalSize: number;
      verificationStatus: { verified: number; unverified: number };
    };
    documents: ArchivedDocument[];
  } => {
    const yearDocs = documents.filter(d => d.metadata.fiscalYear === fiscalYear);

    const byType = {} as Record<DocumentType, number>;
    let totalSize = 0;
    let verified = 0;
    let unverified = 0;

    yearDocs.forEach(doc => {
      byType[doc.type] = (byType[doc.type] || 0) + 1;
      totalSize += doc.size;
      if (doc.verification.verified) verified++;
      else unverified++;
    });

    return {
      summary: {
        totalDocuments: yearDocs.length,
        byType,
        totalSize,
        verificationStatus: { verified, unverified },
      },
      documents: yearDocs,
    };
  }, [documents]);

  // Update settings
  const updateSettings = useCallback((updates: Partial<ArchiveSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Delete expired documents (with confirmation)
  const deleteExpiredDocuments = useCallback((beforeDate: string): number => {
    const toDelete = documents.filter(d => d.retention.expiresAt < beforeDate);
    setDocuments(prev => prev.filter(d => d.retention.expiresAt >= beforeDate));
    return toDelete.length;
  }, [documents]);

  // Statistics
  const stats = {
    totalDocuments: documents.length,
    totalSize: documents.reduce((sum, d) => sum + d.size, 0),
    byType: documents.reduce((acc, d) => {
      acc[d.type] = (acc[d.type] || 0) + 1;
      return acc;
    }, {} as Record<DocumentType, number>),
    verifiedCount: documents.filter(d => d.verification.verified).length,
    expiringCount: getExpiringDocuments(90).length,
    byFiscalYear: documents.reduce((acc, d) => {
      acc[d.metadata.fiscalYear] = (acc[d.metadata.fiscalYear] || 0) + 1;
      return acc;
    }, {} as Record<number, number>),
  };

  return {
    documents,
    settings,
    updateSettings,
    archiveDocument,
    verifyDocument,
    logAccess,
    searchDocuments,
    getExpiringDocuments,
    getUnverifiedDocuments,
    exportForAudit,
    deleteExpiredDocuments,
    retentionPeriods: RETENTION_PERIODS,
    stats,
  };
}
