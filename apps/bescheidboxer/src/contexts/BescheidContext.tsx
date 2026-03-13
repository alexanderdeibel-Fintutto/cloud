import { createContext, useContext, type ReactNode } from 'react'
import { useBescheide } from '../hooks/use-bescheide'
import type { Bescheid, Frist, Einspruch, DashboardStats, Pruefungsergebnis } from '../types/bescheid'

interface BescheidContextValue {
  bescheide: Bescheid[]
  fristen: Frist[]
  einsprueche: Einspruch[]
  stats: DashboardStats
  loading: boolean
  usingRealData: boolean
  createBescheid: (data: {
    titel: string
    typ: Bescheid['typ']
    steuerjahr: number
    finanzamt: string
    aktenzeichen?: string
    festgesetzteSteuer?: number
    erwarteteSteuer?: number
    einspruchsfrist?: string
    notizen?: string
  }) => Promise<Bescheid | null>
  updateBescheid: (id: string, data: {
    titel?: string
    finanzamt?: string
    aktenzeichen?: string
    festgesetzteSteuer?: number
    erwarteteSteuer?: number
    einspruchsfrist?: string
    notizen?: string
  }) => Promise<boolean>
  updateBescheidStatus: (id: string, status: Bescheid['status']) => Promise<void>
  deleteBescheid: (id: string) => Promise<boolean>
  createEinspruch: (data: {
    bescheidId: string
    begruendung: string
    forderung: number
    frist: string
  }) => Promise<Einspruch | null>
  toggleFrist: (id: string) => Promise<void>
  runAnalyse: (id: string) => Promise<Pruefungsergebnis | undefined>
}

const BescheidContext = createContext<BescheidContextValue | null>(null)

export function BescheidProvider({ children }: { children: ReactNode }) {
  const value = useBescheide()
  return (
    <BescheidContext.Provider value={value}>
      {children}
    </BescheidContext.Provider>
  )
}

export function useBescheidContext(): BescheidContextValue {
  const ctx = useContext(BescheidContext)
  if (!ctx) {
    throw new Error('useBescheidContext must be used within a BescheidProvider')
  }
  return ctx
}
