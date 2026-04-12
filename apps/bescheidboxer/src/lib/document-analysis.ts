/**
 * Document analysis service - sends documents to Claude AI for real analysis.
 * Converts files to base64 and calls the analyzeDocument Supabase Edge Function.
 */
import { supabase } from '../integrations/supabase/client'

export interface DocumentAnalysisResult {
  success: boolean
  typ?: string
  steuerjahr?: string
  finanzamt?: string
  aktenzeichen?: string
  festgesetzteSteuer?: string
  erwarteteSteuer?: string | null
  confidence?: number
  details?: {
    steuerpflichtiger?: string | null
    bescheiddatum?: string | null
    zuVersteuerndEinkommen?: string | null
    vorauszahlungen?: string | null
    nachzahlung?: string | null
    erstattung?: string | null
  }
  hinweise?: string[]
  error?: string
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove the data URL prefix (e.g. "data:application/pdf;base64,")
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'))
    reader.readAsDataURL(file)
  })
}

export async function analyzeDocument(file: File): Promise<DocumentAnalysisResult> {
  const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return {
      success: false,
      error: `Nicht unterstuetzter Dateityp: ${file.type}. Bitte PDF, JPG, PNG oder WebP verwenden.`,
    }
  }

  const maxSize = 20 * 1024 * 1024 // 20MB
  if (file.size > maxSize) {
    return {
      success: false,
      error: 'Datei ist zu gross (max. 20 MB).',
    }
  }

  const fileBase64 = await fileToBase64(file)

  const { data, error } = await supabase.functions.invoke('analyzeDocument', {
    body: {
      fileBase64,
      mimeType: file.type,
      fileName: file.name,
    },
  })

  if (error) {
    console.error('Edge function error:', error)
    return {
      success: false,
      error: `Analyse fehlgeschlagen: ${error.message || 'Unbekannter Fehler'}`,
    }
  }

  if (!data || !data.success) {
    return {
      success: false,
      error: data?.error || 'Die KI konnte das Dokument nicht analysieren.',
    }
  }

  return data as DocumentAnalysisResult
}

/**
 * Maps the AI analysis result to a BescheidTyp value.
 */
export function mapToBescheidTyp(typ: string | undefined): 'einkommensteuer' | 'gewerbesteuer' | 'umsatzsteuer' | 'koerperschaftsteuer' | 'grundsteuer' | 'sonstige' {
  if (!typ) return 'sonstige'
  const normalized = typ.toLowerCase().trim()
  const validTypes = ['einkommensteuer', 'gewerbesteuer', 'umsatzsteuer', 'koerperschaftsteuer', 'grundsteuer', 'sonstige'] as const
  for (const t of validTypes) {
    if (normalized === t || normalized.includes(t)) return t
  }
  return 'sonstige'
}
