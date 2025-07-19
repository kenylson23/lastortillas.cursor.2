import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Clock, CheckCircle, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  orderType: string;
  status: string;
  totalAmount: string;
  notes?: string;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    customizations?: string[];
  }>;
  createdAt: string;
  estimatedDeliveryTime?: string;
}

export default function Kitchen() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const [filter, setFilter] = useState<string>('active'); // active, ready, all

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const { data: orders = [], isLoading: ordersLoading, refetch } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    refetchInterval: 5000, // Auto-refresh a cada 5 segundos
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'active') return ['received', 'preparing'].includes(order.status);
    if (filter === 'ready') return order.status === 'ready';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-blue-500';
      case 'preparing': return 'bg-yellow-500';
      case 'ready': return 'bg-green-500';
      case 'delivered': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received': return 'Recebido';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Pronto';
      case 'delivered': return 'Entregue';
      default: return status;
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header da Cozinha */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLocation('/admin')}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                title="Voltar ao Admin"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <span className="text-3xl">👨‍🍳</span>
                <div>
                  <h1 className="text-2xl font-bold text-orange-400">Painel da Cozinha</h1>
                  <p className="text-gray-400">Las Tortillas Mexican Grill</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-green-600 px-3 py-1 rounded-full text-sm">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Atualização Automática</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-400">{filteredOrders.length}</div>
                <div className="text-sm text-gray-400">Pedidos Ativos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Ativos ({orders.filter(o => ['received', 'preparing'].includes(o.status)).length})
            </button>
            <button
              onClick={() => setFilter('ready')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'ready'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Prontos ({orders.filter(o => o.status === 'ready').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Todos ({orders.length})
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {ordersLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-500" />
            <p className="mt-4 text-gray-400">Carregando pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-500">
              {filter === 'active' && 'Não há pedidos ativos no momento.'}
              {filter === 'ready' && 'Não há pedidos prontos no momento.'}
              {filter === 'all' && 'Nenhum pedido foi feito ainda hoje.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                {/* Header do Pedido */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-orange-400">#{order.id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>

                {/* Info do Cliente */}
                <div className="mb-3">
                  <div className="font-medium text-white">{order.customerName}</div>
                  <div className="text-sm text-gray-400">{order.customerPhone}</div>
                  <div className="text-sm text-gray-400 capitalize">{order.orderType}</div>
                </div>

                {/* Items do Pedido */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-300 mb-2">Itens:</div>
                  {order.items?.map((item, index) => (
                    <div key={index} className="text-sm text-gray-400 mb-1">
                      <span className="text-orange-400 font-medium">{item.quantity}x</span> {item.name}
                      {item.customizations && item.customizations.length > 0 && (
                        <div className="text-xs text-yellow-400 ml-4">
                          {item.customizations.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Notas */}
                {order.notes && (
                  <div className="mb-4 p-2 bg-yellow-900/30 rounded border-l-2 border-yellow-500">
                    <div className="text-xs text-yellow-400 font-medium">Observações:</div>
                    <div className="text-sm text-yellow-300">{order.notes}</div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2">
                  {order.status === 'received' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Iniciar Preparo
                    </button>
                  )}
                  
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Marcar como Pronto
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Marcar como Entregue
                    </button>
                  )}
                </div>

                {/* Total */}
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-400">
                      AOA {parseFloat(order.totalAmount).toLocaleString('pt-AO')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}