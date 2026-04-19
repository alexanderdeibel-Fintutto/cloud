 export interface BankTransaction {
   date: string;
   valueDate: string;
   amount: number;
   description: string;
   reference: string;
   counterpartName?: string;
   counterpartIban?: string;
 }
 
 export type BankFormat = 'sparkasse' | 'deutschebank' | 'commerzbank' | 'n26' | 'revolut' | 'general';
 
 export const BANK_FORMATS: { value: BankFormat; label: string }[] = [
   { value: 'sparkasse', label: 'Sparkasse' },
   { value: 'deutschebank', label: 'Deutsche Bank' },
   { value: 'commerzbank', label: 'Commerzbank' },
   { value: 'n26', label: 'N26' },
   { value: 'revolut', label: 'Revolut' },
   { value: 'general', label: 'Allgemein CSV' },
 ];
 
 // CSV Parser für verschiedene Banken
 export function parseCSV(content: string, format: BankFormat): BankTransaction[] {
   const lines = content.split('\n');
   const transactions: BankTransaction[] = [];
 
   // Skip header (usually first line)
   for (let i = 1; i < lines.length; i++) {
     const line = lines[i].trim();
     if (!line) continue;
     
     const cols = line.split(';').map((c) => c.replace(/"/g, '').trim());
     if (cols.length < 3) continue;
 
     try {
       if (format === 'sparkasse') {
         // Sparkasse: Auftragskonto;Buchungstag;Valutadatum;Buchungstext;Verwendungszweck;Beguenstigter/Zahlungspflichtiger;Kontonummer;BLZ;Betrag;Währung
         transactions.push({
           date: parseGermanDate(cols[1]),
           valueDate: parseGermanDate(cols[2]),
           description: cols[4] || cols[3],
           reference: cols[4] || '',
           counterpartName: cols[5],
           amount: parseGermanNumber(cols[8]),
         });
       } else if (format === 'deutschebank') {
         // Deutsche Bank: Buchungstag;Wert;Umsatzart;Begünstigter / Auftraggeber;Verwendungszweck;IBAN;BIC;Kundenreferenz;Mandatsreferenz;Gläubiger ID;Fremde Gebühren;Betrag;Abweichender Empfänger;Anzahl der Aufträge;Anzahl der Schecks;Soll;Haben;Währung
         transactions.push({
           date: parseGermanDate(cols[0]),
           valueDate: parseGermanDate(cols[1]),
           description: cols[4],
           reference: cols[7] || '',
           counterpartName: cols[3],
           counterpartIban: cols[5],
           amount: parseGermanNumber(cols[15] || cols[16]) || parseGermanNumber(cols[11]),
         });
       } else if (format === 'commerzbank') {
         // Commerzbank: Buchungstag;Wertstellung;Umsatzart;Buchungstext;Betrag;Währung
         transactions.push({
           date: parseGermanDate(cols[0]),
           valueDate: parseGermanDate(cols[1]),
           description: cols[3] || cols[2],
           reference: '',
           amount: parseGermanNumber(cols[4]),
         });
       } else if (format === 'n26') {
         // N26: Datum;Empfänger;Kontonummer;Transaktionstyp;Verwendungszweck;Betrag (EUR);Betrag (Fremdwährung);Fremdwährung;Wechselkurs
         transactions.push({
           date: cols[0],
           valueDate: cols[0],
           description: cols[4] || cols[3],
           reference: '',
           counterpartName: cols[1],
           counterpartIban: cols[2],
           amount: parseGermanNumber(cols[5]),
         });
       } else if (format === 'revolut') {
         // Revolut: Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance
         const revCols = line.split(',').map((c) => c.replace(/"/g, '').trim());
         if (revCols.length < 6) continue;
         transactions.push({
           date: revCols[2]?.split(' ')[0] || '',
           valueDate: revCols[3]?.split(' ')[0] || revCols[2]?.split(' ')[0] || '',
           description: revCols[4],
           reference: '',
           amount: parseFloat(revCols[5]) || 0,
         });
       } else {
         // Allgemein: Datum;Beschreibung;Betrag
         transactions.push({
           date: cols[0],
           valueDate: cols[0],
           description: cols[1],
           reference: '',
           amount: parseGermanNumber(cols[2]),
         });
       }
     } catch (e) {
       console.warn(`Failed to parse line ${i}:`, line, e);
     }
   }
   return transactions;
 }
 
 // MT940 Parser (SWIFT Format)
 export function parseMT940(content: string): BankTransaction[] {
   const transactions: BankTransaction[] = [];
   
   // Match :61: transaction lines followed by :86: description
   const regex = /:61:(\d{6})(\d{4})?(C|D|RC|RD)([A-Z]?)(\d+,\d{2})[^\n]*\n:86:([\s\S]*?)(?=:6[012]:|$)/g;
   let match;
 
   while ((match = regex.exec(content)) !== null) {
     const dateStr = match[1];
     const creditDebit = match[3];
     const amount = parseFloat(match[5].replace(',', '.'));
     const description = match[6].replace(/\?../g, ' ').replace(/\n/g, ' ').trim();
     
     // Parse date: YYMMDD -> YYYY-MM-DD
     const year = parseInt(dateStr.slice(0, 2));
     const fullYear = year > 50 ? 1900 + year : 2000 + year;
     const formattedDate = `${fullYear}-${dateStr.slice(2, 4)}-${dateStr.slice(4, 6)}`;
 
     transactions.push({
       date: formattedDate,
       valueDate: formattedDate,
       amount: creditDebit === 'D' || creditDebit === 'RD' ? -amount : amount,
       description,
       reference: '',
     });
   }
   return transactions;
 }
 
 // CAMT.053 Parser (XML Format)
 export function parseCAMT053(content: string): BankTransaction[] {
   const transactions: BankTransaction[] = [];
   const parser = new DOMParser();
   const doc = parser.parseFromString(content, 'text/xml');
 
   // Find all Ntry (entry) elements
   const entries = doc.querySelectorAll('Ntry');
 
   entries.forEach((entry) => {
     try {
       const bookingDate = entry.querySelector('BookgDt Dt')?.textContent || '';
       const valueDate = entry.querySelector('ValDt Dt')?.textContent || bookingDate;
       const amountEl = entry.querySelector('Amt');
       const amount = parseFloat(amountEl?.textContent || '0');
       const creditDebit = entry.querySelector('CdtDbtInd')?.textContent;
       const description = entry.querySelector('NtryDtls TxDtls RmtInf Ustrd')?.textContent || 
                          entry.querySelector('AddtlNtryInf')?.textContent || '';
       const counterpartName = entry.querySelector('NtryDtls TxDtls RltdPties Cdtr Nm')?.textContent ||
                               entry.querySelector('NtryDtls TxDtls RltdPties Dbtr Nm')?.textContent || '';
       const counterpartIban = entry.querySelector('NtryDtls TxDtls RltdPties CdtrAcct Id IBAN')?.textContent ||
                               entry.querySelector('NtryDtls TxDtls RltdPties DbtrAcct Id IBAN')?.textContent || '';
 
       transactions.push({
         date: bookingDate,
         valueDate,
         amount: creditDebit === 'DBIT' ? -amount : amount,
         description,
         reference: '',
         counterpartName,
         counterpartIban,
       });
     } catch (e) {
       console.warn('Failed to parse CAMT entry:', e);
     }
   });
 
   return transactions;
 }
 
 // Detect file format
 export function detectFileFormat(content: string, filename: string): 'csv' | 'mt940' | 'camt053' {
   const lowerName = filename.toLowerCase();
   
   if (lowerName.endsWith('.xml') || content.trim().startsWith('<?xml') || content.includes('<Document')) {
     return 'camt053';
   }
   
   if (lowerName.includes('mt940') || lowerName.endsWith('.sta') || content.includes(':20:') && content.includes(':61:')) {
     return 'mt940';
   }
   
   return 'csv';
 }
 
 // Parse German date format DD.MM.YYYY to YYYY-MM-DD
 function parseGermanDate(dateStr: string): string {
   if (!dateStr) return '';
   
   // Already in ISO format
   if (dateStr.includes('-')) return dateStr;
   
   // German format: DD.MM.YYYY or DD.MM.YY
   const parts = dateStr.split('.');
   if (parts.length === 3) {
     let year = parts[2];
     if (year.length === 2) {
       year = parseInt(year) > 50 ? '19' + year : '20' + year;
     }
     return `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
   }
   
   return dateStr;
 }
 
 // Parse German number format (1.234,56 -> 1234.56)
 function parseGermanNumber(numStr: string): number {
   if (!numStr) return 0;
   // Remove thousand separators and replace comma with dot
   const cleaned = numStr.replace(/\./g, '').replace(',', '.');
   return parseFloat(cleaned) || 0;
 }