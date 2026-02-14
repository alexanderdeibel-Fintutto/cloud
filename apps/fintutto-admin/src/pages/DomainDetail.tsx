import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useDomain, useUpdateDomain } from "@/hooks/useDomains";
import { usePages, useUpdatePage, useBulkUpdatePages, type Page } from "@/hooks/usePages";
import { usePageLinks, useUpdateLink, useBulkUpdateLinks, type PageLink } from "@/hooks/usePageLinks";
import { useCheckDomain, useCrawlDomain } from "@/hooks/useDomainActions";
import {
  ArrowLeft,
  Globe,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronRight,
  Shield,
  ShieldAlert,
  Link2,
  FileText,
  Eye,
  Smartphone,
  Scale,
  Palette,
  Check,
  X,
  ArrowUpRight,
  Mail,
  Phone,
  Hash,
  Filter,
  CheckCheck,
  SquareCheck,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const statusConfig = {
  online: { label: "Online", color: "bg-emerald-500", textColor: "text-emerald-700", bgLight: "bg-emerald-50" },
  offline: { label: "Offline", color: "bg-red-500", textColor: "text-red-700", bgLight: "bg-red-50" },
  redirect: { label: "Redirect", color: "bg-blue-500", textColor: "text-blue-700", bgLight: "bg-blue-50" },
  error: { label: "Fehler", color: "bg-red-500", textColor: "text-red-700", bgLight: "bg-red-50" },
  pending: { label: "Ausstehend", color: "bg-gray-400", textColor: "text-gray-700", bgLight: "bg-gray-50" },
};

const workflowConfig = {
  nicht_begonnen: { label: "Nicht begonnen", color: "bg-gray-100 text-gray-700", icon: Clock },
  in_bearbeitung: { label: "In Bearbeitung", color: "bg-blue-100 text-blue-700", icon: RefreshCw },
  geprueft: { label: "Geprüft", color: "bg-amber-100 text-amber-700", icon: Eye },
  fertig: { label: "Fertig", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
};

const linkTypeIcons: Record<string, any> = {
  internal: Link2,
  external: ArrowUpRight,
  mailto: Mail,
  tel: Phone,
  anchor: Hash,
};

const checkItems = [
  { key: "checked_links" as const, label: "Links geprüft", icon: Link2 },
  { key: "checked_seo" as const, label: "SEO geprüft", icon: Search },
  { key: "checked_content" as const, label: "Inhalt geprüft", icon: FileText },
  { key: "checked_design" as const, label: "Design geprüft", icon: Palette },
  { key: "checked_mobile" as const, label: "Mobile geprüft", icon: Smartphone },
  { key: "checked_legal" as const, label: "Rechtliches geprüft", icon: Scale },
];

export default function DomainDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: domain, isLoading: domainLoading } = useDomain(id);
  const { data: pages, isLoading: pagesLoading } = usePages(id);
  const updateDomain = useUpdateDomain();
  const updatePage = useUpdatePage();
  const bulkUpdatePages = useBulkUpdatePages();
  const updateLink = useUpdateLink();
  const bulkUpdateLinks = useBulkUpdateLinks();
  const checkDomain = useCheckDomain();
  const crawlDomain = useCrawlDomain();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterWorkflow, setFilterWorkflow] = useState<string>("all");
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("pages");

  // Filter pages
  const filteredPages = useMemo(() => {
    return (pages || []).filter((p) => {
      if (search && !p.path.toLowerCase().includes(search.toLowerCase()) && !p.page_title?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      if (filterWorkflow !== "all" && p.workflow !== filterWorkflow) return false;
      return true;
    });
  }, [pages, search, filterStatus, filterWorkflow]);

  // Stats
  const pageStats = useMemo(() => {
    const all = pages || [];
    return {
      total: all.length,
      online: all.filter((p) => p.status === "online").length,
      offline: all.filter((p) => p.status === "offline" || p.status === "error").length,
      pending: all.filter((p) => p.status === "pending").length,
      fertig: all.filter((p) => p.workflow === "fertig").length,
      totalChecks: all.length * checkItems.length,
      completedChecks: all.reduce(
        (sum, p) => sum + checkItems.filter((c) => p[c.key]).length,
        0
      ),
    };
  }, [pages]);

  const toggleExpand = (pageId: string) => {
    const next = new Set(expandedPages);
    if (next.has(pageId)) next.delete(pageId);
    else next.add(pageId);
    setExpandedPages(next);
  };

  const toggleSelectPage = (pageId: string) => {
    const next = new Set(selectedPages);
    if (next.has(pageId)) next.delete(pageId);
    else next.add(pageId);
    setSelectedPages(next);
  };

  const selectAll = () => {
    if (selectedPages.size === filteredPages.length) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(filteredPages.map((p) => p.id)));
    }
  };

  const handlePageCheck = async (pageId: string, field: keyof Page, value: boolean) => {
    try {
      await updatePage.mutateAsync({ id: pageId, updates: { [field]: value } });
    } catch (e: any) {
      toast({ title: "Fehler", description: e.message, variant: "destructive" });
    }
  };

  const handleWorkflowChange = async (pageId: string, workflow: Page["workflow"]) => {
    try {
      await updatePage.mutateAsync({ id: pageId, updates: { workflow } });
      toast({ title: "Workflow aktualisiert" });
    } catch (e: any) {
      toast({ title: "Fehler", description: e.message, variant: "destructive" });
    }
  };

  const handleBulkWorkflow = async (workflow: Page["workflow"]) => {
    if (selectedPages.size === 0) return;
    try {
      await bulkUpdatePages.mutateAsync({ ids: Array.from(selectedPages), updates: { workflow } });
      toast({ title: `${selectedPages.size} Seiten aktualisiert` });
      setSelectedPages(new Set());
    } catch (e: any) {
      toast({ title: "Fehler", description: e.message, variant: "destructive" });
    }
  };

  const handleLinkToggle = async (linkId: string, field: "is_checked" | "is_approved" | "needs_fix", value: boolean) => {
    try {
      await updateLink.mutateAsync({ id: linkId, updates: { [field]: value } });
    } catch (e: any) {
      toast({ title: "Fehler", description: e.message, variant: "destructive" });
    }
  };

  if (domainLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  if (!domain) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center p-12">
          <h2 className="text-xl font-bold mb-2">Domain nicht gefunden</h2>
          <Button onClick={() => navigate("/domains")}>Zurück zur Übersicht</Button>
        </div>
      </DashboardLayout>
    );
  }

  const overallProgress = pageStats.total > 0
    ? Math.round((pageStats.fertig / pageStats.total) * 100)
    : 0;

  const checkProgress = pageStats.totalChecks > 0
    ? Math.round((pageStats.completedChecks / pageStats.totalChecks) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            className="w-fit -ml-2"
            onClick={() => navigate("/domains")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Alle Domains
          </Button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={`h-4 w-4 rounded-full ${
                domain.health === "healthy" ? "bg-emerald-500" :
                domain.health === "warning" ? "bg-amber-500" :
                domain.health === "critical" ? "bg-red-500" : "bg-gray-400"
              }`} />
              <div>
                <h1 className="text-2xl font-bold">{domain.label}</h1>
                <a
                  href={domain.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  {domain.url} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={crawlDomain.isPending}
                onClick={() => {
                  crawlDomain.mutate(
                    { domainId: domain.id, maxDepth: 3 },
                    {
                      onSuccess: () => toast({ title: "Crawl gestartet" }),
                      onError: (e) => toast({ title: "Fehler", description: e.message, variant: "destructive" }),
                    }
                  );
                }}
              >
                <Globe className="h-4 w-4 mr-2" />
                {crawlDomain.isPending ? "Crawlt..." : "Crawl starten"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={checkDomain.isPending}
                onClick={() => {
                  checkDomain.mutate(domain.id, {
                    onSuccess: () => toast({ title: "Domain geprüft" }),
                    onError: (e) => toast({ title: "Fehler", description: e.message, variant: "destructive" }),
                  });
                }}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${checkDomain.isPending ? "animate-spin" : ""}`} />
                {checkDomain.isPending ? "Prüfe..." : "Domain prüfen"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(domain.url, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Öffnen
              </Button>
            </div>
          </div>
        </div>

        {/* Domain KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Unterseiten</p>
                  <p className="text-2xl font-bold">{pageStats.total}</p>
                </div>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="mt-2 flex gap-2 text-xs">
                <span className="text-emerald-600">{pageStats.online} online</span>
                {pageStats.offline > 0 && <span className="text-red-600">{pageStats.offline} offline</span>}
                {pageStats.pending > 0 && <span className="text-gray-500">{pageStats.pending} ausstehend</span>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Seiten-Fortschritt</p>
                  <p className="text-2xl font-bold">{overallProgress}%</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <Progress value={overallProgress} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">{pageStats.fertig} / {pageStats.total} fertig</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Checklisten</p>
                  <p className="text-2xl font-bold">{checkProgress}%</p>
                </div>
                <SquareCheck className="h-5 w-5 text-blue-500" />
              </div>
              <Progress value={checkProgress} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {pageStats.completedChecks} / {pageStats.totalChecks} Checks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Setup</p>
                  <div className="flex gap-2 mt-1">
                    {domain.has_ssl ? (
                      <Badge variant="outline" className="text-emerald-700 bg-emerald-50 text-xs">SSL</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">Kein SSL</Badge>
                    )}
                    {domain.has_ga && <Badge variant="outline" className="text-xs">GA</Badge>}
                    {domain.has_gtm && <Badge variant="outline" className="text-xs">GTM</Badge>}
                  </div>
                </div>
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex gap-2 mt-2 text-xs">
                {domain.has_impressum ? (
                  <span className="text-emerald-600 flex items-center gap-0.5"><Check className="h-3 w-3" />Impressum</span>
                ) : (
                  <span className="text-red-600 flex items-center gap-0.5"><X className="h-3 w-3" />Impressum</span>
                )}
                {domain.has_datenschutz ? (
                  <span className="text-emerald-600 flex items-center gap-0.5"><Check className="h-3 w-3" />Datenschutz</span>
                ) : (
                  <span className="text-red-600 flex items-center gap-0.5"><X className="h-3 w-3" />Datenschutz</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pages">
              Unterseiten ({pageStats.total})
            </TabsTrigger>
            <TabsTrigger value="setup">
              Einrichtung
            </TabsTrigger>
            <TabsTrigger value="notes">
              Notizen
            </TabsTrigger>
          </TabsList>

          {/* === TAB: UNTERSEITEN === */}
          <TabsContent value="pages" className="space-y-4">
            {/* Filters + Bulk Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Seite suchen (Pfad oder Titel)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="redirect">Redirect</SelectItem>
                  <SelectItem value="error">Fehler</SelectItem>
                  <SelectItem value="pending">Ausstehend</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterWorkflow} onValueChange={setFilterWorkflow}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Workflow" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Workflows</SelectItem>
                  <SelectItem value="nicht_begonnen">Nicht begonnen</SelectItem>
                  <SelectItem value="in_bearbeitung">In Bearbeitung</SelectItem>
                  <SelectItem value="geprueft">Geprüft</SelectItem>
                  <SelectItem value="fertig">Fertig</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions Bar */}
            {selectedPages.size > 0 && (
              <Card className="p-3 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-medium">{selectedPages.size} ausgewählt</span>
                  <Separator orientation="vertical" className="h-6" />
                  <Button size="sm" variant="outline" onClick={() => handleBulkWorkflow("in_bearbeitung")}>
                    In Bearbeitung
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkWorkflow("geprueft")}>
                    Als geprüft markieren
                  </Button>
                  <Button size="sm" variant="default" onClick={() => handleBulkWorkflow("fertig")}>
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Als fertig markieren
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedPages(new Set())}>
                    Auswahl aufheben
                  </Button>
                </div>
              </Card>
            )}

            {/* Pages List */}
            {pagesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
              </div>
            ) : filteredPages.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Keine Unterseiten gefunden</h3>
                <p className="text-muted-foreground text-center">
                  Starte einen Crawl, um alle Unterseiten zu entdecken.
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {/* Select All Header */}
                <div className="flex items-center gap-3 px-4 py-2">
                  <Checkbox
                    checked={selectedPages.size === filteredPages.length && filteredPages.length > 0}
                    onCheckedChange={selectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    Alle auswählen ({filteredPages.length} Seiten)
                  </span>
                </div>

                {filteredPages.map((page) => {
                  const sc = statusConfig[page.status];
                  const wc = workflowConfig[page.workflow];
                  const isExpanded = expandedPages.has(page.id);
                  const completedChecks = checkItems.filter((c) => page[c.key]).length;

                  return (
                    <PageRow
                      key={page.id}
                      page={page}
                      sc={sc}
                      wc={wc}
                      isExpanded={isExpanded}
                      isSelected={selectedPages.has(page.id)}
                      completedChecks={completedChecks}
                      onToggleExpand={() => toggleExpand(page.id)}
                      onToggleSelect={() => toggleSelectPage(page.id)}
                      onCheck={handlePageCheck}
                      onWorkflowChange={handleWorkflowChange}
                      onLinkToggle={handleLinkToggle}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* === TAB: EINRICHTUNG === */}
          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Domain-Einrichtung Checkliste</CardTitle>
                <CardDescription>Alle wichtigen Einstellungen für {domain.label}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { label: "SSL-Zertifikat eingerichtet", done: domain.has_ssl, key: "has_ssl" },
                    { label: "Google Analytics eingebunden", done: domain.has_ga, key: "has_ga" },
                    { label: "Google Tag Manager eingebunden", done: domain.has_gtm, key: "has_gtm" },
                    { label: "Impressum vorhanden", done: domain.has_impressum, key: "has_impressum" },
                    { label: "Datenschutzerklärung vorhanden", done: domain.has_datenschutz, key: "has_datenschutz" },
                    { label: "Setup komplett", done: domain.setup_complete, key: "setup_complete" },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        item.done ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <Checkbox
                        checked={item.done}
                        onCheckedChange={(checked) => {
                          updateDomain.mutate({
                            id: domain.id,
                            updates: { [item.key]: !!checked },
                          });
                        }}
                      />
                      <span className={item.done ? "text-emerald-800" : "text-gray-700"}>
                        {item.label}
                      </span>
                      {item.done && <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SEO Info */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Informationen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Page Title</label>
                  <p className="text-sm">{domain.page_title || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Meta Description</label>
                  <p className="text-sm">{domain.meta_description || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">HTTP Code</label>
                  <p className="text-sm font-mono">{domain.http_code || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Response Time</label>
                  <p className="text-sm">{domain.response_time_ms ? `${domain.response_time_ms}ms` : "—"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === TAB: NOTIZEN === */}
          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notizen zu {domain.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[200px]"
                  placeholder="Notizen zur Domain hier eingeben..."
                  defaultValue={domain.notes || ""}
                  onBlur={(e) => {
                    if (e.target.value !== domain.notes) {
                      updateDomain.mutate({
                        id: domain.id,
                        updates: { notes: e.target.value },
                      });
                      toast({ title: "Notizen gespeichert" });
                    }
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// ============================================================
// SUB-COMPONENT: Einzelne Seiten-Zeile mit aufklappbaren Links
// ============================================================

interface PageRowProps {
  page: Page;
  sc: typeof statusConfig[keyof typeof statusConfig];
  wc: typeof workflowConfig[keyof typeof workflowConfig];
  isExpanded: boolean;
  isSelected: boolean;
  completedChecks: number;
  onToggleExpand: () => void;
  onToggleSelect: () => void;
  onCheck: (pageId: string, field: keyof Page, value: boolean) => void;
  onWorkflowChange: (pageId: string, workflow: Page["workflow"]) => void;
  onLinkToggle: (linkId: string, field: "is_checked" | "is_approved" | "needs_fix", value: boolean) => void;
}

function PageRow({
  page,
  sc,
  wc,
  isExpanded,
  isSelected,
  completedChecks,
  onToggleExpand,
  onToggleSelect,
  onCheck,
  onWorkflowChange,
  onLinkToggle,
}: PageRowProps) {
  const { data: links, isLoading: linksLoading } = usePageLinks(isExpanded ? page.id : undefined);

  const totalLinks = page.internal_links_count + page.external_links_count;
  const WfIcon = wc.icon;

  return (
    <Card className={`overflow-hidden ${isSelected ? "ring-2 ring-primary/30" : ""}`}>
      {/* Main Row */}
      <div className="flex items-center gap-3 p-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
        />

        <button
          onClick={onToggleExpand}
          className="flex items-center text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${sc.color}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{page.path || "/"}</span>
            {page.page_title && (
              <span className="text-xs text-muted-foreground truncate hidden md:inline">
                — {page.page_title}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
            {page.http_code && <span className="font-mono">{page.http_code}</span>}
            {totalLinks > 0 && (
              <span className="flex items-center gap-1">
                <Link2 className="h-3 w-3" />
                {totalLinks} Links
                {page.broken_links_count > 0 && (
                  <span className="text-red-500">({page.broken_links_count} kaputt)</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Checks Progress Mini */}
        <div className="hidden md:flex items-center gap-1">
          {checkItems.map((c) => (
            <div
              key={c.key}
              className={`h-2 w-2 rounded-full ${page[c.key] ? "bg-emerald-500" : "bg-gray-200"}`}
              title={`${c.label}: ${page[c.key] ? "Ja" : "Nein"}`}
            />
          ))}
        </div>

        {/* Workflow Badge */}
        <Select
          value={page.workflow}
          onValueChange={(v) => onWorkflowChange(page.id, v as Page["workflow"])}
        >
          <SelectTrigger className="w-[150px] h-8 text-xs">
            <div className="flex items-center gap-1.5">
              <WfIcon className="h-3 w-3" />
              <span>{wc.label}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(workflowConfig).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                <div className="flex items-center gap-1.5">
                  <v.icon className="h-3 w-3" />
                  {v.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expanded: Checkliste + Links */}
      {isExpanded && (
        <div className="border-t bg-muted/30">
          {/* Checkliste */}
          <div className="p-4 border-b">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <SquareCheck className="h-4 w-4" />
              Checkliste ({completedChecks}/{checkItems.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {checkItems.map((c) => (
                <label
                  key={c.key}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                    page[c.key]
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-background hover:bg-muted border"
                  }`}
                >
                  <Checkbox
                    checked={page[c.key]}
                    onCheckedChange={(checked) => onCheck(page.id, c.key, !!checked)}
                  />
                  <c.icon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="text-xs">{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="p-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Links auf dieser Seite
            </h4>
            {linksLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : !links || links.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Links gefunden. Starte einen Crawl.</p>
            ) : (
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {links.map((link) => {
                  const LinkIcon = linkTypeIcons[link.link_type] || Link2;
                  const lsc = statusConfig[link.status] || statusConfig.pending;
                  return (
                    <div
                      key={link.id}
                      className={`flex items-center gap-2 p-2 rounded-md text-sm ${
                        link.needs_fix
                          ? "bg-red-50 border border-red-200"
                          : link.is_approved
                          ? "bg-emerald-50 border border-emerald-200"
                          : "bg-background border"
                      }`}
                    >
                      <Checkbox
                        checked={link.is_checked}
                        onCheckedChange={(checked) => onLinkToggle(link.id, "is_checked", !!checked)}
                      />
                      <div className={`h-2 w-2 rounded-full flex-shrink-0 ${lsc.color}`} />
                      <LinkIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="truncate flex-1 font-mono text-xs">{link.url}</span>
                      {link.anchor_text && (
                        <span className="text-xs text-muted-foreground truncate max-w-[150px] hidden lg:inline">
                          "{link.anchor_text}"
                        </span>
                      )}
                      {link.http_code && (
                        <Badge variant="outline" className="text-[10px] font-mono px-1">
                          {link.http_code}
                        </Badge>
                      )}
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant={link.is_approved ? "default" : "ghost"}
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onLinkToggle(link.id, "is_approved", !link.is_approved)}
                          title="Genehmigt"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant={link.needs_fix ? "destructive" : "ghost"}
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onLinkToggle(link.id, "needs_fix", !link.needs_fix)}
                          title="Muss repariert werden"
                        >
                          <AlertTriangle className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
