import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, CheckCircle, AlertCircle, RefreshCw, ArrowLeft, Timer, Bell, Users, MapPin, Phone, Flame, Pause, Play, Star, ChefHat, TrendingUp } from 'lucide-react';

// Force dark theme styles
const darkThemeStyles = `
  .kitchen-container * {
    background-color: inherit !important;
    color: inherit !important;
  }
  .kitchen-container {
    background-color: #111827 !important;
    color: #ffffff !important;
  }
  .kitchen-header {
    background-color: #1f2937 !important;
  }
  .kitchen-controls {
    background-color: #374151 !important;
  }
  .kitchen-card {
    background-color: #1f2937 !important;
    color: #ffffff !important;
  }
`;

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
  const { isAuthenticated, isLoading, userRole } = useAuth();

  // Apply dark theme styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = darkThemeStyles;
    document.head.appendChild(styleElement);
    
    // Force body background to dark
    document.body.style.backgroundColor = '#111827';
    document.body.style.color = '#ffffff';
    
    return () => {
      document.head.removeChild(styleElement);
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, []);
  const [filter, setFilter] = useState<string>('active');
  const [sortBy, setSortBy] = useState<'time' | 'priority' | 'type'>('time');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const queryClient = useQueryClient();

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
    <div className="kitchen-container min-h-screen bg-gray-900 text-white" style={{ backgroundColor: '#111827 !important', color: '#ffffff !important' }}>
      {/* Compact Modern Header */}
      <div className="bg-gray-800 border-b border-gray-700 shadow-lg" style={{ backgroundColor: '#1f2937 !important' }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section - Navigation & Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLocation('/admin')}
                className="flex items-center gap-2 text-gray-300 hover:text-white px-2 py-1 rounded-md hover:bg-gray-700 transition-colors"
                title="Voltar ao Admin"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Admin</span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="bg-orange-500/20 p-2 rounded-lg">
                  <ChefHat className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Central da Cozinha</h1>
                  <p className="text-gray-400 text-xs">Las Tortillas Mexican Grill</p>
                </div>
              </div>
            </div>

            {/* Center - Key Metrics */}
            <div className="hidden md:flex items-center gap-4">
              <div className="bg-orange-500/20 border border-orange-500/40 rounded-lg px-3 py-2 text-center">
                <div className="text-xl font-bold text-orange-400">{kitchenStats.activeOrders}</div>
                <div className="text-xs text-orange-300">Ativos</div>
              </div>
              <div className="bg-green-500/20 border border-green-500/40 rounded-lg px-3 py-2 text-center">
                <div className="text-xl font-bold text-green-400">{orders.filter(o => o.status === 'ready').length}</div>
                <div className="text-xs text-green-300">Prontos</div>
              </div>
              <div className="bg-red-500/20 border border-red-500/40 rounded-lg px-3 py-2 text-center">
                <div className="text-xl font-bold text-red-400">{kitchenStats.delayedOrders}</div>
                <div className="text-xs text-red-300">Urgentes</div>
              </div>
            </div>
            
            {/* Right Section - Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-md transition-colors ${
                  autoRefresh 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
                title={autoRefresh ? 'Pausar Auto-refresh' : 'Ativar Auto-refresh'}
              >
                {autoRefresh ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-md transition-colors ${
                  soundEnabled 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
                title={soundEnabled ? 'Desativar Som' : 'Ativar Som'}
              >
                <Bell className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowStats(!showStats)}
                className={`p-2 rounded-md transition-colors ${
                  showStats 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
                title={showStats ? 'Ocultar Stats' : 'Mostrar Stats'}
              >
                <TrendingUp className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2 bg-gray-700 rounded-md px-2 py-1">
                <div className={`w-2 h-2 rounded-full ${
                  kitchenStats.delayedOrders === 0 ? 'bg-green-400' : 
                  kitchenStats.delayedOrders < 3 ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
                <span className="text-xs text-gray-300">
                  {kitchenStats.delayedOrders === 0 ? 'OK' : 
                   kitchenStats.delayedOrders < 3 ? 'Alerta' : 'Crítico'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Stats Dashboard */}
      {showStats && (
        <div className="bg-gray-800 border-b border-gray-700" style={{ backgroundColor: '#1f2937' }}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-400">{kitchenStats.totalOrders}</div>
                <div className="text-xs text-blue-300">Total</div>
              </div>
              
              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-emerald-400">{kitchenStats.completedToday}</div>
                <div className="text-xs text-emerald-300">Concluídos</div>
              </div>
              
              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-yellow-400">{kitchenStats.averageTime}min</div>
                <div className="text-xs text-yellow-300">Tempo Médio</div>
              </div>
              
              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-purple-400">
                  {kitchenStats.totalOrders > 0 ? Math.round((kitchenStats.completedToday / kitchenStats.totalOrders) * 100) : 0}%
                </div>
                <div className="text-xs text-purple-300">Eficiência</div>
              </div>
              
              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <RefreshCw className={`w-3 h-3 ${autoRefresh ? 'animate-spin text-green-400' : 'text-gray-500'}`} />
                  <div className="text-lg font-bold text-gray-300">
                    {autoRefresh ? 'ON' : 'OFF'}
                  </div>
                </div>
                <div className="text-xs text-gray-400">Auto-refresh</div>
              </div>
              
              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-300 mb-1">
                  {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xs text-gray-400">Última Atualização</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compact Filter Controls */}
      <div className="bg-gray-800 border-b border-gray-700" style={{ backgroundColor: '#1f2937 !important' }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  filter === 'active'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-orange-600/20'
                }`}
              >
                <Flame className="w-4 h-4" />
                Ativos ({orders.filter(o => ['received', 'preparing'].includes(o.status)).length})
              </button>
              
              <button
                onClick={() => setFilter('ready')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  filter === 'ready'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-green-600/20'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Prontos ({orders.filter(o => o.status === 'ready').length})
              </button>
              
              <button
                onClick={() => setFilter('urgent')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  filter === 'urgent'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-red-600/20'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                Urgentes ({orders.filter(o => ['received', 'preparing'].includes(o.status) && isOrderUrgent(o)).length})
              </button>
              
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-blue-600/20'
                }`}
              >
                Todos ({orders.length})
              </button>
            </div>

            {/* Sort & Location Controls */}
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'time' | 'priority' | 'type')}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-orange-400 focus:outline-none text-sm"
              >
                <option value="time">Por Tempo</option>
                <option value="priority">Por Prioridade</option>
                <option value="type">Por Tipo</option>
              </select>
              
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none text-sm"
              >
                <option value="all">Todas</option>
                <option value="ilha">Ilha</option>
                <option value="talatona">Talatona</option>
                <option value="movel">Móvel</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6" style={{ backgroundColor: 'transparent' }}>
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
                } shadow-lg`} style={{ 
                  backgroundColor: isUrgent ? '#7f1d1d' : 
                                  isDelayed ? '#78350f' : 
                                  order.status === 'ready' ? '#14532d' : '#1f2937',
                  color: '#ffffff'
                }}>
                  
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