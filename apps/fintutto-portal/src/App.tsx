import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Layout from '@/components/layout/Layout'

// Eagerly loaded (always needed)
import HomePage from '@/pages/HomePage'

// Lazy-loaded pages
const RechnerPage = lazy(() => import('@/pages/RechnerPage'))
const CheckerPage = lazy(() => import('@/pages/CheckerPage'))
const FormularePage = lazy(() => import('@/pages/FormularePage'))
const PricingPage = lazy(() => import('@/pages/PricingPage'))
const AppsPage = lazy(() => import('@/pages/AppsPage'))
const ReferralPage = lazy(() => import('@/pages/ReferralPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// Rechner (7 Vermieter-Tools)
const KautionsRechner = lazy(() => import('@/pages/rechner/KautionsRechner'))
const MieterhoehungsRechner = lazy(() => import('@/pages/rechner/MieterhoehungsRechner'))
const KaufnebenkostenRechner = lazy(() => import('@/pages/rechner/KaufnebenkostenRechner'))
const EigenkapitalRechner = lazy(() => import('@/pages/rechner/EigenkapitalRechner'))
const GrundsteuerRechner = lazy(() => import('@/pages/rechner/GrundsteuerRechner'))
const RenditeRechner = lazy(() => import('@/pages/rechner/RenditeRechner'))
const NebenkostenRechner = lazy(() => import('@/pages/rechner/NebenkostenRechner'))

// Checker (10 Mieter-Tools)
const MietpreisbremseChecker = lazy(() => import('@/pages/checker/MietpreisbremseChecker'))
const MieterhoehungChecker = lazy(() => import('@/pages/checker/MieterhoehungChecker'))
const NebenkostenChecker = lazy(() => import('@/pages/checker/NebenkostenChecker'))
const BetriebskostenChecker = lazy(() => import('@/pages/checker/BetriebskostenChecker'))
const KuendigungChecker = lazy(() => import('@/pages/checker/KuendigungChecker'))
const KautionChecker = lazy(() => import('@/pages/checker/KautionChecker'))
const MietminderungChecker = lazy(() => import('@/pages/checker/MietminderungChecker'))
const EigenbedarfChecker = lazy(() => import('@/pages/checker/EigenbedarfChecker'))
const ModernisierungChecker = lazy(() => import('@/pages/checker/ModernisierungChecker'))
const SchoenheitsreparaturenChecker = lazy(() => import('@/pages/checker/SchoenheitsreparaturenChecker'))

// Formulare (10 Vorlagen)
const MietvertragFormular = lazy(() => import('@/pages/formulare/MietvertragFormular'))
const UebergabeprotokollFormular = lazy(() => import('@/pages/formulare/UebergabeprotokollFormular'))
const MieterhoehungFormular = lazy(() => import('@/pages/formulare/MieterhoehungFormular'))
const SelbstauskunftFormular = lazy(() => import('@/pages/formulare/SelbstauskunftFormular'))
const BetriebskostenFormular = lazy(() => import('@/pages/formulare/BetriebskostenFormular'))
const KuendigungFormular = lazy(() => import('@/pages/formulare/KuendigungFormular'))
const MahnungFormular = lazy(() => import('@/pages/formulare/MahnungFormular'))
const MietbescheinigungFormular = lazy(() => import('@/pages/formulare/MietbescheinigungFormular'))
const WohnungsgeberbestaetigungFormular = lazy(() => import('@/pages/formulare/WohnungsgeberbestaetigungFormular'))
const NebenkostenvorauszahlungFormular = lazy(() => import('@/pages/formulare/NebenkostenvorauszahlungFormular'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />

            {/* === RECHNER (Vermieter) === */}
            <Route path="rechner" element={<RechnerPage />} />
            <Route path="rechner/kaution" element={<KautionsRechner />} />
            <Route path="rechner/mieterhoehung" element={<MieterhoehungsRechner />} />
            <Route path="rechner/kaufnebenkosten" element={<KaufnebenkostenRechner />} />
            <Route path="rechner/eigenkapital" element={<EigenkapitalRechner />} />
            <Route path="rechner/grundsteuer" element={<GrundsteuerRechner />} />
            <Route path="rechner/rendite" element={<RenditeRechner />} />
            <Route path="rechner/nebenkosten" element={<NebenkostenRechner />} />

            {/* === CHECKER (Mieter) === */}
            <Route path="checker" element={<CheckerPage />} />
            <Route path="checker/mietpreisbremse" element={<MietpreisbremseChecker />} />
            <Route path="checker/mieterhoehung" element={<MieterhoehungChecker />} />
            <Route path="checker/nebenkosten" element={<NebenkostenChecker />} />
            <Route path="checker/betriebskosten" element={<BetriebskostenChecker />} />
            <Route path="checker/kuendigung" element={<KuendigungChecker />} />
            <Route path="checker/kaution" element={<KautionChecker />} />
            <Route path="checker/mietminderung" element={<MietminderungChecker />} />
            <Route path="checker/eigenbedarf" element={<EigenbedarfChecker />} />
            <Route path="checker/modernisierung" element={<ModernisierungChecker />} />
            <Route path="checker/schoenheitsreparaturen" element={<SchoenheitsreparaturenChecker />} />

            {/* === FORMULARE (10 Vorlagen – Mieter + Vermieter) === */}
            <Route path="formulare" element={<FormularePage />} />
            <Route path="formulare/mietvertrag" element={<MietvertragFormular />} />
            <Route path="formulare/uebergabeprotokoll" element={<UebergabeprotokollFormular />} />
            <Route path="formulare/mieterhoehung" element={<MieterhoehungFormular />} />
            <Route path="formulare/selbstauskunft" element={<SelbstauskunftFormular />} />
            <Route path="formulare/betriebskosten" element={<BetriebskostenFormular />} />
            <Route path="formulare/kuendigung" element={<KuendigungFormular />} />
            <Route path="formulare/mahnung" element={<MahnungFormular />} />
            <Route path="formulare/mietbescheinigung" element={<MietbescheinigungFormular />} />
            <Route path="formulare/wohnungsgeberbestaetigung" element={<WohnungsgeberbestaetigungFormular />} />
            <Route path="formulare/nebenkostenvorauszahlung" element={<NebenkostenvorauszahlungFormular />} />

            {/* === META === */}
            <Route path="preise" element={<PricingPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="apps" element={<AppsPage />} />
            <Route path="referral" element={<ReferralPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  )
}

export default App
