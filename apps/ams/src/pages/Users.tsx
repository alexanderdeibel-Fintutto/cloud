import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, MoreHorizontal, RefreshCw, Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUsersWithSubscriptions, useUpdateProfile, Profile } from '@/hooks/useUsers';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface UserWithSub extends Profile {
  subscription: any;
  subscriptionTier: string;
  subscriptionStatus: string;
}

export default function Users() {
  const { data: users, isLoading } = useUsersWithSubscriptions();
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithSub | null>(null);
  const [formData, setFormData] = useState({ full_name: '', role: '', status: '' });

  const handleEdit = (user: UserWithSub) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name || '',
      role: user.role || 'user',
      status: user.status || 'active',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    
    await updateProfile.mutateAsync({
      id: editingUser.id,
      full_name: formData.full_name,
      role: formData.role,
      status: formData.status,
    });
    
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const columns = [
    { key: 'full_name', header: 'Name', render: (user: UserWithSub) => (
      <span className="font-medium">{user.full_name || '-'}</span>
    )},
    { key: 'email', header: 'E-Mail', render: (user: UserWithSub) => (
      <span className="text-muted-foreground">{user.email}</span>
    )},
    { key: 'role', header: 'Rolle', render: (user: UserWithSub) => (
      <Badge variant="outline">{user.role || 'user'}</Badge>
    )},
    {
      key: 'status',
      header: 'Status',
      render: (user: UserWithSub) => (
        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
          {user.status === 'active' ? 'Aktiv' : user.status || 'Unbekannt'}
        </Badge>
      ),
    },
    {
      key: 'subscription',
      header: 'Abonnement',
      render: (user: UserWithSub) => (
        <Badge variant={user.subscriptionStatus === 'active' ? 'default' : 'outline'}>
          {user.subscriptionTier}
        </Badge>
      ),
    },
    { 
      key: 'created_at', 
      header: 'Erstellt', 
      render: (user: UserWithSub) => (
        <span className="text-sm text-muted-foreground">
          {user.created_at ? format(new Date(user.created_at), 'dd.MM.yyyy', { locale: de }) : '-'}
        </span>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (user: UserWithSub) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(user)}>
              <Pencil className="mr-2 h-4 w-4" />
              Bearbeiten
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.location.href = `mailto:${user.email}`}>
              <Mail className="mr-2 h-4 w-4" />
              E-Mail senden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Benutzer & Abos</h1>
            <p className="text-muted-foreground">
              Verwalten Sie alle Benutzer und deren Abonnements
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['profiles'] })}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Aktualisieren
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : users && users.length > 0 ? (
          <DataTable<UserWithSub>
            data={users}
            columns={columns}
            searchKey="email"
            searchPlaceholder="Nach E-Mail suchen..."
          />
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                Keine Benutzer gefunden.
              </p>
            </CardContent>
          </Card>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Benutzer bearbeiten</DialogTitle>
              <DialogDescription>
                Bearbeiten Sie die Benutzerinformationen.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Rolle</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="user">Benutzer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="inactive">Inaktiv</SelectItem>
                    <SelectItem value="suspended">Gesperrt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Abbrechen</Button>
              <Button onClick={handleSave} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Speichern...' : 'Speichern'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
