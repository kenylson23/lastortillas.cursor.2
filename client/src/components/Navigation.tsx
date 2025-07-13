import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const navItems = [
    { href: "#inicio", label: "Início" },
    { href: "#menu", label: "Menu" },
    { href: "#sobre", label: "Sobre" },
    { href: "#locais", label: "Nossos Locais" },
    { href: "#contato", label: "Contato" },
  ];

  const handleNavigation = (href: string, isRoute?: boolean) => {
    if (isRoute) {
      window.location.href = href;
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-green-700">Las Tortillas</h1>
              <span className="text-xs sm:text-sm text-red-600 font-medium -mt-1 sm:mt-0">Mexican Grill</span>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href, item.isRoute)}
                  className="text-gray-700 hover:text-red-600 transition-colors duration-300"
                >
                  {item.label}
                </button>
              ))}
              <a
                href="/menu"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm"
              >
                Pedir Online
              </a>
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Olá, {user?.firstName}</span>
                  <a
                    href="/admin"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm"
                  >
                    Admin
                  </a>
                  <button
                    onClick={logout}
                    className="text-gray-600 hover:text-red-600 transition-colors duration-200 font-medium text-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <a
                  href="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm"
                >
                  Login
                </a>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Menu hambúrguer - muito mais visível */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-lg"
              >
                {isMenuOpen ? (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu - menu lateral completo */}
        {isMenuOpen && (
          <div className="md:hidden mobile-menu-overlay">
            {/* Overlay escuro */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Menu lateral */}
            <div className="mobile-menu-panel">
              <div className="flex flex-col h-full">
                {/* Header do menu */}
                <div className="bg-red-600 text-white p-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-green-200">Las Tortillas</h3>
                    <p className="text-red-200 text-sm">Mexican Grill</p>
                  </div>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="bg-red-700 p-2 rounded-lg hover:bg-red-800 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Menu items */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {navItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => {
                        handleNavigation(item.href, item.isRoute);
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left text-gray-700 hover:text-red-600 hover:bg-red-50 px-4 py-3 rounded-lg text-lg font-medium transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                  
                  {/* Divisor */}
                  <div className="border-t border-gray-200 my-4"></div>
                  
                  {/* Botão de pedido online */}
                  <a
                    href="/menu"
                    className="block bg-green-600 text-white px-6 py-4 rounded-xl hover:bg-green-700 transition-colors duration-200 text-lg font-bold text-center shadow-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    🛒 Pedir Online
                  </a>
                  
                  {/* Botões de login/admin */}
                  {isAuthenticated ? (
                    <div className="space-y-3 mt-4">
                      <div className="text-center text-gray-700 text-lg font-medium">Olá, {user?.firstName}!</div>
                      <a
                        href="/admin"
                        className="block bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 transition-colors duration-200 text-lg font-bold text-center shadow-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        👨‍💼 Painel Admin
                      </a>
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full bg-gray-600 text-white px-6 py-4 rounded-xl hover:bg-gray-700 transition-colors duration-200 text-lg font-bold shadow-lg"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  ) : (
                    <a
                      href="/login"
                      className="block bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 transition-colors duration-200 text-lg font-bold text-center shadow-lg mt-4"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      🔐 Entrar
                    </a>
                  )}
                </div>

                {/* Footer do menu */}
                <div className="bg-gray-100 p-4 text-center text-gray-600">
                  <p className="text-sm">📞 +244 949 639 932</p>
                  <p className="text-xs mt-1">Seg-Qui: 11:00-23:00<br/>Sex-Dom: 11:00-01:00</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
