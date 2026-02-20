import { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import EcosystemBar from './EcosystemBar'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <EcosystemBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
