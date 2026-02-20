import { CheckCircle, XCircle, AlertCircle, ArrowRight, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { CheckerResult as CheckerResultType } from '@/contexts/CheckerContext'
import { motion } from 'framer-motion'
import { AffiliateCard, AdSlot, PremiumTeaser } from '@/components/monetization'

interface CheckerResultProps {
  result: CheckerResultType
  checkerType: string
  onGoToForm: () => void
  onDownloadPDF?: () => void
  onStartNew: () => void
}

export default function CheckerResult({
  result,
  checkerType,
  onGoToForm,
  onDownloadPDF,
  onStartNew,
}: CheckerResultProps) {
  const getStatusIcon = () => {
    switch (result.status) {
      case 'positive':
        return <CheckCircle className="w-16 h-16 text-green-500" />
      case 'negative':
        return <XCircle className="w-16 h-16 text-red-500" />
      default:
        return <AlertCircle className="w-16 h-16 text-yellow-500" />
    }
  }

  const getStatusColor = () => {
    switch (result.status) {
      case 'positive':
        return 'result-positive'
      case 'negative':
        return 'result-negative'
      default:
        return 'result-neutral'
    }
  }

  const getStatusText = () => {
    switch (result.status) {
      case 'positive':
        return 'Sie haben gute Chancen!'
      case 'negative':
        return 'Leider keine Ansprueche erkennbar'
      default:
        return 'Weitere Pruefung empfohlen'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Main Result Card */}
      <Card className={`${getStatusColor()} border-2`}>
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col items-center text-center">
            {getStatusIcon()}
            <h2 className="text-2xl font-bold mt-4">{result.title}</h2>
            <p className="text-lg mt-2">{getStatusText()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Potential Savings */}
      {result.potentialSavings && result.potentialSavings > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="py-6">
            <div className="text-center">
              <p className="text-sm text-green-700 font-medium">
                Moegliche Ersparnis / Rueckforderung
              </p>
              <p className="text-4xl font-bold text-green-600 mt-2">
                {formatCurrency(result.potentialSavings)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Zusammenfassung</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{result.summary}</p>
        </CardContent>
      </Card>

      {/* Details */}
      {result.details.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.details.map((detail, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-fintutto-primary/10 text-fintutto-primary rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{detail}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendation */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">Unsere Empfehlung</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800">{result.recommendation}</p>
        </CardContent>
      </Card>

      {/* Kontextbezogene Partner-Empfehlungen */}
      <AffiliateCard checkerType={checkerType} />

      {/* Premium-Teaser für PDF-Export */}
      <PremiumTeaser feature="pdf" />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {result.status !== 'negative' && (
          <Button
            variant="fintutto"
            size="xl"
            className="flex-1"
            onClick={onGoToForm}
          >
            <FileText className="w-5 h-5 mr-2" />
            Zum passenden Formular
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}

        {onDownloadPDF && (
          <Button variant="outline" size="xl" onClick={onDownloadPDF}>
            <Download className="w-5 h-5 mr-2" />
            PDF herunterladen
          </Button>
        )}
      </div>

      {/* Werbung (nur Free-User) */}
      <AdSlot placement="result" />

      {/* Start New Check */}
      <div className="text-center pt-4">
        <button
          onClick={onStartNew}
          className="text-fintutto-primary hover:underline font-medium"
        >
          Neuen Check starten
        </button>
      </div>
    </motion.div>
  )
}
