import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isLoading } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    console.log('Tentando login com:', credentials);

    try {
      const result = await login(credentials.username, credentials.password);
      
      if (result.success) {
        console.log('Login bem-sucedido');
        console.log('Redirecionando...');
        
        // Redirecionar baseado no role
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'admin') {
          setLocation('/admin');
        } else if (userRole === 'kitchen') {
          setLocation('/cozinha');
        } else {
          setLocation('/admin'); // Fallback
        }
      } else {
        console.log('Credenciais inválidas:', credentials);
        setError(result.error || 'Credenciais inválidas! Nome de usuário ou senha incorretos.');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro interno. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Logo e Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-red-600 rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Painel Administrativo
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Las Tortillas Mexican Grill
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <form 
            className="space-y-6" 
            onSubmit={handleSubmit}
            autoComplete="off"
            data-form-type="other"
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome de usuário
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  placeholder="Digite o nome de usuário"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  placeholder="Digite a senha"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Informações de acesso */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Credenciais de Teste:</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div>
                <strong>Administrador:</strong> administrador / lasTortillas2025!
              </div>
              <div>
                <strong>Cozinha:</strong> cozinha / lasTortillas2025Cozinha!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}