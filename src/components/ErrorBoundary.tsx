import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallbackTitle?: string
}

interface State {
  error: Error | null
}

export function ErrorBoundary({ children, fallbackTitle }: Props) {
  return <ErrorBoundaryInner fallbackTitle={fallbackTitle}>{children}</ErrorBoundaryInner>
}

class ErrorBoundaryInner extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI crash', error, info.componentStack)
  }

  private reset = () => {
    this.setState({ error: null })
  }

  private goHome = () => {
    try {
      // Clear potentially corrupt persisted demo state that can crash selectors
      localStorage.removeItem('simchi-app-data')
    } catch {
      // ignore
    }
    window.location.href = '/'
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto flex min-h-dvh max-w-lg items-center px-4 py-8">
          <Card className="w-full space-y-4">
            <h2 className="text-xl font-extrabold">{this.props.fallbackTitle ?? 'Что-то пошло не так'}</h2>
            <p className="text-sm text-muted">
              Страница не загрузилась. Можно повторить или сбросить локальные данные и открыть главную.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={this.reset}>
                Повторить
              </Button>
              <Button variant="outline" onClick={this.goHome}>
                На главную
              </Button>
            </div>
          </Card>
        </div>
      )
    }
    return this.props.children
  }
}
