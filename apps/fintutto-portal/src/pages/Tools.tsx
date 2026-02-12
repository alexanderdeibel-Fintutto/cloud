import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import {
  Calculator, FileText, Receipt, Building2, Scale, TrendingUp, Calendar,
  CreditCard, Landmark, FileSpreadsheet, Upload, PiggyBank, Euro, Percent,
  Clock, Users, Wallet, ArrowRightLeft, Search, Star, Sparkles, Lock,
  BookOpen, AlertTriangle, BarChart3, Briefcase, Globe, Mail, FileCheck
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  route: string;
  category: 'accounting' | 'tax' | 'banking' | 'reports' | 'productivity' | 'compliance';
  tier: 'free' | 'starter' | 'professional' | 'enterprise';
  isNew?: boolean;
  isPopular?: boolean;
}

const TOOLS: Tool[] = [
  // Accounting Tools
  { id: 'chart-of-accounts', name: 'Kontenrahmen', description: 'SKR03/SKR04 Kontenplan verwalten', icon: BookOpen, route: '/kontenrahmen', category: 'accounting', tier: 'free' },
  { id: 'journal', name: 'Buchungsjournal', description: 'Alle Buchungen erfassen und verwalten', icon: FileText, route: '/journal', category: 'accounting', tier: 'free', isPopular: true },
  { id: 'invoices', name: 'Rechnungen', description: 'Rechnungen erstellen und verwalten', icon: Receipt, route: '/invoices', category: 'accounting', tier: 'free', isPopular: true },
  { id: 'receipts', name: 'Belege', description: 'Belege hochladen und kategorisieren', icon: FileCheck, route: '/receipts', category: 'accounting', tier: 'free' },
  { id: 'open-items', name: 'Offene Posten', description: 'Offene Forderungen & Verbindlichkeiten', icon: AlertTriangle, route: '/offene-posten', category: 'accounting', tier: 'starter' },
  { id: 'dunning', name: 'Mahnwesen', description: 'Automatische Zahlungserinnerungen', icon: Mail, route: '/mahnwesen', category: 'accounting', tier: 'starter' },
  { id: 'recurring', name: 'Wiederkehrende Buchungen', description: 'Daueraufträge und Abos verwalten', icon: Clock, route: '/recurring', category: 'accounting', tier: 'starter' },
  { id: 'cost-centers', name: 'Kostenstellen', description: 'Kostenstellenrechnung', icon: Building2, route: '/kostenstellen', category: 'accounting', tier: 'professional' },
  { id: 'projects', name: 'Projektbuchhaltung', description: 'Projektbasierte Kostenerfassung', icon: Briefcase, route: '/projekte', category: 'accounting', tier: 'professional' },
  { id: 'multi-currency', name: 'Fremdwährungen', description: 'Multi-Währungs-Transaktionen', icon: Globe, route: '/waehrungen', category: 'accounting', tier: 'professional', isNew: true },

  // Tax Tools
  { id: 'vat-helper', name: 'USt-Voranmeldung', description: 'USt-VA berechnen & an ELSTER senden', icon: Percent, route: '/ust-va', category: 'tax', tier: 'starter', isPopular: true },
  { id: 'vat-calculator', name: 'MwSt-Rechner', description: 'Schnelle MwSt-Berechnung', icon: Calculator, route: '/mwst-rechner', category: 'tax', tier: 'free' },

  // Banking Tools
  { id: 'bank-accounts', name: 'Bankkonten', description: 'Bankverbindungen verwalten', icon: Landmark, route: '/bank', category: 'banking', tier: 'free' },
  { id: 'bank-import', name: 'Kontoauszüge importieren', description: 'CSV, MT940, CAMT.053 Import', icon: Upload, route: '/bank?import=true', category: 'banking', tier: 'starter' },
  { id: 'bank-reconciliation', name: 'Bankabstimmung', description: 'Automatischer Kontenabgleich', icon: ArrowRightLeft, route: '/bankabstimmung', category: 'banking', tier: 'starter' },
  { id: 'cash-book', name: 'Kassenbuch', description: 'Bargeldbewegungen erfassen', icon: Wallet, route: '/kassenbuch', category: 'banking', tier: 'starter' },
  { id: 'sepa', name: 'SEPA-Zahlungen', description: 'SEPA-Überweisungen & Lastschriften', icon: Euro, route: '/sepa', category: 'banking', tier: 'professional' },
  { id: 'online-payments', name: 'Online-Zahlungen', description: 'Stripe, PayPal Integration', icon: CreditCard, route: '/online-payments', category: 'banking', tier: 'professional', isNew: true },

  // Reports
  { id: 'balance-sheet', name: 'Bilanz', description: 'Vermögensübersicht nach HGB § 266', icon: Scale, route: '/bilanz', category: 'reports', tier: 'starter' },
  { id: 'profit-loss', name: 'GuV', description: 'Gewinn- und Verlustrechnung', icon: TrendingUp, route: '/guv', category: 'reports', tier: 'starter' },
  { id: 'bwa', name: 'BWA', description: 'Betriebswirtschaftliche Auswertung', icon: BarChart3, route: '/bwa', category: 'reports', tier: 'starter', isPopular: true },
  { id: 'trial-balance', name: 'Summen- und Saldenliste', description: 'Kontenübersicht mit Salden', icon: FileSpreadsheet, route: '/susa', category: 'reports', tier: 'starter' },
  { id: 'account-statement', name: 'Kontoauszüge', description: 'Einzelne Konten analysieren', icon: FileText, route: '/kontoauszug', category: 'reports', tier: 'starter' },
  { id: 'cash-flow', name: 'Cashflow-Analyse', description: 'Liquiditätsplanung', icon: TrendingUp, route: '/cashflow', category: 'reports', tier: 'professional' },

  // Productivity
  { id: 'import-wizard', name: 'Daten-Import', description: 'CSV, DATEV, Excel importieren', icon: Upload, route: '/import', category: 'productivity', tier: 'starter' },
  { id: 'templates', name: 'Buchungsvorlagen', description: 'Schnellbuchungen mit Vorlagen', icon: FileText, route: '/vorlagen', category: 'productivity', tier: 'starter' },
  { id: 'batch-operations', name: 'Stapelverarbeitung', description: 'Massenoperationen durchführen', icon: FileSpreadsheet, route: '/stapel', category: 'productivity', tier: 'professional' },
  { id: 'scheduler', name: 'Scheduler', description: 'Automatisierte Aufgaben planen', icon: Calendar, route: '/scheduler', category: 'productivity', tier: 'professional' },
  { id: 'contacts', name: 'Kontakte', description: 'Kunden & Lieferanten verwalten', icon: Users, route: '/contacts', category: 'productivity', tier: 'free' },
  { id: 'budgeting', name: 'Budgetierung', description: 'Budgets planen und überwachen', icon: PiggyBank, route: '/budget', category: 'productivity', tier: 'professional', isNew: true },

  // Compliance
  { id: 'period-closing', name: 'Periodenabschluss', description: 'Monats-/Quartals-/Jahresabschluss', icon: Calendar, route: '/periodenabschluss', category: 'compliance', tier: 'starter' },
  { id: 'year-end', name: 'Jahresabschluss', description: 'Kompletter Jahresabschluss-Workflow', icon: FileCheck, route: '/jahresabschluss', category: 'compliance', tier: 'professional' },
  { id: 'audit-trail', name: 'Audit Trail', description: 'GoBD-konforme Änderungshistorie', icon: Clock, route: '/audit', category: 'compliance', tier: 'professional' },
  { id: 'datev-export', name: 'DATEV-Export', description: 'Export für Steuerberater', icon: FileSpreadsheet, route: '/datev-export', category: 'compliance', tier: 'starter' },
];

const CATEGORIES = [
  { id: 'all', label: 'Alle Tools', icon: Sparkles },
  { id: 'accounting', label: 'Buchhaltung', icon: FileText },
  { id: 'tax', label: 'Steuern', icon: Percent },
  { id: 'banking', label: 'Banking', icon: Landmark },
  { id: 'reports', label: 'Auswertungen', icon: BarChart3 },
  { id: 'productivity', label: 'Produktivität', icon: Clock },
  { id: 'compliance', label: 'Compliance', icon: FileCheck },
];

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: 'Kostenlos', color: 'bg-green-500' },
  starter: { label: 'Starter', color: 'bg-blue-500' },
  professional: { label: 'Professional', color: 'bg-purple-500' },
  enterprise: { label: 'Enterprise', color: 'bg-orange-500' },
};

const Tools = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock: current user tier - would come from subscription context
  const currentTier = 'starter';
  const tierOrder = ['free', 'starter', 'professional', 'enterprise'];
  const currentTierIndex = tierOrder.indexOf(currentTier);

  const filteredTools = TOOLS.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isToolLocked = (tool: Tool) => {
    const toolTierIndex = tierOrder.indexOf(tool.tier);
    return toolTierIndex > currentTierIndex;
  };

  const handleToolClick = (tool: Tool) => {
    if (isToolLocked(tool)) {
      navigate('/pricing');
    } else {
      navigate(tool.route);
    }
  };

  const popularTools = TOOLS.filter(t => t.isPopular);
  const newTools = TOOLS.filter(t => t.isNew);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tools & Services</h1>
          <p className="text-muted-foreground">Alle Werkzeuge für Ihre Finanzbuchhaltung</p>
        </div>
        <Button onClick={() => navigate('/pricing')}>
          <Sparkles className="h-4 w-4 mr-2" />
          Upgrade
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tools durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Featured Sections */}
      {!searchQuery && selectedCategory === 'all' && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Popular Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Beliebte Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {popularTools.map(tool => (
                <Button
                  key={tool.id}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleToolClick(tool)}
                >
                  <tool.icon className="h-4 w-4 mr-2" />
                  {tool.name}
                  {isToolLocked(tool) && <Lock className="h-3 w-3 ml-auto" />}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* New Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Neu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {newTools.map(tool => (
                <Button
                  key={tool.id}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleToolClick(tool)}
                >
                  <tool.icon className="h-4 w-4 mr-2" />
                  {tool.name}
                  <Badge variant="secondary" className="ml-2">Neu</Badge>
                  {isToolLocked(tool) && <Lock className="h-3 w-3 ml-auto" />}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex-wrap h-auto gap-1">
          {CATEGORIES.map(cat => (
            <TabsTrigger key={cat.id} value={cat.id} className="gap-1">
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTools.map(tool => {
              const locked = isToolLocked(tool);
              const tierInfo = TIER_LABELS[tool.tier];

              return (
                <Card
                  key={tool.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${locked ? 'opacity-75' : ''}`}
                  onClick={() => handleToolClick(tool)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-lg ${locked ? 'bg-muted' : 'bg-primary/10'}`}>
                        <tool.icon className={`h-5 w-5 ${locked ? 'text-muted-foreground' : 'text-primary'}`} />
                      </div>
                      <div className="flex gap-1">
                        {tool.isNew && <Badge variant="secondary">Neu</Badge>}
                        {tool.isPopular && <Badge variant="outline"><Star className="h-3 w-3" /></Badge>}
                        {locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>
                    <CardTitle className="text-base mt-2">{tool.name}</CardTitle>
                    <CardDescription className="text-sm">{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Badge variant="outline" className={`text-xs text-white ${tierInfo.color}`}>
                      {tierInfo.label}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Tools gefunden.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Upgrade CTA */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Mehr Funktionen freischalten</h3>
              <p className="text-muted-foreground">Upgrade auf Professional für erweiterte Buchhaltungsfunktionen</p>
            </div>
            <Button onClick={() => navigate('/pricing')}>
              Pläne vergleichen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tools;
