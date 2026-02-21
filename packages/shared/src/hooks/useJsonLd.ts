import { useEffect } from 'react'

interface WebAppJsonLd {
  type: 'WebApplication'
  name: string
  description: string
  url: string
  applicationCategory?: string
  operatingSystem?: string
  offers?: { price: string; priceCurrency: string }
}

interface FAQJsonLd {
  type: 'FAQPage'
  questions: { question: string; answer: string }[]
}

type JsonLdData = WebAppJsonLd | FAQJsonLd

/**
 * Injects JSON-LD structured data into the page <head>.
 * Improves Google rich results for tools and FAQ pages.
 *
 * Usage:
 *   useJsonLd({
 *     type: 'WebApplication',
 *     name: 'Kautions-Rechner',
 *     description: 'Berechne die maximale Mietkaution nach §551 BGB',
 *     url: 'https://portal.fintutto.cloud/rechner/kaution',
 *     applicationCategory: 'FinanceApplication',
 *     offers: { price: '0', priceCurrency: 'EUR' },
 *   })
 */
export function useJsonLd(data: JsonLdData) {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute('data-fintutto-jsonld', 'true')

    let jsonLd: Record<string, unknown>

    if (data.type === 'WebApplication') {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: data.name,
        description: data.description,
        url: data.url,
        applicationCategory: data.applicationCategory || 'FinanceApplication',
        operatingSystem: data.operatingSystem || 'All',
        ...(data.offers && {
          offers: {
            '@type': 'Offer',
            price: data.offers.price,
            priceCurrency: data.offers.priceCurrency,
          },
        }),
      }
    } else {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data.questions.map((q) => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: q.answer,
          },
        })),
      }
    }

    script.textContent = JSON.stringify(jsonLd)
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [data])
}
