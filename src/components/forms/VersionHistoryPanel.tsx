import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  History, Download, Eye, GitCompare,
  Printer, Send, PenTool, X, ChevronDown, ChevronUp
} from 'lucide-react'
import { FormVersion } from '@/contexts/FormContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface VersionHistoryPanelProps {
  versions: FormVersion[]
  onClose: () => void
  onLoadVersion: (version: FormVersion) => void
}

const STATUS_ICONS = {
  draft: History,
  printed: Printer,
  sent: Send,
  signed: PenTool,
}

const STATUS_LABELS = {
  draft: 'Entwurf',
  printed: 'Gedruckt',
  sent: 'Gesendet',
  signed: 'Unterschrieben',
}

const STATUS_COLORS = {
  draft: 'text-gray-500 bg-gray-100',
  printed: 'text-blue-600 bg-blue-100',
  sent: 'text-green-600 bg-green-100',
  signed: 'text-purple-600 bg-purple-100',
}

export default function VersionHistoryPanel({
  versions,
  onClose,
  onLoadVersion,
}: VersionHistoryPanelProps) {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([])

  const toggleExpand = (versionId: string) => {
    setExpandedVersion(expandedVersion === versionId ? null : versionId)
  }

  const toggleCompareSelect = (versionId: string) => {
    if (selectedForCompare.includes(versionId)) {
      setSelectedForCompare(selectedForCompare.filter(id => id !== versionId))
    } else if (selectedForCompare.length < 2) {
      setSelectedForCompare([...selectedForCompare, versionId])
    }
  }

  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber)

  if (versions.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="w-5 h-5" />
            Versionshistorie
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Versionen vorhanden.</p>
            <p className="text-sm">Drucken oder senden Sie das Dokument, um eine Version zu erstellen.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="w-5 h-5" />
          Versionshistorie ({versions.length})
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant={compareMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setCompareMode(!compareMode)
              setSelectedForCompare([])
            }}
          >
            <GitCompare className="w-4 h-4 mr-1" />
            Vergleichen
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {compareMode && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            Waehlen Sie 2 Versionen zum Vergleichen aus ({selectedForCompare.length}/2)
            {selectedForCompare.length === 2 && (
              <Button size="sm" className="ml-4">
                Vergleich anzeigen
              </Button>
            )}
          </div>
        )}

        <div className="space-y-3">
          {sortedVersions.map((version) => {
            const StatusIcon = STATUS_ICONS[version.status]
            const isExpanded = expandedVersion === version.id
            const isSelected = selectedForCompare.includes(version.id)

            return (
              <motion.div
                key={version.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-lg overflow-hidden ${
                  isSelected ? 'border-fintutto-primary ring-2 ring-fintutto-primary/20' : ''
                }`}
              >
                <div
                  className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 ${
                    isExpanded ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => compareMode ? toggleCompareSelect(version.id) : toggleExpand(version.id)}
                >
                  <div className="flex items-center gap-4">
                    {compareMode && (
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'bg-fintutto-primary border-fintutto-primary text-white' : 'border-gray-300'
                      }`}>
                        {isSelected && <span className="text-xs font-bold">{selectedForCompare.indexOf(version.id) + 1}</span>}
                      </div>
                    )}

                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${STATUS_COLORS[version.status]}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="font-medium">
                        Version {version.versionNumber}
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[version.status]}`}>
                          {STATUS_LABELS[version.status]}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(version.createdAt).toLocaleString('de-DE')}
                        {version.sentTo && (
                          <span className="ml-2">
                            • Gesendet an: {version.sentTo}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!compareMode && (
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>

                {isExpanded && !compareMode && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t bg-white p-4"
                  >
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onLoadVersion(version)
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Diese Version laden
                      </Button>

                      {version.pdfUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(version.pdfUrl, '_blank')
                          }}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          PDF herunterladen
                        </Button>
                      )}
                    </div>

                    {/* Version Data Preview */}
                    <div className="bg-gray-50 rounded-lg p-4 text-sm">
                      <h4 className="font-medium mb-2">Gespeicherte Daten</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(version.data as Record<string, unknown>)
                          .filter(([key]) => !key.startsWith('_') && key !== 'signature')
                          .slice(0, 6)
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between text-gray-600">
                              <span>{key}:</span>
                              <span className="font-medium">{String(value).substring(0, 30)}</span>
                            </div>
                          ))}
                      </div>
                      {Object.keys(version.data as object).length > 6 && (
                        <p className="text-gray-400 text-xs mt-2">
                          + {Object.keys(version.data as object).length - 6} weitere Felder
                        </p>
                      )}
                    </div>

                    {version.signatureData && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <PenTool className="w-4 h-4" />
                          Unterschrift
                        </h4>
                        <img
                          src={version.signatureData}
                          alt="Unterschrift"
                          className="max-h-16 border rounded"
                        />
                        {version.signedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Unterschrieben am {new Date(version.signedAt).toLocaleString('de-DE')}
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
