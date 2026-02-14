import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, CreditCard, Loader2 } from 'lucide-react'
import { usePayments } from '@/hooks/usePayments'
import { formatCurrency, formatDate } from '@/lib/utils'

export function Payments() {
  const { data: payments, isLoading } = usePayments()

  const statusColor: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    overdue: 'bg-red-100 text-red-700',
    partial: 'bg-orange-100 text-orange-700',
  }

  const statusLabel: Record<string, string> = {
    paid: 'Bezahlt',
    pending: 'Ausstehend',
    overdue: 'Überfällig',
    partial: 'Teilweise',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zahlungen</h1>
          <p className="text-muted-foreground">
            Überwachen Sie Mieteingänge und Ausgaben
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Zahlung erfassen
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !payments || payments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Keine Zahlungen vorhanden</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Zahlungen werden automatisch erstellt, wenn Mietverträge angelegt sind.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <Card key={payment.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">
                    {(payment as any).tenant?.first_name} {(payment as any).tenant?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Fällig: {formatDate(payment.due_date)}
                    {payment.paid_date && ` | Bezahlt: ${formatDate(payment.paid_date)}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatCurrency(payment.amount / 100)}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColor[payment.status] || 'bg-gray-100'}`}>
                    {statusLabel[payment.status] || payment.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
