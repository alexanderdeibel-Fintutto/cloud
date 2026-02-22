/**
 * Global print styles that hide navigation, footer, ecosystem bar,
 * and command palette when printing. Shows only the main content.
 *
 * Include once in your app layout:
 *   <PrintStyles />
 */
export function PrintStyles() {
  return (
    <style>{`
      @media print {
        /* Hide navigation elements */
        header, footer, nav,
        [data-ecosystem-bar],
        [data-print-hide] {
          display: none !important;
        }

        /* Reset layout */
        body {
          background: white !important;
          color: black !important;
          font-size: 12pt !important;
        }

        main {
          padding: 0 !important;
          margin: 0 !important;
        }

        /* Remove shadows and borders for clean print */
        .shadow, .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl {
          box-shadow: none !important;
        }

        /* Ensure proper page breaks */
        .print\\:break-before { page-break-before: always; }
        .print\\:break-after { page-break-after: always; }
        .print\\:avoid-break { page-break-inside: avoid; }

        /* Cards should not break across pages */
        [class*="card"], [class*="Card"] {
          page-break-inside: avoid;
        }

        /* Show full URLs for links */
        a[href^="http"]::after {
          content: " (" attr(href) ")";
          font-size: 0.8em;
          color: #666;
        }

        /* Hide interactive elements */
        button:not([data-print-show]),
        [role="dialog"],
        .sr-only {
          display: none !important;
        }

        /* Adjust max-width for print */
        .container, .max-w-7xl, .max-w-4xl, .max-w-2xl {
          max-width: 100% !important;
          padding: 0 !important;
        }
      }
    `}</style>
  )
}
