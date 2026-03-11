import { Component, type ReactNode } from 'react'
import { Brain, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[SecondBrain] Unhandled error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-xl font-bold mb-2">Etwas ist schiefgelaufen</h1>
              <p className="text-sm text-muted-foreground">
                Ein unerwarteter Fehler ist aufgetreten. Bitte versuche die Seite neu zu laden.
              </p>
            </div>
            {this.state.error && (
              <pre className="text-xs text-left bg-muted p-3 rounded-lg overflow-auto max-h-32 text-muted-foreground">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Neu laden
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
              >
                <Home className="w-4 h-4" />
                Startseite
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
