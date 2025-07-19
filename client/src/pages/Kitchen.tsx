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

      {/* Enhanced Statistics Dashboard */}
      {showStats && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Main Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Active Orders - Primary Metric */}
              <div className="bg-gradient-to-br from-orange-600/30 to-red-600/20 border-2 border-orange-500/40 rounded-xl p-6 text-center relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Flame className="w-8 h-8 text-orange-400" />
                    <div className="text-4xl font-black text-orange-400">{kitchenStats.activeOrders}</div>
                  </div>
                  <div className="text-lg font-semibold text-orange-200">Pedidos em Preparo</div>
                  <div className="text-xs text-orange-300/80 mt-1">Requer atenção imediata</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent"></div>
              </div>

              {/* Ready Orders */}
              <div className="bg-gradient-to-br from-green-600/30 to-emerald-600/20 border-2 border-green-500/40 rounded-xl p-6 text-center relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                    <div className="text-4xl font-black text-green-400">{orders.filter(o => o.status === 'ready').length}</div>
                  </div>
                  <div className="text-lg font-semibold text-green-200">Pedidos Prontos</div>
                  <div className="text-xs text-green-300/80 mt-1">Aguardando entrega</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"></div>
              </div>

              {/* Urgent Orders */}
              <div className="bg-gradient-to-br from-red-600/30 to-pink-600/20 border-2 border-red-500/40 rounded-xl p-6 text-center relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                    <div className="text-4xl font-black text-red-400">{kitchenStats.delayedOrders}</div>
                  </div>
                  <div className="text-lg font-semibold text-red-200">Pedidos Urgentes</div>
                  <div className="text-xs text-red-300/80 mt-1">Mais de 20 min</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent"></div>
              </div>
            </div>

            {/* Secondary Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Orders Today */}
              <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-blue-400">{kitchenStats.totalOrders}</div>
                <div className="text-sm text-blue-300 font-medium">Total Hoje</div>
                <div className="text-xs text-gray-400 mt-1">Todos os pedidos</div>
              </div>

              {/* Completed Today */}
              <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-emerald-400">{kitchenStats.completedToday}</div>
                <div className="text-sm text-emerald-300 font-medium">Concluídos</div>
                <div className="text-xs text-gray-400 mt-1">Entregues hoje</div>
              </div>

              {/* Average Time */}
              <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4 text-center backdrop-blur-sm">
                <div className="flex items-center justify-center gap-1">
                  <Timer className="w-5 h-5 text-yellow-400" />
                  <div className="text-2xl font-bold text-yellow-400">{kitchenStats.averageTime}</div>
                  <span className="text-sm text-yellow-300">min</span>
                </div>
                <div className="text-sm text-yellow-300 font-medium">Tempo Médio</div>
                <div className="text-xs text-gray-400 mt-1">Por pedido</div>
              </div>

              {/* Efficiency Indicator */}
              <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-purple-400">
                  {kitchenStats.totalOrders > 0 ? Math.round((kitchenStats.completedToday / kitchenStats.totalOrders) * 100) : 0}%
                </div>
                <div className="text-sm text-purple-300 font-medium">Eficiência</div>
                <div className="text-xs text-gray-400 mt-1">Taxa conclusão</div>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${kitchenStats.delayedOrders === 0 ? 'bg-green-500' : kitchenStats.delayedOrders < 3 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-300">
                  Status: {kitchenStats.delayedOrders === 0 ? 'Excelente' : kitchenStats.delayedOrders < 3 ? 'Normal' : 'Crítico'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">
                  Atualizado em tempo real
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filters and Controls */}
      <div className="bg-gray-800 border-b border-gray-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="space-y-4">
            {/* Status Filters - Row 1 */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFilter('active')}
                className={`px-5 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg ${
                  filter === 'active'
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-orange-500/25 transform scale-105'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white border border-gray-600'
                }`}
              >
                <Flame className="w-5 h-5" />
                Ativos ({orders.filter(o => ['received', 'preparing'].includes(o.status)).length})
              </button>
              <button
                onClick={() => setFilter('ready')}
                className={`px-5 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg ${
                  filter === 'ready'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-500/25 transform scale-105'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white border border-gray-600'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                Prontos ({orders.filter(o => o.status === 'ready').length})
              </button>
              <button
                onClick={() => setFilter('urgent')}
                className={`px-5 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg ${
                  filter === 'urgent'
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-red-500/25 transform scale-105'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white border border-gray-600'
                }`}
              >
                <AlertCircle className="w-5 h-5" />
                Urgentes ({orders.filter(o => ['received', 'preparing'].includes(o.status) && isOrderUrgent(o)).length})
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-5 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25 transform scale-105'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white border border-gray-600'
                }`}
              >
                Todos ({orders.length})
              </button>
            </div>

            {/* Sort and Location Controls - Row 2 */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-300">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'time' | 'priority' | 'type')}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg border-2 border-gray-500 focus:border-orange-500 focus:outline-none hover:border-gray-400 transition-colors font-medium shadow-lg"
                >
                  <option value="time" className="bg-gray-700 text-white">⏰ Por Tempo</option>
                  <option value="priority" className="bg-gray-700 text-white">🔥 Por Prioridade</option>
                  <option value="type" className="bg-gray-700 text-white">📍 Por Tipo</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-300">Localização:</span>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg border-2 border-gray-500 focus:border-purple-500 focus:outline-none hover:border-gray-400 transition-colors font-medium shadow-lg"
                >
                  <option value="all" className="bg-gray-700 text-white">🌍 Todas</option>
                  <option value="ilha" className="bg-gray-700 text-white">🏢 Ilha</option>
                  <option value="talatona" className="bg-gray-700 text-white">🏪 Talatona</option>
                  <option value="movel" className="bg-gray-700 text-white">🚐 Móvel</option>
                </select>
              </div>

              {/* Quick Stats */}
              <div className="ml-auto flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-400">
                  <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin text-green-400' : ''}`} />
                  <span>{autoRefresh ? 'Auto-refresh ativo' : 'Auto-refresh pausado'}</span>
                </div>
                <div className="text-gray-400">
                  {filteredOrders.length} de {orders.length} pedidos
                </div>
              </div>
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

                  {/* Customer & Order Info Card */}
                  <div className="mb-4 bg-gray-700/30 rounded-lg p-3 border-l-4 border-blue-500">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span className="font-semibold text-white truncate">{order.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{order.customerPhone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <div className="text-sm text-gray-300">
                          <span className="capitalize font-medium">{order.orderType}</span>
                          <span className="mx-1">•</span>
                          <span className="capitalize">{order.locationId}</span>
                          {order.tableId && (
                            <>
                              <span className="mx-1">•</span>
                              <span className="text-purple-300 font-medium">Mesa {order.tableId}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items do Pedido - Melhor organização */}
                  <div className="mb-4">
                    <div className="bg-gray-700/40 rounded-lg p-3 border border-gray-600/50">
                      <div className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2 border-b border-gray-600 pb-2">
                        <ChefHat className="w-4 h-4 text-orange-400" />
                        Itens para Preparar ({order.items?.length || 0})
                      </div>
                      <div className="space-y-2">
                        {order.items?.map((item, index) => (
                          <div key={index} className="bg-gray-800/60 rounded-md p-3 border-l-3 border-orange-500">
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                                    {item.quantity}
                                  </span>
                                  <span className="text-white font-medium">{item.name}</span>
                                </div>
                              </div>
                              {item.preparationTime && (
                                <div className="bg-yellow-600/20 text-yellow-300 text-xs px-2 py-1 rounded-md flex items-center gap-1 flex-shrink-0">
                                  <Timer className="w-3 h-3" />
                                  {item.preparationTime}min
                                </div>
                              )}
                            </div>
                            {item.customizations && item.customizations.length > 0 && (
                              <div className="mt-2 bg-yellow-900/40 rounded-md p-2 border-l-2 border-yellow-500">
                                <div className="text-xs text-yellow-300 font-medium mb-1">Customizações:</div>
                                <div className="text-xs text-yellow-200">
                                  {item.customizations.join(' • ')}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
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

                  {/* Footer - Informações importantes */}
                  <div className="mt-4 space-y-3">
                    {/* Valor total e tempo estimado */}
                    <div className="bg-gray-700/40 rounded-lg p-3 border border-gray-600/50">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-xs text-gray-400 uppercase tracking-wide">Valor Total</div>
                          <div className="text-xl font-bold text-green-400">
                            AOA {parseFloat(order.totalAmount).toLocaleString('pt-AO')}
                          </div>
                        </div>
                        {order.estimatedDeliveryTime && (
                          <div className="text-right">
                            <div className="text-xs text-gray-400 uppercase tracking-wide">Tempo Est.</div>
                            <div className="text-sm font-medium text-blue-400">
                              {order.estimatedDeliveryTime}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Prioridade e status */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-400">PRIORIDADE:</div>
                        <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                          order.priority === 'urgent' ? 'bg-red-600/30 text-red-300 border border-red-500' :
                          order.priority === 'high' ? 'bg-orange-600/30 text-orange-300 border border-orange-500' :
                          'bg-gray-600/30 text-gray-300 border border-gray-500'
                        }`}>
                          {order.priority ? order.priority.toUpperCase() : 'NORMAL'}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xs text-gray-400">TEMPO DECORRIDO</div>
                        <div className={`text-sm font-bold ${
                          isDelayed ? 'text-red-400' : isUrgent ? 'text-yellow-400' : 'text-gray-300'
                        }`}>
                          {duration}
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