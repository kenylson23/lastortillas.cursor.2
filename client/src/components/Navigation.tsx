import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const navItems = [
    { href: "#inicio", label: "Início" },
    { href: "#menu", label: "Menu" },
    { href: "#sobre", label: "Sobre" },
    { href: "#locais", label: "Nossos Locais" },
    { href: "#contato", label: "Contato" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
                  onClick={() => scrollToSection(item.href)}
                  className="text-gray-700 hover:text-red-600 transition-colors duration-300"
                >
                  {item.label}
                </button>
              ))}
              <a
                href="/menu"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300 font-medium"
              >
                Pedir Online
              </a>
              {!isAuthenticated && (
                <a
                  href="/api/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium"
                >
                  Login
                </a>
              )}
              {isAuthenticated && (
                <div className="flex items-center gap-4">
                  <span className="text-gray-700">Olá, {user?.firstName || 'Usuário'}</span>
                  <a
                    href="/api/logout"
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-300 font-medium"
                  >
                    Logout
                  </a>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Desktop: Botão completo */}
            <button 
              onClick={() => scrollToSection("#contato")}
              className="hidden md:block bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-all duration-300 floating-btn"
            >
              Reservar Mesa
            </button>
            
            {/* Mobile: Botão compacto */}
            <button 
              onClick={() => scrollToSection("#contato")}
              className="md:hidden bg-red-600 text-white px-3 py-2 rounded-full hover:bg-red-700 transition-all duration-300 text-sm"
            >
              Reservar
            </button>
            
            {/* Menu hambúrguer */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 ml-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="block text-gray-700 hover:text-red-600 px-3 py-2 text-base font-medium w-full text-left"
                >
                  {item.label}
                </button>
              ))}
              
              {/* Botão de reserva destacado no menu mobile */}
              <button
                onClick={() => scrollToSection("#contato")}
                className="block bg-red-600 text-white px-3 py-3 rounded-lg hover:bg-red-700 transition-all duration-300 text-base font-semibold w-full text-center mt-4 mx-3"
              >
                🍽️ Reservar Mesa
              </button>
              
              {/* Botão de pedido online no menu mobile */}
              <a
                href="/menu"
                className="block bg-green-600 text-white px-3 py-3 rounded-lg hover:bg-green-700 transition-all duration-300 text-base font-semibold w-full text-center mt-2 mx-3"
              >
                🛒 Pedir Online
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
