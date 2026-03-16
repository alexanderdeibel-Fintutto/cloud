import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/buchungen" element={<Dashboard />} />
        <Route path="/rechnungen" element={<Dashboard />} />
        <Route path="/belege" element={<Dashboard />} />
        <Route path="/kontakte" element={<Dashboard />} />
        <Route path="/bankkonten" element={<Dashboard />} />
        <Route path="/berichte" element={<Dashboard />} />
        <Route path="/einstellungen" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}
