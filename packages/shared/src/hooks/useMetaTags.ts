/**
 * Sets Open Graph and standard meta tags for the current page.
 * Call once per page to improve SEO and social sharing previews.
 *
 * Usage:
 *   useMetaTags({
 *     title: 'Kautions-Rechner',
 *     description: 'Berechne die maximale Mietkaution nach §551 BGB.',
 *     path: '/rechner/kaution',
 *   })
 */

import { useEffect } from 'react'

interface MetaTagsOptions {
  title: string
  description: string
  path?: string
  siteName?: string
  image?: string
}

function setMeta(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement | null
  }
  if (!el) {
    el = document.createElement('meta')
    if (property.startsWith('og:')) {
      el.setAttribute('property', property)
    } else {
      el.setAttribute('name', property)
    }
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function useMetaTags({ title, description, path, siteName = 'Fintutto', image }: MetaTagsOptions) {
  useEffect(() => {
    // Standard meta
    setMeta('description', description)

    // Open Graph
    setMeta('og:title', title)
    setMeta('og:description', description)
    setMeta('og:type', 'website')
    setMeta('og:site_name', siteName)

    if (path) {
      setMeta('og:url', `https://portal.fintutto.cloud${path}`)
    }
    if (image) {
      setMeta('og:image', image)
    }

    // Twitter Card
    setMeta('twitter:card', 'summary')
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)
  }, [title, description, path, siteName, image])
}
