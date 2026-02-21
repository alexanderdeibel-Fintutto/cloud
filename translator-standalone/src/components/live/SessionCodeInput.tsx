import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface SessionCodeInputProps {
  onJoin: (code: string) => void
}

export default function SessionCodeInput({ onJoin }: SessionCodeInputProps) {
  const [code, setCode] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cleaned = code.trim().toUpperCase()
    if (cleaned.length >= 4) {
      // Accept with or without TR- prefix
      const normalized = cleaned.startsWith('TR-') ? cleaned : `TR-${cleaned}`
      onJoin(normalized)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground block mb-2">
            Session-Code eingeben
          </label>
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="TR-XXXX"
            className="w-full text-center text-2xl font-mono font-bold tracking-widest px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={7}
            autoFocus
          />
        </div>
        <Button type="submit" className="w-full gap-2" disabled={code.trim().length < 4}>
          <ArrowRight className="h-4 w-4" />
          Beitreten
        </Button>
      </form>
    </Card>
  )
}
