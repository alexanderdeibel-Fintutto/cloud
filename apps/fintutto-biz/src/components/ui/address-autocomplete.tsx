/**
 * Wrapper um die zentrale AddressAutocomplete-Komponente aus @fintutto/shared.
 * Injiziert automatisch den fintutto-biz Supabase-Client.
 */
import { supabase } from '@/integrations/supabase/client'
import {
  AddressAutocomplete as SharedAddressAutocomplete,
  type PlaceDetails,
  type AddressAutocompleteProps,
} from '@fintutto/shared/components/address'

export type { PlaceDetails, AddressAutocompleteProps }

type WrapperProps = Omit<AddressAutocompleteProps, 'supabase'>

export function AddressAutocomplete(props: WrapperProps) {
  return <SharedAddressAutocomplete {...props} supabase={supabase} />
}
