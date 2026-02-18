import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight, MapPin, Shield, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import { renderMarkdown } from '@/lib/markdown'
import { AffiliateCard, NewsletterSignup, LeadCaptureForm, CHECKER_LEAD_MAPPING } from '@/components/monetization'

interface LandingPageData {
  id: string
  slug: string
  title: string
  subtitle: string | null
  content: string | null
  city: string | null
  bundesland: string | null
  topic: string
  related_checker: string | null
  related_rechner: string | null
  seo_title: string | null
  seo_description: string | null
  views: number
}

export default function LandingPage() {
  const { slug } = useParams<{ slug: string }>()
  const [page, setPage] = useState<LandingPageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) loadPage(slug)
  }, [slug])

  async function loadPage(pageSlug: string) {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('slug', pageSlug)
        .eq('published', true)
        .single()

      if (error) throw error
      setPage(data)

      // View-Counter (fire-and-forget)
      supabase
        .from('landing_pages')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', data.id)
        .then(() => {})

      // SEO
      if (data.seo_title || data.title) {
        document.title = `${data.seo_title || data.title} | Fintutto`
      }
      const metaDesc = document.querySelector('meta[name="description"]')
      if (metaDesc && data.seo_description) {
        metaDesc.setAttribute('content', data.seo_description)
      }
    } catch (err) {
      console.error('Error loading landing page:', err)
      setPage(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!page) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Seite nicht gefunden</h1>
        <p className="text-muted-foreground mb-6">
          Die gesuchte Seite existiert nicht.
        </p>
        <Button variant="fintutto" asChild>
          <Link to="/">Zur Startseite</Link>
        </Button>
      </div>
    )
  }

  const leadTypes = page.related_checker
    ? CHECKER_LEAD_MAPPING[page.related_checker] || []
    : []

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-16">
        <div className="container">
          <div className="max-w-2xl">
            {page.city && (
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-blue-200" />
                <span className="text-blue-200 font-medium">{page.city}</span>
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {page.title}
            </h1>
            {page.subtitle && (
              <p className="text-lg text-white/80 mb-6">{page.subtitle}</p>
            )}
            {page.related_checker && (
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50" asChild>
                <Link to={`/checker/${page.related_checker}`}>
                  <Shield className="h-5 w-5 mr-2" />
                  Jetzt kostenlos prüfen
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            )}
            {page.related_rechner && !page.related_checker && (
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50" asChild>
                <Link to={`/rechner/${page.related_rechner}`}>
                  Jetzt berechnen
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container max-w-3xl mx-auto">
          {page.content && (
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(page.content) }}
            />
          )}

          {/* CTA Card */}
          {page.related_checker && (
            <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="py-8 text-center">
                <h2 className="text-xl font-bold text-green-900 mb-2">
                  Kostenlos prüfen {page.city ? `in ${page.city}` : ''}
                </h2>
                <p className="text-green-700 mb-4">
                  Unser {page.topic === 'mietpreisbremse' ? 'Mietpreisbremse' : page.topic === 'nebenkosten' ? 'Nebenkosten' : page.topic}-Checker
                  gibt Ihnen in wenigen Minuten eine Einschätzung.
                </p>
                <Button variant="fintutto" size="lg" asChild>
                  <Link to={`/checker/${page.related_checker}`}>
                    Jetzt kostenlos prüfen
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Affiliate */}
          {page.related_checker && (
            <div className="mt-6">
              <AffiliateCard checkerType={page.related_checker} />
            </div>
          )}

          {/* Lead Form */}
          {leadTypes.length > 0 && page.related_checker && (
            <div className="mt-6">
              <LeadCaptureForm
                leadType={leadTypes[0]}
                checkerType={page.related_checker}
              />
            </div>
          )}

          {/* Newsletter */}
          <div className="mt-8">
            <NewsletterSignup
              variant="card"
              source={`landing-${page.slug}`}
              segment="mieter"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
