import { useState } from 'react'
import { ShoppingCart, Loader2, FileDown, Brain, Package, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

export interface Product {
  id: string
  name: string
  price: string // display price
  priceInCents: number
  description: string
  icon: typeof ShoppingCart
}

const PRODUCTS: Product[] = [
  {
    id: 'single_pdf_export',
    name: 'PDF-Export',
    price: '1,99 EUR',
    priceInCents: 199,
    description: 'Ergebnis als PDF herunterladen',
    icon: FileDown,
  },
  {
    id: 'ai_legal_report',
    name: 'KI-Rechtsgutachten',
    price: '4,99 EUR',
    priceInCents: 499,
    description: 'Detaillierte KI-Analyse Ihres Falls',
    icon: Brain,
  },
  {
    id: 'full_checker_analysis',
    name: 'Komplett-Analyse',
    price: '9,99 EUR',
    priceInCents: 999,
    description: 'Alle 10 Checker in einem Durchlauf',
    icon: Package,
  },
  {
    id: 'annual_nebenkosten_report',
    name: 'Jahres-NK-Report',
    price: '7,99 EUR',
    priceInCents: 799,
    description: 'Jahresauswertung Ihrer Nebenkosten',
    icon: BarChart3,
  },
]

interface OneTimePurchaseProps {
  productId?: string // show only specific product
  resultId?: string // link to a checker result
  variant?: 'single' | 'grid'
}

export default function OneTimePurchase({ productId, resultId, variant = 'single' }: OneTimePurchaseProps) {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  // Premium users don't need one-time purchases
  if (profile?.tier === 'premium') return null

  const products = productId
    ? PRODUCTS.filter((p) => p.id === productId)
    : PRODUCTS

  const handlePurchase = async (product: Product) => {
    setLoading(product.id)
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'payment',
          productId: product.id,
          userId: user?.id || '',
          userEmail: user?.email || '',
          resultId: resultId || '',
        }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Purchase error:', error)
    } finally {
      setLoading(null)
    }
  }

  if (variant === 'single' && products.length === 1) {
    const product = products[0]
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePurchase(product)}
        disabled={loading === product.id}
        className="border-purple-200 text-purple-800 hover:bg-purple-50"
      >
        {loading === product.id ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <ShoppingCart className="h-4 w-4 mr-2" />
        )}
        {product.name} — {product.price}
      </Button>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {products.map((product) => {
        const Icon = product.icon
        return (
          <Card
            key={product.id}
            className="cursor-pointer hover:border-purple-300 hover:shadow-md transition-all"
            onClick={() => !loading && handlePurchase(product)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 flex-shrink-0">
                  <Icon className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{product.name}</span>
                    <span className="text-sm font-bold text-purple-600">{product.price}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{product.description}</p>
                </div>
              </div>
              {loading === product.id && (
                <div className="flex items-center justify-center mt-2">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
