import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client'

// App ID für Mietrecht Formulare
const APP_ID = 'ft-formulare'

// AI Aktionen
export type AIAction =
  | 'chat'           // Mietrecht-Fragen beantworten
  | 'form-help'      // Formular-Ausfüllhilfe
  | 'legal-check'    // Rechtliche Prüfung
  | 'suggest-value'  // Wert-Vorschläge (Miete, Nebenkosten)
  | 'crosssell'      // Upgrade-Empfehlungen

export interface AIRequest {
  action: AIAction
  message?: string
  context?: Record<string, unknown>
  fieldId?: string
  fieldType?: string
}

export interface AIResponse {
  success: boolean
  message?: string
  suggestion?: any
  explanation?: string
  legalHints?: string[]
  error?: string
}

// Haupt-Funktion zum Aufrufen der KI
export async function callFinTuttoKI(request: AIRequest): Promise<AIResponse> {
  // Fallback wenn Supabase nicht konfiguriert ist
  if (!isSupabaseConfigured()) {
    return generateLocalSuggestion(request)
  }

  try {
    const { data, error } = await supabase.functions.invoke('smooth-handler', {
      body: {
        app_id: APP_ID,
        action: request.action,
        message: request.message,
        context: request.context,
        field_id: request.fieldId,
        field_type: request.fieldType,
      }
    })

    if (error) {
      console.error('AI Service Error:', error)
      return generateLocalSuggestion(request)
    }

    return {
      success: true,
      message: data.message,
      suggestion: data.suggestion,
      explanation: data.explanation,
      legalHints: data.legal_hints,
    }
  } catch (error) {
    console.error('AI Service Error:', error)
    return generateLocalSuggestion(request)
  }
}

// Chat-Funktion für Mietrecht-Fragen
export async function askMietrechtQuestion(question: string, context?: Record<string, unknown>): Promise<AIResponse> {
  return callFinTuttoKI({
    action: 'chat',
    message: question,
    context,
  })
}

// Formular-Ausfüllhilfe
export async function getFormFieldHelp(
  fieldId: string,
  fieldType: string,
  currentValue?: any,
  formContext?: Record<string, unknown>
): Promise<AIResponse> {
  return callFinTuttoKI({
    action: 'form-help',
    fieldId,
    fieldType,
    context: {
      currentValue,
      ...formContext,
    },
  })
}

// Wert-Vorschlag generieren (z.B. Miete basierend auf Wohnfläche)
export async function suggestValue(
  fieldId: string,
  fieldType: string,
  formContext: Record<string, unknown>
): Promise<AIResponse> {
  return callFinTuttoKI({
    action: 'suggest-value',
    fieldId,
    fieldType,
    context: formContext,
  })
}

// Rechtliche Prüfung eines Textes
export async function checkLegalText(text: string, documentType: string): Promise<AIResponse> {
  return callFinTuttoKI({
    action: 'legal-check',
    message: text,
    context: { documentType },
  })
}

// Lokale Fallback-Vorschläge wenn API nicht verfügbar
function generateLocalSuggestion(request: AIRequest): AIResponse {
  const { fieldId, fieldType, context } = request

  // Kaltmiete-Vorschlag
  if (fieldType === 'currency' && fieldId?.toLowerCase().includes('kalt')) {
    const qm = (context?.wohnflaeche as number) || 80
    const avgPricePerQm = 12
    return {
      success: true,
      suggestion: Math.round(qm * avgPricePerQm * 100) / 100,
      explanation: `Basierend auf ${qm}m² Wohnfläche und einem durchschnittlichen Quadratmeterpreis von ${avgPricePerQm}€.`,
      legalHints: ['Beachten Sie die lokale Mietpreisbremse (§ 556d BGB)'],
    }
  }

  // Nebenkosten-Vorschlag
  if (fieldType === 'currency' && fieldId?.toLowerCase().includes('neben')) {
    const qm = (context?.wohnflaeche as number) || 80
    return {
      success: true,
      suggestion: Math.round(qm * 2.5 * 100) / 100,
      explanation: `Typische Nebenkostenvorauszahlung von 2,50€/m² für ${qm}m² Wohnfläche.`,
      legalHints: ['Nur Kosten nach § 2 BetrKV sind umlagefähig'],
    }
  }

  // Kaution-Vorschlag
  if (fieldType === 'currency' && fieldId?.toLowerCase().includes('kaution')) {
    const kaltmiete = (context?.kaltmiete as number) || 800
    return {
      success: true,
      suggestion: kaltmiete * 3,
      explanation: `Maximale Kaution: 3 Monatskaltmieten (${kaltmiete}€ × 3)`,
      legalHints: ['Maximum: 3 Monatskaltmieten (§ 551 BGB)', 'Kann in 3 Raten gezahlt werden'],
    }
  }

  // Chat-Fallback
  if (request.action === 'chat') {
    return {
      success: true,
      message: 'Diese Funktion benötigt eine aktive Internetverbindung. Bitte versuchen Sie es später erneut oder konsultieren Sie einen Rechtsanwalt für rechtliche Fragen.',
    }
  }

  return {
    success: false,
    error: 'Keine Empfehlung verfügbar.',
  }
}
