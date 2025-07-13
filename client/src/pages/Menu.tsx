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
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Menu Online</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Faça seu pedido online</p>
            </div>
            <button
              onClick={() => setLocation('/')}
              className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
            >
              Voltar ao Site
            </button>
          </div>
        </div>
      </div>

      {/* Location Selection */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:gap-4">
            <span className="text-xs sm:text-sm font-medium text-gray-700 flex-shrink-0">Localização:</span>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => setSelectedLocationId('ilha')}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto ${
                  selectedLocationId === 'ilha'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Las Tortillas Ilha
              </button>
              <button
                onClick={() => setSelectedLocationId('talatona')}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto ${
                  selectedLocationId === 'talatona'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Las Tortillas Talatona
              </button>
              <button
                onClick={() => setSelectedLocationId('movel')}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto ${
                  selectedLocationId === 'movel'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Las Tortillas Móvel
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