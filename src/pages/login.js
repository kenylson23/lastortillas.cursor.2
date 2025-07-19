import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/pages/_app';
import { useRouter } from 'next/router';

export default function Login() {
  const { login, user, logout } = useAuth();
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(credentials);
      
      if (result.success) {
        // Redirect to admin panel
        router.push('/admin');
      } else {
        setError(result.error || 'Erro ao fazer login');
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setCredentials({ email: '', password: '' });
    setError('');
  };

  return (
    <>
      <Head>
        <title>Login - Las Tortillas Mexican Grill</title>
        <meta 
          name="description" 
          content="Faça login para acessar o painel administrativo do Las Tortillas Mexican Grill." 
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-mexican-cream to-white flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="flex items-center justify-center gap-3 mb-8">
              <div className="w-16 h-16 bg-accent-orange rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold">🌮</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-mexican-green">Las Tortillas</h1>
                <p className="text-sm text-gray-600">Mexican Grill</p>
              </div>
            </Link>
            
            <h2 className="text-3xl font-bold text-gray-900">
              {user ? 'Conta Conectada' : 'Acesso Administrativo'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {user 
                ? `Logado como ${user.name} (${user.role})`
                : 'Entre com suas credenciais de administrador'
              }
            </p>
          </div>

          {/* User Already Logged In */}
          {user ? (
            <div className="card p-8 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👤</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Bem-vindo, {user.name}!
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Você está conectado como {user.role}
                </p>
              </div>
              
              <div className="space-y-4">
                <Link 
                  href="/admin" 
                  className="btn btn-primary w-full py-3"
                >
                  Ir para Painel Admin
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline w-full py-3"
                >
                  Sair da Conta
                </button>
                <Link 
                  href="/" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 w-full py-3"
                >
                  Voltar ao Site
                </Link>
              </div>
            </div>
          ) : (
            /* Login Form */
            <div className="card p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={credentials.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mexican-green focus:border-mexican-green"
                    placeholder="admin@lastortillas.com"
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
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mexican-green focus:border-mexican-green"
                    placeholder="Digite sua senha"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Entrando...
                    </span>
                  ) : (
                    'Entrar'
                  )}
                </button>
              </form>

              {/* Demo Credentials Info */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Credenciais de Demonstração:
                </h4>
                <p className="text-xs text-blue-700">
                  <strong>Email:</strong> admin@lastortillas.com<br />
                  <strong>Senha:</strong> admin123
                </p>
              </div>

              <div className="mt-6 text-center">
                <Link 
                  href="/" 
                  className="text-sm text-mexican-green hover:text-accent-orange"
                >
                  ← Voltar ao site principal
                </Link>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Problemas para acessar?{' '}
              <a 
                href="https://wa.me/244949639932" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-mexican-green hover:text-accent-orange"
              >
                Entre em contato via WhatsApp
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}