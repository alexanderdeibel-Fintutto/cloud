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
  Download,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  Eye,
} from 'lucide-react'

type Tab = 'inbox' | 'questions' | 'senders'

interface EmailInboxData {
  id: string
  generated_address: string
  is_active: boolean
}

interface EmailAttachment {
  id: string
  email_id: string
  file_name: string
  file_type: string
  file_size: number
  file_path: string
}

interface InboundEmail {
  id: string
  sender_email: string
  subject: string | null
  body_text: string | null
  received_at: string
  status: 'pending' | 'processed' | 'unclear' | 'rejected'
  notes: string | null
  attachments?: EmailAttachment[]
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
  return `belege-${shortId}@fintutto.de`
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null)
  const [processingEmailId, setProcessingEmailId] = useState<string | null>(null)
  const [bookingQuestionId, setBookingQuestionId] = useState<string | null>(null)
  const [bookingCategory, setBookingCategory] = useState('')
  const [bookingAmount, setBookingAmount] = useState('')

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
      const emailPrefix = generatedAddress.split('@')[0]
      const { data: newInbox, error } = await supabase
        .from('email_inboxes')
        .insert({ user_id: user.id, generated_address: generatedAddress, email_prefix: emailPrefix })
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
      .select('*, email_attachments(*)')
      .eq('user_id', user.id)
      .order('received_at', { ascending: false })

    if (data) {
      setEmails(
        data.map((e: Record<string, unknown>) => ({
          ...e,
          attachments: (e.email_attachments as EmailAttachment[]) || [],
        })) as InboundEmail[]
      )
    }
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

  // Realtime subscription for live updates
  useEffect(() => {
    if (!user) return

    const emailChannel = supabase
      .channel('inbound-emails-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inbound_emails', filter: `user_id=eq.${user.id}` },
        () => { loadEmails() }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'booking_questions', filter: `user_id=eq.${user.id}` },
        () => { loadQuestions() }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(emailChannel)
    }
  }, [user, loadEmails, loadQuestions])

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

  const handleOpenBooking = (q: BookingQuestion) => {
    setBookingQuestionId(q.id)
    setBookingCategory(q.suggested_category || '')
    setBookingAmount(q.suggested_amount != null ? String(q.suggested_amount).replace('.', ',') : '')
  }

  const handleConfirmBooking = async () => {
    if (!bookingQuestionId) return

    const question = questions.find((q) => q.id === bookingQuestionId)
    if (!question) return

    const amount = bookingAmount ? parseFloat(bookingAmount.replace(',', '.')) : null
    const notes = `Manuell gebucht: ${bookingCategory || 'Ohne Kategorie'}${amount ? ` - ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)}` : ''}`

    // Mark question resolved
    const { error } = await supabase
      .from('booking_questions')
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString(),
        resolution_notes: notes,
      })
      .eq('id', bookingQuestionId)

    if (error) {
      toast.error('Fehler beim Buchen')
      return
    }

    // Mark the email as processed
    if (question.email_id) {
      await supabase.from('inbound_emails').update({
        status: 'processed',
        processed_at: new Date().toISOString(),
        notes,
      }).eq('id', question.email_id)
    }

    toast.success('Beleg erfolgreich gebucht')
    setBookingQuestionId(null)
    setBookingCategory('')
    setBookingAmount('')
    loadQuestions()
    loadEmails()
  }

  const handleCancelBooking = () => {
    setBookingQuestionId(null)
    setBookingCategory('')
    setBookingAmount('')
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

  // #8: Manual AI processing trigger
  const handleProcessReceipt = async (emailId: string, attachmentId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    setProcessingEmailId(emailId)

    try {
      const response = await fetch('/api/process-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email_id: emailId, attachment_id: attachmentId }),
      })

      const result = await response.json()

      if (result.status === 'analyzed') {
        toast.success(
          result.data?.confidence >= 0.7
            ? 'Beleg erfolgreich erkannt und verbucht!'
            : 'Beleg teilweise erkannt - bitte manuell pruefen.'
        )
        loadEmails()
        loadQuestions()
      } else {
        toast.error(result.error || 'Fehler bei der Verarbeitung')
      }
    } catch {
      toast.error('Verarbeitung fehlgeschlagen')
    } finally {
      setProcessingEmailId(null)
    }
  }

  // #10: Download attachment via signed URL
  const handleDownloadAttachment = async (attachment: EmailAttachment) => {
    const { data, error } = await supabase.storage
      .from('email-attachments')
      .createSignedUrl(attachment.file_path, 60) // 60 seconds

    if (error || !data?.signedUrl) {
      toast.error('Download fehlgeschlagen')
      return
    }

    window.open(data.signedUrl, '_blank')
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
              const isExpanded = expandedEmailId === email.id
              const attachments = email.attachments || []
              const isProcessing = processingEmailId === email.id

              return (
                <Card key={email.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="py-4">
                    {/* Email header row */}
                    <div
                      className="flex items-start justify-between gap-4 cursor-pointer"
                      onClick={() => setExpandedEmailId(isExpanded ? null : email.id)}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="mt-0.5 shrink-0">
                          {attachments.length > 0 ? (
                            <Paperclip className="h-4 w-4 text-primary" />
                          ) : (
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {email.subject || '(Kein Betreff)'}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            Von: {email.sender_email}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(email.received_at)}
                            </p>
                            {attachments.length > 0 && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                                {attachments.length} {attachments.length === 1 ? 'Anhang' : 'Anhaenge'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {status.label}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Notes (always visible if present) */}
                    {email.notes && !isExpanded && (
                      <p className="text-sm text-muted-foreground mt-2 pl-7 truncate">
                        {email.notes}
                      </p>
                    )}

                    {/* #9: Expanded detail view */}
                    {isExpanded && (
                      <div className="mt-4 pl-7 space-y-4">
                        <Separator />

                        {/* Notes */}
                        {email.notes && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Verarbeitungshinweis</p>
                            <p className="text-sm">{email.notes}</p>
                          </div>
                        )}

                        {/* Email body preview */}
                        {email.body_text && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">E-Mail-Inhalt</p>
                            <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                              {email.body_text.substring(0, 2000)}
                              {(email.body_text?.length ?? 0) > 2000 && '...'}
                            </div>
                          </div>
                        )}

                        {/* #10: Attachments with download */}
                        {attachments.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Anhaenge</p>
                            <div className="space-y-2">
                              {attachments.map((att) => (
                                <div
                                  key={att.id}
                                  className="flex items-center justify-between rounded-md border bg-background p-3"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <FileText className="h-5 w-5 text-red-500 shrink-0" />
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium truncate">{att.file_name}</p>
                                      <p className="text-xs text-muted-foreground">{formatFileSize(att.file_size)}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {/* #8: Manual process button */}
                                    {(email.status === 'pending' || email.status === 'unclear') && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={isProcessing}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleProcessReceipt(email.id, att.id)
                                        }}
                                      >
                                        {isProcessing ? (
                                          <RefreshCw className="mr-1 h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <Sparkles className="mr-1 h-3.5 w-3.5" />
                                        )}
                                        {isProcessing ? 'Wird analysiert...' : 'KI-Analyse'}
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDownloadAttachment(att)
                                      }}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
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
                      <div className="min-w-0 flex-1">
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
                        {q.email && (
                          <p className="text-xs text-muted-foreground mt-1">
                            E-Mail: {q.email.subject || '(Kein Betreff)'} - Von: {q.email.sender_email}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDateTime(q.created_at)}
                        </p>

                        {/* Inline Booking Form */}
                        {bookingQuestionId === q.id && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-lg border space-y-3">
                            <div>
                              <Label htmlFor={`cat-${q.id}`} className="text-xs font-medium">Kategorie</Label>
                              <select
                                id={`cat-${q.id}`}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={bookingCategory}
                                onChange={(e) => setBookingCategory(e.target.value)}
                              >
                                <option value="">Kategorie waehlen...</option>
                                <option value="Nebenkosten">Nebenkosten</option>
                                <option value="Versicherung">Versicherung</option>
                                <option value="Reparatur">Reparatur</option>
                                <option value="Steuern">Steuern</option>
                                <option value="Verwaltung">Verwaltung</option>
                                <option value="Energie">Energie</option>
                                <option value="Wasser">Wasser</option>
                                <option value="Muellentsorgung">Muellentsorgung</option>
                                <option value="Grundstueck">Grundstueck</option>
                                <option value="Rechtskosten">Rechtskosten</option>
                                <option value="Sonstiges">Sonstiges</option>
                              </select>
                            </div>
                            <div>
                              <Label htmlFor={`amt-${q.id}`} className="text-xs font-medium">Betrag (EUR)</Label>
                              <Input
                                id={`amt-${q.id}`}
                                type="text"
                                placeholder="z.B. 123,45"
                                value={bookingAmount}
                                onChange={(e) => setBookingAmount(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleConfirmBooking}>
                                <Check className="mr-1 h-3.5 w-3.5" />
                                Bestaetigen
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelBooking}>
                                <X className="mr-1 h-3.5 w-3.5" />
                                Abbrechen
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {bookingQuestionId !== q.id && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleOpenBooking(q)}
                        >
                          <FileText className="mr-1 h-3.5 w-3.5" />
                          Buchen
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveQuestion(q.id)}
                        >
                          <Check className="mr-1 h-3.5 w-3.5" />
                          Erledigt
                        </Button>
                      </div>
                    )}
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
