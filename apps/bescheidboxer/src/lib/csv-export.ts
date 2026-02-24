import type { Bescheid, Frist, Einspruch } from '../types/bescheid'
import { BESCHEID_TYP_LABELS, BESCHEID_STATUS_LABELS, EINSPRUCH_STATUS_LABELS } from '../types/bescheid'

function escapeCsv(value: string | number | null | undefined): string {
  if (value == null) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function downloadCsv(filename: string, content: string) {
  // BOM for Excel UTF-8 compatibility
  const bom = '\uFEFF'
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportBescheideAsCsv(bescheide: Bescheid[]) {
  const headers = [
    'Titel',
    'Typ',
    'Steuerjahr',
    'Eingangsdatum',
    'Finanzamt',
    'Aktenzeichen',
    'Status',
    'Festgesetzte Steuer',
    'Erwartete Steuer',
    'Abweichung',
    'Abweichung %',
    'Einspruchsfrist',
    'Erstellt am',
  ]

  const rows = bescheide.map(b => [
    escapeCsv(b.titel),
    escapeCsv(BESCHEID_TYP_LABELS[b.typ]),
    escapeCsv(b.steuerjahr),
    escapeCsv(b.eingangsdatum),
    escapeCsv(b.finanzamt),
    escapeCsv(b.aktenzeichen),
    escapeCsv(BESCHEID_STATUS_LABELS[b.status]),
    escapeCsv(b.festgesetzteSteuer),
    escapeCsv(b.erwarteteSteuer),
    escapeCsv(b.abweichung),
    escapeCsv(b.abweichungProzent != null ? `${b.abweichungProzent.toFixed(1)}%` : null),
    escapeCsv(b.einspruchsfrist),
    escapeCsv(b.createdAt?.split('T')[0]),
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const date = new Date().toISOString().split('T')[0]
  downloadCsv(`bescheide-export-${date}.csv`, csv)
}

export function exportFristenAsCsv(fristen: Frist[]) {
  const headers = [
    'Bescheid',
    'Typ',
    'Fristdatum',
    'Erledigt',
    'Notiz',
  ]

  const FRIST_TYP_LABELS: Record<string, string> = {
    einspruch: 'Einspruch',
    zahlung: 'Zahlung',
    nachreichung: 'Nachreichung',
  }

  const rows = fristen.map(f => [
    escapeCsv(f.bescheidTitel),
    escapeCsv(FRIST_TYP_LABELS[f.typ] || f.typ),
    escapeCsv(f.fristdatum),
    escapeCsv(f.erledigt ? 'Ja' : 'Nein'),
    escapeCsv(f.notiz),
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const date = new Date().toISOString().split('T')[0]
  downloadCsv(`fristen-export-${date}.csv`, csv)
}

export function exportEinspruecheAsCsv(einsprueche: Einspruch[]) {
  const headers = [
    'Bescheid-ID',
    'Status',
    'Begruendung',
    'Forderung',
    'Frist',
    'Eingereicht am',
    'Antwort erhalten',
    'Ergebnis',
    'Erstellt am',
  ]

  const rows = einsprueche.map(e => [
    escapeCsv(e.bescheidId),
    escapeCsv(EINSPRUCH_STATUS_LABELS[e.status]),
    escapeCsv(e.begruendung),
    escapeCsv(e.forderung),
    escapeCsv(e.frist),
    escapeCsv(e.eingereichtAm),
    escapeCsv(e.antwortErhalten),
    escapeCsv(e.ergebnis),
    escapeCsv(e.createdAt?.split('T')[0]),
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const date = new Date().toISOString().split('T')[0]
  downloadCsv(`einsprueche-export-${date}.csv`, csv)
}
