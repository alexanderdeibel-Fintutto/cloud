import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User, Mail, Crown, Settings, LogOut, ChevronRight,
  Dumbbell, Heart, Shield, Share2, ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/lib/supabase'
import { FITNESS_PLANS, formatPrice } from '@/lib/pricing'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { user, profile, subscriptionTier } = useAuth()
  const navigate = useNavigate()
  const plan = FITNESS_PLANS[subscriptionTier]
  const [referralCopied, setReferralCopied] = useState(false)

  const referralCode = profile?.referralCode || `FT-${user?.id?.slice(0, 8).toUpperCase() || 'XXXXXX'}`
  const referralLink = `https://fittutto.fintutto.cloud/auth?ref=${referralCode}`

  const handleLogout = async () => {
    await signOut()
    navigate('/')
    toast.success('Erfolgreich abgemeldet')
  }

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink)
    setReferralCopied(true)
    toast.success('Referral-Link kopiert!')
    setTimeout(() => setReferralCopied(false), 2000)
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold">Profil</h1>

      {/* User Info */}
      <Card>
        <CardContent className="pt-6 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full gradient-fitness flex items-center justify-center">
            <User className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg">{profile?.displayName || user?.email?.split('@')[0] || 'Gast'}</p>
            <p className="text-sm text-muted-foreground">{user?.email || 'Nicht angemeldet'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                subscriptionTier === 'premium' ? 'bg-amber-500/10' :
                subscriptionTier === 'basic' ? 'bg-primary/10' :
                subscriptionTier === 'save_load' ? 'bg-blue-500/10' : 'bg-muted'
              )}>
                <Crown className={cn(
                  'h-5 w-5',
                  subscriptionTier === 'premium' ? 'text-amber-500' :
                  subscriptionTier === 'basic' ? 'text-primary' :
                  subscriptionTier === 'save_load' ? 'text-blue-500' : 'text-muted-foreground'
                )} />
              </div>
              <div>
                <p className="font-semibold text-sm">{plan.name}</p>
                <p className="text-xs text-muted-foreground">
                  {plan.price === 0 ? 'Kostenlos' : `${formatPrice(plan.price)}/Monat`}
                </p>
              </div>
            </div>
            {subscriptionTier !== 'premium' && (
              <Link to="/pricing">
                <Button variant="outline" size="sm">
                  Upgrade
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Referral */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <Share2 className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-sm">Freunde einladen</p>
              <p className="text-xs text-muted-foreground">Erhalte Bonus-Credits für jede Einladung</p>
            </div>
          </div>
          <div className="flex gap-2">
            <code className="flex-1 px-3 py-2 bg-muted rounded-lg text-xs truncate">
              {referralLink}
            </code>
            <Button variant="outline" size="sm" onClick={copyReferral}>
              {referralCopied ? 'Kopiert!' : 'Kopieren'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="space-y-1">
        {[
          { icon: Dumbbell, label: 'Trainingspläne', to: '/training' },
          { icon: Heart, label: 'Fortschritt & Erfolge', to: '/progress' },
          { icon: Settings, label: 'Einstellungen', to: '/settings' },
          { icon: Shield, label: 'Fintutto-Ökosystem', to: '/pricing', external: false },
        ].map(({ icon: Icon, label, to }) => (
          <Link key={label} to={to}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-sm font-medium">{label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Fintutto Apps */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-5 pb-4">
          <p className="font-semibold text-sm mb-1">Weitere Fintutto-Apps</p>
          <p className="text-xs text-muted-foreground mb-3">
            Nutze dein Konto für alle Apps im Fintutto-Ökosystem.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Fintutto Portal', icon: '✨' },
              { name: 'Vermietify', icon: '🏠' },
              { name: 'BescheidBoxer', icon: '🥊' },
              { name: 'Ablesung', icon: '📊' },
            ].map(({ name, icon }) => (
              <span key={name} className="inline-flex items-center gap-1 px-2 py-1 bg-background rounded-lg text-xs">
                {icon} {name}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      {user && (
        <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Abmelden
        </Button>
      )}
    </div>
  )
}
