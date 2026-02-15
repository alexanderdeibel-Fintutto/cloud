import { ExternalLink, Shield, Banknote, Truck, Building2, Search, Wrench, Home } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AFFILIATE_MAPPINGS, buildAffiliateUrl } from '@/lib/affiliate-config'
import type { AffiliatePartner } from '@/lib/affiliate-config'
import { motion } from 'framer-motion'

const categoryIcons: Record<AffiliatePartner['category'], typeof Shield> = {
  rechtsschutz: Shield,
  kaution: Banknote,
  umzug: Truck,
  finanzierung: Building2,
  pruefung: Search,
  handwerker: Wrench,
  immobilien: Home,
}

interface AffiliateCardProps {
  checkerType: string
}

export default function AffiliateCard({ checkerType }: AffiliateCardProps) {
  const mapping = AFFILIATE_MAPPINGS[checkerType]
  if (!mapping) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <ExternalLink className="h-4 w-4 text-amber-700" />
            </div>
            <div>
              <CardTitle className="text-lg text-amber-900">{mapping.title}</CardTitle>
              <p className="text-sm text-amber-700">{mapping.subtitle}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {mapping.partners.map((partner) => {
            const Icon = categoryIcons[partner.category]
            return (
              <a
                key={partner.id}
                href={buildAffiliateUrl(partner, checkerType)}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block"
              >
                <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-white hover:border-amber-300 hover:shadow-md transition-all group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-amber-50 transition-colors flex-shrink-0">
                    <Icon className="h-5 w-5 text-gray-500 group-hover:text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900">{partner.name}</span>
                      {partner.badge && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          {partner.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{partner.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-shrink-0 text-xs border-amber-200 text-amber-800 hover:bg-amber-50"
                    tabIndex={-1}
                  >
                    {partner.cta}
                  </Button>
                </div>
              </a>
            )
          })}
          <p className="text-[10px] text-gray-400 text-center pt-1">
            Anzeige — Wir erhalten ggf. eine Provision bei Abschluss
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
