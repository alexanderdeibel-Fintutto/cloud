/**
 * CoreContactForm — Formular zum Erstellen und Bearbeiten von Kontakten
 *
 * Zentrale Komponente für alle Apps. Unterstützt Personen und Firmen,
 * inkl. Adresse (mit Google Autocomplete), IBAN und Steuerdaten.
 *
 * Usage:
 *   <CoreContactForm
 *     supabase={supabase}
 *     onSubmit={(data) => createContact.mutate(data)}
 *     onCancel={() => setOpen(false)}
 *   />
 */
import { useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { CoreContactInsert } from '../hooks/useCoreContacts'
import { AddressAutocomplete } from './AddressAutocomplete'
import type { PlaceDetails } from './AddressAutocomplete'

export interface CoreContactFormProps {
  supabase: SupabaseClient
  initialData?: Partial<CoreContactInsert>
  onSubmit: (data: CoreContactInsert) => void | Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  /** Typ vorbelegen und ausblenden */
  fixedType?: 'person' | 'company'
  /** Zusätzliche Felder anzeigen */
  showBankFields?: boolean
  showTaxFields?: boolean
}

export function CoreContactForm({
  supabase,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  fixedType,
  showBankFields = false,
  showTaxFields = false,
}: CoreContactFormProps) {
  const [contactType, setContactType] = useState<'person' | 'company'>(
    fixedType ?? initialData?.contact_type ?? 'person'
  )
  const [firstName, setFirstName] = useState(initialData?.first_name ?? '')
  const [lastName, setLastName] = useState(initialData?.last_name ?? '')
  const [companyName, setCompanyName] = useState(initialData?.company_name ?? '')
  const [email, setEmail] = useState(initialData?.email ?? '')
  const [phone, setPhone] = useState(initialData?.phone ?? '')
  const [mobile, _setMobile] = useState(initialData?.mobile ?? '')
  const [taxId, setTaxId] = useState(initialData?.tax_id ?? '')
  const [vatId, setVatId] = useState(initialData?.vat_id ?? '')
  const [iban, setIban] = useState(initialData?.iban ?? '')
  const [bankName, setBankName] = useState(initialData?.bank_name ?? '')
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [tagsInput, setTagsInput] = useState((initialData?.tags ?? []).join(', '))

  // Adresse
  const [addressInput, setAddressInput] = useState(
    initialData?.address?.street ?? ''
  )
  const [addressDetails, setAddressDetails] = useState<{
    street: string
    postal_code: string
    city: string
    country: string
    google_place_id?: string
    formatted?: string
    latitude?: number
    longitude?: number
  } | null>(
    initialData?.address
      ? {
          street: initialData.address.street,
          postal_code: initialData.address.postal_code,
          city: initialData.address.city,
          country: initialData.address.country ?? 'Deutschland',
        }
      : null
  )

  const handlePlaceSelect = (details: PlaceDetails) => {
    setAddressDetails({
      street: details.address,
      postal_code: details.postalCode,
      city: details.city,
      country: details.country,
      google_place_id: details.placeId,
      formatted: details.formattedAddress,
      latitude: details.lat,
      longitude: details.lng,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    const data: CoreContactInsert = {
      contact_type: contactType,
      first_name: contactType === 'person' ? firstName || undefined : undefined,
      last_name: contactType === 'person' ? lastName || undefined : undefined,
      company_name: contactType === 'company' ? companyName || undefined : companyName || undefined,
      email: email || undefined,
      phone: phone || undefined,
      mobile: mobile || undefined,
      tax_id: taxId || undefined,
      vat_id: vatId || undefined,
      iban: iban || undefined,
      bank_name: bankName || undefined,
      notes: notes || undefined,
      tags,
      address: addressDetails ?? undefined,
    }
    await onSubmit(data)
  }

  const inputClass =
    'w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50'
  const labelClass = 'block text-sm font-medium text-foreground mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Typ-Auswahl */}
      {!fixedType && (
        <div className="flex gap-2">
          {(['person', 'company'] as const).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setContactType(type)}
              className={[
                'flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                contactType === type
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background hover:bg-accent',
              ].join(' ')}
            >
              {type === 'person' ? '👤 Person' : '🏢 Firma'}
            </button>
          ))}
        </div>
      )}

      {/* Name */}
      {contactType === 'person' ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Vorname</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Max"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Nachname *</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Mustermann"
              required
              className={inputClass}
            />
          </div>
        </div>
      ) : (
        <div>
          <label className={labelClass}>Firmenname *</label>
          <input
            type="text"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder="Musterfirma GmbH"
            required
            className={inputClass}
          />
        </div>
      )}

      {/* Kontakt */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>E-Mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="max@beispiel.de"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Telefon</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+49 89 12345678"
            className={inputClass}
          />
        </div>
      </div>

      {/* Adresse */}
      <div>
        <label className={labelClass}>Adresse</label>
        <AddressAutocomplete
          supabase={supabase}
          value={addressInput}
          onChange={setAddressInput}
          onPlaceSelect={handlePlaceSelect}
          placeholder="Straße, PLZ, Ort..."
        />
        {addressDetails && (
          <p className="mt-1 text-xs text-muted-foreground">
            ✓ {addressDetails.formatted ?? `${addressDetails.street}, ${addressDetails.postal_code} ${addressDetails.city}`}
          </p>
        )}
      </div>

      {/* Bankdaten */}
      {showBankFields && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>IBAN</label>
            <input
              type="text"
              value={iban}
              onChange={e => setIban(e.target.value.toUpperCase().replace(/\s/g, ''))}
              placeholder="DE89 3704 0044 0532 0130 00"
              className={`${inputClass} font-mono`}
            />
          </div>
          <div>
            <label className={labelClass}>Bank</label>
            <input
              type="text"
              value={bankName}
              onChange={e => setBankName(e.target.value)}
              placeholder="Commerzbank"
              className={inputClass}
            />
          </div>
        </div>
      )}

      {/* Steuerdaten */}
      {showTaxFields && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Steuernummer</label>
            <input
              type="text"
              value={taxId}
              onChange={e => setTaxId(e.target.value)}
              placeholder="123/456/78901"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>USt-IdNr.</label>
            <input
              type="text"
              value={vatId}
              onChange={e => setVatId(e.target.value.toUpperCase())}
              placeholder="DE123456789"
              className={inputClass}
            />
          </div>
        </div>
      )}

      {/* Tags */}
      <div>
        <label className={labelClass}>Tags (kommagetrennt)</label>
        <input
          type="text"
          value={tagsInput}
          onChange={e => setTagsInput(e.target.value)}
          placeholder="Wichtig, VIP, Gewerbe"
          className={inputClass}
        />
      </div>

      {/* Notizen */}
      <div>
        <label className={labelClass}>Notizen</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Interne Notizen..."
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-input px-4 py-2 text-sm hover:bg-accent"
          >
            Abbrechen
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? 'Speichern...' : 'Speichern'}
        </button>
      </div>
    </form>
  )
}

export default CoreContactForm
