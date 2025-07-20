
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
  const { isAuthenticated, isLoading, userRole } = useAuth();

  // Sistema de notificação sonora para novos pedidos
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Função para criar som de notificação
  const playNotificationSound = () => {
    if (!soundEnabled || !audioContext) return;

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
  };

  // Estados para controles
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState<string>('active');
  const [sortBy, setSortBy] = useState<'time' | 'priority' | 'type'>('time');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [showStats, setShowStats] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (userRole !== 'kitchen' && userRole !== 'admin'))) {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, userRole, setLocation]);

  // Inicializar AudioContext quando som é ativado
  useEffect(() => {
    if (soundEnabled && !audioContext) {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(context);
    }
  }, [soundEnabled, audioContext]);

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

  // Detectar novos pedidos e tocar som
  useEffect(() => {
    if (orders.length > lastOrderCount && lastOrderCount > 0) {
      playNotificationSound();
    }
    setLastOrderCount(orders.length);
  }, [orders.length, lastOrderCount, soundEnabled, audioContext]);

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
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="bg-red-600 border-b border-red-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLocation('/admin')}
                className="flex items-center gap-2 text-red-100 hover:text-white px-2 py-1 rounded-md hover:bg-red-700 transition-colors"
                title="Voltar ao Admin"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Admin</span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Central da Cozinha</h1>
                  <p className="text-red-100 text-xs">Las Tortillas Mexican Grill</p>
                </div>
              </div>
            </div>

            {/* Center - Key Metrics */}
            <div className="hidden md:flex items-center gap-4">
              <div className="bg-white/20 border border-white/40 rounded-lg px-3 py-2 text-center">
                <div className="text-xl font-bold text-white">{kitchenStats.activeOrders}</div>
                <div className="text-xs text-red-100">Ativos</div>
              </div>
              <div className="bg-white/20 border border-white/40 rounded-lg px-3 py-2 text-center">
                <div className="text-xl font-bold text-white">{orders.filter(o => o.status === 'ready').length}</div>
                <div className="text-xs text-red-100">Prontos</div>
              </div>
            </div>
            
            {/* Right Section - Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-md transition-colors ${
                  autoRefresh 
                    ? 'bg-white text-red-600' 
                    : 'bg-red-800 text-red-100 hover:bg-red-700'
                }`}
                title={autoRefresh ? 'Pausar Auto-refresh' : 'Ativar Auto-refresh'}
              >
                {autoRefresh ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  if (!soundEnabled) {
                    setTimeout(() => {
                      playNotificationSound();
                    }, 100);
                  }
                }}
                className={`p-2 rounded-md transition-colors ${
                  soundEnabled 
                    ? 'bg-white text-red-600' 
                    : 'bg-red-800 text-red-100 hover:bg-red-700'
                }`}
                title={soundEnabled ? 'Desativar Som' : 'Ativar Som'}
              >
                <Bell className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      {showStats && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div className="bg-white border border-red-200 rounded-lg p-3 text-center shadow-sm">
                <div className="text-lg font-bold text-red-600">{kitchenStats.totalOrders}</div>
                <div className="text-xs text-red-500">Total</div>
              </div>
              
              <div className="bg-white border border-red-200 rounded-lg p-3 text-center shadow-sm">
                <div className="text-lg font-bold text-red-600">{kitchenStats.completedToday}</div>
                <div className="text-xs text-red-500">Concluídos</div>
              </div>
              
              <div className="bg-white border border-red-200 rounded-lg p-3 text-center shadow-sm">
                <div className="text-lg font-bold text-red-600">{kitchenStats.averageTime}min</div>
                <div className="text-xs text-red-500">Tempo Médio</div>
              </div>
              
              <div className="bg-white border border-red-200 rounded-lg p-3 text-center shadow-sm">
                <div className="text-lg font-bold text-red-600">
                  {kitchenStats.totalOrders > 0 ? Math.round((kitchenStats.completedToday / kitchenStats.totalOrders) * 100) : 0}%
                </div>
                <div className="text-xs text-red-500">Eficiência</div>
              </div>
              
              <div className="bg-white border border-red-200 rounded-lg p-3 text-center shadow-sm">
                <div className="flex items-center justify-center gap-1">
                  <RefreshCw className={`w-3 h-3 ${autoRefresh ? 'animate-spin text-red-600' : 'text-gray-400'}`} />
                  <div className="text-lg font-bold text-red-600">
                    {autoRefresh ? 'ON' : 'OFF'}
                  </div>
                </div>
                <div className="text-xs text-red-500">Auto-refresh</div>
              </div>
              
              <div className="bg-white border border-red-200 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-red-600 mb-1">
                  {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xs text-red-500">Última Atualização</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="bg-white border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  filter === 'active'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                }`}
              >
                <Flame className="w-4 h-4" />
                Ativos ({orders.filter(o => ['received', 'preparing'].includes(o.status)).length})
              </button>
              
              <button
                onClick={() => setFilter('ready')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  filter === 'ready'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Prontos ({orders.filter(o => o.status === 'ready').length})
              </button>
              
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                }`}
              >
                Todos ({orders.length})
              </button>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'time' | 'priority' | 'type')}
                className="bg-white text-red-600 px-3 py-2 rounded-lg border border-red-200 focus:border-red-400 focus:outline-none text-sm"
              >
                <option value="time">Por Tempo</option>
                <option value="priority">Por Prioridade</option>
                <option value="type">Por Tipo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {ordersLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-red-600">Carregando pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <p className="text-xl text-red-600 mb-2">Nenhum pedido encontrado</p>
            <p className="text-red-500">
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
                <div key={order.id} className={`rounded-xl border-2 p-4 transition-all duration-300 hover:scale-105 shadow-lg ${
                  isUrgent ? 'bg-red-50 border-red-600' :
                  isDelayed ? 'bg-red-25 border-red-400' :
                  order.status === 'ready' ? 'bg-green-50 border-green-600' :
                  'bg-white border-red-200'
                }`}>
                  
                  {/* Header do Pedido */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-red-600">#{order.id}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      {isUrgent && (
                        <span className="px-2 py-1 bg-red-700 text-white rounded-full text-xs font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          URGENTE
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-red-600">
                        {new Date(order.createdAt).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <div className={`text-xs font-medium ${
                        isDelayed ? 'text-red-700' : 'text-red-500'
                      }`}>
                        {duration}
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-4 bg-red-50 rounded-lg p-3 border-l-4 border-red-600">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span className="font-semibold text-red-800 truncate">{order.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span className="text-sm text-red-700">{order.customerPhone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <div className="text-sm text-red-700">
                          <span className="capitalize font-medium">{order.orderType}</span>
                          <span className="mx-1">•</span>
                          <span className="capitalize">{order.locationId}</span>
                          {order.tableId && (
                            <>
                              <span className="mx-1">•</span>
                              <span className="text-red-600 font-medium">Mesa {order.tableId}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items do Pedido */}
                  <div className="mb-4">
                    <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                      <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2 border-b border-gray-300 pb-2">
                        <ChefHat className="w-4 h-4 text-red-500" />
                        Itens para Preparar ({order.items?.length || 0})
                      </div>
                      <div className="space-y-2">
                        {order.items?.map((item, index) => (
                          <div key={index} className="bg-white rounded-md p-3 border-l-3 border-red-500">
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                                    {item.quantity}
                                  </span>
                                  <span className="text-gray-900 font-medium">{item.name}</span>
                                </div>
                              </div>
                              {item.preparationTime && (
                                <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-md flex items-center gap-1 flex-shrink-0">
                                  <Timer className="w-3 h-3" />
                                  {item.preparationTime}min
                                </div>
                              )}
                            </div>
                            {item.customizations && item.customizations.length > 0 && (
                              <div className="mt-2 bg-yellow-50 rounded-md p-2 border-l-2 border-yellow-400">
                                <div className="text-xs text-yellow-700 font-medium mb-1">Customizações:</div>
                                <div className="text-xs text-yellow-600">
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
                    <div className="mb-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                      <div className="text-xs text-yellow-700 font-medium flex items-center gap-2 mb-1">
                        <Star className="w-3 h-3" />
                        Observações Especiais:
                      </div>
                      <div className="text-sm text-yellow-800">{order.notes}</div>
                    </div>
                  )}

                  {/* Ações */}
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
                    <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Valor Total</div>
                          <div className="text-xl font-bold text-green-600">
                            AOA {parseFloat(order.totalAmount).toLocaleString('pt-AO')}
                          </div>
                        </div>
                        {order.estimatedDeliveryTime && (
                          <div className="text-right">
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Tempo Est.</div>
                            <div className="text-sm font-medium text-blue-600">
                              {order.estimatedDeliveryTime}
                            </div>
                          </div>
                        )}
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
