import React, { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class RouteErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    try {
      const path = typeof window !== "undefined" ? window.location?.pathname : "N/A"
      console.error("🚨 RouteErrorBoundary caught error:", {
        path,
        message: error?.message,
        errorName: error?.name,
        stack: error?.stack?.split("\n").slice(0, 8).join("\n"),
        componentStack: errorInfo?.componentStack?.split("\n").slice(0, 10).join("\n"),
        time: new Date().toISOString()
      })
    } catch (logError) {
      console.error("Error logging boundary error:", logError)
    }
    this.setState({ error, errorInfo })
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-[300px] flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold mb-2">Error al cargar esta vista</h2>
            <p className="text-muted-foreground mb-4">Intenta nuevamente o recarga la página.</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={this.handleRetry}>Intentar de nuevo</Button>
              <Button variant="outline" onClick={() => window.location.reload()}>Recargar</Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default RouteErrorBoundary
