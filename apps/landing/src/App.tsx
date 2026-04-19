import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CloudLayout } from './components/CloudLayout'
import { CloudHomePage } from './pages/CloudHomePage'
import { AppsOverviewPage } from './pages/AppsOverviewPage'
import { PricingPage } from './pages/PricingPage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
// App-spezifische Seiten
import { FinanceCoachPage } from './pages/apps/FinanceCoachPage'
import { FinanceMentorPage } from './pages/apps/FinanceMentorPage'
import { FintuttoBizPage } from './pages/apps/FintuttoBizPage'
import { BescheidboxerPage } from './pages/apps/BescheidboxerPage'
import { VermietifyPage } from './pages/apps/VermietifyPage'
import { WohnHeldPage } from './pages/apps/WohnHeldPage'
import { AblesungPage } from './pages/apps/AblesungPage'
import { PortalPage } from './pages/apps/PortalPage'
import { LernAppPage } from './pages/apps/LernAppPage'
import { SecondBrainPage } from './pages/apps/SecondBrainPage'
import { PflanzenPage } from './pages/apps/PflanzenPage'
import { TranslatorPage } from './pages/apps/TranslatorPage'
import { ArbeitslosPage } from './pages/apps/ArbeitslosPage'
import { WiderspruchPage } from './pages/apps/WiderspruchPage'
// Lösungen
import { SolutionPage } from './pages/SolutionPage'
// Rechtliches
import { ImpressumPage } from './pages/ImpressumPage'
import { DatenschutzPage } from './pages/DatenschutzPage'

export default function App() {
  return (
    <BrowserRouter>
      <CloudLayout>
        <Routes>
          <Route path="/" element={<CloudHomePage />} />
          <Route path="/apps" element={<AppsOverviewPage />} />
          <Route path="/preise" element={<PricingPage />} />
          <Route path="/ueber-uns" element={<AboutPage />} />
          <Route path="/kontakt" element={<ContactPage />} />
          {/* App-Seiten */}
          <Route path="/apps/finance-coach" element={<FinanceCoachPage />} />
          <Route path="/apps/finance-mentor" element={<FinanceMentorPage />} />
          <Route path="/apps/fintutto-biz" element={<FintuttoBizPage />} />
          <Route path="/apps/bescheidboxer" element={<BescheidboxerPage />} />
          <Route path="/apps/vermietify" element={<VermietifyPage />} />
          <Route path="/apps/wohnheld" element={<WohnHeldPage />} />
          <Route path="/apps/ablesung" element={<AblesungPage />} />
          <Route path="/apps/portal" element={<PortalPage />} />
          <Route path="/apps/lernapp" element={<LernAppPage />} />
          <Route path="/apps/secondbrain" element={<SecondBrainPage />} />
          <Route path="/apps/pflanzen" element={<PflanzenPage />} />
          <Route path="/apps/translator" element={<TranslatorPage />} />
          <Route path="/apps/arbeitslos" element={<ArbeitslosPage />} />
          <Route path="/apps/widerspruch" element={<WiderspruchPage />} />
          {/* Lösungen */}
          <Route path="/loesungen/:slug" element={<SolutionPage />} />
          {/* Rechtliches */}
          <Route path="/impressum" element={<ImpressumPage />} />
          <Route path="/datenschutz" element={<DatenschutzPage />} />
          {/* Fallback */}
          <Route path="*" element={<CloudHomePage />} />
        </Routes>
      </CloudLayout>
    </BrowserRouter>
  )
}
