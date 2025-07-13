import { useState } from 'react';
import { useLocation } from 'wouter';
import OnlineMenu from '../components/OnlineMenu';
import { Order } from '@shared/schema';

export default function Menu() {
  const [, setLocation] = useLocation();
  const [selectedLocationId, setSelectedLocationId] = useState<string>('ilha');

  const handleOrderCreated = (order: Order) => {
    // Show success message
    alert(`Pedido #${order.id} criado com sucesso! Total: ${order.totalAmount} AOA. Entraremos em contato em breve para confirmar.`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-sunset shadow-fiesta">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="min-w-0 flex-1 text-white">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🌮</div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-wide">Las Tortillas</h1>
                  <p className="text-sm sm:text-base text-orange-100 mt-1 font-medium">Faça seu pedido online</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setLocation('/')}
              className="bg-gradient-fiesta text-white px-4 sm:px-6 py-3 rounded-xl hover:bg-gradient-terra transition-all duration-300 text-sm sm:text-base w-full sm:w-auto font-bold shadow-mexican hover-lift"
            >
              🏠 Voltar ao Site
            </button>
          </div>
        </div>
      </div>

      {/* Location Selection */}
      <div className="bg-white border-b-2 border-gradient-mexico shadow-lg">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-5">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:gap-4">
            <span className="text-sm sm:text-base font-bold text-mexican-tierra flex-shrink-0 flex items-center">
              📍 Escolha sua localização:
            </span>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => setSelectedLocationId('ilha')}
                className={`px-4 sm:px-6 py-3 rounded-xl transition-all duration-300 text-sm sm:text-base font-bold w-full sm:w-auto hover-lift ${
                  selectedLocationId === 'ilha'
                    ? 'bg-gradient-sunset text-white shadow-fiesta'
                    : 'bg-white text-mexican-tierra border-2 border-mexican-orange hover:bg-gradient-fresh hover:text-white shadow-mexican'
                }`}
              >
                🏝️ Las Tortillas Ilha
              </button>
              <button
                onClick={() => setSelectedLocationId('talatona')}
                className={`px-4 sm:px-6 py-3 rounded-xl transition-all duration-300 text-sm sm:text-base font-bold w-full sm:w-auto hover-lift ${
                  selectedLocationId === 'talatona'
                    ? 'bg-gradient-sunset text-white shadow-fiesta'
                    : 'bg-white text-mexican-tierra border-2 border-mexican-orange hover:bg-gradient-fresh hover:text-white shadow-mexican'
                }`}
              >
                🏢 Las Tortillas Talatona
              </button>
              <button
                onClick={() => setSelectedLocationId('movel')}
                className={`px-4 sm:px-6 py-3 rounded-xl transition-all duration-300 text-sm sm:text-base font-bold w-full sm:w-auto hover-lift ${
                  selectedLocationId === 'movel'
                    ? 'bg-gradient-sunset text-white shadow-fiesta'
                    : 'bg-white text-mexican-tierra border-2 border-mexican-orange hover:bg-gradient-fresh hover:text-white shadow-mexican'
                }`}
              >
                🚚 Las Tortillas Móvel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Component */}
      <OnlineMenu
        locationId={selectedLocationId}
        onOrderCreated={handleOrderCreated}
      />
    </div>
  );
}