import Tesseract from 'tesseract.js';

interface OcrResult {
  text: string;
  confidence: number;
  words?: Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
}

// OCR mit Tesseract.js
export async function processOcr(imageUrl: string, mimeType: string): Promise<OcrResult> {
  try {
    // Tesseract Worker erstellen
    const result = await Tesseract.recognize(imageUrl, 'deu+eng', {
      logger: (m) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`OCR: ${m.status} - ${Math.round((m.progress || 0) * 100)}%`);
        }
      },
    });

    // Ergebnis aufbereiten
    const text = result.data.text;
    const confidence = result.data.confidence / 100;

    // Wörter mit Bounding Boxes extrahieren
    const words = result.data.words?.map((word) => ({
      text: word.text,
      confidence: word.confidence / 100,
      bbox: word.bbox,
    }));

    return {
      text: cleanOcrText(text),
      confidence,
      words,
    };
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('OCR processing failed');
  }
}

// OCR-Text bereinigen
function cleanOcrText(text: string): string {
  return text
    // Mehrfache Leerzeichen entfernen
    .replace(/  +/g, ' ')
    // Mehrfache Zeilenumbrüche reduzieren
    .replace(/\n{3,}/g, '\n\n')
    // Führende/nachfolgende Leerzeichen pro Zeile entfernen
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    // Gesamttext trimmen
    .trim();
}

// Strukturierte Daten aus OCR-Text extrahieren
export function extractReceiptData(ocrText: string): Partial<{
  vendorName: string;
  receiptNumber: string;
  receiptDate: string;
  totalAmount: number;
  taxAmount: number;
  netAmount: number;
  iban: string;
  vatId: string;
}> {
  const result: any = {};

  // Regex-Patterns für deutsche Belege
  const patterns = {
    // Rechnungsnummer
    receiptNumber: /(?:Rechnung(?:s)?(?:nummer)?|Invoice|Re\.?\s*Nr\.?|Beleg(?:nummer)?)[:\s]*([A-Z0-9-/]+)/i,

    // Datum (verschiedene Formate)
    date: /(?:Datum|Date|vom)[:\s]*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/i,

    // Beträge
    totalAmount: /(?:Gesamt(?:betrag)?|Total|Summe|Brutto)[:\s]*€?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i,
    netAmount: /(?:Netto(?:betrag)?|Net)[:\s]*€?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i,
    taxAmount: /(?:MwSt\.?|USt\.?|Steuer|VAT)[:\s]*€?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i,

    // Steuernummern
    vatId: /(DE\s?\d{9})/i,

    // IBAN
    iban: /(DE\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{2})/i,
  };

  // Patterns anwenden
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = ocrText.match(pattern);
    if (match && match[1]) {
      if (key.includes('Amount')) {
        // Beträge in Zahlen konvertieren
        result[key] = parseGermanNumber(match[1]);
      } else if (key === 'iban' || key === 'vatId') {
        // Leerzeichen entfernen
        result[key] = match[1].replace(/\s/g, '');
      } else {
        result[key] = match[1].trim();
      }
    }
  }

  // Datum formatieren
  if (result.date) {
    result.receiptDate = parseGermanDate(result.date);
    delete result.date;
  }

  // Firmenname aus ersten Zeilen extrahieren (heuristisch)
  const lines = ocrText.split('\n').filter((l) => l.trim().length > 3);
  if (lines.length > 0) {
    // Erste nicht-leere Zeile ist oft der Firmenname
    const potentialName = lines[0].trim();
    if (
      potentialName.length > 3 &&
      !potentialName.match(/^(Rechnung|Invoice|Datum|Date|Seite)/i)
    ) {
      result.vendorName = potentialName;
    }
  }

  return result;
}

// Deutsche Zahlenformate parsen (1.234,56 -> 1234.56)
function parseGermanNumber(str: string): number {
  return parseFloat(
    str
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
  );
}

// Deutsche Datumsformate parsen
function parseGermanDate(dateStr: string): string {
  const parts = dateStr.split(/[./-]/);
  if (parts.length !== 3) return dateStr;

  let [day, month, year] = parts;

  // 2-stelliges Jahr zu 4-stellig konvertieren
  if (year.length === 2) {
    year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
  }

  // ISO-Format zurückgeben
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
