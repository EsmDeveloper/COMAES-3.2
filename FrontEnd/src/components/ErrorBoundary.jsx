/**
 * ErrorBoundary - Componente para capturar erros de renderização React
 * Previne que erros em componentes filhos derrubem toda a aplicação
 */
import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorCount = this.state.errorCount + 1;
    
    console.error('🚨 ErrorBoundary capturou erro:', {
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      errorCount
    });

    this.setState({
      error,
      errorInfo,
      errorCount
    });

    // Se muitos erros consecutivos, pode ser um loop infinito
    if (errorCount > 5) {
      console.error('⚠️ Muitos erros consecutivos detectados. Possível loop infinito.');
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorCount } = this.state;
      const { fallback, showDetails = false } = this.props;

      // Se fornecido um fallback customizado
      if (fallback) {
        return fallback;
      }

      // UI padrão de erro
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            {/* Ícone de erro */}
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 rounded-full p-4">
                <AlertCircle className="w-16 h-16 text-red-600" />
              </div>
            </div>

            {/* Título */}
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
              Algo deu errado
            </h1>

            {/* Descrição */}
            <p className="text-gray-600 text-center mb-6">
              Ocorreu um erro inesperado ao renderizar esta página. 
              Não se preocupe, seus dados estão seguros.
            </p>

            {/* Informação do erro (modo desenvolvimento) */}
            {(showDetails || import.meta.env.DEV) && error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="font-mono text-sm text-red-800 mb-2">
                  <strong>Erro:</strong> {error.toString()}
                </p>
                {errorInfo?.componentStack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-red-700 font-semibold text-sm">
                      Ver detalhes técnicos
                    </summary>
                    <pre className="mt-2 text-xs text-red-700 overflow-auto max-h-40 bg-white p-2 rounded">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Contagem de erros (se múltiplos) */}
            {errorCount > 1 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                <p className="text-yellow-800 text-sm text-center">
                  ⚠️ Este erro ocorreu {errorCount} vez(es). 
                  {errorCount > 3 && ' Considere recarregar a página.'}
                </p>
              </div>
            )}

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
                Tentar Novamente
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <Home className="w-5 h-5" />
                Ir para Início
              </button>

              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
                Recarregar Página
              </button>
            </div>

            {/* Dica */}
            <p className="text-gray-500 text-sm text-center mt-6">
              Se o problema persistir, tente limpar o cache do navegador ou contacte o suporte.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
