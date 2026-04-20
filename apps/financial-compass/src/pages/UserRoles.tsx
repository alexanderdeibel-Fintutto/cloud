import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  useUserRoles, Role, User, Permission, Module,
  PERMISSION_LABELS, PERMISSION_GROUPS
} from '@/hooks/useUserRoles';
import {
  Users, Shield, Plus, Edit, Trash2, UserPlus, Key, Lock,
  Activity, Eye, Pencil, Check, X, Settings, History
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

const MODULE_LABELS: Record<Module, string> = {
  dashboard: 'Dashboard',
  invoices: 'Rechnungen',
  receipts: 'Belege',
  bookings: 'Buchungen',
  bank: 'Bank',
  reports: 'Berichte',
  contacts: 'Kontakte',
  settings: 'Einstellungen',
  users: 'Benutzer',
  archive: 'Archiv',
  assets: 'Anlagen',
  budget: 'Budget',
  data: 'Daten',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-blue-100 text-blue-800',
  accountant: 'bg-green-100 text-green-800',
  auditor: 'bg-purple-100 text-purple-800',
  viewer: 'bg-gray-100 text-gray-800',
  custom: 'bg-orange-100 text-orange-800',
};

export default function UserRoles() {
  const {
    roles,
    users,
    currentUser,
    currentRole,
    activityLog,
    hasPermission,
    createRole,
    updateRole,
    deleteRole,
    createUser,
    updateUser,
    deleteUser,
    assignRole,
    permissionLabels,
    permissionGroups,
    stats,
  } = useUserRoles();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'user' | 'role'; id: string; name: string } | null>(null);

  // New user form
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    roleId: 'role_viewer',
    isActive: true,
    mfaEnabled: false,
  });

  // New role form
  const [newRoleForm, setNewRoleForm] = useState({
    name: '',
    nameEn: '',
    description: '',
    permissions: [] as Permission[],
  });

  const handleCreateUser = () => {
    try {
      createUser(newUserForm);
      toast.success('Benutzer erstellt');
      setUserDialogOpen(false);
      setNewUserForm({
        name: '',
        email: '',
        roleId: 'role_viewer',
        isActive: true,
        mfaEnabled: false,
      });
    } catch (error: unknown) {
      toast.error((error as Error).message);
    }
  };

  const handleCreateRole = () => {
    try {
      createRole({
        ...newRoleForm,
        type: 'custom',
      });
      toast.success('Rolle erstellt');
      setRoleDialogOpen(false);
      setNewRoleForm({
        name: '',
        nameEn: '',
        description: '',
        permissions: [],
      });
    } catch (error: unknown) {
      toast.error((error as Error).message);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'user') {
        deleteUser(deleteTarget.id);
        toast.success('Benutzer gelöscht');
      } else {
        deleteRole(deleteTarget.id);
        toast.success('Rolle gelöscht');
      }
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (error: unknown) {
      toast.error((error as Error).message);
    }
  };

  const togglePermission = (permission: Permission) => {
    setNewRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const toggleModulePermissions = (module: Module, checked: boolean) => {
    const modulePerms = permissionGroups[module];
    setNewRoleForm(prev => ({
      ...prev,
      permissions: checked
        ? [...new Set([...prev.permissions, ...modulePerms])]
        : prev.permissions.filter(p => !modulePerms.includes(p)),
    }));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Benutzer & Rollen</h1>
          <p className="text-muted-foreground">Verwalten Sie Zugriffsrechte und Berechtigungen</p>
        </div>
        <div className="flex gap-2">
          {hasPermission('users:create') && (
            <Button onClick={() => setUserDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Benutzer einladen
            </Button>
          )}
          {hasPermission('users:roles') && (
            <Button variant="outline" onClick={() => setRoleDialogOpen(true)}>
              <Shield className="mr-2 h-4 w-4" />
              Rolle erstellen
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Benutzer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">{stats.activeUsers} aktiv</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rollen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRoles}</div>
            <p className="text-xs text-muted-foreground">{stats.customRoles} benutzerdefiniert</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ihre Rolle</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={ROLE_COLORS[currentRole?.type || 'viewer']}>
              {currentRole?.name || 'Keine'}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Berechtigungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentRole?.permissions.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Benutzer</TabsTrigger>
          <TabsTrigger value="roles">Rollen</TabsTrigger>
          <TabsTrigger value="activity">Aktivitätslog</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alle Benutzer</CardTitle>
              <CardDescription>Verwalten Sie Benutzerkonten und Rollenzuweisungen</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Benutzer</TableHead>
                    <TableHead>E-Mail</TableHead>
                    <TableHead>Rolle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Letzter Login</TableHead>
                    <TableHead>2FA</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const userRole = roles.find(r => r.id === user.roleId);
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.name}</span>
                            {user.id === currentUser?.id && (
                              <Badge variant="outline" className="text-xs">Sie</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={ROLE_COLORS[userRole?.type || 'viewer']}>
                            {userRole?.name || 'Unbekannt'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.isActive ? (
                            <Badge variant="default" className="bg-green-600">Aktiv</Badge>
                          ) : (
                            <Badge variant="secondary">Inaktiv</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.lastLogin
                            ? format(new Date(user.lastLogin), 'dd.MM.yyyy HH:mm', { locale: de })
                            : 'Nie'}
                        </TableCell>
                        <TableCell>
                          {user.mfaEnabled ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.id !== currentUser?.id && hasPermission('users:delete') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDeleteTarget({ type: 'user', id: user.id, name: user.name });
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.id} className={role.isSystem ? 'border-dashed' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                    </div>
                    <Badge className={ROLE_COLORS[role.type]}>
                      {role.isSystem ? 'System' : 'Custom'}
                    </Badge>
                  </div>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Berechtigungen</span>
                      <span className="font-medium">{role.permissions.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Benutzer</span>
                      <span className="font-medium">{stats.byRole[role.name] || 0}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 5).map(p => (
                        <Badge key={p} variant="outline" className="text-xs">
                          {p.split(':')[0]}
                        </Badge>
                      ))}
                      {role.permissions.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 5}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {!role.isSystem && hasPermission('users:roles') && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedRole(role)}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Bearbeiten
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeleteTarget({ type: 'role', id: role.id, name: role.name });
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aktivitätslog</CardTitle>
              <CardDescription>Letzte Benutzeraktivitäten im System</CardDescription>
            </CardHeader>
            <CardContent>
              {activityLog.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Keine Aktivitäten aufgezeichnet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activityLog.slice(0, 20).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                    >
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{activity.userName}</div>
                        <div className="text-sm text-muted-foreground">
                          {activity.action} in {MODULE_LABELS[activity.module]}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(activity.timestamp), 'dd.MM.yyyy HH:mm', { locale: de })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuen Benutzer einladen</DialogTitle>
            <DialogDescription>Erstellen Sie ein neues Benutzerkonto</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newUserForm.name}
                onChange={(e) => setNewUserForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Max Mustermann"
              />
            </div>
            <div className="space-y-2">
              <Label>E-Mail</Label>
              <Input
                type="email"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="max@beispiel.de"
              />
            </div>
            <div className="space-y-2">
              <Label>Rolle</Label>
              <Select
                value={newUserForm.roleId}
                onValueChange={(v) => setNewUserForm(prev => ({ ...prev, roleId: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Aktiv</Label>
              <Switch
                checked={newUserForm.isActive}
                onCheckedChange={(checked) => setNewUserForm(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleCreateUser}>Einladen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Neue Rolle erstellen</DialogTitle>
            <DialogDescription>Definieren Sie eine benutzerdefinierte Rolle mit Berechtigungen</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name (Deutsch)</Label>
                <Input
                  value={newRoleForm.name}
                  onChange={(e) => setNewRoleForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Sachbearbeiter"
                />
              </div>
              <div className="space-y-2">
                <Label>Name (English)</Label>
                <Input
                  value={newRoleForm.nameEn}
                  onChange={(e) => setNewRoleForm(prev => ({ ...prev, nameEn: e.target.value }))}
                  placeholder="Clerk"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea
                value={newRoleForm.description}
                onChange={(e) => setNewRoleForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beschreibung der Rolle und ihrer Aufgaben..."
              />
            </div>
            <div className="space-y-4">
              <Label>Berechtigungen ({newRoleForm.permissions.length} ausgewählt)</Label>
              {Object.entries(permissionGroups).map(([module, permissions]) => (
                <div key={module} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={permissions.every(p => newRoleForm.permissions.includes(p))}
                        onCheckedChange={(checked) => toggleModulePermissions(module as Module, !!checked)}
                      />
                      <Label className="font-medium">{MODULE_LABELS[module as Module]}</Label>
                    </div>
                    <Badge variant="outline">
                      {permissions.filter(p => newRoleForm.permissions.includes(p)).length}/{permissions.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 ml-6">
                    {permissions.map(permission => (
                      <div key={permission} className="flex items-center gap-2">
                        <Checkbox
                          checked={newRoleForm.permissions.includes(permission)}
                          onCheckedChange={() => togglePermission(permission)}
                        />
                        <span className="text-sm">{permissionLabels[permission].de}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleCreateRole}>Erstellen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Löschen bestätigen</DialogTitle>
            <DialogDescription>
              Möchten Sie {deleteTarget?.type === 'user' ? 'den Benutzer' : 'die Rolle'} "{deleteTarget?.name}" wirklich löschen?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Abbrechen</Button>
            <Button variant="destructive" onClick={handleDelete}>Löschen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Edit Sheet */}
      <Sheet open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Benutzer bearbeiten</SheetTitle>
            <SheetDescription>{selectedUser?.email}</SheetDescription>
          </SheetHeader>
          {selectedUser && (
            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={selectedUser.name}
                  onChange={(e) => {
                    updateUser(selectedUser.id, { name: e.target.value });
                    setSelectedUser(prev => prev ? { ...prev, name: e.target.value } : null);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Rolle</Label>
                <Select
                  value={selectedUser.roleId}
                  onValueChange={(v) => {
                    assignRole(selectedUser.id, v);
                    setSelectedUser(prev => prev ? { ...prev, roleId: v } : null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Aktiv</Label>
                  <p className="text-sm text-muted-foreground">Benutzer kann sich anmelden</p>
                </div>
                <Switch
                  checked={selectedUser.isActive}
                  onCheckedChange={(checked) => {
                    updateUser(selectedUser.id, { isActive: checked });
                    setSelectedUser(prev => prev ? { ...prev, isActive: checked } : null);
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>2-Faktor-Authentifizierung</Label>
                  <p className="text-sm text-muted-foreground">Zusätzliche Sicherheitsebene</p>
                </div>
                <Switch
                  checked={selectedUser.mfaEnabled}
                  onCheckedChange={(checked) => {
                    updateUser(selectedUser.id, { mfaEnabled: checked });
                    setSelectedUser(prev => prev ? { ...prev, mfaEnabled: checked } : null);
                  }}
                />
              </div>
              <div className="pt-4 border-t">
                <Label className="text-muted-foreground">Mitglied seit</Label>
                <p>{format(new Date(selectedUser.createdAt), 'dd.MM.yyyy', { locale: de })}</p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
