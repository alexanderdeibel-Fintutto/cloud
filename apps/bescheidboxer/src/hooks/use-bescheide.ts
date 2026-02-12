import { useState, useEffect, useCallback } from 'react'
import type { Bescheid, Frist, Einspruch, DashboardStats } from '../types/bescheid'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../integrations/supabase/client'
import { useMockData } from './use-mock-data'

function mapBescheid(row: Record<string, unknown>): Bescheid {
  return {
    id: row.id as string,
    titel: row.titel as string,
    typ: row.typ as Bescheid['typ'],
    steuerjahr: row.steuerjahr as number,
    eingangsdatum: row.eingangsdatum as string,
    finanzamt: row.finanzamt as string,
    aktenzeichen: (row.aktenzeichen as string) || '',
    status: row.status as Bescheid['status'],
    festgesetzteSteuer: Number(row.festgesetzte_steuer) || 0,
    erwarteteSteuer: row.erwartete_steuer != null ? Number(row.erwartete_steuer) : null,
    abweichung: row.abweichung != null ? Number(row.abweichung) : null,
    abweichungProzent: row.abweichung_prozent != null ? Number(row.abweichung_prozent) : null,
    einspruchsfrist: (row.einspruchsfrist as string) || '',
    dokumentUrl: (row.dokument_url as string) || null,
    notizen: (row.notizen as string) || null,
    pruefungsergebnis: (row.pruefungsergebnis as Bescheid['pruefungsergebnis']) || null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function mapFrist(row: Record<string, unknown>, bescheidTitel: string): Frist {
  return {
    id: row.id as string,
    bescheidId: row.bescheid_id as string,
    bescheidTitel,
    typ: row.typ as Frist['typ'],
    fristdatum: row.fristdatum as string,
    erledigt: row.erledigt as boolean,
    notiz: (row.notiz as string) || null,
  }
}

function mapEinspruch(row: Record<string, unknown>): Einspruch {
  return {
    id: row.id as string,
    bescheidId: row.bescheid_id as string,
    status: row.status as Einspruch['status'],
    begruendung: row.begruendung as string,
    forderung: Number(row.forderung) || 0,
    eingereichtAm: (row.eingereicht_am as string) || null,
    frist: (row.frist as string) || '',
    antwortErhalten: (row.antwort_erhalten as string) || null,
    ergebnis: (row.ergebnis as string) || null,
    createdAt: row.created_at as string,
  }
}

export function useBescheide() {
  const { user } = useAuth()
  const mock = useMockData()
  const [bescheide, setBescheide] = useState<Bescheid[]>(mock.bescheide)
  const [fristen, setFristen] = useState<Frist[]>(mock.fristen)
  const [einsprueche, setEinsprueche] = useState<Einspruch[]>(mock.einsprueche)
  const [loading, setLoading] = useState(false)
  const [usingRealData, setUsingRealData] = useState(false)

  // Fetch real data from Supabase
  useEffect(() => {
    if (!user?.id) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch bescheide
        const { data: bescheideData, error: bescheideError } = await supabase
          .from('bescheide')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (bescheideError) throw bescheideError

        if (bescheideData && bescheideData.length > 0) {
          const mapped = bescheideData.map(r => mapBescheid(r as Record<string, unknown>))
          setBescheide(mapped)
          setUsingRealData(true)

          // Build a title lookup for fristen
          const titelMap = new Map(mapped.map(b => [b.id, b.titel]))

          // Fetch fristen
          const { data: fristenData } = await supabase
            .from('fristen')
            .select('*')
            .eq('user_id', user.id)
            .order('fristdatum', { ascending: true })

          if (fristenData && fristenData.length > 0) {
            setFristen(
              fristenData.map(r => mapFrist(
                r as Record<string, unknown>,
                titelMap.get(r.bescheid_id as string) || 'Unbekannt'
              ))
            )
          }

          // Fetch einsprueche
          const { data: einspruecheData } = await supabase
            .from('einsprueche')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (einspruecheData && einspruecheData.length > 0) {
            setEinsprueche(einspruecheData.map(r => mapEinspruch(r as Record<string, unknown>)))
          }
        }
        // If no real data, keep mock data
      } catch {
        // Keep mock data on error
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  // Create a new Bescheid
  const createBescheid = useCallback(async (data: {
    titel: string
    typ: Bescheid['typ']
    steuerjahr: number
    finanzamt: string
    aktenzeichen?: string
    festgesetzteSteuer?: number
    erwarteteSteuer?: number
    einspruchsfrist?: string
    notizen?: string
  }) => {
    if (!user?.id) return null

    const abweichung =
      data.festgesetzteSteuer != null && data.erwarteteSteuer != null
        ? data.festgesetzteSteuer - data.erwarteteSteuer
        : null

    const abweichungProzent =
      abweichung != null && data.erwarteteSteuer && data.erwarteteSteuer > 0
        ? (abweichung / data.erwarteteSteuer) * 100
        : null

    const { data: row, error } = await supabase
      .from('bescheide')
      .insert({
        user_id: user.id,
        titel: data.titel,
        typ: data.typ,
        steuerjahr: data.steuerjahr,
        finanzamt: data.finanzamt,
        aktenzeichen: data.aktenzeichen || null,
        festgesetzte_steuer: data.festgesetzteSteuer || null,
        erwartete_steuer: data.erwarteteSteuer || null,
        abweichung,
        abweichung_prozent: abweichungProzent,
        einspruchsfrist: data.einspruchsfrist || null,
        notizen: data.notizen || null,
      })
      .select()
      .single()

    if (error) {
      // Fallback: add locally
      const local: Bescheid = {
        id: `local-${Date.now()}`,
        titel: data.titel,
        typ: data.typ,
        steuerjahr: data.steuerjahr,
        eingangsdatum: new Date().toISOString().split('T')[0],
        finanzamt: data.finanzamt,
        aktenzeichen: data.aktenzeichen || '',
        status: 'neu',
        festgesetzteSteuer: data.festgesetzteSteuer || 0,
        erwarteteSteuer: data.erwarteteSteuer || null,
        abweichung,
        abweichungProzent: abweichungProzent,
        einspruchsfrist: data.einspruchsfrist || '',
        dokumentUrl: null,
        notizen: data.notizen || null,
        pruefungsergebnis: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setBescheide(prev => [local, ...prev])
      return local
    }

    const mapped = mapBescheid(row as Record<string, unknown>)
    setBescheide(prev => [mapped, ...prev])
    return mapped
  }, [user?.id])

  // Update Bescheid status
  const updateBescheidStatus = useCallback(async (id: string, status: Bescheid['status']) => {
    if (!user?.id) return

    const { error } = await supabase
      .from('bescheide')
      .update({ status })
      .eq('id', id)
      .eq('user_id', user.id)

    if (!error) {
      setBescheide(prev => prev.map(b => b.id === id ? { ...b, status } : b))
    }
  }, [user?.id])

  // Create Einspruch
  const createEinspruch = useCallback(async (data: {
    bescheidId: string
    begruendung: string
    forderung: number
    frist: string
  }) => {
    if (!user?.id) return null

    const { data: row, error } = await supabase
      .from('einsprueche')
      .insert({
        user_id: user.id,
        bescheid_id: data.bescheidId,
        begruendung: data.begruendung,
        forderung: data.forderung,
        frist: data.frist,
        status: 'entwurf',
      })
      .select()
      .single()

    if (error) {
      const local: Einspruch = {
        id: `local-${Date.now()}`,
        bescheidId: data.bescheidId,
        status: 'entwurf',
        begruendung: data.begruendung,
        forderung: data.forderung,
        eingereichtAm: null,
        frist: data.frist,
        antwortErhalten: null,
        ergebnis: null,
        createdAt: new Date().toISOString(),
      }
      setEinsprueche(prev => [local, ...prev])
      return local
    }

    const mapped = mapEinspruch(row as Record<string, unknown>)
    setEinsprueche(prev => [mapped, ...prev])
    return mapped
  }, [user?.id])

  // Toggle Frist erledigt
  const toggleFrist = useCallback(async (id: string) => {
    const frist = fristen.find(f => f.id === id)
    if (!frist || !user?.id) return

    const newErledigt = !frist.erledigt
    const { error } = await supabase
      .from('fristen')
      .update({ erledigt: newErledigt })
      .eq('id', id)
      .eq('user_id', user.id)

    if (!error || frist.id.startsWith('f')) {
      setFristen(prev => prev.map(f => f.id === id ? { ...f, erledigt: newErledigt } : f))
    }
  }, [user?.id, fristen])

  // Compute stats
  const stats: DashboardStats = {
    bescheideGesamt: bescheide.length,
    offenePruefungen: bescheide.filter(b => b.status === 'neu' || b.status === 'in_pruefung').length,
    einsprueche: bescheide.filter(b => b.status === 'einspruch').length,
    einsparpotenzial: bescheide.reduce((sum, b) => sum + (b.pruefungsergebnis?.einsparpotenzial ?? 0), 0),
    ablaufendeFristen: fristen.filter(f => !f.erledigt).length,
    abweichungenGesamt: bescheide.reduce((sum, b) => sum + (b.pruefungsergebnis?.abweichungen.length ?? 0), 0),
  }

  return {
    bescheide,
    fristen,
    einsprueche,
    stats,
    loading,
    usingRealData,
    createBescheid,
    updateBescheidStatus,
    createEinspruch,
    toggleFrist,
  }
}
