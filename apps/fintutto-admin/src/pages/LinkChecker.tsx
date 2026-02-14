import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useToast } from "@/hooks/use-toast";
import { useDomains, type Domain } from "@/hooks/useDomains";
import { useBrokenLinks, useBulkUpdateLinks } from "@/hooks/usePageLinks";
import { useCheckLinks } from "@/hooks/useDomainActions";
import {
  Search,
  Link2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Wrench,
  RefreshCw,
  ArrowUpRight,
  Filter,
  BarChart3,
  Globe,
  Zap,
  Clock,
  CheckCheck,
  Clipboard,
} from "lucide-react";

export default function LinkChecker() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: domains } = useDomains();
  const [selectedDomainId, setSelectedDomainId] = useState<string>("");
  const { data: brokenLinks, isLoading } = useBrokenLinks(selectedDomainId || undefined);
  const bulkUpdateLinks = useBulkUpdateLinks();
  const checkLinks = useCheckLinks();

  const [search, setSearch] = useState("");
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());
  const [bulkUrls, setBulkUrls] = useState("");
  const [showBulkInput, setShowBulkInput] = useState(false);

  // Filtered broken links
  const filtered = useMemo(() => {
    if (!brokenLinks) return [];
    if (!search) return brokenLinks;
    return brokenLinks.filter(
      (l) =>
        l.url.toLowerCase().includes(search.toLowerCase()) ||
        l.anchor_text?.toLowerCase().includes(search.toLowerCase())
    );
  }, [brokenLinks, search]);

  // Stats
  const stats = useMemo(() => {
    const all = brokenLinks || [];
    return {
      total: all.length,
      offline: all.filter((l) => l.status === "offline").length,
      error: all.filter((l) => l.status === "error").length,
      needsFix: all.filter((l) => l.needs_fix).length,
      checked: all.filter((l) => l.is_checked).length,
    };
  }, [brokenLinks]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedLinks);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedLinks(next);
  };

  const selectAll = () => {
    if (selectedLinks.size === filtered.length) {
      setSelectedLinks(new Set());
    } else {
      setSelectedLinks(new Set(filtered.map((l) => l.id)));
    }
  };

  const handleBulkAction = async (action: "mark_checked" | "mark_fix" | "mark_approved") => {
    if (selectedLinks.size === 0) return;
    const updates =
      action === "mark_checked"
        ? { is_checked: true }
        : action === "mark_fix"
        ? { needs_fix: true }
        : { is_approved: true, needs_fix: false };

    try {
      await bulkUpdateLinks.mutateAsync({ ids: Array.from(selectedLinks), updates });
      toast({ title: `${selectedLinks.size} Links aktualisiert` });
      setSelectedLinks(new Set());
    } catch (e: any) {
      toast({ title: "Fehler", description: e.message, variant: "destructive" });
    }
  };

  const copyBrokenUrls = () => {
    const urls = filtered.map((l) => l.url).join("\n");
    navigator.clipboard.writeText(urls);
    toast({ title: "URLs kopiert", description: `${filtered.length} URLs in die Zwischenablage kopiert` });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Link2 className="h-8 w-8 text-primary" />
              Link Checker
            </h1>
            <p className="text-muted-foreground mt-1">
              Kaputte und problematische Links finden und reparieren
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyBrokenUrls}>
              <Clipboard className="h-4 w-4 mr-2" />
              URLs kopieren
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowBulkInput(!showBulkInput)}>
              <Zap className="h-4 w-4 mr-2" />
              Bulk Check
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Probleme gesamt</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Offline</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.offline}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Fehler</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.error}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Zu reparieren</CardTitle>
              <Wrench className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.needsFix}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Geprüft</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{stats.checked}</div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk URL Input */}
        {showBulkInput && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bulk URL Check</CardTitle>
              <CardDescription>
                Füge URLs ein (eine pro Zeile), um sie schnell zu prüfen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder={"https://fintutto.de\nhttps://vermietify.de\nhttps://mieter.fintutto.de"}
                value={bulkUrls}
                onChange={(e) => setBulkUrls(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {bulkUrls.split("\n").filter((u) => u.trim()).length} URLs
                </span>
                <Button
                  size="sm"
                  disabled={checkLinks.isPending}
                  onClick={() => {
                    const urls = bulkUrls.split("\n").map((u) => u.trim()).filter(Boolean);
                    if (urls.length === 0) return;
                    checkLinks.mutate(
                      { urls },
                      {
                        onSuccess: (data) => toast({ title: `${data?.checked ?? urls.length} URLs geprüft` }),
                        onError: (e) => toast({ title: "Fehler", description: e.message, variant: "destructive" }),
                      }
                    );
                  }}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${checkLinks.isPending ? "animate-spin" : ""}`} />
                  {checkLinks.isPending ? "Prüfe..." : "Alle prüfen"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedDomainId} onValueChange={setSelectedDomainId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Alle Domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle Domains</SelectItem>
              {(domains || []).map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="URL oder Ankertext suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedLinks.size > 0 && (
          <Card className="p-3 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium">{selectedLinks.size} ausgewählt</span>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("mark_checked")}>
                <CheckCheck className="h-4 w-4 mr-1" />
                Als geprüft markieren
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("mark_fix")}>
                <Wrench className="h-4 w-4 mr-1" />
                Muss repariert werden
              </Button>
              <Button size="sm" variant="default" onClick={() => handleBulkAction("mark_approved")}>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Genehmigen
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedLinks(new Set())}>
                Auswahl aufheben
              </Button>
            </div>
          </Card>
        )}

        {/* Links Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine kaputten Links</h3>
            <p className="text-muted-foreground text-center">
              {selectedDomainId
                ? "Diese Domain hat keine kaputten Links. Super!"
                : "Keine problematischen Links gefunden. Alles ok!"}
            </p>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={selectedLinks.size === filtered.length && filtered.length > 0}
                      onCheckedChange={selectAll}
                    />
                  </TableHead>
                  <TableHead className="w-[40px]">Status</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="hidden md:table-cell">Ankertext</TableHead>
                  <TableHead className="hidden md:table-cell">Seite</TableHead>
                  <TableHead className="hidden lg:table-cell">Code</TableHead>
                  <TableHead className="w-[100px]">Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((link) => (
                  <TableRow
                    key={link.id}
                    className={
                      link.needs_fix
                        ? "bg-red-50/50"
                        : link.is_approved
                        ? "bg-emerald-50/50"
                        : ""
                    }
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedLinks.has(link.id)}
                        onCheckedChange={() => toggleSelect(link.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div
                        className={`h-3 w-3 rounded-full ${
                          link.status === "offline" ? "bg-red-500" : "bg-amber-500"
                        }`}
                      />
                    </TableCell>
                    <TableCell>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-mono text-blue-600 hover:underline truncate block max-w-[400px]"
                      >
                        {link.url}
                      </a>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground truncate block max-w-[150px]">
                        {link.anchor_text || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-xs text-muted-foreground font-mono">
                        {(link as any).pages?.path || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline" className="font-mono text-xs">
                        {link.http_code || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => window.open(link.url, "_blank")}
                          title="Öffnen"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                        {link.needs_fix ? (
                          <Badge variant="destructive" className="text-[10px]">
                            <Wrench className="h-3 w-3 mr-0.5" />
                            Fix
                          </Badge>
                        ) : link.is_approved ? (
                          <Badge variant="default" className="text-[10px] bg-emerald-600">
                            <CheckCircle2 className="h-3 w-3 mr-0.5" />
                            OK
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {filtered.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            {filtered.length} problematische Links gefunden
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
