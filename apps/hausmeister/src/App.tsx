import { Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/aufgaben" element={<Dashboard />} />
        <Route path="/gebaeude" element={<Dashboard />} />
        <Route path="/protokolle" element={<Dashboard />} />
        <Route path="/einstellungen" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}
