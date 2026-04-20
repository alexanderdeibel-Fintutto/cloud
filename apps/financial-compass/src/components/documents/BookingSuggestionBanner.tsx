/**
 * BookingSuggestionBanner — Zeigt KI-Buchungsvorschlag für einen Beleg
 *
 * Opt-in: Erscheint nur wenn Nutzer auf "Buchungsvorschlag erstellen" klickt
 * oder wenn bereits ein offener Vorschlag in fc_booking_suggestions existiert.
 */

import { useState } from 'react'
import { Sparkles, Check, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import {
  useFcBookingSuggestions,
  useRequestBookingSuggestion,
  useAcceptBookingSuggestion,
  useRejectBookingSuggestion,
  type FcBookingSuggestion,
} from '@/hooks/useFcBookingSuggestions'
import type { FcDocument } from '@/hooks/useFcDocuments'

interface BookingSuggestionBannerProps {
  doc: FcDocument
  companyId: string
}

function formatAmount(amount: number | null, currency = 'EUR'): string {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(amount)
}

function ConfidenceDot({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100)
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-400'
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {pct}% Konfidenz
    </span>
  )
}

function SuggestionCard({
  suggestion,
  companyId,
}: {
  suggestion: FcBookingSuggestion
  companyId: string
}) {
  const [expanded, setExpanded] = useState(false)
  const accept = useAcceptBookingSuggestion()
  const reject = useRejectBookingSuggestion()

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-800">
              KI-Buchungsvorschlag
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {suggestion.vendor ?? 'Unbekannter Lieferant'} ·{' '}
              {formatAmount(suggestion.amount_gross)} ·{' '}
              {suggestion.account_number ? `Konto ${suggestion.account_number}` : 'Konto unbekannt'}
              {suggestion.account_name ? ` (${suggestion.account_name})` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <ConfidenceDot confidence={suggestion.confidence} />
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-1 text-amber-500 hover:text-amber-700"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Details */}
      {expanded && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white rounded-lg p-2 border border-amber-100">
            <p className="text-gray-400">Brutto</p>
            <p className="font-semibold text-gray-800">{formatAmount(suggestion.amount_gross)}</p>
          </div>
          <div className="bg-white rounded-lg p-2 border border-amber-100">
            <p className="text-gray-400">Netto</p>
            <p className="font-semibold text-gray-800">{formatAmount(suggestion.amount_net)}</p>
          </div>
          <div className="bg-white rounded-lg p-2 border border-amber-100">
            <p className="text-gray-400">MwSt</p>
            <p className="font-semibold text-gray-800">
              {suggestion.vat_rate !== null ? `${suggestion.vat_rate}%` : '—'}
              {suggestion.vat_amount !== null ? ` (${formatAmount(suggestion.vat_amount)})` : ''}
            </p>
          </div>
          <div className="bg-white rounded-lg p-2 border border-amber-100">
            <p className="text-gray-400">Belegdatum</p>
            <p className="font-semibold text-gray-800">
              {suggestion.document_date
                ? new Date(suggestion.document_date).toLocaleDateString('de-DE')
                : '—'}
            </p>
          </div>
          {suggestion.raw_suggestion?.notes && (
            <div className="col-span-2 bg-white rounded-lg p-2 border border-amber-100">
              <p className="text-gray-400">KI-Begründung</p>
              <p className="text-gray-700">{String(suggestion.raw_suggestion.notes)}</p>
            </div>
          )}
        </div>
      )}

      {/* Aktionen */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => accept.mutate({ suggestion, companyId })}
          disabled={accept.isPending}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {accept.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Buchung anlegen
        </button>
        <button
          onClick={() => reject.mutate(suggestion.id)}
          disabled={reject.isPending}
          className="px-3 py-2 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-100 disabled:opacity-50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function BookingSuggestionBanner({ doc, companyId }: BookingSuggestionBannerProps) {
  const { data: suggestions = [] } = useFcBookingSuggestions(doc.id)
  const requestSuggestion = useRequestBookingSuggestion()

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending')
  const canRequest = doc.ocr_status === 'completed' && pendingSuggestions.length === 0

  if (pendingSuggestions.length > 0) {
    return (
      <div className="space-y-2">
        {pendingSuggestions.map(s => (
          <SuggestionCard key={s.id} suggestion={s} companyId={companyId} />
        ))}
      </div>
    )
  }

  if (!canRequest) return null

  return (
    <button
      onClick={() => requestSuggestion.mutate(doc.id)}
      disabled={requestSuggestion.isPending}
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-amber-300 text-amber-700 text-sm font-medium rounded-xl hover:bg-amber-50 disabled:opacity-50 transition-colors"
    >
      {requestSuggestion.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {requestSuggestion.isPending ? 'KI analysiert…' : 'Buchungsvorschlag erstellen (Opt-in)'}
    </button>
  )
}
