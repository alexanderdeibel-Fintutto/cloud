// Einfacher Markdown-zu-HTML-Konverter (kein react-markdown nötig)
// Unterstützt: Headings, Bold, Italic, Links, Lists, Blockquotes, Tables, Code, HR

export function renderMarkdown(markdown: string): string {
  let html = markdown

  // Escape HTML (Sicherheit)
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Tables (muss vor anderen Block-Elementen kommen)
  html = html.replace(/^(\|.+\|)\n(\|[-:| ]+\|)\n((?:\|.+\|\n?)*)/gm, (_match, header: string, _separator, body: string) => {
    const headerCells = header.split('|').filter((c: string) => c.trim()).map((c: string) => `<th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb;font-weight:600">${c.trim()}</th>`).join('')
    const rows = body.trim().split('\n').map((row: string) => {
      const cells = row.split('|').filter((c: string) => c.trim()).map((c: string) => `<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${c.trim()}</td>`).join('')
      return `<tr>${cells}</tr>`
    }).join('')
    return `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;margin:16px 0"><thead><tr>${headerCells}</tr></thead><tbody>${rows}</tbody></table></div>`
  })

  // Code blocks (```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    return `<pre style="background:#1e293b;color:#e2e8f0;padding:16px;border-radius:8px;overflow-x:auto;margin:16px 0"><code>${code.trim()}</code></pre>`
  })

  // Blockquotes
  html = html.replace(/^&gt;\s*\*\*(.*?)\*\*:?\s*(.*)/gm, '<div style="border-left:4px solid #3b82f6;background:#eff6ff;padding:12px 16px;border-radius:0 8px 8px 0;margin:16px 0"><strong>$1</strong> $2</div>')
  html = html.replace(/^&gt;\s*(.+)/gm, '<blockquote style="border-left:4px solid #d1d5db;padding:8px 16px;margin:16px 0;color:#4b5563;background:#f9fafb;border-radius:0 8px 8px 0">$1</blockquote>')

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3 style="font-size:1.125rem;font-weight:700;margin:24px 0 8px;color:#1e293b">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 style="font-size:1.375rem;font-weight:700;margin:32px 0 12px;color:#0f172a">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 style="font-size:1.75rem;font-weight:800;margin:32px 0 16px;color:#0f172a">$1</h1>')

  // Bold & Italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Inline code
  html = html.replace(/`(.+?)`/g, '<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:0.875em">$1</code>')

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li style="margin:4px 0;padding-left:4px">$1</li>')
  html = html.replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, '<ul style="list-style-type:disc;padding-left:24px;margin:12px 0">$1</ul>')

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li style="margin:4px 0;padding-left:4px">$1</li>')

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">')

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#2563eb;text-decoration:underline">$1</a>')

  // Paragraphs (lines that aren't already wrapped in HTML tags)
  html = html.replace(/^(?!<[a-z]|$)(.+)$/gm, '<p style="margin:8px 0;line-height:1.7;color:#374151">$1</p>')

  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*>\s*<\/p>/g, '')

  return html
}
