import { useState } from 'react';
import {
  CreditCard,
  Plus,
  Settings,
  Link,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  ExternalLink,
  Copy,
  TrendingUp,
  Euro,
  Percent,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCompany } from '@/contexts/CompanyContext';
import { useOnlinePayments, PaymentProvider, PaymentStatus } from '@/hooks/useOnlinePayments';
import { useToast } from '@/hooks/use-toast';

export default function OnlinePayments() {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const {
    providers,
    payments,
    paymentLinks,
    loading,
    configureProvider,
    toggleProvider,
    createPaymentLink,
    deactivateLink,
    createPayment,
    processPayment,
    refundPayment,
    getStats,
    getProviderInfo,
  } = useOnlinePayments();

  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('stripe');
  const [activeTab, setActiveTab] = useState<'payments' | 'links' | 'providers'>('payments');

  const [providerConfig, setProviderConfig] = useState({
    api_key: '',
    secret_key: '',
    is_test_mode: true,
  });

  const [newLink, setNewLink] = useState({
    amount: '',
    description: '',
    expires_in_days: '',
  });

  const stats = getStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const config: Record<PaymentStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      pending: { label: 'Ausstehend', variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> },
      processing: { label: 'Wird verarbeitet', variant: 'outline', icon: <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> },
      completed: { label: 'Abgeschlossen', variant: 'default', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      failed: { label: 'Fehlgeschlagen', variant: 'destructive', icon: <XCircle className="h-3 w-3 mr-1" /> },
      refunded: { label: 'Erstattet', variant: 'destructive', icon: <RefreshCw className="h-3 w-3 mr-1" /> },
      cancelled: { label: 'Storniert', variant: 'secondary', icon: <XCircle className="h-3 w-3 mr-1" /> },
    };
    const { label, variant, icon } = config[status];
    return (
      <Badge variant={variant} className="flex items-center">
        {icon}
        {label}
      </Badge>
    );
  };

  const handleConfigureProvider = () => {
    configureProvider({
      provider: selectedProvider,
      api_key: providerConfig.api_key,
      secret_key: providerConfig.secret_key,
      is_test_mode: providerConfig.is_test_mode,
    });
    toast({
      title: 'Provider konfiguriert',
      description: `${getProviderInfo(selectedProvider).name} wurde erfolgreich konfiguriert.`,
    });
    setConfigDialogOpen(false);
  };

  const handleToggleProvider = (providerId: string, enabled: boolean) => {
    toggleProvider(providerId, enabled);
    toast({
      title: enabled ? 'Provider aktiviert' : 'Provider deaktiviert',
      description: enabled ? 'Zahlungen können jetzt empfangen werden.' : 'Der Provider wurde deaktiviert.',
    });
  };

  const handleCreateLink = () => {
    if (!newLink.amount || !newLink.description) {
      toast({
        title: 'Fehler',
        description: 'Bitte füllen Sie alle Pflichtfelder aus.',
        variant: 'destructive',
      });
      return;
    }

    const expiresAt = newLink.expires_in_days
      ? new Date(Date.now() + parseInt(newLink.expires_in_days) * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    const link = createPaymentLink({
      amount: parseFloat(newLink.amount),
      description: newLink.description,
      expires_at: expiresAt,
    });

    if (link) {
      toast({
        title: 'Zahlungslink erstellt',
        description: 'Der Link wurde erfolgreich erstellt.',
      });
      setLinkDialogOpen(false);
      setNewLink({ amount: '', description: '', expires_in_days: '' });
    } else {
      toast({
        title: 'Fehler',
        description: 'Kein aktiver Zahlungsanbieter konfiguriert.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'Kopiert',
      description: 'Zahlungslink in Zwischenablage kopiert.',
    });
  };

  const handleSimulatePayment = async (paymentId: string) => {
    await processPayment(paymentId);
    toast({
      title: 'Zahlung abgeschlossen',
      description: 'Die Zahlung wurde erfolgreich verarbeitet.',
    });
  };

  const handleRefund = (paymentId: string) => {
    refundPayment(paymentId);
    toast({
      title: 'Erstattung durchgeführt',
      description: 'Die Zahlung wurde erstattet.',
    });
  };

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Bitte wählen Sie eine Firma aus.
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Online-Zahlungen</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Stripe, PayPal & mehr verwalten
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Link className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Zahlungslink</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Zahlungslink erstellen</DialogTitle>
                <DialogDescription>
                  Erstellen Sie einen Link, den Ihre Kunden zum Bezahlen nutzen können.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Betrag (EUR) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={newLink.amount}
                    onChange={(e) => setNewLink({ ...newLink, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Beschreibung *</Label>
                  <Input
                    placeholder="z.B. Rechnung RE-2024-001"
                    value={newLink.description}
                    onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gültigkeit (Tage, optional)</Label>
                  <Input
                    type="number"
                    placeholder="Unbegrenzt"
                    value={newLink.expires_in_days}
                    onChange={(e) => setNewLink({ ...newLink, expires_in_days: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleCreateLink}>Link erstellen</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card className="glass">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Umsatz</p>
                <p className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(stats.totalVolume)}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-success/10 shrink-0 ml-2">
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Netto</p>
                <p className="text-lg sm:text-2xl font-bold text-primary truncate">{formatCurrency(stats.netRevenue)}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-primary/10 shrink-0 ml-2">
                <Euro className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Gebühren</p>
                <p className="text-lg sm:text-2xl font-bold text-warning truncate">{formatCurrency(stats.totalFees)}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-warning/10 shrink-0 ml-2">
                <Percent className="h-4 w-4 sm:h-6 sm:w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Zahlungen</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.completedPayments}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-info/10 shrink-0 ml-2">
                <CreditCard className="h-4 w-4 sm:h-6 sm:w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="payments" className="flex-1 sm:flex-none gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Zahlungen</span>
          </TabsTrigger>
          <TabsTrigger value="links" className="flex-1 sm:flex-none gap-2">
            <Link className="h-4 w-4" />
            <span>Links</span>
          </TabsTrigger>
          <TabsTrigger value="providers" className="flex-1 sm:flex-none gap-2">
            <Settings className="h-4 w-4" />
            <span>Anbieter</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4">
          <Card className="glass overflow-hidden">
            <CardContent className="p-0">
              {payments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Noch keine Zahlungen vorhanden.
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {payments.map((payment) => {
                    const providerInfo = getProviderInfo(payment.provider);
                    return (
                      <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`p-2 rounded-lg ${providerInfo.color} text-white text-lg`}>
                            {providerInfo.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{payment.description}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {payment.customer_name || payment.customer_email} • {formatDateTime(payment.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                          {getStatusBadge(payment.status)}
                          <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                        </div>

                        <div className="flex gap-2">
                          {payment.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSimulatePayment(payment.id)}
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Simulieren
                            </Button>
                          )}
                          {payment.status === 'completed' && !payment.refunded_amount && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRefund(payment.id)}
                            >
                              <RefreshCw className="mr-1 h-3 w-3" />
                              Erstatten
                            </Button>
                          )}
                          {payment.receipt_url && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="mt-4">
          <Card className="glass overflow-hidden">
            <CardContent className="p-0">
              {paymentLinks.length === 0 ? (
                <div className="text-center py-8">
                  <Link className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Noch keine Zahlungslinks erstellt.</p>
                  <Button className="mt-4" onClick={() => setLinkDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ersten Link erstellen
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {paymentLinks.map((link) => (
                    <div key={link.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Link className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{link.description}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            Erstellt: {formatDate(link.created_at)}
                            {link.expires_at && ` • Gültig bis: ${formatDate(link.expires_at)}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-4">
                        <Badge variant={link.is_active ? 'default' : 'secondary'}>
                          {link.is_active ? 'Aktiv' : 'Deaktiviert'}
                        </Badge>
                        <span className="font-semibold">{formatCurrency(link.amount)}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyLink(link.url)}
                        >
                          <Copy className="mr-1 h-3 w-3" />
                          Kopieren
                        </Button>
                        {link.is_active && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              deactivateLink(link.id);
                              toast({ title: 'Link deaktiviert' });
                            }}
                          >
                            Deaktivieren
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="mt-4">
          <div className="space-y-4">
            {(['stripe', 'paypal', 'klarna', 'sofort'] as PaymentProvider[]).map((providerType) => {
              const info = getProviderInfo(providerType);
              const config = providers.find(p => p.provider === providerType);

              return (
                <Card key={providerType} className="glass">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className={`p-4 rounded-xl ${info.color} text-white text-3xl shrink-0`}>
                        {info.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{info.name}</h3>
                          {config?.is_test_mode && (
                            <Badge variant="outline">Testmodus</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Gebühren: {info.fees}
                        </p>
                        {config && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Konfiguriert am {formatDate(config.created_at)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {config ? (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {config.enabled ? 'Aktiviert' : 'Deaktiviert'}
                              </span>
                              <Switch
                                checked={config.enabled}
                                onCheckedChange={(checked) => handleToggleProvider(config.id, checked)}
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProvider(providerType);
                                setProviderConfig({
                                  api_key: config.api_key || '',
                                  secret_key: config.secret_key || '',
                                  is_test_mode: config.is_test_mode,
                                });
                                setConfigDialogOpen(true);
                              }}
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              Konfigurieren
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => {
                              setSelectedProvider(providerType);
                              setProviderConfig({ api_key: '', secret_key: '', is_test_mode: true });
                              setConfigDialogOpen(true);
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Einrichten
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Config Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getProviderInfo(selectedProvider).name} konfigurieren</DialogTitle>
            <DialogDescription>
              Geben Sie Ihre API-Schlüssel ein, um Zahlungen zu empfangen.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>API-Schlüssel (Public Key)</Label>
              <Input
                placeholder={selectedProvider === 'stripe' ? 'pk_test_...' : 'API Key'}
                value={providerConfig.api_key}
                onChange={(e) => setProviderConfig({ ...providerConfig, api_key: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Secret Key</Label>
              <Input
                type="password"
                placeholder={selectedProvider === 'stripe' ? 'sk_test_...' : 'Secret'}
                value={providerConfig.secret_key}
                onChange={(e) => setProviderConfig({ ...providerConfig, secret_key: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={providerConfig.is_test_mode}
                onCheckedChange={(checked) => setProviderConfig({ ...providerConfig, is_test_mode: checked })}
              />
              <Label>Testmodus (keine echten Zahlungen)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleConfigureProvider}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
