import { useState } from 'react'
import { Copy, Check, Share2, Mail, Link2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useToast } from '../../hooks/use-toast'

interface ReferralShareCardProps {
  referralCode: string
  referralLink: string
}

export default function ReferralShareCard({ referralCode, referralLink }: ReferralShareCardProps) {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)
  const { toast } = useToast()

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      toast({
        title: 'Kopiert!',
        description: type === 'code' ? 'Referral-Code kopiert' : 'Einladungslink kopiert',
      })
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast({
        title: 'Fehler',
        description: 'Konnte nicht in die Zwischenablage kopiert werden.',
        variant: 'destructive',
      })
    }
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Teste Steuer-Bescheidprüfer - Steuerbescheide einfach pruefen')
    const body = encodeURIComponent(
      `Hallo,\n\nich nutze den Steuer-Bescheidprüfer um meine Steuerbescheide automatisch pruefen zu lassen und kann es nur empfehlen!\n\nMelde dich ueber meinen Einladungslink an:\n${referralLink}\n\nOder nutze meinen Code: ${referralCode}\n\nViele Gruesse`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Steuer-Bescheidprüfer - Steuerbescheide pruefen',
          text: `Teste den Steuer-Bescheidprüfer! Mein Einladungscode: ${referralCode}`,
          url: referralLink,
        })
      } catch {
        // User cancelled sharing
      }
    } else {
      copyToClipboard(referralLink, 'link')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Freunde einladen
        </CardTitle>
        <CardDescription>
          Teile deinen persoenlichen Einladungscode und erhalte Credits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Referral Code */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Dein Referral-Code</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={referralCode}
                readOnly
                className="font-mono text-lg font-bold tracking-widest text-center bg-muted"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(referralCode, 'code')}
            >
              {copied === 'code' ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Einladungslink</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={referralLink}
                readOnly
                className="text-sm bg-muted pr-10"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(referralLink, 'link')}
            >
              {copied === 'link' ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1 gap-2" onClick={shareViaEmail}>
            <Mail className="h-4 w-4" />
            Per E-Mail
          </Button>
          <Button className="flex-1 gap-2" onClick={shareNative}>
            <Share2 className="h-4 w-4" />
            Teilen
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
