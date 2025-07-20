import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Clock, CheckCircle, ArrowLeft, RefreshCw, Bell, BellOff, Users, MapPin, Phone, Timer, AlertCircle } from 'lucide-react';

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

interface KitchenFilters {
  status: string;
  location: string;
  sortBy: 'time' | 'priority' | 'type';
  orderType?: string;
}

interface KitchenStats {
  totalOrders: number;
  activeOrders: number;
  completedToday: number;
  averageTime: number;
  delayedOrders: number;
}

export default function Kitchen() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const queryClient = useQueryClient();

  // Apply white theme styles for kitchen
  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#1f2937';
    
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, []);

  // Estados para controles
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
  // Filtros da cozinha
  const [filters, setFilters] = useState<KitchenFilters>({
    status: 'all',
    location: 'all',
    sortBy: 'time'
  });

  // Query para buscar pedidos
  const { data: orders = [], isLoading: ordersLoading, refetch } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    refetchInterval: autoRefresh ? 3000 : false,
    refetchIntervalInBackground: true,
  });

  // Mutation para atualizar status do pedido
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

  // Inicializar AudioContext
  useEffect(() => {
    if (soundEnabled && !audioContext) {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(context);
    }
  }, [soundEnabled, audioContext]);

  // Função para tocar som
  const playNotificationSound = () => {
    if (!soundEnabled || !audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('Erro ao reproduzir som:', error);
    }
  };

  // Verificação de autenticação
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (userRole !== 'kitchen' && userRole !== 'admin'))) {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, userRole, setLocation]);

  // Detectar novos pedidos e tocar som
  useEffect(() => {
    if (orders && orders.length > lastOrderCount && lastOrderCount > 0) {
      playNotificationSound();
    }
    if (orders) {
      setLastOrderCount(orders.length);
    }
  }, [orders?.length, lastOrderCount, soundEnabled, audioContext]);

  // Funções auxiliares para estatísticas
  const isToday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const calculateAverageTime = (orders: Order[]): number => {
    const completedOrders = orders.filter(o => o.status === 'delivered');
    if (completedOrders.length === 0) return 0;
    
    const totalTime = completedOrders.reduce((sum, order) => {
      const start = new Date(order.createdAt);
      const now = new Date();
      return sum + (now.getTime() - start.getTime()) / (1000 * 60);
    }, 0);
    
    return Math.round(totalTime / completedOrders.length);
  };

  const isOrderDelayed = (order: Order): boolean => {
    const orderTime = new Date(order.createdAt);
    const now = new Date();
    const timeDiff = now.getTime() - orderTime.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    return minutesDiff > 30 && ['received', 'preparing'].includes(order.status);
  };

  // Calcular estatísticas da cozinha
  const kitchenStats: KitchenStats = {
    totalOrders: orders.length,
    activeOrders: orders.filter(o => ['received', 'preparing'].includes(o.status)).length,
    completedToday: orders.filter(o => o.status === 'delivered' && isToday(o.createdAt)).length,
    averageTime: calculateAverageTime(orders),
    delayedOrders: orders.filter(o => isOrderDelayed(o)).length
  };

  // Filtrar e ordenar pedidos
  const filteredOrders = orders
    .filter(order => {
      if (filters.status !== 'all' && order.status !== filters.status) return false;
      if (filters.location !== 'all' && order.locationId !== filters.location) return false;
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'time':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
          return (priorityOrder[a.priority || 'normal'] || 2) - (priorityOrder[b.priority || 'normal'] || 2);
        case 'type':
          return a.orderType.localeCompare(b.orderType);
        default:
          return 0;
      }
    });

  // Handlers para eventos
  const handleFiltersChange = (newFilters: Partial<KitchenFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSoundToggle = () => {
    setSoundEnabled(!soundEnabled);
  };

  const handleAutoRefreshToggle = () => {
    setAutoRefresh(!autoRefresh);
  };

  const handleStatsToggle = () => {
    setShowStats(!showStats);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleStatusUpdate = (orderId: number, status: string) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando painel da cozinha...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation('/admin')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:block">Voltar</span>
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel da Cozinha</h1>
              <p className="text-sm text-gray-500">Gestão de pedidos em tempo real</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStatsToggle}
              className={`p-2 rounded-lg transition-colors ${
                showStats 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={showStats ? 'Ocultar estatísticas' : 'Mostrar estatísticas'}
            >
              <BarChart3 size={20} />
            </button>

            <button
              onClick={handleSoundToggle}
              className={`p-2 rounded-lg transition-colors ${
                soundEnabled 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={soundEnabled ? 'Desativar som' : 'Ativar som'}
            >
              {soundEnabled ? <Bell size={20} /> : <BellOff size={20} />}
            </button>

            <button
              onClick={handleAutoRefreshToggle}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={autoRefresh ? 'Desativar atualização automática' : 'Ativar atualização automática'}
            >
              <RefreshCw size={20} className={autoRefresh ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={handleRefresh}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              title="Atualizar agora"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {showStats && (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <BarChart3 size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total</span>
              </div>
              <div className="text-xl font-bold text-blue-900">{kitchenStats.totalOrders}</div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock size={16} className="text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Ativos</span>
              </div>
              <div className="text-xl font-bold text-yellow-900">{kitchenStats.activeOrders}</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-sm font-medium text-green-800">Hoje</span>
              </div>
              <div className="text-xl font-bold text-green-900">{kitchenStats.completedToday}</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp size={16} className="text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Tempo Médio</span>
              </div>
              <div className="text-xl font-bold text-purple-900">{kitchenStats.averageTime}min</div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock size={16} className="text-red-600" />
                <span className="text-sm font-medium text-red-800">Atrasados</span>
              </div>
              <div className="text-xl font-bold text-red-900">{kitchenStats.delayedOrders}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status do Pedido</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Todos', color: 'bg-gray-100 text-gray-800' },
                { value: 'received', label: 'Recebidos', color: 'bg-blue-100 text-blue-800' },
                { value: 'preparing', label: 'Preparando', color: 'bg-yellow-100 text-yellow-800' },
                { value: 'ready', label: 'Prontos', color: 'bg-green-100 text-green-800' },
                { value: 'delivered', label: 'Entregues', color: 'bg-gray-100 text-gray-800' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handleFiltersChange({ status: option.value })}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.status === option.value
                      ? 'bg-red-600 text-white'
                      : option.color + ' hover:bg-opacity-80'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
            <select
              value={filters.location}
              onChange={(e) => handleFiltersChange({ location: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">Todas as Localidades</option>
              <option value="talatona">Talatona</option>
              <option value="ilha">Ilha de Luanda</option>
              <option value="movel">Unidade Móvel</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar Por</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFiltersChange({ sortBy: e.target.value as 'time' | 'priority' | 'type' })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="time">Por Tempo</option>
              <option value="priority">Por Prioridade</option>
              <option value="type">Por Tipo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="p-4">
        {ordersLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-500">
              {filters.status === 'all' 
                ? 'Não há pedidos no momento.'
                : `Não há pedidos com status "${filters.status}".`
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order) => {
              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'received': return 'border-blue-500 bg-blue-50';
                  case 'preparing': return 'border-yellow-500 bg-yellow-50';
                  case 'ready': return 'border-green-500 bg-green-50';
                  case 'delivered': return 'border-gray-500 bg-gray-50';
                  case 'cancelled': return 'border-red-500 bg-red-50';
                  default: return 'border-gray-300 bg-white';
                }
              };

              const getStatusText = (status: string) => {
                switch (status) {
                  case 'received': return 'Recebido';
                  case 'preparing': return 'Preparando';
                  case 'ready': return 'Pronto';
                  case 'delivered': return 'Entregue';
                  case 'cancelled': return 'Cancelado';
                  default: return status;
                }
              };

              const getPriorityColor = (priority: string) => {
                switch (priority) {
                  case 'urgent': return 'text-red-600 bg-red-100';
                  case 'high': return 'text-orange-600 bg-orange-100';
                  case 'normal': return 'text-blue-600 bg-blue-100';
                  case 'low': return 'text-gray-600 bg-gray-100';
                  default: return 'text-blue-600 bg-blue-100';
                }
              };

              const getOrderTypeIcon = (type: string) => {
                switch (type) {
                  case 'delivery': return '🚚';
                  case 'takeaway': return '🥡';
                  case 'dine-in': return '🍽️';
                  default: return '📦';
                }
              };

              const getLocationName = (locationId: string) => {
                switch (locationId) {
                  case 'talatona': return 'Talatona';
                  case 'ilha': return 'Ilha';
                  case 'movel': return 'Móvel';
                  default: return locationId;
                }
              };

              const getNextStatus = (currentStatus: string) => {
                switch (currentStatus) {
                  case 'received': return 'preparing';
                  case 'preparing': return 'ready';
                  case 'ready': return 'delivered';
                  default: return null;
                }
              };

              const getNextStatusText = (currentStatus: string) => {
                switch (currentStatus) {
                  case 'received': return 'Iniciar Preparo';
                  case 'preparing': return 'Marcar Pronto';
                  case 'ready': return 'Marcar Entregue';
                  default: return null;
                }
              };

              const timeSinceOrder = () => {
                const now = new Date();
                const orderTime = new Date(order.createdAt);
                const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
                
                if (diffMinutes < 60) return `${diffMinutes}min`;
                const hours = Math.floor(diffMinutes / 60);
                const minutes = diffMinutes % 60;
                return `${hours}h ${minutes}min`;
              };

              const nextStatus = getNextStatus(order.status);
              const nextStatusText = getNextStatusText(order.status);

              return (
                <div key={order.id} className={`border-2 rounded-lg p-4 ${getStatusColor(order.status)} transition-all hover:shadow-md`}>
                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">#{order.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority || 'normal')}`}>
                        {order.priority?.toUpperCase() || 'NORMAL'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Timer size={16} />
                      <span>{timeSinceOrder()}</span>
                    </div>
                  </div>

                  {/* Informações do Cliente */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Users size={16} className="text-gray-600" />
                      <span className="font-medium text-gray-900">{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Phone size={16} className="text-gray-600" />
                      <span className="text-sm text-gray-700">{order.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-600" />
                      <span className="text-sm text-gray-700">
                        {getOrderTypeIcon(order.orderType)} {getLocationName(order.locationId)}
                        {order.tableId && ` - Mesa ${order.tableId}`}
                      </span>
                    </div>
                  </div>

                  {/* Itens do Pedido */}
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-900 mb-2">Itens:</h4>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">
                            {item.quantity}x {item.name}
                            {item.customizations && item.customizations.length > 0 && (
                              <span className="text-gray-500 ml-1">
                                ({item.customizations.join(', ')})
                              </span>
                            )}
                          </span>
                          {item.preparationTime && (
                            <span className="text-gray-500 flex items-center gap-1">
                              <Clock size={12} />
                              {item.preparationTime}min
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notas */}
                  {order.notes && (
                    <div className="mb-3 p-2 bg-white bg-opacity-50 rounded border-l-4 border-yellow-400">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-yellow-800">Observações:</span>
                          <p className="text-sm text-yellow-700">{order.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer com Status e Ações */}
                  <div className="flex items-center justify-between pt-3 border-t border-white border-opacity-50">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <span className="text-sm font-semibold text-gray-900">{getStatusText(order.status)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">{order.totalAmount} AOA</span>
                      
                      {nextStatus && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, nextStatus)}
                          disabled={updateStatusMutation.isPending}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {updateStatusMutation.isPending ? 'Atualizando...' : nextStatusText}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}