import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Safe error logging
    const errorMessage =
      error && error.message ? error.message : 'Unknown error';
    const errorStack =
      error && error.stack ? error.stack : 'No stack trace available';

    console.error('ErrorBoundary caught an error:', errorMessage);
    console.error('Error stack:', errorStack);
    console.error('Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Oops! Quelque chose s'est mal passé
              </h1>
              <p className="text-gray-600 mb-6">
                Nous sommes désolés pour la gêne occasionnée. Veuillez essayer
                de rafraîchir la page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg"
              >
                🔄 Rafraîchir la page
              </button>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-red-600 font-medium">
                    Détails de l'erreur (Développement uniquement)
                  </summary>
                  <pre className="mt-2 p-4 bg-red-50 border border-red-200 rounded text-sm text-red-800 overflow-auto max-h-40">
                    {this.state.error.stack ||
                      this.state.error.message ||
                      'Erreur inconnue'}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
