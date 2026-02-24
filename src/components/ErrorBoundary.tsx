import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <p className="text-muted-foreground">Seite konnte nicht geladen werden.</p>
          <Button
            variant="outline"
            onClick={() => {
              this.setState({ hasError: false })
              window.location.reload()
            }}
          >
            Erneut versuchen
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
