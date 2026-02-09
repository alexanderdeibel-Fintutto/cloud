import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useForm } from '@/contexts/FormContext'

interface SendEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentTitle: string
}

export default function SendEmailDialog({
  open,
  onOpenChange,
  documentTitle,
}: SendEmailDialogProps) {
  const { sendEmail } = useForm()
  const [isSending, setIsSending] = useState(false)
  const [formData, setFormData] = useState({
    to: '',
    subject: `Dokument: ${documentTitle}`,
    message: `Sehr geehrte Damen und Herren,

anbei erhalten Sie das angeforderte Dokument "${documentTitle}".

Bei Fragen stehe ich Ihnen gerne zur Verfuegung.

Mit freundlichen Gruessen`,
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.to.trim()) {
      toast.error('Bitte geben Sie eine E-Mail-Adresse ein')
      return
    }

    if (!validateEmail(formData.to)) {
      toast.error('Bitte geben Sie eine gueltige E-Mail-Adresse ein')
      return
    }

    if (!formData.subject.trim()) {
      toast.error('Bitte geben Sie einen Betreff ein')
      return
    }

    setIsSending(true)

    try {
      await sendEmail(formData.to, formData.subject, formData.message)
      toast.success('Dokument wurde erfolgreich gesendet')
      onOpenChange(false)
      // Reset form
      setFormData({
        to: '',
        subject: `Dokument: ${documentTitle}`,
        message: formData.message,
      })
    } catch (error) {
      console.error('Error sending email:', error)
      toast.error('Fehler beim Senden der E-Mail')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Dokument per E-Mail senden</DialogTitle>
            <DialogDescription>
              Senden Sie das aktuelle Dokument als PDF an eine E-Mail-Adresse.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="to">Empfaenger-E-Mail *</Label>
              <Input
                id="to"
                type="email"
                placeholder="empfaenger@beispiel.de"
                value={formData.to}
                onChange={(e) => handleChange('to', e.target.value)}
                disabled={isSending}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Betreff *</Label>
              <Input
                id="subject"
                type="text"
                placeholder="Betreff der E-Mail"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                disabled={isSending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Nachricht</Label>
              <Textarea
                id="message"
                placeholder="Optionale Nachricht..."
                value={formData.message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleChange('message', e.target.value)
                }
                disabled={isSending}
                rows={6}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSending}
            >
              Abbrechen
            </Button>
            <Button type="submit" variant="fintutto" disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Senden
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
