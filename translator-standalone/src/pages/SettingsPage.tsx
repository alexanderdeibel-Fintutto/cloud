import { useState, useEffect } from 'react'
import { Download, Trash2, Wifi, WifiOff, Mic, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useOffline } from '@/context/OfflineContext'
import LanguagePackCard from '@/components/settings/LanguagePackCard'
import StorageIndicator from '@/components/settings/StorageIndicator'
import { getLanguagePairStatus } from '@/lib/offline/model-manager'
import { getCacheStats, clearTranslationCache } from '@/lib/offline/translation-cache'
import { getTTSCacheStats, clearTTSCache } from '@/lib/offline/tts-cache'
import { isWhisperAvailable, preloadWhisper } from '@/lib/offline/stt-engine'
import { checkOfflineSupport, isIOSSafariNotStandalone } from '@/lib/offline/storage-manager'

export default function SettingsPage() {
  const { networkMode, isPersistent, storageUsed, storagePercent, requestPersistence, refreshModels } = useOffline()

  const [languagePairs, setLanguagePairs] = useState<Awaited<ReturnType<typeof getLanguagePairStatus>>>([])
  const [translationCacheCount, setTranslationCacheCount] = useState(0)
  const [ttsCacheCount, setTtsCacheCount] = useState(0)
  const [whisperReady, setWhisperReady] = useState(false)
  const [whisperDownloading, setWhisperDownloading] = useState(false)
  const [whisperProgress, setWhisperProgress] = useState(0)
  const [offlineSupport, setOfflineSupport] = useState<ReturnType<typeof checkOfflineSupport> | null>(null)
  const [showSafariHint, setShowSafariHint] = useState(false)

  useEffect(() => {
    loadData()
    setOfflineSupport(checkOfflineSupport())
    setShowSafariHint(isIOSSafariNotStandalone())
  }, [])

  async function loadData() {
    const [pairs, cacheStats, ttsStats, whisper] = await Promise.all([
      getLanguagePairStatus(),
      getCacheStats(),
      getTTSCacheStats(),
      isWhisperAvailable(),
    ])
    setLanguagePairs(pairs)
    setTranslationCacheCount(cacheStats.entryCount)
    setTtsCacheCount(ttsStats.entryCount)
    setWhisperReady(whisper)
  }

  const handleRefresh = async () => {
    await refreshModels()
    await loadData()
  }

  const handleClearTranslationCache = async () => {
    await clearTranslationCache()
    await loadData()
  }

  const handleClearTTSCache = async () => {
    await clearTTSCache()
    await loadData()
  }

  const handleDownloadWhisper = async () => {
    setWhisperDownloading(true)
    setWhisperProgress(0)
    try {
      await preloadWhisper((pct) => setWhisperProgress(Math.round(pct)))
      setWhisperReady(true)
    } catch (err) {
      console.error('[Settings] Whisper download failed:', err)
    } finally {
      setWhisperDownloading(false)
    }
  }

  // Group language pairs by source language for better display
  const groupedPairs = languagePairs.reduce((acc, pair) => {
    const group = pair.src === 'en' ? 'Englisch →' : `${pair.src.toUpperCase()} →`
    if (!acc[group]) acc[group] = []
    acc[group].push(pair)
    return acc
  }, {} as Record<string, typeof languagePairs>)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Einstellungen</h1>
        <p className="text-muted-foreground text-sm mt-1">Offline-Modus, Sprachpakete und Speicher verwalten</p>
      </div>

      {/* Safari Homescreen Hint */}
      {showSafariHint && (
        <Card className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
          <CardContent className="pt-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Tipp für iOS Safari:</strong> Füge diese App zum Home-Bildschirm hinzu, damit deine
              Offline-Daten nicht nach 7 Tagen gelöscht werden. Tippe auf{' '}
              <span className="inline-block px-1 bg-amber-200/50 rounded">Teilen ↑</span> →{' '}
              <span className="inline-block px-1 bg-amber-200/50 rounded">Zum Home-Bildschirm</span>.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Network Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {networkMode === 'offline' ? <WifiOff className="h-4 w-4 text-destructive" /> : <Wifi className="h-4 w-4 text-emerald-600" />}
            Netzwerk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${
              networkMode === 'online' ? 'bg-emerald-500' :
              networkMode === 'degraded' ? 'bg-amber-500' :
              'bg-destructive'
            }`} />
            <span className="text-sm">
              {networkMode === 'online' ? 'Online — Cloud-Übersetzung aktiv' :
               networkMode === 'degraded' ? 'Instabile Verbindung — Offline-Modus bereit' :
               'Offline — Nur heruntergeladene Sprachen verfügbar'}
            </span>
          </div>
          {offlineSupport && (
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(offlineSupport).map(([key, supported]) => (
                <span
                  key={key}
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    supported ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {key}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Speicher</CardTitle>
        </CardHeader>
        <CardContent>
          <StorageIndicator
            storageUsed={storageUsed}
            storagePercent={storagePercent}
            isPersistent={isPersistent}
            onRequestPersistence={requestPersistence}
          />
        </CardContent>
      </Card>

      {/* Offline Translation Models */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4" />
            Offline-Sprachen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Lade Sprachpakete herunter, um auch ohne Internet übersetzen zu können (~35 MB pro Paar).
          </p>
          {Object.entries(groupedPairs).map(([group, pairs]) => (
            <div key={group}>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">{group}</h4>
              <div className="space-y-2">
                {pairs.map(pair => (
                  <LanguagePackCard
                    key={`${pair.src}-${pair.tgt}`}
                    src={pair.src}
                    tgt={pair.tgt}
                    modelId={pair.modelId}
                    downloaded={pair.downloaded}
                    sizeEstimateMB={pair.sizeEstimateMB}
                    onStatusChange={handleRefresh}
                  />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Offline Speech Recognition */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Offline-Spracheingabe (Whisper)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Whisper ermöglicht Spracherkennung ohne Internet (~40 MB).
            Funktioniert in allen Browsern.
          </p>
          {whisperReady ? (
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Whisper-Modell bereit
            </div>
          ) : whisperDownloading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              <div className="flex-1">
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${whisperProgress}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{whisperProgress}%</span>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={handleDownloadWhisper} className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Whisper herunterladen (~40 MB)
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Cache Management */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Cache verwalten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">Übersetzungs-Cache</div>
              <div className="text-xs text-muted-foreground">{translationCacheCount} Einträge (30 Tage)</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearTranslationCache}
              disabled={translationCacheCount === 0}
            >
              Leeren
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">TTS Audio-Cache</div>
              <div className="text-xs text-muted-foreground">{ttsCacheCount} Audio-Clips</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearTTSCache}
              disabled={ttsCacheCount === 0}
            >
              Leeren
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
