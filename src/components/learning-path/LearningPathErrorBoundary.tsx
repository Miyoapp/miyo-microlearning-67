
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class LearningPathErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('🚨 LearningPathErrorBoundary caught error:', error);
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 LearningPathErrorBoundary detailed error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
  }

  resetError = () => {
    console.log('🔄 LearningPathErrorBoundary - Resetting error state');
    this.setState({
      hasError: false,
      error: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="py-8 px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error en la Ruta de Aprendizaje
            </h3>
            
            <p className="text-gray-600 mb-4 text-sm">
              Ha ocurrido un error al cargar las lecciones. Esto puede deberse a problemas de conectividad.
            </p>

            <Button
              onClick={this.resetError}
              className="bg-[#5e16ea] hover:bg-[#4a11ba] text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                  Detalles del Error (Desarrollo)
                </summary>
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                  <div className="mb-1">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div>
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap text-xs">{this.state.error.stack}</pre>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LearningPathErrorBoundary;
