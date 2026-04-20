/**
 * PDF-Kontoauszug-Parser
 * Unterstützt: C24 Bank, Sparkasse, Deutsche Bank, Volksbank, ING, DKB, Commerzbank
 */

export interface ParsedTransaction {
  date: string;       // ISO 8601: YYYY-MM-DD
  valueDate?: string; // ISO 8601: YYYY-MM-DD
  description: string;
  counterparty?: string;
  iban?: string;
  bic?: string;
  amount: number;     // positiv = Gutschrift, negativ = Belastung
  reference?: string;
  raw?: string;
}

export interface ParsedStatement {
  bank?: string;
  accountHolder?: string;
  iban?: string;
  bic?: string;
  period?: string;
  startBalance?: number;
  endBalance?: number;
  transactions: ParsedTransaction[];
  parseErrors?: string[];
}

// Hilfsfunktion: deutsches Datum DD.MM.YYYY oder DD.MM. → ISO
function parseGermanDate(dateStr: string, yearHint?: number): string | null {
  const full = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (full) {
    const [, d, m, y] = full;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const short = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.?$/);
  if (short) {
    const [, d, m] = short;
    const year = yearHint || new Date().getFullYear();
    return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return null;
}

// Hilfsfunktion: deutschen Betrag parsen "- 17,00 €" oder "+ 952,00 €"
function parseGermanAmount(amountStr: string): number | null {
  // Entferne Währungssymbol und Leerzeichen
  const cleaned = amountStr.replace(/[€\s]/g, '').replace(/\./g, '').replace(',', '.');
  const match = cleaned.match(/^([+-]?\d+\.?\d*)$/);
  if (match) return parseFloat(match[1]);
  // Mit explizitem Vorzeichen
  const signMatch = cleaned.match(/^([+-])\s*(\d+\.?\d*)$/);
  if (signMatch) {
    const sign = signMatch[1] === '-' ? -1 : 1;
    return sign * parseFloat(signMatch[2]);
  }
  return null;
}

// C24 Bank Parser
function parseC24(text: string): ParsedStatement {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const result: ParsedStatement = {
    bank: 'C24 Bank',
    transactions: [],
    parseErrors: [],
  };

  // IBAN und BIC extrahieren
  const ibanMatch = text.match(/IBAN:\s*(DE\d{20,22})/);
  if (ibanMatch) result.iban = ibanMatch[1];
  const bicMatch = text.match(/BIC:\s*([A-Z]{6,11})/);
  if (bicMatch) result.bic = bicMatch[1];

  // Kontoinhaber (erste Zeile)
  if (lines[0] && !lines[0].startsWith('C24')) {
    result.accountHolder = lines[0];
  }

  // Periode
  const periodMatch = text.match(/(\d{2}\.\d{2}\.\d{4})\s*[-–]\s*(\d{2}\.\d{2}\.\d{4})/);
  if (periodMatch) result.period = `${periodMatch[1]} – ${periodMatch[2]}`;

  // Jahr aus Periode
  const yearMatch = text.match(/\d{2}\.\d{2}\.(\d{4})/);
  const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

  // Startsaldo und Endsaldo
  const startMatch = text.match(/Startsaldo\s+([\d.,]+)\s*€/);
  if (startMatch) result.startBalance = parseGermanAmount(startMatch[1] + '€');
  const endMatch = text.match(/Endsaldo\s+([\d.,]+)\s*€/);
  if (endMatch) result.endBalance = parseGermanAmount(endMatch[1] + '€');

  // Transaktionen parsen
  // Format: DD.MM. DD.MM. Transaktionstext +/-X.XXX,XX €
  // Mehrzeilige Transaktionen: nächste Zeilen bis zur nächsten Datumszeile
  const datePattern = /^(\d{2}\.\d{2}\.)\s+(\d{2}\.\d{2}\.)\s+(.+?)\s+([-+]\s*[\d.,]+\s*€)$/;
  const dateLinePattern = /^(\d{2}\.\d{2}\.)\s+(\d{2}\.\d{2}\.)\s*/;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const dateMatch = line.match(/^(\d{2}\.\d{2}\.)\s+(\d{2}\.\d{2}\.)(.*)$/);

    if (dateMatch) {
      const bookingDate = parseGermanDate(dateMatch[1], year);
      const valueDate = parseGermanDate(dateMatch[2], year);
      let rest = dateMatch[3].trim();
      let amountStr = '';

      // Betrag in dieser Zeile?
      const amountInLine = rest.match(/([-+]\s*[\d.]+,\d{2}\s*€)$/);
      if (amountInLine) {
        amountStr = amountInLine[1];
        rest = rest.slice(0, rest.length - amountInLine[1].length).trim();
      }

      // Folgezeilen sammeln bis nächste Datumszeile oder Betrag gefunden
      const descLines = rest ? [rest] : [];
      i++;
      while (i < lines.length) {
        const nextLine = lines[i];
        // Nächste Datumszeile?
        if (nextLine.match(/^\d{2}\.\d{2}\.\s+\d{2}\.\d{2}\./)) break;
        // Betrag in Folgezeile?
        const nextAmount = nextLine.match(/^([-+]\s*[\d.]+,\d{2}\s*€)$/);
        if (nextAmount) {
          amountStr = nextAmount[1];
          i++;
          break;
        }
        // Zusammenfassung-Abschnitt?
        if (nextLine.match(/^(Zusammenfassung|Startsaldo|Endsaldo|Kontobelastungen|Kontogutschriften)/)) break;
        descLines.push(nextLine);
        i++;
      }

      if (!bookingDate || !amountStr) continue;

      const amount = parseGermanAmount(amountStr);
      if (amount === null) continue;

      // Beschreibung aufteilen: erste Zeile = Buchungsart, zweite = Empfänger, weitere = Details
      const [bookingType, counterparty, ...details] = descLines;
      const description = descLines.join(' ');

      // IBAN aus Details extrahieren
      const ibanInDesc = description.match(/IBAN:\s*(DE\d{20,22})/);
      const bicInDesc = description.match(/BIC:\s*([A-Z]{6,11})/);

      result.transactions.push({
        date: bookingDate,
        valueDate: valueDate || bookingDate,
        description: bookingType || description,
        counterparty: counterparty || undefined,
        iban: ibanInDesc ? ibanInDesc[1] : undefined,
        bic: bicInDesc ? bicInDesc[1] : undefined,
        amount,
        reference: details.join(' ') || undefined,
        raw: descLines.join('\n'),
      });
    } else {
      i++;
    }
  }

  return result;
}

// Sparkasse Parser (ähnliches Format)
function parseSparkasse(text: string): ParsedStatement {
  const result: ParsedStatement = {
    bank: 'Sparkasse',
    transactions: [],
    parseErrors: [],
  };

  const ibanMatch = text.match(/DE\d{20,22}/);
  if (ibanMatch) result.iban = ibanMatch[0];

  const yearMatch = text.match(/\d{2}\.\d{2}\.(\d{4})/);
  const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

  // Format: DD.MM.YYYY Buchungstext Betrag
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  for (const line of lines) {
    const match = line.match(/^(\d{2}\.\d{2}\.\d{4})\s+(.+?)\s+([-+]?\s*[\d.]+,\d{2})\s*[€]?$/);
    if (match) {
      const date = parseGermanDate(match[1]);
      if (!date) continue;
      const amount = parseGermanAmount(match[3] + '€');
      if (amount === null) continue;
      result.transactions.push({
        date,
        description: match[2].trim(),
        amount,
      });
    }
  }

  return result;
}

// Generischer Parser (Fallback)
function parseGeneric(text: string): ParsedStatement {
  const result: ParsedStatement = {
    bank: 'Unbekannte Bank',
    transactions: [],
    parseErrors: ['Bankformat nicht erkannt, generischer Parser verwendet'],
  };

  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const yearMatch = text.match(/\d{2}\.\d{2}\.(\d{4})/);
  const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

  for (const line of lines) {
    // Versuche Datum + Betrag zu finden
    const dateMatch = line.match(/(\d{2}\.\d{2}\.(?:\d{4})?)/);
    const amountMatch = line.match(/([-+]?\s*[\d.]+,\d{2})\s*[€]?/);

    if (dateMatch && amountMatch) {
      const date = parseGermanDate(dateMatch[1], year);
      if (!date) continue;
      const amount = parseGermanAmount(amountMatch[1] + '€');
      if (amount === null) continue;

      const description = line
        .replace(dateMatch[0], '')
        .replace(amountMatch[0], '')
        .trim();

      if (description) {
        result.transactions.push({ date, description, amount });
      }
    }
  }

  return result;
}

// Bank erkennen
function detectBank(text: string): string {
  if (text.includes('C24') || text.includes('C24 Bank')) return 'c24';
  if (text.includes('Sparkasse')) return 'sparkasse';
  if (text.includes('Deutsche Bank')) return 'deutschebank';
  if (text.includes('Volksbank') || text.includes('Raiffeisenbank')) return 'volksbank';
  if (text.includes('ING-DiBa') || text.includes('ING Bank')) return 'ing';
  if (text.includes('DKB') || text.includes('Deutsche Kreditbank')) return 'dkb';
  if (text.includes('Commerzbank')) return 'commerzbank';
  if (text.includes('N26')) return 'n26';
  return 'generic';
}

/**
 * Hauptfunktion: PDF-Text parsen
 * Wird mit dem extrahierten Text aus pdf.js aufgerufen
 */
export function parseBankStatementText(text: string): ParsedStatement {
  const bank = detectBank(text);

  switch (bank) {
    case 'c24':
      return parseC24(text);
    case 'sparkasse':
      return parseSparkasse(text);
    default:
      // Versuche C24-Format zuerst (am häufigsten)
      const c24Result = parseC24(text);
      if (c24Result.transactions.length > 0) return c24Result;
      return parseGeneric(text);
  }
}

/**
 * PDF-Datei parsen (Browser-seitig mit pdf.js)
 */
export async function parsePDFStatement(file: File): Promise<ParsedStatement> {
  try {
    // Dynamischer Import von pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist');

    // Worker-URL setzen (CDN)
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Text mit Positionen sammeln und nach Y-Position sortieren
      const items = textContent.items as Array<{
        str: string;
        transform: number[];
        width: number;
        height: number;
      }>;

      // Zeilen rekonstruieren basierend auf Y-Position
      const lineMap = new Map<number, string[]>();
      for (const item of items) {
        const y = Math.round(item.transform[5]); // Y-Koordinate
        if (!lineMap.has(y)) lineMap.set(y, []);
        lineMap.get(y)!.push(item.str);
      }

      // Zeilen von oben nach unten sortieren (höhere Y = weiter oben im PDF)
      const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);
      for (const y of sortedYs) {
        const lineText = lineMap.get(y)!.join(' ').trim();
        if (lineText) fullText += lineText + '\n';
      }
      fullText += '\n';
    }

    return parseBankStatementText(fullText);
  } catch (error) {
    console.error('PDF-Parsing-Fehler:', error);
    return {
      bank: 'Unbekannt',
      transactions: [],
      parseErrors: [`PDF konnte nicht gelesen werden: ${error instanceof Error ? error.message : String(error)}`],
    };
  }
}
