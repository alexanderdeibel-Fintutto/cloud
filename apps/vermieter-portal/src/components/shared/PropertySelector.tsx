import { useState } from 'react'
import { Building2, ChevronDown } from 'lucide-react'
import { useProperties } from '@/hooks/useProperties'
import { useAuth } from '@/contexts/AuthContext'

interface PropertySelectorProps {
  onSelect: (data: { rent: number; address: string; unitId?: string }) => void
  label?: string
}

export default function PropertySelector({ onSelect, label = 'Aus Vermietify laden' }: PropertySelectorProps) {
  const { user } = useAuth()
  const { properties, isLoading, hasProperties } = useProperties()
  const [open, setOpen] = useState(false)

  if (!user || isLoading || !hasProperties) return null

  return (
    <div className="relative mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        <Building2 className="h-4 w-4" />
        {label}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-80 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {properties.map((building) => (
            <div key={building.id}>
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                {building.name} &middot; {building.city}
              </div>
              {building.units.map((unit) => {
                const tenantName = unit.leases?.[0]?.tenants
                  ? `${unit.leases[0].tenants.first_name} ${unit.leases[0].tenants.last_name}`
                  : null
                return (
                  <button
                    key={unit.id}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 flex justify-between items-center"
                    onClick={() => {
                      onSelect({
                        rent: unit.rent_amount,
                        address: `${building.address}, ${building.postal_code} ${building.city}`,
                        unitId: unit.id,
                      })
                      setOpen(false)
                    }}
                  >
                    <span className="text-sm">
                      {unit.unit_number}
                      {tenantName && <span className="text-gray-400 ml-1">({tenantName})</span>}
                    </span>
                    <span className="text-sm font-medium">{unit.rent_amount.toFixed(2)} &euro;</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
