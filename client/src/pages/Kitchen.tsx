import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, CheckCircle, AlertCircle, RefreshCw, ArrowLeft, Timer, Bell, Users, MapPin, Phone, Flame, Pause, Play, Star, ChefHat, TrendingUp } from 'lucide-react';

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

interface KitchenStats {
  totalOrders: number;
  activeOrders: number;
  completedToday: number;
  averageTime: number;
  delayedOrders: number;
}

export default function Kitchen() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const [filter, setFilter] = useState<string>('active');
  const [sortBy, setSortBy] = useState<'time' | 'priority' | 'type'>('time');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, setLocation]);

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
    refetchInterval: autoRefresh ? 3000 : false,
  });

  // Sound notification for new orders
  useEffect(() => {
    if (soundEnabled && orders.length > 0) {
      const newOrders = orders.filter(o => o.status === 'received');
      if (newOrders.length > 0) {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+j');
        audio.play().catch(() => {});
      }
    }
  }, [orders.length, soundEnabled]);

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

  // Helper functions
  function isOrderUrgent(order: Order): boolean {
    const orderTime = new Date(order.createdAt);
    const now = new Date();
    const timeDiff = now.getTime() - orderTime.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    return minutesDiff > 20 || order.priority === 'urgent' || order.priority === 'high';
  }

  function isOrderDelayed(order: Order): boolean {
    const orderTime = new Date(order.createdAt);
    const now = new Date();
    const timeDiff = now.getTime() - orderTime.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    return minutesDiff > 30 && ['received', 'preparing'].includes(order.status);
  }

  function isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  function calculateAverageTime(orders: Order[]): number {
    const completedOrders = orders.filter(o => o.status === 'delivered');
    if (completedOrders.length === 0) return 0;
    
    const totalTime = completedOrders.reduce((sum, order) => {
      const start = new Date(order.createdAt);
      const now = new Date();
      return sum + (now.getTime() - start.getTime()) / (1000 * 60);
    }, 0);
    
    return Math.round(totalTime / completedOrders.length);
  }

  function getOrderDuration(order: Order): string {
    const start = new Date(order.createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}min`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}min`;
  }

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

  const updateOrderStatus = (orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  // Enhanced filtering and sorting
  const filteredOrders = orders
    .filter(order => {
      let statusMatch = true;
      if (filter === 'active') statusMatch = ['received', 'preparing'].includes(order.status);
      else if (filter === 'ready') statusMatch = order.status === 'ready';
      else if (filter === 'urgent') statusMatch = ['received', 'preparing'].includes(order.status) && isOrderUrgent(order);
      
      const locationMatch = selectedLocation === 'all' || order.locationId === selectedLocation;
      
      return statusMatch && locationMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
        return (priorityOrder[b.priority || 'normal'] || 2) - (priorityOrder[a.priority || 'normal'] || 2);
      } else if (sortBy === 'type') {
        return a.orderType.localeCompare(b.orderType);
      } else {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
    });

  // Calculate kitchen statistics
  const kitchenStats: KitchenStats = {
    totalOrders: orders.length,
    activeOrders: orders.filter(o => ['received', 'preparing'].includes(o.status)).length,
    completedToday: orders.filter(o => o.status === 'delivered' && isToday(o.createdAt)).length,
    averageTime: calculateAverageTime(orders),
    delayedOrders: orders.filter(o => isOrderDelayed(o)).length,
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
                <ChefHat className="w-8 h-8 text-orange-400" />
                <div>
                  <h1 className="text-2xl font-bold text-orange-400">Painel da Cozinha Avançado</h1>
                  <p className="text-gray-400">Las Tortillas Mexican Grill • Sistema Inteligente</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`p-2 rounded-lg transition-colors ${
                    autoRefresh ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}
                  title={autoRefresh ? 'Desabilitar Auto-Refresh' : 'Habilitar Auto-Refresh'}
                >
                  {autoRefresh ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-lg transition-colors ${
                    soundEnabled ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}
                  title={soundEnabled ? 'Desabilitar Som' : 'Habilitar Som'}
                >
                  <Bell className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setShowStats(!showStats)}
                  className={`p-2 rounded-lg transition-colors ${
                    showStats ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}
                  title={showStats ? 'Ocultar Estatísticas' : 'Mostrar Estatísticas'}
                >
                  <TrendingUp className="w-4 h-4" />
                </button>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-400">{kitchenStats.activeOrders}</div>
                <div className="text-sm text-gray-400">Pedidos Ativos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {showStats && (
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">{kitchenStats.totalOrders}</div>
                <div className="text-xs text-blue-300">Total Hoje</div>
              </div>
              <div className="bg-orange-600/20 border border-orange-500/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-400">{kitchenStats.activeOrders}</div>
                <div className="text-xs text-orange-300">Em Preparo</div>
              </div>
              <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{kitchenStats.completedToday}</div>
                <div className="text-xs text-green-300">Concluídos</div>
              </div>
              <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">{kitchenStats.averageTime}min</div>
                <div className="text-xs text-yellow-300">Tempo Médio</div>
              </div>
              <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-400">{kitchenStats.delayedOrders}</div>
                <div className="text-xs text-red-300">Atrasados</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filters and Controls */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Status Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  filter === 'active'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Flame className="w-4 h-4" />
                Ativos ({orders.filter(o => ['received', 'preparing'].includes(o.status)).length})
              </button>
              <button
                onClick={() => setFilter('ready')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  filter === 'ready'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Prontos ({orders.filter(o => o.status === 'ready').length})
              </button>
              <button
                onClick={() => setFilter('urgent')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  filter === 'urgent'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                Urgentes ({orders.filter(o => ['received', 'preparing'].includes(o.status) && isOrderUrgent(o)).length})
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

            {/* Sort and Location Controls */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'time' | 'priority' | 'type')}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
              >
                <option value="time">Ordenar por Tempo</option>
                <option value="priority">Ordenar por Prioridade</option>
                <option value="type">Ordenar por Tipo</option>
              </select>
              
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
              >
                <option value="all">Todas as Localizações</option>
                <option value="ilha">Ilha</option>
                <option value="talatona">Talatona</option>
                <option value="movel">Móvel</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {ordersLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-orange-400 mx-auto mb-4" />
            <p className="text-gray-400">Carregando pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-2">Nenhum pedido encontrado</p>
            <p className="text-gray-500">
              {filter === 'active' && 'Não há pedidos ativos no momento.'}
              {filter === 'ready' && 'Não há pedidos prontos no momento.'}
              {filter === 'all' && 'Nenhum pedido foi feito ainda hoje.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredOrders.map((order) => {
              const isUrgent = isOrderUrgent(order);
              const isDelayed = isOrderDelayed(order);
              const duration = getOrderDuration(order);
              
              return (
                <div key={order.id} className={`rounded-xl border-2 p-4 transition-all duration-300 hover:scale-105 ${
                  isUrgent ? 'bg-red-900/30 border-red-500 shadow-red-500/20' :
                  isDelayed ? 'bg-yellow-900/30 border-yellow-500 shadow-yellow-500/20' :
                  order.status === 'ready' ? 'bg-green-900/30 border-green-500 shadow-green-500/20' :
                  'bg-gray-800 border-gray-600 shadow-gray-800/20'
                } shadow-lg`}>
                  
                  {/* Header do Pedido */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-orange-400">#{order.id}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      {isUrgent && (
                        <span className="px-2 py-1 bg-red-600 text-white rounded-full text-xs font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          URGENTE
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">
                        {new Date(order.createdAt).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <div className={`text-xs font-medium ${
                        isDelayed ? 'text-red-400' : 'text-gray-500'
                      }`}>
                        {duration}
                      </div>
                    </div>
                  </div>

                  {/* Customer Info with icons */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="font-medium text-white">{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-400">{order.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-400 capitalize">
                        {order.orderType} • {order.locationId}
                        {order.tableId && ` • Mesa ${order.tableId}`}
                      </span>
                    </div>
                  </div>

                  {/* Items do Pedido com design melhorado */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <ChefHat className="w-4 h-4" />
                      Itens do Pedido:
                    </div>
                    <div className="space-y-2">
                      {order.items?.map((item, index) => (
                        <div key={index} className="bg-gray-700/50 rounded-lg p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white">
                              <span className="text-orange-400 font-bold">{item.quantity}x</span> {item.name}
                            </span>
                            {item.preparationTime && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Timer className="w-3 h-3" />
                                {item.preparationTime}min
                              </span>
                            )}
                          </div>
                          {item.customizations && item.customizations.length > 0 && (
                            <div className="text-xs text-yellow-400 mt-1 pl-2 border-l-2 border-yellow-600">
                              {item.customizations.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notas especiais */}
                  {order.notes && (
                    <div className="mb-4 p-3 bg-yellow-900/40 rounded-lg border-l-4 border-yellow-500">
                      <div className="text-xs text-yellow-400 font-medium flex items-center gap-2 mb-1">
                        <Star className="w-3 h-3" />
                        Observações Especiais:
                      </div>
                      <div className="text-sm text-yellow-200">{order.notes}</div>
                    </div>
                  )}

                  {/* Ações com design melhorado */}
                  <div className="space-y-2">
                    {order.status === 'received' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        disabled={updateStatusMutation.isPending}
                        className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Clock className="w-5 h-5" />
                        {updateStatusMutation.isPending ? 'Atualizando...' : 'Iniciar Preparo'}
                      </button>
                    )}
                    
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        disabled={updateStatusMutation.isPending}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
                      >
                        <CheckCircle className="w-5 h-5" />
                        {updateStatusMutation.isPending ? 'Atualizando...' : 'Marcar como Pronto'}
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        disabled={updateStatusMutation.isPending}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
                      >
                        <CheckCircle className="w-5 h-5" />
                        {updateStatusMutation.isPending ? 'Atualizando...' : 'Marcar como Entregue'}
                      </button>
                    )}
                  </div>

                  {/* Footer com total e tempo estimado */}
                  <div className="mt-4 pt-3 border-t border-gray-600">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xl font-bold text-green-400">
                          AOA {parseFloat(order.totalAmount).toLocaleString('pt-AO')}
                        </div>
                        {order.estimatedDeliveryTime && (
                          <div className="text-xs text-gray-400">
                            Est: {order.estimatedDeliveryTime}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">Prioridade</div>
                        <div className={`text-sm font-medium ${
                          order.priority === 'urgent' ? 'text-red-400' :
                          order.priority === 'high' ? 'text-orange-400' :
                          'text-gray-400'
                        }`}>
                          {order.priority ? order.priority.toUpperCase() : 'NORMAL'}
                        </div>
                      </div>
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