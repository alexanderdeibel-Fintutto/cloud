import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import Buchungen from '@/pages/Buchungen'
import Rechnungen from '@/pages/Rechnungen'
import Belege from '@/pages/Belege'
import Kontakte from '@/pages/Kontakte'
import Bankkonten from '@/pages/Bankkonten'
import Kontenrahmen from '@/pages/Kontenrahmen'
import Berichte from '@/pages/Berichte'
import Firmen from '@/pages/Firmen'
import Einstellungen from '@/pages/Einstellungen'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/buchungen" element={<Buchungen />} />
        <Route path="/rechnungen" element={<Rechnungen />} />
        <Route path="/rechnungen/neu" element={<Rechnungen />} />
        <Route path="/belege" element={<Belege />} />
        <Route path="/kontakte" element={<Kontakte />} />
        <Route path="/bankkonten" element={<Bankkonten />} />
        <Route path="/kontenrahmen" element={<Kontenrahmen />} />
        <Route path="/berichte" element={<Berichte />} />
        <Route path="/berichte/bwa" element={<Berichte />} />
        <Route path="/firmen" element={<Firmen />} />
        <Route path="/einstellungen" element={<Einstellungen />} />
      </Route>
    </Routes>
  )
}
