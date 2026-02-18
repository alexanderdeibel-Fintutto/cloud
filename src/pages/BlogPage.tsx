import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ArrowRight, Calendar, Eye, Tag, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { BLOG_CATEGORIES, getCategoryConfig } from '@/lib/blog-config'
import { NewsletterSignup } from '@/components/monetization'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  author: string
  featured: boolean
  views: number
  published_at: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    loadPosts()
  }, [activeCategory])

  async function loadPosts() {
    setLoading(true)
    try {
      let query = supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, category, tags, author, featured, views, published_at')
        .eq('published', true)
        .order('published_at', { ascending: false })

      if (activeCategory) {
        query = query.eq('category', activeCategory)
      }

      const { data, error } = await query

      if (error) throw error
      setPosts(data || [])
    } catch (err) {
      console.error('Error loading blog posts:', err)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const featuredPosts = posts.filter((p) => p.featured)
  const regularPosts = posts.filter((p) => !p.featured)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-16">
        <div className="container">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-blue-200" />
              <span className="text-blue-200 font-medium">Ratgeber</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Mietrecht-Ratgeber
            </h1>
            <p className="text-lg text-white/80">
              Expertenwissen zu Mietrecht, Nebenkosten und Immobilien.
              Praxistipps und aktuelle Urteile – verständlich erklärt.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-border bg-card py-4">
        <div className="container">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(null)}
            >
              Alle
            </Button>
            {BLOG_CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                Noch keine Artikel in dieser Kategorie.
              </p>
            </div>
          ) : (
            <>
              {/* Featured Posts */}
              {featuredPosts.length > 0 && !activeCategory && (
                <div className="mb-12">
                  <h2 className="text-xl font-bold mb-6">Empfohlene Artikel</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {featuredPosts.map((post) => (
                      <BlogPostCard key={post.id} post={post} featured />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Posts */}
              <div>
                {featuredPosts.length > 0 && !activeCategory && (
                  <h2 className="text-xl font-bold mb-6">Alle Artikel</h2>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(activeCategory ? posts : regularPosts).map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="mt-12 max-w-xl mx-auto">
                <NewsletterSignup variant="card" source="blog" segment="kombi" />
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

function BlogPostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  const category = getCategoryConfig(post.category)

  return (
    <Link to={`/ratgeber/${post.slug}`}>
      <Card className={`h-full hover:shadow-lg transition-all group ${featured ? 'border-blue-200 shadow-md' : 'hover:border-primary/30'}`}>
        {featured && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-t-xl text-center">
            Empfohlen
          </div>
        )}
        <CardHeader>
          {category && (
            <div className="mb-2">
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${category.bgColor} ${category.color}`}>
                <Tag className="h-3 w-3" />
                {category.label}
              </span>
            </div>
          )}
          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </CardTitle>
          <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(post.published_at).toLocaleDateString('de-DE', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {post.views}
              </span>
            </div>
            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              Lesen <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
