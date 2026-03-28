/**
 * SEPA Credit Transfer (pain.001.003.03) Generator
 * Erzeugt eine valide SEPA-XML-Datei für Mieteinnahmen-Lastschriften
 * oder Überweisungen an Dienstleister.
 */

export interface SepaTransaction {
  id: string;
  tenantName: string;
  tenantIban: string;
  tenantBic?: string;
  amount: number; // in Cent
  dueDate: string; // ISO date string
  reference: string; // Verwendungszweck
  mandateId?: string;
  mandateDate?: string;
}

export interface SepaExportOptions {
  creditorName: string;
  creditorIban: string;
  creditorBic: string;
  messageId?: string;
  executionDate?: string; // ISO date string, default: today
}

function padLeft(str: string, length: number, char = "0"): string {
  return str.padStart(length, char);
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${padLeft(String(date.getMonth() + 1), 2)}-${padLeft(String(date.getDate()), 2)}`;
}

function sanitizeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/[^\x20-\x7E\u00C0-\u024F]/g, ""); // nur Latin-Zeichen
}

function sanitizeSepa(str: string): string {
  // SEPA erlaubt nur bestimmte Zeichen
  return str
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-zA-Z0-9 .,\-\/\+\?:\(\)]/g, "")
    .substring(0, 70);
}

export function generateSepaPain001(
  transactions: SepaTransaction[],
  options: SepaExportOptions
): string {
  const now = new Date();
  const executionDate = options.executionDate
    ? new Date(options.executionDate)
    : new Date(now.getTime() + 24 * 60 * 60 * 1000); // morgen

  const messageId = options.messageId || `FINTUTTO-${now.getTime()}`;
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalAmountFormatted = (totalAmount / 100).toFixed(2);

  const txXml = transactions
    .map((tx, idx) => {
      const amount = (tx.amount / 100).toFixed(2);
      const endToEndId = `E2E-${tx.id.substring(0, 20)}-${idx}`;
      const ref = sanitizeSepa(tx.reference);
      const name = sanitizeSepa(tx.tenantName);

      return `      <CdtTrfTxInf>
        <PmtId>
          <EndToEndId>${sanitizeXml(endToEndId)}</EndToEndId>
        </PmtId>
        <Amt>
          <InstdAmt Ccy="EUR">${amount}</InstdAmt>
        </Amt>
        <Cdtr>
          <Nm>${sanitizeXml(name)}</Nm>
        </Cdtr>
        <CdtrAcct>
          <Id>
            <IBAN>${sanitizeXml(tx.tenantIban.replace(/\s/g, ""))}</IBAN>
          </Id>
        </CdtrAcct>${
          tx.tenantBic
            ? `
        <CdtrAgt>
          <FinInstnId>
            <BIC>${sanitizeXml(tx.tenantBic)}</BIC>
          </FinInstnId>
        </CdtrAgt>`
            : ""
        }
        <RmtInf>
          <Ustrd>${sanitizeXml(ref)}</Ustrd>
        </RmtInf>
      </CdtTrfTxInf>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.003.03"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="urn:iso:std:iso:20022:tech:xsd:pain.001.003.03 pain.001.003.03.xsd">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${sanitizeXml(messageId)}</MsgId>
      <CreDtTm>${now.toISOString().substring(0, 19)}</CreDtTm>
      <NbOfTxs>${transactions.length}</NbOfTxs>
      <CtrlSum>${totalAmountFormatted}</CtrlSum>
      <InitgPty>
        <Nm>${sanitizeXml(sanitizeSepa(options.creditorName))}</Nm>
      </InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PMT-${sanitizeXml(messageId)}</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <NbOfTxs>${transactions.length}</NbOfTxs>
      <CtrlSum>${totalAmountFormatted}</CtrlSum>
      <PmtTpInf>
        <SvcLvl>
          <Cd>SEPA</Cd>
        </SvcLvl>
      </PmtTpInf>
      <ReqdExctnDt>${formatDate(executionDate)}</ReqdExctnDt>
      <Dbtr>
        <Nm>${sanitizeXml(sanitizeSepa(options.creditorName))}</Nm>
      </Dbtr>
      <DbtrAcct>
        <Id>
          <IBAN>${sanitizeXml(options.creditorIban.replace(/\s/g, ""))}</IBAN>
        </Id>
      </DbtrAcct>
      <DbtrAgt>
        <FinInstnId>
          <BIC>${sanitizeXml(options.creditorBic)}</BIC>
        </FinInstnId>
      </DbtrAgt>
${txXml}
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;
}

export function downloadSepaXml(xml: string, filename?: string): void {
  const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `SEPA_${new Date().toISOString().substring(0, 10)}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
