// OCR Processing for Bescheide (multi-page document scanning)
// Uses Tesseract.js for real client-side OCR text extraction
// Supports multiple pages since a Bescheid typically has 4-8 pages (front+back)

import Tesseract from 'tesseract.js'

export interface BescheidPage {
  id: string
  file: File
  previewUrl: string
  status: 'pending' | 'processing' | 'done' | 'error'
  extractedText: string
  confidence: number
  pageNumber: number
}

/** Create a new page entry from a file */
export function createPage(file: File, pageNumber: number): BescheidPage {
  return {
    id: `page-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
    status: 'pending',
    extractedText: '',
    confidence: 0,
    pageNumber,
  }
}

/** Clean up object URLs when pages are removed */
export function releasePage(page: BescheidPage): void {
  if (page.previewUrl) {
    URL.revokeObjectURL(page.previewUrl)
  }
}

/**
 * Extract text from a single image file using Tesseract.js (client-side OCR).
 * Uses German language model for best results with Bescheide.
 */
export async function ocrExtractText(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<{ text: string; confidence: number }> {
  const result = await Tesseract.recognize(file, 'deu', {
    logger: (info) => {
      if (info.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(info.progress * 100))
      }
    },
  })

  return {
    text: result.data.text.trim(),
    confidence: Math.round(result.data.confidence),
  }
}

/**
 * Process all pages with Tesseract.js OCR.
 * Calls onPageUpdate for each page so the UI can show real-time progress.
 */
export async function processAllPages(
  pages: BescheidPage[],
  onPageUpdate: (pageId: string, update: Partial<BescheidPage>) => void,
): Promise<string> {
  const texts: string[] = []

  for (const page of pages) {
    onPageUpdate(page.id, { status: 'processing' })

    try {
      const { text, confidence } = await ocrExtractText(page.file, (progress) => {
        // Could add a progress field to BescheidPage if needed
        onPageUpdate(page.id, { status: 'processing', extractedText: `OCR ${progress}%...` })
      })

      if (text) {
        texts.push(`[Seite ${page.pageNumber}]\n${text}`)
      }

      onPageUpdate(page.id, {
        status: 'done',
        extractedText: text || '(Kein Text erkannt)',
        confidence,
      })
    } catch (err) {
      console.error(`OCR error on page ${page.pageNumber}:`, err)
      onPageUpdate(page.id, {
        status: 'error',
        extractedText: '',
        confidence: 0,
      })
    }
  }

  return texts.filter(Boolean).join('\n\n')
}

/**
 * Send combined bescheid text to the Supabase Edge Function for AI analysis.
 * Falls back to the VITE_AI_API_ENDPOINT if configured.
 */
export async function analyzeBescheidText(
  bescheidText: string,
  supabaseUrl?: string,
  supabaseAnonKey?: string,
): Promise<AnalysisResult | null> {
  // Try Supabase Edge Function first
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/amt-scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ action: 'analyze', bescheidText }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.analysis) return data.analysis
      }
    } catch {
      // Fall through to API endpoint
    }
  }

  // Try VITE_AI_API_ENDPOINT as fallback
  const apiEndpoint = import.meta.env.VITE_AI_API_ENDPOINT
  if (apiEndpoint) {
    try {
      const response = await fetch(`${apiEndpoint}/amt-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', bescheidText }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.analysis) return data.analysis
      }
    } catch {
      // No backend available
    }
  }

  return null
}

export interface AnalysisResult {
  zusammenfassung: string
  fehler: Array<{
    kategorie: string
    schwere: string
    beschreibung: string
    paragraph?: string
    potenziellerBetrag?: number
    empfehlung?: string
  }>
  korrekt: string[]
  gesamtPotenzial: number
  dringlichkeit: 'hoch' | 'mittel' | 'niedrig'
  naechsteSchritte: string[]
  fristende?: string | null
}

/** Validate file type and size */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 20 * 1024 * 1024 // 20 MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'application/pdf',
  ]

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Dateityp "${file.type}" wird nicht unterstuetzt. Erlaubt: JPG, PNG, WebP, HEIC, PDF` }
  }

  if (file.size > maxSize) {
    return { valid: false, error: `Datei zu gross (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum: 20 MB` }
  }

  return { valid: true }
}
