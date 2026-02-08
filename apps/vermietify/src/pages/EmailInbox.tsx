import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import {
  Mail,
  Inbox,
  Copy,
  Check,
  Plus,
  Trash2,
  FileText,
  Paperclip,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  RefreshCw,
  Shield,
  Send,
} from 'lucide-react'

type Tab = 'inbox' | 'questions' | 'senders'

interface EmailInboxData {
  id: string
  generated_address: string
  is_active: boolean
}

interface InboundEmail {
  id: string
  sender_email: string
  subject: string | null
  received_at: string
  status: 'pending' | 'processed' | 'unclear' | 'rejected'
  notes: string | null
}

interface BookingQuestion {
  id: string
  email_id: string
  question: string
  suggested_category: string | null
  suggested_amount: number | null
  is_resolved: boolean
  created_at: string
  email?: InboundEmail
}

interface VerifiedSender {
  id: string
  email: string
  is_verified: boolean
  verified_at: string | null
}

function generateEmailAddress(userId: string): string {
  const shortId = userId.replace(/-/g, '').slice(0, 8)
  return `belege-${shortId}@eingang.vermietify.de`
}

function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

const statusConfig = {
  pending: { label: 'Ausstehend', icon: Clock, className: 'text-yellow-600 bg-yellow-50' },
  processed: { label: 'Gebucht', icon: CheckCircle2, className: 'text-green-600 bg-green-50' },
  unclear: { label: 'Unklar', icon: HelpCircle, className: 'text-orange-600 bg-orange-50' },
  rejected: { label: 'Abgelehnt', icon: XCircle, className: 'text-red-600 bg-red-50' },
}

export function EmailInbox() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('inbox')
  const [inbox, setInbox] = useState<EmailInboxData | null>(null)
  const [emails, setEmails] = useState<InboundEmail[]>([])
  const [questions, setQuestions] = useState<BookingQuestion[]>([])
  const [senders, setSenders] = useState<VerifiedSender[]>([])
  const [copied, setCopied] = useState(false)
  const [newSenderEmail, setNewSenderEmail] = useState('')
  const [loading, setLoading] = useState(true)

  const loadInbox = useCallback(async () => {
    if (!user) return

    const { data: existingInbox } = await supabase
      .from('email_inboxes')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existingInbox) {
      setInbox(existingInbox)
    } else {
      const generatedAddress = generateEmailAddress(user.id)
      const { data: newInbox, error } = await supabase
        .from('email_inboxes')
        .insert({ user_id: user.id, generated_address: generatedAddress })
        .select()
        .single()

      if (error) {
        toast.error('Fehler beim Erstellen des E-Mail-Postfachs')
        return
      }
      setInbox(newInbox)
    }
  }, [user])

  const loadEmails = useCallback(async () => {
    if (!user) return

    const { data } = await supabase
      .from('inbound_emails')
      .select('*')
      .eq('user_id', user.id)
      .order('received_at', { ascending: false })

    if (data) setEmails(data)
  }, [user])

  const loadQuestions = useCallback(async () => {
    if (!user) return

    const { data } = await supabase
      .from('booking_questions')
      .select('*, inbound_emails(*)')
      .eq('user_id', user.id)
      .eq('is_resolved', false)
      .order('created_at', { ascending: false })

    if (data) {
      setQuestions(
        data.map((q: Record<string, unknown>) => ({
          ...q,
          email: q.inbound_emails as unknown as InboundEmail | undefined,
        })) as BookingQuestion[]
      )
    }
  }, [user])

  const loadSenders = useCallback(async () => {
    if (!user) return

    const { data } = await supabase
      .from('verified_senders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setSenders(data)
  }, [user])

  useEffect(() => {
    async function loadAll() {
      setLoading(true)
      await Promise.all([loadInbox(), loadEmails(), loadQuestions(), loadSenders()])
      setLoading(false)
    }
    loadAll()
  }, [loadInbox, loadEmails, loadQuestions, loadSenders])

  const handleCopyAddress = async () => {
    if (!inbox) return
    await navigator.clipboard.writeText(inbox.generated_address)
    setCopied(true)
    toast.success('E-Mail-Adresse kopiert')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddSender = async () => {
    if (!user || !newSenderEmail.trim()) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newSenderEmail)) {
      toast.error('Bitte geben Sie eine gueltige E-Mail-Adresse ein')
      return
    }

    const { data: newSender, error } = await supabase.from('verified_senders').insert({
      user_id: user.id,
      email: newSenderEmail.trim().toLowerCase(),
    }).select().single()

    if (error) {
      if (error.code === '23505') {
        toast.error('Diese E-Mail-Adresse ist bereits hinterlegt')
      } else {
        toast.error('Fehler beim Hinzufuegen der Absenderadresse')
      }
      return
    }

    toast.success('Absenderadresse hinzugefuegt - Verifizierungs-E-Mail wird gesendet...')
    setNewSenderEmail('')
    loadSenders()

    // Trigger verification email
    if (newSender) {
      handleSendVerification(newSender.id)
    }
  }

  const handleSendVerification = async (senderId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    try {
      const response = await fetch('/api/verify-sender', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ sender_id: senderId }),
      })

      const result = await response.json()

      if (result.dev_mode) {
        toast.success('Absenderadresse automatisch verifiziert (Dev-Modus)')
        loadSenders()
      } else if (result.status === 'verification_sent') {
        toast.success('Verifizierungs-E-Mail gesendet! Bitte pruefen Sie Ihr Postfach.')
      } else {
        toast.error(result.error || 'Fehler beim Senden der Verifizierung')
      }
    } catch {
      toast.error('Verifizierungs-E-Mail konnte nicht gesendet werden')
    }
  }

  const handleRemoveSender = async (id: string) => {
    const { error } = await supabase.from('verified_senders').delete().eq('id', id)

    if (error) {
      toast.error('Fehler beim Entfernen der Absenderadresse')
      return
    }

    toast.success('Absenderadresse entfernt')
    loadSenders()
  }

  const handleResolveQuestion = async (questionId: string) => {
    const { error } = await supabase
      .from('booking_questions')
      .update({ is_resolved: true, resolved_at: new Date().toISOString() })
      .eq('id', questionId)

    if (error) {
      toast.error('Fehler beim Erledigen der Frage')
      return
    }

    toast.success('Frage als erledigt markiert')
    loadQuestions()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">E-Mail Posteingang</h1>
          <p className="text-muted-foreground">
            Belege per E-Mail empfangen und automatisch verbuchen
          </p>
        </div>
        <Button variant="outline" onClick={() => { loadEmails(); loadQuestions() }}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Aktualisieren
        </Button>
      </div>

      {/* Generated Email Address Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-primary" />
            Ihre persoenliche Belegadresse
          </CardTitle>
          <CardDescription>
            Senden Sie Rechnungen und Belege als PDF-Anhang an diese Adresse.
            E-Mails werden automatisch verarbeitet und verbucht.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 rounded-lg border bg-background px-4 py-3 font-mono text-sm">
              <Inbox className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">{inbox?.generated_address ?? '...'}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopyAddress}>
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="ml-2">{copied ? 'Kopiert' : 'Kopieren'}</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Nur E-Mails von verifizierten Absenderadressen werden akzeptiert.
            Verwalten Sie Ihre Absender im Tab &quot;Verifizierte Absender&quot;.
          </p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'inbox'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('inbox')}
        >
          <span className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Posteingang
            {emails.length > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {emails.length}
              </span>
            )}
          </span>
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'questions'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('questions')}
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Offene Fragen
            {questions.length > 0 && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                {questions.length}
              </span>
            )}
          </span>
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'senders'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('senders')}
        >
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Verifizierte Absender
          </span>
        </button>
      </div>

      {/* Tab Content: Inbox */}
      {activeTab === 'inbox' && (
        <div className="space-y-3">
          {emails.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Noch keine E-Mails empfangen</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                  Senden Sie eine E-Mail mit PDF-Beleg an Ihre persoenliche Belegadresse.
                  Die E-Mail wird hier angezeigt und automatisch verarbeitet.
                </p>
              </CardContent>
            </Card>
          ) : (
            emails.map((email) => {
              const status = statusConfig[email.status]
              const StatusIcon = status.icon
              return (
                <Card key={email.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="mt-0.5 shrink-0">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {email.subject || '(Kein Betreff)'}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            Von: {email.sender_email}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDateTime(email.received_at)}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium shrink-0 ${status.className}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {status.label}
                      </div>
                    </div>
                    {email.notes && (
                      <p className="text-sm text-muted-foreground mt-2 pl-7">
                        {email.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}

      {/* Tab Content: Questions */}
      {activeTab === 'questions' && (
        <div className="space-y-3">
          {questions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium">Keine offenen Fragen</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Alle eingegangenen Belege konnten automatisch zugeordnet werden.
                  Unklare Positionen erscheinen hier zur manuellen Buchung.
                </p>
              </CardContent>
            </Card>
          ) : (
            questions.map((q) => (
              <Card key={q.id} className="border-orange-200">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 shrink-0">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">{q.question}</p>
                        {q.suggested_category && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Vorgeschlagene Kategorie: <span className="font-medium">{q.suggested_category}</span>
                          </p>
                        )}
                        {q.suggested_amount != null && (
                          <p className="text-sm text-muted-foreground">
                            Betrag: <span className="font-medium">
                              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(q.suggested_amount)}
                            </span>
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDateTime(q.created_at)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolveQuestion(q.id)}
                    >
                      <Check className="mr-1 h-3.5 w-3.5" />
                      Erledigt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab Content: Verified Senders */}
      {activeTab === 'senders' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Absenderadresse hinzufuegen</CardTitle>
              <CardDescription>
                Nur E-Mails von hier hinterlegten Adressen werden angenommen.
                So schuetzen wir Ihr Postfach vor Spam.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="sender-email" className="sr-only">
                    E-Mail-Adresse
                  </Label>
                  <Input
                    id="sender-email"
                    type="email"
                    placeholder="ihre.email@beispiel.de"
                    value={newSenderEmail}
                    onChange={(e) => setNewSenderEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSender()}
                  />
                </div>
                <Button onClick={handleAddSender}>
                  <Plus className="mr-2 h-4 w-4" />
                  Hinzufuegen
                </Button>
              </div>
            </CardContent>
          </Card>

          {senders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Keine Absender hinterlegt</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Fuegen Sie Ihre E-Mail-Adresse(n) hinzu, von denen Sie Belege senden moechten.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {senders.map((sender) => (
                <Card key={sender.id}>
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{sender.email}</span>
                        {sender.is_verified ? (
                          <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Verifiziert
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700">
                            <Clock className="h-3 w-3" />
                            Ausstehend
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {!sender.is_verified && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendVerification(sender.id)}
                          >
                            <Send className="mr-1 h-3.5 w-3.5" />
                            Verifizieren
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSender(sender.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
