import { describe, it, expect } from 'vitest'
import { generatePdfHtml, type PdfOptions, type KeyValuePair, type TableData } from './pdfGenerator'

describe('generatePdfHtml', () => {
  it('generates valid HTML document', () => {
    const options: PdfOptions = {
      title: 'Test PDF',
      subtitle: 'Test subtitle',
      content: [],
    }
    const html = generatePdfHtml(options)
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<html')
    expect(html).toContain('</html>')
    expect(html).toContain('Test PDF')
    expect(html).toContain('Test subtitle')
  })

  it('renders text sections', () => {
    const options: PdfOptions = {
      title: 'Test',
      content: [
        { type: 'text', data: 'Hello World paragraph' },
      ],
    }
    const html = generatePdfHtml(options)
    expect(html).toContain('Hello World paragraph')
  })

  it('renders key-value sections', () => {
    const pairs: KeyValuePair[] = [
      { key: 'Name', value: 'Max Mustermann' },
      { key: 'Betrag', value: '1.234,56 €' },
    ]
    const options: PdfOptions = {
      title: 'Test',
      content: [
        { heading: 'Details', type: 'keyvalue', data: pairs },
      ],
    }
    const html = generatePdfHtml(options)
    expect(html).toContain('Max Mustermann')
    expect(html).toContain('1.234,56 €')
    expect(html).toContain('Details')
  })

  it('renders highlighted key-value pairs', () => {
    const pairs: KeyValuePair[] = [
      { key: 'Ergebnis', value: '500 €', highlight: true },
    ]
    const options: PdfOptions = {
      title: 'Test',
      content: [
        { type: 'keyvalue', data: pairs },
      ],
    }
    const html = generatePdfHtml(options)
    expect(html).toContain('highlight')
    expect(html).toContain('Ergebnis')
  })

  it('renders table sections', () => {
    const tableData: TableData = {
      headers: ['Position', 'Betrag'],
      rows: [
        ['Grundsteuer', '500,00 €'],
        ['Versicherung', '300,00 €'],
      ],
    }
    const options: PdfOptions = {
      title: 'Test',
      content: [
        { heading: 'Tabelle', type: 'table', data: tableData },
      ],
    }
    const html = generatePdfHtml(options)
    expect(html).toContain('<table')
    expect(html).toContain('Position')
    expect(html).toContain('Grundsteuer')
    expect(html).toContain('500,00 €')
  })

  it('renders list sections', () => {
    const options: PdfOptions = {
      title: 'Test',
      content: [
        { heading: 'Tipps', type: 'list', data: ['Tipp 1', 'Tipp 2', 'Tipp 3'] },
      ],
    }
    const html = generatePdfHtml(options)
    expect(html).toContain('Tipp 1')
    expect(html).toContain('Tipp 2')
    expect(html).toContain('Tipp 3')
  })

  it('renders divider sections', () => {
    const options: PdfOptions = {
      title: 'Test',
      content: [
        { type: 'divider', data: null },
      ],
    }
    const html = generatePdfHtml(options)
    expect(html).toContain('divider')
  })

  it('includes Fintutto branding', () => {
    const options: PdfOptions = {
      title: 'Test',
      content: [],
    }
    const html = generatePdfHtml(options)
    expect(html).toContain('Fintutto')
  })

  it('includes current date by default', () => {
    const options: PdfOptions = {
      title: 'Test',
      content: [],
    }
    const html = generatePdfHtml(options)
    const today = new Date().toLocaleDateString('de-DE')
    expect(html).toContain(today)
  })

  it('uses custom date when provided', () => {
    const options: PdfOptions = {
      title: 'Test',
      content: [],
      date: '15.03.2025',
    }
    const html = generatePdfHtml(options)
    expect(html).toContain('15.03.2025')
  })

  it('uses custom footer when provided', () => {
    const options: PdfOptions = {
      title: 'Test',
      content: [],
      footer: 'Custom footer text',
    }
    const html = generatePdfHtml(options)
    expect(html).toContain('Custom footer text')
  })

  it('includes print button', () => {
    const options: PdfOptions = {
      title: 'Test',
      content: [],
    }
    const html = generatePdfHtml(options)
    expect(html).toContain('window.print()')
    expect(html).toContain('Als PDF drucken')
  })
})
