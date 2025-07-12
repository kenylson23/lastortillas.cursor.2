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
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Menu Online</h1>
              <p className="text-gray-600 mt-1">Faça seu pedido online para entrega ou retirada</p>
            </div>
            <button
              onClick={() => setLocation('/')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Voltar ao Site
            </button>
          </div>
        </div>
      </div>

      {/* Location Selection */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Selecione a localização:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedLocationId('ilha')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedLocationId === 'ilha'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Las Tortillas Ilha
              </button>
              <button
                onClick={() => setSelectedLocationId('talatona')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedLocationId === 'talatona'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Las Tortillas Talatona
              </button>
              <button
                onClick={() => setSelectedLocationId('movel')}
                className={`px-4 py-2 rounded-lg transition-colors ${
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