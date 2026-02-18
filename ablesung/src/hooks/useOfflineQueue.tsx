import { useState, useEffect, useCallback } from 'react';

interface QueuedReading {
  id: string;
  meter_id: string;
  reading_value: number;
  reading_date: string;
  source: 'manual' | 'ocr';
  queued_at: string;
  synced: boolean;
  error?: string;
}

const QUEUE_KEY = 'fintutto_offline_queue';

function loadQueue(): QueuedReading[] {
  try {
    const data = localStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveQueue(queue: QueuedReading[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function useOfflineQueue() {
  const [queue, setQueue] = useState<QueuedReading[]>(loadQueue);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Add reading to queue
  const addToQueue = useCallback((data: {
    meter_id: string;
    reading_value: number;
    reading_date?: string;
    source?: 'manual' | 'ocr';
  }) => {
    const entry: QueuedReading = {
      id: crypto.randomUUID(),
      meter_id: data.meter_id,
      reading_value: data.reading_value,
      reading_date: data.reading_date || new Date().toISOString().split('T')[0],
      source: data.source || 'manual',
      queued_at: new Date().toISOString(),
      synced: false,
    };
    const updated = [...queue, entry];
    setQueue(updated);
    saveQueue(updated);
    return entry;
  }, [queue]);

  // Remove from queue
  const removeFromQueue = useCallback((id: string) => {
    const updated = queue.filter(q => q.id !== id);
    setQueue(updated);
    saveQueue(updated);
  }, [queue]);

  // Mark as synced
  const markSynced = useCallback((id: string) => {
    const updated = queue.map(q => q.id === id ? { ...q, synced: true } : q);
    setQueue(updated);
    saveQueue(updated);
  }, [queue]);

  // Mark as error
  const markError = useCallback((id: string, error: string) => {
    const updated = queue.map(q => q.id === id ? { ...q, error } : q);
    setQueue(updated);
    saveQueue(updated);
  }, [queue]);

  // Clear synced items
  const clearSynced = useCallback(() => {
    const updated = queue.filter(q => !q.synced);
    setQueue(updated);
    saveQueue(updated);
  }, [queue]);

  const pendingCount = queue.filter(q => !q.synced).length;
  const syncedCount = queue.filter(q => q.synced).length;
  const errorCount = queue.filter(q => q.error && !q.synced).length;

  return {
    queue,
    isOnline,
    syncing,
    setSyncing,
    addToQueue,
    removeFromQueue,
    markSynced,
    markError,
    clearSynced,
    pendingCount,
    syncedCount,
    errorCount,
  };
}
