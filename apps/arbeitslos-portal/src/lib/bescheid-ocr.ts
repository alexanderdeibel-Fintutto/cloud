// OCR Processing for Bescheide (multi-page document scanning)
// Supports multiple pages (images/PDFs) since a Bescheid typically has 4-8 pages (front+back)

export interface BescheidPage {
  id: string
  file: File
  previewUrl: string
  status: 'pending' | 'processing' | 'done' | 'error'
  extractedText: string
  pageNumber: number
}

export interface BescheidOcrResult {
  pages: BescheidPage[]
  combinedText: string
  totalPages: number
  status: 'idle' | 'processing' | 'done' | 'error'
  errorMessage?: string
}

/** Create a new page entry from a file */
export function createPage(file: File, pageNumber: number): BescheidPage {
  return {
    id: `page-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
    status: 'pending',
    extractedText: '',
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
 * Extract text from a single page using the Claude Vision API via our backend.
 * Falls back to a local placeholder when no API is configured.
 */
export async function extractTextFromPage(
  page: BescheidPage,
  apiEndpoint?: string,
): Promise<string> {
  // Try server-side OCR via Vision API
  if (apiEndpoint) {
    try {
      const formData = new FormData()
      formData.append('file', page.file)
      formData.append('action', 'ocr')

      const response = await fetch(`${apiEndpoint}/amt-scan`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        if (data.extractedText) {
          return data.extractedText
        }
      }
    } catch {
      // Fall through to manual input prompt
    }
  }

  // No API available - return empty to signal manual input needed
  return ''
}

/**
 * Process all pages: extract text from each, then combine.
 * Returns a callback-based approach so the UI can update per-page.
 */
export async function processAllPages(
  pages: BescheidPage[],
  apiEndpoint: string | undefined,
  onPageUpdate: (pageId: string, update: Partial<BescheidPage>) => void,
): Promise<string> {
  const texts: string[] = []

  for (const page of pages) {
    onPageUpdate(page.id, { status: 'processing' })

    try {
      const text = await extractTextFromPage(page, apiEndpoint)
      texts.push(text)
      onPageUpdate(page.id, { status: 'done', extractedText: text })
    } catch {
      onPageUpdate(page.id, { status: 'error', extractedText: '' })
    }
  }

  return texts.filter(Boolean).join('\n\n--- Seite ---\n\n')
}

/** Convert a File to a base64 data URL (for sending images to APIs) */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
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
