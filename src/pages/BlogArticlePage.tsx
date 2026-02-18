import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Eye, Tag, User, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import { getCategoryConfig } from '@/lib/blog-config'
import { renderMarkdown } from '@/lib/markdown'
import { AffiliateCard, NewsletterSignup } from '@/components/monetization'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  author: string
  related_checker: string | null
  related_rechner: string | null
  views: number
  published_at: string
  seo_title: string | null
  seo_description: string | null
}

export default function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) loadPost(slug)
  }, [slug])

  async function loadPost(postSlug: string) {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', postSlug)
        .eq('published', true)
        .single()

      if (error) throw error
      setPost(data)

      // View-Counter incrementieren (fire-and-forget)
      supabase
        .from('blog_posts')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', data.id)
        .then(() => {})

      // SEO: Titel aktualisieren
      if (data.seo_title || data.title) {
        document.title = `${data.seo_title || data.title} | Fintutto Ratgeber`
      }
      // SEO: Meta-Description
      const metaDesc = document.querySelector('meta[name="description"]')
      if (metaDesc && (data.seo_description || data.excerpt)) {
        metaDesc.setAttribute('content', data.seo_description || data.excerpt)
      }
    } catch (err) {
      console.error('Error loading blog post:', err)
      setPost(null)
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

  if (!post) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Artikel nicht gefunden</h1>
        <p className="text-muted-foreground mb-6">
          Der gesuchte Artikel existiert nicht oder wurde entfernt.
        </p>
        <Button variant="fintutto" asChild>
          <Link to="/ratgeber">Zum Ratgeber</Link>
        </Button>
      </div>
    )
  }

  const category = getCategoryConfig(post.category)

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/30">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/ratgeber" className="hover:text-foreground">Ratgeber</Link>
            <span>/</span>
            <span className="text-foreground truncate">{post.title}</span>
          </nav>
        </div>
      </div>

      <article className="container py-8 max-w-3xl mx-auto">
        {/* Back */}
        <Link
          to="/ratgeber"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zum Ratgeber
        </Link>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {category && (
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${category.bgColor} ${category.color}`}>
              <Tag className="h-3 w-3" />
              {category.label}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(post.published_at).toLocaleDateString('de-DE', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            {post.author}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            {post.views} Aufrufe
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          {post.excerpt}
        </p>

        {/* Content */}
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        {/* Related Tool CTA */}
        {post.related_checker && (
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-blue-900">Jetzt kostenlos prüfen</h3>
                  <p className="text-sm text-blue-700">
                    Nutzen Sie unseren kostenlosen Checker für eine sofortige Einschätzung.
                  </p>
                </div>
                <Button variant="fintutto" asChild>
                  <Link to={`/checker/${post.related_checker}`}>
                    Zum Checker
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {post.related_rechner && (
          <Card className="mt-4 bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-purple-900">Jetzt berechnen</h3>
                  <p className="text-sm text-purple-700">
                    Nutzen Sie unseren kostenlosen Rechner für eine genaue Berechnung.
                  </p>
                </div>
                <Button variant="fintutto" asChild>
                  <Link to={`/rechner/${post.related_rechner}`}>
                    Zum Rechner
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Affiliate Recommendations */}
        {post.related_checker && (
          <div className="mt-6">
            <AffiliateCard checkerType={post.related_checker} />
          </div>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Newsletter */}
        <div className="mt-8">
          <NewsletterSignup variant="card" source="blog-article" segment="kombi" />
        </div>
      </article>
    </div>
  )
}
