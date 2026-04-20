import { useState } from 'react';
import {
  useProjectAccounting,
  Project,
  ProjectStatus,
  ProjectType,
  PROJECT_TYPES,
  PROJECT_STATUSES,
  EXPENSE_CATEGORIES,
} from '@/hooks/useProjectAccounting';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  FolderKanban,
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  Euro,
  TrendingUp,
  Download,
  Users,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  PauseCircle,
  XCircle,
  PlayCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const ProjectAccounting = () => {
  const { toast } = useToast();
  const {
    projects,
    transactions,
    timeEntries,
    milestones,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    addTransaction,
    addTimeEntry,
    addMilestone,
    completeMilestone,
    getProjectSummary,
    getOverallSummary,
    searchProjects,
    exportProjects,
  } = useProjectAccounting();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [timeEntryOpen, setTimeEntryOpen] = useState(false);
  const [transactionOpen, setTransactionOpen] = useState(false);

  // Form states
  const [formProject, setFormProject] = useState<Partial<Project>>({
    type: 'client',
    status: 'planning',
    billingType: 'hourly',
    budget: 0,
    tags: [],
    isActive: true,
  });
  const [formTimeEntry, setFormTimeEntry] = useState({
    projectId: '',
    userName: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    hours: 0,
    description: '',
    isBillable: true,
  });
  const [formTransaction, setFormTransaction] = useState({
    projectId: '',
    type: 'expense' as 'expense' | 'revenue',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    amount: 0,
  });

  const overallSummary = getOverallSummary();

  const filteredProjects = projects.filter(p => {
    const matchesSearch = searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateProject = () => {
    if (!formProject.code || !formProject.name) {
      toast({
        title: 'Fehler',
        description: 'Bitte Code und Name eingeben.',
        variant: 'destructive',
      });
      return;
    }
    createProject(formProject as any);
    toast({
      title: 'Projekt erstellt',
      description: `${formProject.name} wurde erfolgreich angelegt.`,
    });
    setNewProjectOpen(false);
    setFormProject({
      type: 'client',
      status: 'planning',
      billingType: 'hourly',
      budget: 0,
      tags: [],
      isActive: true,
    });
  };

  const handleAddTimeEntry = () => {
    if (!formTimeEntry.projectId || formTimeEntry.hours <= 0) {
      toast({
        title: 'Fehler',
        description: 'Bitte Projekt und Stunden eingeben.',
        variant: 'destructive',
      });
      return;
    }
    addTimeEntry({
      ...formTimeEntry,
      status: 'draft',
    });
    toast({
      title: 'Zeiteintrag hinzugefügt',
      description: `${formTimeEntry.hours} Stunden wurden erfasst.`,
    });
    setTimeEntryOpen(false);
  };

  const handleAddTransaction = () => {
    if (!formTransaction.projectId || formTransaction.amount <= 0) {
      toast({
        title: 'Fehler',
        description: 'Bitte Projekt und Betrag eingeben.',
        variant: 'destructive',
      });
      return;
    }
    addTransaction(formTransaction);
    toast({
      title: 'Transaktion hinzugefügt',
      description: `${formTransaction.type === 'expense' ? 'Ausgabe' : 'Einnahme'} wurde erfasst.`,
    });
    setTransactionOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case 'planning': return <Target className="h-4 w-4 text-gray-500" />;
      case 'active': return <PlayCircle className="h-4 w-4 text-green-500" />;
      case 'on_hold': return <PauseCircle className="h-4 w-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getTypeBadge = (type: ProjectType) => {
    const colors: Record<ProjectType, string> = {
      internal: 'bg-gray-500',
      client: 'bg-green-500',
      investment: 'bg-blue-500',
      rd: 'bg-purple-500',
    };
    return (
      <Badge className={colors[type]}>
        {PROJECT_TYPES.find(t => t.value === type)?.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projekt-Buchhaltung</h1>
          <p className="text-muted-foreground">
            Projekte verwalten, Zeiten erfassen und Kosten tracken
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportProjects('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Neues Projekt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Neues Projekt anlegen</DialogTitle>
                <DialogDescription>
                  Erstellen Sie ein neues Projekt für die Buchhaltung
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Projekt-Code *</Label>
                    <Input
                      value={formProject.code || ''}
                      onChange={(e) => setFormProject({ ...formProject, code: e.target.value })}
                      placeholder="z.B. P2024-003"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={formProject.name || ''}
                      onChange={(e) => setFormProject({ ...formProject, name: e.target.value })}
                      placeholder="Projektname"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Beschreibung</Label>
                  <Textarea
                    value={formProject.description || ''}
                    onChange={(e) => setFormProject({ ...formProject, description: e.target.value })}
                    placeholder="Projektbeschreibung..."
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Typ</Label>
                    <Select
                      value={formProject.type}
                      onValueChange={(v) => setFormProject({ ...formProject, type: v as ProjectType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formProject.status}
                      onValueChange={(v) => setFormProject({ ...formProject, status: v as ProjectStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Abrechnungsart</Label>
                    <Select
                      value={formProject.billingType}
                      onValueChange={(v) => setFormProject({ ...formProject, billingType: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Nach Stunden</SelectItem>
                        <SelectItem value="fixed">Festpreis</SelectItem>
                        <SelectItem value="milestone">Meilensteine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Budget</Label>
                    <Input
                      type="number"
                      value={formProject.budget || 0}
                      onChange={(e) => setFormProject({ ...formProject, budget: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stundensatz</Label>
                    <Input
                      type="number"
                      value={formProject.hourlyRate || ''}
                      onChange={(e) => setFormProject({ ...formProject, hourlyRate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Startdatum</Label>
                    <Input
                      type="date"
                      value={formProject.startDate || ''}
                      onChange={(e) => setFormProject({ ...formProject, startDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kunde</Label>
                    <Input
                      value={formProject.clientName || ''}
                      onChange={(e) => setFormProject({ ...formProject, clientName: e.target.value })}
                      placeholder="Kundenname"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Projektleiter</Label>
                    <Input
                      value={formProject.managerName || ''}
                      onChange={(e) => setFormProject({ ...formProject, managerName: e.target.value })}
                      placeholder="Name"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewProjectOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleCreateProject}>Projekt anlegen</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktive Projekte</p>
                <p className="text-2xl font-bold">{overallSummary.activeProjects}</p>
              </div>
              <FolderKanban className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {overallSummary.completedProjects} abgeschlossen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt-Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(overallSummary.totalBudget)}</p>
              </div>
              <Euro className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {formatCurrency(overallSummary.totalCost)} verbraucht
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Erfasste Stunden</p>
                <p className="text-2xl font-bold">{overallSummary.totalHours.toFixed(1)} h</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              alle aktiven Projekte
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gewinn</p>
                <p className={`text-2xl font-bold ${overallSummary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(overallSummary.totalProfit)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {formatCurrency(overallSummary.totalUnbilled)} offen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Projekte suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {PROJECT_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={timeEntryOpen} onOpenChange={setTimeEntryOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              Zeit erfassen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Zeit erfassen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Projekt</Label>
                <Select
                  value={formTimeEntry.projectId}
                  onValueChange={(v) => setFormTimeEntry({ ...formTimeEntry, projectId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Projekt wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.filter(p => p.status === 'active').map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.code} - {p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Datum</Label>
                  <Input
                    type="date"
                    value={formTimeEntry.date}
                    onChange={(e) => setFormTimeEntry({ ...formTimeEntry, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stunden</Label>
                  <Input
                    type="number"
                    step="0.25"
                    value={formTimeEntry.hours}
                    onChange={(e) => setFormTimeEntry({ ...formTimeEntry, hours: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mitarbeiter</Label>
                <Input
                  value={formTimeEntry.userName}
                  onChange={(e) => setFormTimeEntry({ ...formTimeEntry, userName: e.target.value })}
                  placeholder="Name"
                />
              </div>
              <div className="space-y-2">
                <Label>Beschreibung</Label>
                <Textarea
                  value={formTimeEntry.description}
                  onChange={(e) => setFormTimeEntry({ ...formTimeEntry, description: e.target.value })}
                  placeholder="Was wurde gemacht?"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Abrechenbar</Label>
                <Switch
                  checked={formTimeEntry.isBillable}
                  onCheckedChange={(c) => setFormTimeEntry({ ...formTimeEntry, isBillable: c })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTimeEntryOpen(false)}>Abbrechen</Button>
              <Button onClick={handleAddTimeEntry}>Speichern</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={transactionOpen} onOpenChange={setTransactionOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Euro className="h-4 w-4 mr-2" />
              Transaktion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Projekttransaktion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Projekt</Label>
                <Select
                  value={formTransaction.projectId}
                  onValueChange={(v) => setFormTransaction({ ...formTransaction, projectId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Projekt wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.code} - {p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Typ</Label>
                  <Select
                    value={formTransaction.type}
                    onValueChange={(v) => setFormTransaction({ ...formTransaction, type: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Ausgabe</SelectItem>
                      <SelectItem value="revenue">Einnahme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Kategorie</Label>
                  <Select
                    value={formTransaction.category}
                    onValueChange={(v) => setFormTransaction({ ...formTransaction, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Datum</Label>
                  <Input
                    type="date"
                    value={formTransaction.date}
                    onChange={(e) => setFormTransaction({ ...formTransaction, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Betrag</Label>
                  <Input
                    type="number"
                    value={formTransaction.amount}
                    onChange={(e) => setFormTransaction({ ...formTransaction, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Beschreibung</Label>
                <Textarea
                  value={formTransaction.description}
                  onChange={(e) => setFormTransaction({ ...formTransaction, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTransactionOpen(false)}>Abbrechen</Button>
              <Button onClick={handleAddTransaction}>Speichern</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projekt</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead className="text-right">Verbraucht</TableHead>
                <TableHead>Fortschritt</TableHead>
                <TableHead className="text-right">Stunden</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Keine Projekte gefunden
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => {
                  const summary = getProjectSummary(project.id);
                  const budgetPercent = project.budget > 0 ? (project.actualCost / project.budget) * 100 : 0;
                  const isOverBudget = budgetPercent > 100;

                  return (
                    <TableRow
                      key={project.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedProject(project)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground">{project.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(project.type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(project.status)}
                          <span>{PROJECT_STATUSES.find(s => s.value === project.status)?.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>{project.clientName || '-'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(project.budget)}</TableCell>
                      <TableCell className={`text-right ${isOverBudget ? 'text-red-600' : ''}`}>
                        {formatCurrency(project.actualCost)}
                        {isOverBudget && <AlertTriangle className="inline h-4 w-4 ml-1" />}
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          <Progress
                            value={Math.min(budgetPercent, 100)}
                            className={isOverBudget ? '[&>div]:bg-red-500' : ''}
                          />
                          <p className="text-xs text-center mt-1">{budgetPercent.toFixed(0)}%</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{project.hoursWorked.toFixed(1)} h</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              updateProject(project.id, {
                                status: project.status === 'active' ? 'on_hold' : 'active'
                              });
                            }}
                          >
                            {project.status === 'active' ? (
                              <PauseCircle className="h-4 w-4" />
                            ) : (
                              <PlayCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteProject(project.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Project Detail Dialog */}
      <Dialog open={selectedProject !== null} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedProject && (() => {
            const summary = getProjectSummary(selectedProject.id);
            if (!summary) return null;

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    {getStatusIcon(selectedProject.status)}
                    {selectedProject.name}
                    <Badge variant="outline">{selectedProject.code}</Badge>
                  </DialogTitle>
                  <DialogDescription>
                    {selectedProject.description || 'Keine Beschreibung'}
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview">Übersicht</TabsTrigger>
                    <TabsTrigger value="time">Zeiterfassung</TabsTrigger>
                    <TabsTrigger value="transactions">Transaktionen</TabsTrigger>
                    <TabsTrigger value="milestones">Meilensteine</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-4">
                          <p className="text-sm text-muted-foreground">Budget-Auslastung</p>
                          <p className="text-2xl font-bold">{summary.budgetUsedPercent}%</p>
                          <Progress value={Math.min(summary.budgetUsedPercent, 100)} className="mt-2" />
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatCurrency(summary.budgetRemaining)} verbleibend
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <p className="text-sm text-muted-foreground">Profit-Marge</p>
                          <p className={`text-2xl font-bold ${summary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {summary.profitMargin}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatCurrency(selectedProject.actualRevenue - selectedProject.actualCost)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <p className="text-sm text-muted-foreground">Stunden</p>
                          <p className="text-2xl font-bold">{summary.billableHours}h</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            + {summary.nonBillableHours}h nicht abrechenbar
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Details</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Typ:</span>
                            <span>{PROJECT_TYPES.find(t => t.value === selectedProject.type)?.label}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Abrechnungsart:</span>
                            <span>{selectedProject.billingType === 'hourly' ? 'Nach Stunden' : selectedProject.billingType === 'fixed' ? 'Festpreis' : 'Meilensteine'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Stundensatz:</span>
                            <span>{formatCurrency(selectedProject.hourlyRate || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Startdatum:</span>
                            <span>{format(new Date(selectedProject.startDate), 'dd.MM.yyyy', { locale: de })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Finanzen</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Budget:</span>
                            <span>{formatCurrency(selectedProject.budget)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Ist-Kosten:</span>
                            <span>{formatCurrency(selectedProject.actualCost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Erlöse:</span>
                            <span>{formatCurrency(selectedProject.actualRevenue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fakturiert:</span>
                            <span>{formatCurrency(selectedProject.invoicedAmount)}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Offen:</span>
                            <span className="text-yellow-600">{formatCurrency(summary.unbilledAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="time">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Datum</TableHead>
                          <TableHead>Mitarbeiter</TableHead>
                          <TableHead>Beschreibung</TableHead>
                          <TableHead className="text-right">Stunden</TableHead>
                          <TableHead className="text-right">Betrag</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summary.timeEntries.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              Keine Zeiteinträge
                            </TableCell>
                          </TableRow>
                        ) : (
                          summary.timeEntries.map((e) => (
                            <TableRow key={e.id}>
                              <TableCell>{format(new Date(e.date), 'dd.MM.yyyy', { locale: de })}</TableCell>
                              <TableCell>{e.userName}</TableCell>
                              <TableCell>{e.description}</TableCell>
                              <TableCell className="text-right">{e.hours}h</TableCell>
                              <TableCell className="text-right">
                                {e.isBillable ? formatCurrency(e.amount) : '-'}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="transactions">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Datum</TableHead>
                          <TableHead>Typ</TableHead>
                          <TableHead>Kategorie</TableHead>
                          <TableHead>Beschreibung</TableHead>
                          <TableHead className="text-right">Betrag</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summary.transactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              Keine Transaktionen
                            </TableCell>
                          </TableRow>
                        ) : (
                          summary.transactions.map((t) => (
                            <TableRow key={t.id}>
                              <TableCell>{format(new Date(t.date), 'dd.MM.yyyy', { locale: de })}</TableCell>
                              <TableCell>
                                <Badge variant={t.type === 'expense' ? 'destructive' : 'default'}>
                                  {t.type === 'expense' ? 'Ausgabe' : t.type === 'revenue' ? 'Einnahme' : 'Rechnung'}
                                </Badge>
                              </TableCell>
                              <TableCell>{t.category}</TableCell>
                              <TableCell>{t.description}</TableCell>
                              <TableCell className={`text-right ${t.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                                {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="milestones">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Meilenstein</TableHead>
                          <TableHead>Fällig</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Betrag</TableHead>
                          <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summary.milestones.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              Keine Meilensteine
                            </TableCell>
                          </TableRow>
                        ) : (
                          summary.milestones.map((m) => (
                            <TableRow key={m.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{m.name}</p>
                                  {m.description && <p className="text-sm text-muted-foreground">{m.description}</p>}
                                </div>
                              </TableCell>
                              <TableCell>{format(new Date(m.dueDate), 'dd.MM.yyyy', { locale: de })}</TableCell>
                              <TableCell>
                                <Badge variant={m.status === 'completed' ? 'default' : 'secondary'}>
                                  {m.status === 'pending' ? 'Offen' : m.status === 'in_progress' ? 'In Arbeit' : m.status === 'completed' ? 'Abgeschlossen' : 'Fakturiert'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {m.amount ? formatCurrency(m.amount) : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                {m.status !== 'completed' && m.status !== 'invoiced' && (
                                  <Button size="sm" onClick={() => completeMilestone(m.id)}>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Abschließen
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>
                </Tabs>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectAccounting;
