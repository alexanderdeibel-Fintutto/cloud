import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { useDomains, useDomainStats, useCreateDomain, useDeleteDomain, type Domain } from "@/hooks/useDomains";
import { useCheckAllDomains } from "@/hooks/useDomainActions";
import {
  Globe,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  ExternalLink,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  BarChart3,
  FileCheck,
  Link2,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const healthConfig = {
  healthy: { label: "Online", icon: ShieldCheck, color: "bg-emerald-500", badge: "default" as const },
  warning: { label: "Warnung", icon: ShieldAlert, color: "bg-amber-500", badge: "secondary" as const },
  critical: { label: "Kritisch", icon: ShieldAlert, color: "bg-red-500", badge: "destructive" as const },
  unknown: { label: "Unbekannt", icon: ShieldQuestion, color: "bg-gray-400", badge: "outline" as const },
};

const categoryLabels: Record<string, string> = {
  app: "App",
  calculator: "Rechner",
  portal: "Portal",
  landing: "Landing Page",
  tool: "Tool",
  docs: "Dokumentation",
};

export default function Domains() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: domains, isLoading } = useDomains();
  const { data: stats } = useDomainStats();
  const createDomain = useCreateDomain();
  const deleteDomain = useDeleteDomain();
  const checkAll = useCheckAllDomains();

  const [search, setSearch] = useState("");
  const [filterHealth, setFilterHealth] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDomain, setNewDomain] = useState({ url: "", label: "", category: "app", repo_name: "" });

  // Filter
  const filtered = (domains || []).filter((d) => {
    if (search && !d.label.toLowerCase().includes(search.toLowerCase()) && !d.url.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterHealth !== "all" && d.health !== filterHealth) return false;
    if (filterCategory !== "all" && d.category !== filterCategory) return false;
    return true;
  });

  const handleAddDomain = async () => {
    if (!newDomain.url || !newDomain.label) return;
    try {
      await createDomain.mutateAsync(newDomain);
      toast({ title: "Domain hinzugefügt", description: newDomain.label });
      setShowAddDialog(false);
      setNewDomain({ url: "", label: "", category: "app", repo_name: "" });
    } catch (e: any) {
      toast({ title: "Fehler", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, label: string) => {
    e.stopPropagation();
    if (!confirm(`"${label}" wirklich löschen? Alle Unterseiten und Links werden ebenfalls gelöscht.`)) return;
    try {
      await deleteDomain.mutateAsync(id);
      toast({ title: "Gelöscht", description: label });
    } catch (e: any) {
      toast({ title: "Fehler", description: e.message, variant: "destructive" });
    }
  };

  const getProgressPercent = (d: Domain) => {
    if (!d.total_pages) return 0;
    return Math.round((d.pages_fertig / d.total_pages) * 100);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Globe className="h-8 w-8 text-primary" />
              Domain-Verwaltung
            </h1>
            <p className="text-muted-foreground mt-1">
              Alle Fintutto-Seiten, Unterseiten und Links im Überblick
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={checkAll.isPending}
              onClick={() => {
                checkAll.mutate(undefined, {
                  onSuccess: (data) => toast({ title: `${data?.checked ?? 0} Domains geprüft` }),
                  onError: (e) => toast({ title: "Fehler", description: e.message, variant: "destructive" }),
                });
              }}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${checkAll.isPending ? "animate-spin" : ""}`} />
              {checkAll.isPending ? "Prüfe..." : "Alle prüfen"}
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Domain hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neue Domain hinzufügen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium">URL</label>
                    <Input
                      placeholder="https://fintutto.de"
                      value={newDomain.url}
                      onChange={(e) => setNewDomain({ ...newDomain, url: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      placeholder="Fintutto Hauptseite"
                      value={newDomain.label}
                      onChange={(e) => setNewDomain({ ...newDomain, label: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Kategorie</label>
                    <Select value={newDomain.category} onValueChange={(v) => setNewDomain({ ...newDomain, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">GitHub Repo (optional)</label>
                    <Input
                      placeholder="alexanderdeibel-Fintutto/repo-name"
                      value={newDomain.repo_name}
                      onChange={(e) => setNewDomain({ ...newDomain, repo_name: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddDomain} className="w-full" disabled={createDomain.isPending}>
                    {createDomain.isPending ? "Wird hinzugefügt..." : "Hinzufügen"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Domains</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total ?? "—"}</div>
              <p className="text-xs text-muted-foreground">{stats?.setupComplete ?? 0} fertig eingerichtet</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Online</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{stats?.healthy ?? "—"}</div>
              <p className="text-xs text-muted-foreground">Alles ok</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Warnung</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats?.warning ?? "—"}</div>
              <p className="text-xs text-muted-foreground">Braucht Aufmerksamkeit</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Kritisch</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.critical ?? "—"}</div>
              <p className="text-xs text-muted-foreground">Sofort handeln</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unterseiten</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPages ?? "—"}</div>
              <p className="text-xs text-muted-foreground">{stats?.pagesChecked ?? 0} geprüft</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Fortschritt</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalPages ? Math.round((stats.pagesFertig / stats.totalPages) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">{stats?.pagesFertig ?? 0} Seiten fertig</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Domain suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterHealth} onValueChange={setFilterHealth}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="healthy">Online</SelectItem>
              <SelectItem value="warning">Warnung</SelectItem>
              <SelectItem value="critical">Kritisch</SelectItem>
              <SelectItem value="unknown">Unbekannt</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Kategorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kategorien</SelectItem>
              {Object.entries(categoryLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Domain Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Domains gefunden</h3>
            <p className="text-muted-foreground text-center mb-4">
              {search || filterHealth !== "all" || filterCategory !== "all"
                ? "Versuche andere Filtereinstellungen."
                : "Füge deine erste Domain hinzu, um loszulegen."}
            </p>
            {!search && filterHealth === "all" && filterCategory === "all" && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Erste Domain hinzufügen
              </Button>
            )}
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">Status</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead className="hidden md:table-cell">Kategorie</TableHead>
                  <TableHead className="hidden lg:table-cell">Seiten</TableHead>
                  <TableHead className="hidden lg:table-cell">Fortschritt</TableHead>
                  <TableHead className="hidden md:table-cell">SSL</TableHead>
                  <TableHead className="hidden md:table-cell">Tracking</TableHead>
                  <TableHead className="hidden lg:table-cell">Geprüft</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((domain) => {
                  const hc = healthConfig[domain.health];
                  const progress = getProgressPercent(domain);
                  return (
                    <TableRow
                      key={domain.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/domains/${domain.id}`)}
                    >
                      <TableCell>
                        <div className={`h-3 w-3 rounded-full ${hc.color}`} title={hc.label} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{domain.label}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                            {domain.url}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{categoryLabels[domain.category] || domain.category}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{domain.total_pages}</span>
                          <span className="text-muted-foreground">
                            ({domain.pages_online}
                            <CheckCircle2 className="inline h-3 w-3 text-emerald-500 mx-0.5" />
                            {domain.pages_offline > 0 && (
                              <>
                                {domain.pages_offline}
                                <XCircle className="inline h-3 w-3 text-red-500 mx-0.5" />
                              </>
                            )}
                            )
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2 w-32">
                          <Progress value={progress} className="h-2" />
                          <span className="text-xs text-muted-foreground w-10">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {domain.has_ssl ? (
                          <Shield className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <ShieldAlert className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex gap-1">
                          {domain.has_ga && <Badge variant="outline" className="text-[10px] px-1">GA</Badge>}
                          {domain.has_gtm && <Badge variant="outline" className="text-[10px] px-1">GTM</Badge>}
                          {!domain.has_ga && !domain.has_gtm && (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {domain.last_check_at ? (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(domain.last_check_at), "dd.MM. HH:mm", { locale: de })}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Nie
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(domain.url, "_blank");
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={(e) => handleDelete(e, domain.id, domain.label)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Summary Footer */}
        {filtered.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            {filtered.length} von {domains?.length || 0} Domains angezeigt
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
