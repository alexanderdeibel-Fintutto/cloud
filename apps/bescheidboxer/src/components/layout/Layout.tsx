import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import Onboarding from '../Onboarding'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <Onboarding />
    </div>
  )
}
