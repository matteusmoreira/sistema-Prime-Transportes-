import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log para análise
    console.error('[ErrorBoundary] Capturado erro na UI:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full p-6">
          <div className="max-w-xl mx-auto rounded-lg border border-gray-200 bg-white shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900">Ocorreu um erro inesperado</h2>
            <p className="mt-2 text-sm text-gray-600">
              Tente novamente. Se o problema persistir, entre em contato com o suporte.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Tentar novamente
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                Recarregar página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}