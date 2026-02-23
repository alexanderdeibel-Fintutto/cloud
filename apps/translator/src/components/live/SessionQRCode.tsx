import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Check, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getSessionUrl } from '@/lib/session'

interface SessionQRCodeProps {
  code: string
}

export default function SessionQRCode({ code }: SessionQRCodeProps) {
  const [copied, setCopied] = useState(false)
  const url = getSessionUrl(code)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Fintutto Live-Übersetzung',
        text: `Tritt meiner Live-Übersetzung bei: ${code}`,
        url,
      })
    } else {
      handleCopy()
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-white p-4 rounded-xl">
          <QRCodeSVG value={url} size={180} level="M" />
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Session-Code</p>
          <p className="text-3xl font-bold tracking-widest font-mono">{code}</p>
        </div>

        <p className="text-xs text-muted-foreground text-center max-w-[250px]">
          Listener scannen den QR-Code oder öffnen den Link im Browser
        </p>

        <div className="flex gap-2 w-full">
          <Button variant="outline" className="flex-1 gap-2" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Kopiert!' : 'Link kopieren'}
          </Button>
          <Button variant="outline" className="flex-1 gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            Teilen
          </Button>
        </div>
      </div>
    </Card>
  )
}
