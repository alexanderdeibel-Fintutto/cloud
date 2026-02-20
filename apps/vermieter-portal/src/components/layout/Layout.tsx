import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import EcosystemBar from './EcosystemBar'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <EcosystemBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
