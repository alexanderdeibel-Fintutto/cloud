import {
  Clock,
  UserCheck,
  Star,
  Mail,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { formatDate } from '../../lib/utils'
import type { Referral, ReferralStatus } from '../../types/referral'
import { REFERRAL_STATUS_LABELS } from '../../types/referral'

interface ReferralStatusListProps {
  referrals: Referral[]
}

export default function ReferralStatusList({ referrals }: ReferralStatusListProps) {
  if (referrals.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Mail className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-1">Noch keine Einladungen</h3>
          <p className="text-muted-foreground text-center">
            Teilen Sie Ihren Einladungscode um Credits zu verdienen.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Einladungen</CardTitle>
        <CardDescription>
          {referrals.length} Einladung{referrals.length !== 1 ? 'en' : ''} insgesamt
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {referrals.map(referral => (
            <ReferralItem key={referral.id} referral={referral} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ReferralItem({ referral }: { referral: Referral }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`rounded-full p-2 ${
          referral.status === 'converted' ? 'bg-green-100' :
          referral.status === 'registered' ? 'bg-blue-100' :
          'bg-muted'
        }`}>
          <StatusIcon status={referral.status} />
        </div>
        <div>
          <p className="font-medium text-sm">{referral.referredEmail}</p>
          <p className="text-xs text-muted-foreground">
            Eingeladen am {formatDate(referral.createdAt)}
            {referral.convertedAt && ` \u00b7 Registriert am ${formatDate(referral.convertedAt)}`}
          </p>
        </div>
      </div>
      <ReferralStatusBadge status={referral.status} />
    </div>
  )
}

function StatusIcon({ status }: { status: ReferralStatus }) {
  switch (status) {
    case 'converted':
      return <Star className="h-4 w-4 text-green-600" />
    case 'registered':
      return <UserCheck className="h-4 w-4 text-blue-600" />
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

function ReferralStatusBadge({ status }: { status: ReferralStatus }) {
  const variant = {
    pending: 'secondary' as const,
    registered: 'default' as const,
    converted: 'success' as const,
  }[status]

  return (
    <Badge variant={variant}>
      {REFERRAL_STATUS_LABELS[status]}
    </Badge>
  )
}
