import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, CheckCircle, AlertCircle, RefreshCw, ArrowLeft, Timer, Bell, Users, MapPin, Phone, Flame, Pause, Play, Star, ChefHat, TrendingUp, Wifi, WifiOff } from 'lucide-react';
import { useRealTimeUpdates, wsManager } from '../lib/websocket';

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
    preparationTime?: number;
  }>;
  createdAt: string;
  estimatedDeliveryTime?: string;
  locationId: string;
  tableId?: number;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export default function Kitchen() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading, userRole } = useAuth();
  
  // Basic states
  const [filter, setFilter] = useState<string>('active');
  const [sortBy, setSortBy] = useState<'time' | 'priority' | 'type'>('time');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [showStats, setShowStats] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const queryClient = useQueryClient();

  // Check WebSocket connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(wsManager.isConnected());
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Real-time updates using WebSocket
  const invalidateOrders = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
  }, [queryClient]);

  useRealTimeUpdates('orders', invalidateOrders);
  useRealTimeUpdates('order-status', invalidateOrders);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (userRole !== 'kitchen' && userRole !== 'admin'))) {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, userRole, setLocation]);

  // Mutation for updating order status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    // Use polling in development, WebSocket in production
    refetchInterval: import.meta.env.DEV ? 3000 : false, // Poll every 3 seconds in dev
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Filter and sort orders
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['received', 'preparing'].includes(order.status);
    return order.status === filter;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation('/admin')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Voltar ao Admin</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">🍳 Painel da Cozinha</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-600" />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Tempo Real</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-orange-600" />
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-orange-600 font-medium">Reconectando...</span>
                </>
              )}
            </div>
            <button
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
                queryClient.refetchQueries({ queryKey: ['/api/orders'] });
              }}
              className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              title="Atualizar manualmente"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          {/* Filter buttons */}
          <div className="flex gap-2">
            {[
              { key: 'active', label: 'Ativos', color: 'red' },
              { key: 'received', label: 'Recebidos', color: 'blue' },
              { key: 'preparing', label: 'Preparando', color: 'yellow' },
              { key: 'ready', label: 'Prontos', color: 'green' },
              { key: 'all', label: 'Todos', color: 'gray' }
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === key
                    ? `bg-${color}-500 text-white`
                    : `bg-white text-${color}-600 border border-${color}-200 hover:bg-${color}-50`
                }`}
              >
                {label} ({filteredOrders.filter(o => key === 'active' ? ['received', 'preparing'].includes(o.status) : key === 'all' ? true : o.status === key).length})
              </button>
            ))}
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-gray-100">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-medium">Atualizações Automáticas</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-orange-600" />
                <span className="text-orange-700 font-medium">Modo Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="p-4">
        {ordersLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-600">
              {filter === 'active' ? 'Não há pedidos ativos no momento.' : `Não há pedidos com status "${filter}".`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-lg border-2 shadow-sm p-4 ${
                  order.status === 'received' ? 'border-blue-200 bg-blue-50' :
                  order.status === 'preparing' ? 'border-yellow-200 bg-yellow-50' :
                  order.status === 'ready' ? 'border-green-200 bg-green-50' :
                  'border-gray-200'
                }`}
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">#{order.id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'received' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'ready' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status === 'received' ? 'Recebido' :
                       order.status === 'preparing' ? 'Preparando' :
                       order.status === 'ready' ? 'Pronto' : order.status}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString('pt-AO', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="mb-3">
                  <h3 className="font-medium text-gray-900">{order.customerName}</h3>
                  <div className="text-sm text-gray-600 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {order.customerPhone}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {order.orderType === 'delivery' ? 'Entrega' : 
                       order.orderType === 'takeaway' ? 'Takeaway' : 'Mesa'}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Itens:</h4>
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        {item.customizations && item.customizations.length > 0 && (
                          <span className="text-gray-500 text-xs">
                            ({item.customizations.join(', ')})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {order.status === 'received' && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'preparing' })}
                      className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
                      disabled={updateStatusMutation.isPending}
                    >
                      <Timer className="w-4 h-4 inline mr-1" />
                      Iniciar Preparo
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'ready' })}
                      className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                      disabled={updateStatusMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Marcar Pronto
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'completed' })}
                      className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                      disabled={updateStatusMutation.isPending}
                    >
                      Entregar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}