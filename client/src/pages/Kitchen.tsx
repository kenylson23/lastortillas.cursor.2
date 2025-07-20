import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, RefreshCw, Bell, BellOff, BarChart3, 
  Clock, CheckCircle, Users, MapPin, Phone, Timer, 
  AlertCircle, ChefHat, Package, TrendingUp 
} from 'lucide-react';

interface OrderItem {
  id?: number;
  menuItemId: number;
  name?: string;
  quantity: number;
  unitPrice: string;
  customizations?: string[];
  preparationTime?: number;
}

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  orderType: string;
  status: string;
  totalAmount: string;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  estimatedDeliveryTime?: string;
  locationId: string;
  tableId?: number;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  preparationTime?: number;
}

export default function Kitchen() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const queryClient = useQueryClient();

  // Estados de controle
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState<'time' | 'priority' | 'status'>('time');
  const [lastOrderCount, setLastOrderCount] = useState(0);

  // Sistema de som
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Verificação de autenticação
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (userRole !== 'kitchen' && userRole !== 'admin'))) {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, userRole, setLocation]);

  // Configuração do tema
  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#1f2937';
    
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, []);

  // Inicializar AudioContext
  useEffect(() => {
    if (soundEnabled && !audioContext) {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(context);
    }
  }, [soundEnabled, audioContext]);

  // Queries
  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    refetchInterval: autoRefresh ? 3000 : false,
    refetchIntervalInBackground: true,
  });

  const { data: menuItems = [] } = useQuery<MenuItem[]>({
    queryKey: ['/api/menu-items'],
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutation para atualizar status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao atualizar status do pedido');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
  });

  // Sistema de notificação sonora
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

  // Detectar novos pedidos
  useEffect(() => {
    if (orders.length > lastOrderCount && lastOrderCount > 0) {
      playNotificationSound();
    }
    setLastOrderCount(orders.length);
  }, [orders.length, lastOrderCount, soundEnabled]);

  // Funções auxiliares
  const getMenuItemName = (menuItemId: number): string => {
    const item = menuItems.find(m => m.id === menuItemId);
    return item?.name || `Item #${menuItemId}`;
  };

  const getOrderDuration = (createdAt: string): string => {
    const now = new Date();
    const orderTime = new Date(createdAt);
    const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}min`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}min`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'border-blue-500 bg-blue-50 text-blue-900';
      case 'preparing': return 'border-yellow-500 bg-yellow-50 text-yellow-900';
      case 'ready': return 'border-green-500 bg-green-50 text-green-900';
      case 'delivered': return 'border-gray-500 bg-gray-50 text-gray-900';
      case 'cancelled': return 'border-red-500 bg-red-50 text-red-900';
      default: return 'border-gray-300 bg-white text-gray-900';
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

  const getLocationName = (locationId: string) => {
    switch (locationId) {
      case 'talatona': return 'Talatona';
      case 'ilha': return 'Ilha';
      case 'movel': return 'Móvel';
      default: return locationId;
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

  // Filtrar e ordenar pedidos
  const filteredOrders = orders
    .filter(order => {
      if (selectedStatus !== 'all' && order.status !== selectedStatus) return false;
      if (selectedLocation !== 'all' && order.locationId !== selectedLocation) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
          return (priorityOrder[a.priority || 'normal'] || 2) - (priorityOrder[b.priority || 'normal'] || 2);
        case 'status':
          const statusOrder = { received: 0, preparing: 1, ready: 2, delivered: 3, cancelled: 4 };
          return (statusOrder[a.status as keyof typeof statusOrder] || 0) - (statusOrder[b.status as keyof typeof statusOrder] || 0);
        default:
          return 0;
      }
    });

  // Calcular estatísticas
  const stats = {
    total: orders.length,
    active: orders.filter(o => ['received', 'preparing'].includes(o.status)).length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'delivered').length,
    delayed: orders.filter(o => {
      const orderTime = new Date(o.createdAt);
      const now = new Date();
      const diffMinutes = (now.getTime() - orderTime.getTime()) / (1000 * 60);
      return diffMinutes > 30 && ['received', 'preparing'].includes(o.status);
    }).length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="mx-auto h-12 w-12 text-red-500 animate-pulse mb-4" />
          <p className="text-gray-600">Carregando painel da cozinha...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setLocation('/admin')}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:block">Voltar</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <ChefHat className="h-8 w-8 text-red-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Painel da Cozinha</h1>
                  <p className="text-sm text-gray-500">Las Tortillas Mexican Grill</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className={`p-2 rounded-lg transition-colors ${
                  showStats ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={showStats ? 'Ocultar estatísticas' : 'Mostrar estatísticas'}
              >
                <BarChart3 size={20} />
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  soundEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={soundEnabled ? 'Desativar som' : 'Ativar som'}
              >
                {soundEnabled ? <Bell size={20} /> : <BellOff size={20} />}
              </button>

              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg transition-colors ${
                  autoRefresh ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={autoRefresh ? 'Desativar atualização automática' : 'Ativar atualização automática'}
              >
                <RefreshCw size={20} className={autoRefresh ? 'animate-spin' : ''} />
              </button>

              <button
                onClick={() => refetchOrders()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RefreshCw size={16} className="inline mr-2" />
                Atualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {showStats && (
        <div className="bg-white border-b p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Package size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Timer size={16} className="text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Ativos</span>
              </div>
              <div className="text-2xl font-bold text-yellow-900">{stats.active}</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-sm font-medium text-green-800">Prontos</span>
              </div>
              <div className="text-2xl font-bold text-green-900">{stats.ready}</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <TrendingUp size={16} className="text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Entregues</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">{stats.completed}</div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-3 text-center border border-red-200">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <AlertCircle size={16} className="text-red-600" />
                <span className="text-sm font-medium text-red-800">Atrasados</span>
              </div>
              <div className="text-2xl font-bold text-red-900">{stats.delayed}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white border-b p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Todos', color: 'bg-gray-100 text-gray-800' },
                { value: 'received', label: 'Recebidos', color: 'bg-blue-100 text-blue-800' },
                { value: 'preparing', label: 'Preparando', color: 'bg-yellow-100 text-yellow-800' },
                { value: 'ready', label: 'Prontos', color: 'bg-green-100 text-green-800' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedStatus === option.value
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
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">Todas as Localidades</option>
              <option value="talatona">Talatona</option>
              <option value="ilha">Ilha de Luanda</option>
              <option value="movel">Unidade Móvel</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ordenação</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'time' | 'priority' | 'status')}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="time">Por Tempo</option>
              <option value="priority">Por Prioridade</option>
              <option value="status">Por Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="p-4">
        {ordersLoading ? (
          <div className="text-center py-12">
            <ChefHat className="mx-auto h-12 w-12 text-red-500 animate-pulse mb-4" />
            <p className="text-gray-600">Carregando pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-500">
              {selectedStatus === 'all' 
                ? 'Não há pedidos no momento.'
                : `Não há pedidos com status "${getStatusText(selectedStatus)}".`
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order) => {
              const nextStatus = getNextStatus(order.status);
              const nextStatusText = getNextStatusText(order.status);

              return (
                <div key={order.id} className={`border-2 rounded-xl p-4 ${getStatusColor(order.status)} transition-all hover:shadow-lg`}>
                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">#{order.id}</span>
                      <span className="px-2 py-1 bg-white bg-opacity-50 rounded-full text-xs font-medium">
                        {order.priority?.toUpperCase() || 'NORMAL'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Timer size={16} />
                      <span className="font-medium">{getOrderDuration(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* Informações do Cliente */}
                  <div className="mb-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Users size={16} className="text-gray-600" />
                      <span className="font-medium">{order.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone size={16} className="text-gray-600" />
                      <span className="text-sm">{order.customerPhone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} className="text-gray-600" />
                      <span className="text-sm">
                        {getOrderTypeIcon(order.orderType)} {getLocationName(order.locationId)}
                        {order.tableId && ` - Mesa ${order.tableId}`}
                      </span>
                    </div>
                  </div>

                  {/* Itens do Pedido */}
                  <div className="mb-3">
                    <h4 className="font-medium mb-2">Itens:</h4>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>
                            <strong>{item.quantity}x</strong> {getMenuItemName(item.menuItemId)}
                            {item.customizations && item.customizations.length > 0 && (
                              <span className="text-gray-600 block text-xs">
                                • {item.customizations.join(', ')}
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notas */}
                  {order.notes && (
                    <div className="mb-3 p-2 bg-white bg-opacity-50 rounded border-l-4 border-yellow-400">
                      <div className="flex items-start space-x-2">
                        <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-sm font-medium text-yellow-800">Observações:</span>
                          <p className="text-sm text-yellow-700">{order.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer com Status e Ações */}
                  <div className="flex items-center justify-between pt-3 border-t border-white border-opacity-50">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Status:</span>
                      <span className="text-sm font-bold">{getStatusText(order.status)}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{order.totalAmount} AOA</span>
                      
                      {nextStatus && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: nextStatus })}
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