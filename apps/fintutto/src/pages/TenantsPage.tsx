import { useState } from 'react'
import {
  Button, Card, CardContent, Input, Label, Badge, Skeleton, EmptyState, Separator,
} from '@fintutto/ui'
import { Users, Plus, Search, Mail, Phone, MapPin, X, Trash2 } from 'lucide-react'
import { useTenantsList, useCreateTenant, useDeleteTenant, type TenantWithLease } from '@/hooks/useTenants'
import type { TenantFormData } from '@fintutto/shared'
import { toast } from 'sonner'

function CreateTenantForm({ onClose }: { onClose: () => void }) {
  const createTenant = useCreateTenant()
  const [form, setForm] = useState<TenantFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTenant.mutateAsync(form)
      toast.success('Mieter erfolgreich angelegt')
      onClose()
    } catch {
      toast.error('Fehler beim Anlegen des Mieters')
    }
  }

  return (
    <Card className="border-primary">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Neuer Mieter</h3>
            <button type="button" onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Vorname</Label>
              <Input value={form.first_name} onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Nachname</Label>
              <Input value={form.last_name} onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>E-Mail</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Abbrechen</Button>
            <Button type="submit" disabled={createTenant.isPending}>
              {createTenant.isPending ? 'Wird angelegt...' : 'Anlegen'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success' }> = {
  active: { label: 'Aktiv', variant: 'success' },
  former: { label: 'Ehemalig', variant: 'secondary' },
  terminated: { label: 'Kein Vertrag', variant: 'destructive' },
}

export default function TenantsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')
  const { data: tenants, isLoading } = useTenantsList()
  const deleteTenant = useDeleteTenant()

  const filtered = (tenants ?? []).filter((t) =>
    !search ||
    `${t.first_name} ${t.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (t: TenantWithLease) => {
    if (!confirm(`"${t.first_name} ${t.last_name}" wirklich löschen?`)) return
    try {
      await deleteTenant.mutateAsync(t.id)
      toast.success('Mieter gelöscht')
    } catch {
      toast.error('Fehler beim Löschen')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Mieter</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Mieter anlegen
        </Button>
      </div>

      {showCreate && <CreateTenantForm onClose={() => setShowCreate(false)} />}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Suche nach Name oder E-Mail..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title={search ? 'Keine Ergebnisse' : 'Noch keine Mieter'}
          description={search ? 'Versuche einen anderen Suchbegriff.' : 'Lege deinen ersten Mieter an.'}
          action={!search ? <Button onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" />Ersten Mieter anlegen</Button> : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((tenant) => {
            const activeLease = tenant.leases?.find((l) => l.is_active)
            const s = statusLabels[tenant.status ?? 'terminated']
            return (
              <Card key={tenant.id} className="group">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                    {tenant.first_name[0]}{tenant.last_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{tenant.first_name} {tenant.last_name}</span>
                      <Badge variant={s.variant as 'default'}>{s.label}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                      {tenant.email && (
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{tenant.email}</span>
                      )}
                      {tenant.phone && (
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{tenant.phone}</span>
                      )}
                      {activeLease?.units?.buildings && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {activeLease.units.buildings.name} – Einheit {activeLease.units.unit_number}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(tenant)}
                    className="p-1.5 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
