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

/** Catches render crashes so navigation failures don't leave a blank white screen. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI crash', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <Card className="space-y-4">
          <h2 className="text-xl font-extrabold">{this.props.fallbackTitle ?? 'Что-то пошло не так'}</h2>
          <p className="text-sm text-muted">Страница не загрузилась. Можно вернуться назад и попробовать снова.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => this.setState({ error: null })}>
              Повторить
            </Button>
            <Button variant="outline" onClick={() => { window.location.href = '/' }}>
              На главную
            </Button>
          </div>
        </Card>
      )
    }
    return this.props.children
  }
}
