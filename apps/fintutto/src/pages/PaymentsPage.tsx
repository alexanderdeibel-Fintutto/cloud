import { EmptyState } from '@fintutto/ui'
import { CreditCard } from 'lucide-react'

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Zahlungen</h1>
      <EmptyState
        icon={<CreditCard className="h-8 w-8" />}
        title="Noch keine Zahlungen"
        description="Zahlungen werden automatisch aus Mietverträgen generiert."
      />
    </div>
  )
}
