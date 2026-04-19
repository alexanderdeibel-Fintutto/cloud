import { useState, useCallback, useEffect } from 'react';

export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;

  // Header settings
  showLogo: boolean;
  logoPosition: 'left' | 'center' | 'right';

  // Colors
  primaryColor: string;
  secondaryColor: string;
  textColor: string;

  // Fonts
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';

  // Layout
  paperSize: 'A4' | 'Letter' | 'A5';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };

  // Header content
  headerText?: string;
  subheaderText?: string;

  // Footer content
  footerText?: string;
  showPageNumbers: boolean;
  showDate: boolean;

  // Invoice specific
  invoiceTitle: string;
  invoiceNumberLabel: string;
  invoiceDateLabel: string;
  dueDateLabel: string;
  customerLabel: string;

  // Table headers
  itemDescriptionLabel: string;
  quantityLabel: string;
  unitPriceLabel: string;
  taxLabel: string;
  totalLabel: string;

  // Summary labels
  subtotalLabel: string;
  discountLabel: string;
  taxTotalLabel: string;
  grandTotalLabel: string;

  // Payment info
  showPaymentInfo: boolean;
  paymentInfoText?: string;
  showBankDetails: boolean;
  bankDetailsText?: string;

  // Legal
  showTerms: boolean;
  termsText?: string;
  showPrivacyNote: boolean;
  privacyNoteText?: string;

  // Custom CSS
  customCss?: string;

  createdAt: string;
  updatedAt: string;
}

const DEFAULT_TEMPLATE: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Standard',
  description: 'Standardvorlage für Rechnungen',
  isDefault: true,

  showLogo: true,
  logoPosition: 'left',

  primaryColor: '#1a56db',
  secondaryColor: '#f3f4f6',
  textColor: '#1f2937',

  fontFamily: 'Inter, sans-serif',
  fontSize: 'medium',

  paperSize: 'A4',
  orientation: 'portrait',
  margins: { top: 20, right: 20, bottom: 20, left: 20 },

  headerText: '',
  subheaderText: '',

  footerText: '',
  showPageNumbers: true,
  showDate: true,

  invoiceTitle: 'Rechnung',
  invoiceNumberLabel: 'Rechnungsnummer',
  invoiceDateLabel: 'Rechnungsdatum',
  dueDateLabel: 'Fälligkeitsdatum',
  customerLabel: 'Rechnungsempfänger',

  itemDescriptionLabel: 'Beschreibung',
  quantityLabel: 'Menge',
  unitPriceLabel: 'Einzelpreis',
  taxLabel: 'MwSt.',
  totalLabel: 'Gesamt',

  subtotalLabel: 'Zwischensumme',
  discountLabel: 'Rabatt',
  taxTotalLabel: 'MwSt. gesamt',
  grandTotalLabel: 'Gesamtbetrag',

  showPaymentInfo: true,
  paymentInfoText: 'Bitte überweisen Sie den Betrag innerhalb von 14 Tagen auf das unten angegebene Konto.',
  showBankDetails: true,
  bankDetailsText: '',

  showTerms: true,
  termsText: 'Es gelten unsere allgemeinen Geschäftsbedingungen.',
  showPrivacyNote: false,
  privacyNoteText: '',
};

const STORAGE_KEY = 'fintutto_invoice_templates';

export function useInvoiceTemplates() {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    // Create default template
    return [{
      ...DEFAULT_TEMPLATE,
      id: 'template_default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }];
  });

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  // Get default template
  const getDefaultTemplate = useCallback((): InvoiceTemplate => {
    return templates.find(t => t.isDefault) || templates[0];
  }, [templates]);

  // Create template
  const createTemplate = useCallback((
    data: Partial<Omit<InvoiceTemplate, 'id' | 'createdAt' | 'updatedAt'>>
  ): InvoiceTemplate => {
    const newTemplate: InvoiceTemplate = {
      ...DEFAULT_TEMPLATE,
      ...data,
      id: `template_${Date.now()}`,
      isDefault: false, // New templates are not default
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  }, []);

  // Update template
  const updateTemplate = useCallback((id: string, updates: Partial<InvoiceTemplate>) => {
    setTemplates(prev => prev.map(t =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    ));
  }, []);

  // Delete template
  const deleteTemplate = useCallback((id: string) => {
    const template = templates.find(t => t.id === id);
    if (template?.isDefault) {
      throw new Error('Standardvorlage kann nicht gelöscht werden');
    }
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, [templates]);

  // Set as default
  const setAsDefault = useCallback((id: string) => {
    setTemplates(prev => prev.map(t => ({
      ...t,
      isDefault: t.id === id,
      updatedAt: t.id === id ? new Date().toISOString() : t.updatedAt,
    })));
  }, []);

  // Duplicate template
  const duplicateTemplate = useCallback((id: string): InvoiceTemplate => {
    const source = templates.find(t => t.id === id);
    if (!source) {
      throw new Error('Vorlage nicht gefunden');
    }

    const duplicate: InvoiceTemplate = {
      ...source,
      id: `template_${Date.now()}`,
      name: `${source.name} (Kopie)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTemplates(prev => [...prev, duplicate]);
    return duplicate;
  }, [templates]);

  // Generate preview HTML
  const generatePreviewHtml = useCallback((template: InvoiceTemplate, sampleData?: {
    invoiceNumber?: string;
    date?: string;
    dueDate?: string;
    customer?: { name: string; address: string };
    items?: { description: string; quantity: number; unitPrice: number; tax: number }[];
    subtotal?: number;
    tax?: number;
    total?: number;
  }): string => {
    const data = {
      invoiceNumber: sampleData?.invoiceNumber || 'RE-2024-001',
      date: sampleData?.date || new Date().toLocaleDateString('de-DE'),
      dueDate: sampleData?.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE'),
      customer: sampleData?.customer || { name: 'Musterfirma GmbH', address: 'Musterstraße 1, 12345 Musterstadt' },
      items: sampleData?.items || [
        { description: 'Beispielposition 1', quantity: 2, unitPrice: 100, tax: 19 },
        { description: 'Beispielposition 2', quantity: 1, unitPrice: 250, tax: 19 },
      ],
      subtotal: sampleData?.subtotal || 450,
      tax: sampleData?.tax || 85.5,
      total: sampleData?.total || 535.5,
    };

    const fontSizeMap = { small: '12px', medium: '14px', large: '16px' };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: ${template.fontFamily};
            font-size: ${fontSizeMap[template.fontSize]};
            color: ${template.textColor};
            padding: ${template.margins.top}mm ${template.margins.right}mm ${template.margins.bottom}mm ${template.margins.left}mm;
          }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .logo { text-align: ${template.logoPosition}; }
          .invoice-info { text-align: right; }
          .title { font-size: 24px; font-weight: bold; color: ${template.primaryColor}; margin-bottom: 10px; }
          .customer { margin-bottom: 30px; }
          .customer-label { font-weight: bold; margin-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: ${template.secondaryColor}; padding: 10px; text-align: left; border-bottom: 2px solid ${template.primaryColor}; }
          td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
          .summary { width: 300px; margin-left: auto; }
          .summary-row { display: flex; justify-content: space-between; padding: 5px 0; }
          .summary-total { font-weight: bold; font-size: 18px; border-top: 2px solid ${template.primaryColor}; padding-top: 10px; margin-top: 10px; }
          .footer { margin-top: 40px; font-size: 12px; color: #6b7280; }
          .payment-info { margin-top: 20px; padding: 15px; background: ${template.secondaryColor}; border-radius: 5px; }
          ${template.customCss || ''}
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">
            ${template.showLogo ? '[LOGO]' : ''}
            ${template.headerText ? `<div>${template.headerText}</div>` : ''}
          </div>
          <div class="invoice-info">
            <div class="title">${template.invoiceTitle}</div>
            <div>${template.invoiceNumberLabel}: ${data.invoiceNumber}</div>
            <div>${template.invoiceDateLabel}: ${data.date}</div>
            <div>${template.dueDateLabel}: ${data.dueDate}</div>
          </div>
        </div>

        <div class="customer">
          <div class="customer-label">${template.customerLabel}</div>
          <div>${data.customer.name}</div>
          <div>${data.customer.address}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>${template.itemDescriptionLabel}</th>
              <th>${template.quantityLabel}</th>
              <th>${template.unitPriceLabel}</th>
              <th>${template.taxLabel}</th>
              <th>${template.totalLabel}</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${item.unitPrice.toFixed(2)} €</td>
                <td>${item.tax}%</td>
                <td>${(item.quantity * item.unitPrice).toFixed(2)} €</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">
            <span>${template.subtotalLabel}</span>
            <span>${data.subtotal.toFixed(2)} €</span>
          </div>
          <div class="summary-row">
            <span>${template.taxTotalLabel}</span>
            <span>${data.tax.toFixed(2)} €</span>
          </div>
          <div class="summary-row summary-total">
            <span>${template.grandTotalLabel}</span>
            <span>${data.total.toFixed(2)} €</span>
          </div>
        </div>

        ${template.showPaymentInfo ? `
          <div class="payment-info">
            ${template.paymentInfoText || ''}
            ${template.showBankDetails && template.bankDetailsText ? `<div style="margin-top: 10px;">${template.bankDetailsText}</div>` : ''}
          </div>
        ` : ''}

        ${template.showTerms && template.termsText ? `
          <div class="footer">
            ${template.termsText}
          </div>
        ` : ''}
      </body>
      </html>
    `;
  }, []);

  return {
    templates,
    getDefaultTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setAsDefault,
    duplicateTemplate,
    generatePreviewHtml,
    defaultTemplate: DEFAULT_TEMPLATE,
  };
}
