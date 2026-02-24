import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface RechnerLayoutProps {
  title: string
  description: string
  icon: ReactNode
  children: ReactNode
}

export default function RechnerLayout({
  title,
  description,
  icon,
  children,
}: RechnerLayoutProps) {
  return (
    <div>
      <section className="gradient-vermieter py-12">
        <div className="container">
          <Link
            to="/rechner"
            className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Alle Rechner
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              {icon}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
              <p className="text-white/80">{description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            {children}
          </div>
        </div>
      </section>
    </div>
  )
}
