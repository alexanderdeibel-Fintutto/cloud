import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Users, Search, Loader2, Mail, Phone } from 'lucide-react'
import { useTenants, useCreateTenant } from '@/hooks/useTenants'
import { useProperties } from '@/hooks/useProperties'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

export function Tenants() {
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    unit_id: '',
    move_in_date: '',
    deposit_amount: '',
  })

  const { data: tenants, isLoading } = useTenants()
  const { data: properties } = useProperties()
  const createTenant = useCreateTenant()

  const allUnits = (properties || []).flatMap((p) =>
    ((p as any).units || []).map((u: any) => ({
      ...u,
      propertyName: p.name,
    }))
  )

  const filtered = (tenants || []).filter((t) =>
    `${t.first_name} ${t.last_name} ${t.email || ''}`.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.first_name || !form.last_name || !form.move_in_date) {
      toast.error('Bitte füllen Sie Name und Einzugsdatum aus.')
      return
    }
    try {
      await createTenant.mutateAsync({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email || null,
        phone: form.phone || null,
        unit_id: form.unit_id || null,
        move_in_date: form.move_in_date,
        deposit_amount: form.deposit_amount ? Math.round(parseFloat(form.deposit_amount) * 100) : null,
      })
      toast.success('Mieter erfolgreich angelegt!')
      setShowForm(false)
      setForm({ first_name: '', last_name: '', email: '', phone: '', unit_id: '', move_in_date: '', deposit_amount: '' })
    } catch (err: any) {
      toast.error(err.message || 'Fehler beim Anlegen.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mieter</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Mieter und Mietverhältnisse
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Mieter
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Vorname *</Label>
                <Input placeholder="Vorname" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Nachname *</Label>
                <Input placeholder="Nachname" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>E-Mail</Label>
                <Input type="email" placeholder="email@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input placeholder="+49..." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Wohnung zuordnen</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.unit_id} onChange={(e) => setForm({ ...form, unit_id: e.target.value })}>
                  <option value="">-- Keine Zuordnung --</option>
                  {allUnits.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.propertyName} - {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Einzugsdatum *</Label>
                <Input type="date" value={form.move_in_date} onChange={(e) => setForm({ ...form, move_in_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Kaution (EUR)</Label>
                <Input type="number" step="0.01" placeholder="z.B. 1500.00" value={form.deposit_amount} onChange={(e) => setForm({ ...form, deposit_amount: e.target.value })} />
              </div>
              <div className="flex items-end justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Abbrechen</Button>
                <Button type="submit" disabled={createTenant.isPending}>
                  {createTenant.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Speichern
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Mieter suchen..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Keine Mieter vorhanden</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Fügen Sie Ihren ersten Mieter hinzu.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Mieter hinzufügen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tenant) => (
            <Card key={tenant.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{tenant.first_name} {tenant.last_name}</h3>
                    {(tenant as any).unit?.property && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {(tenant as any).unit.property.name} - {(tenant as any).unit.name}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${tenant.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {tenant.is_active ? 'Aktiv' : 'Ausgezogen'}
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {tenant.email && (
                    <div className="flex items-center gap-2"><Mail className="h-3 w-3" />{tenant.email}</div>
                  )}
                  {tenant.phone && (
                    <div className="flex items-center gap-2"><Phone className="h-3 w-3" />{tenant.phone}</div>
                  )}
                  <div>Einzug: {formatDate(tenant.move_in_date)}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
