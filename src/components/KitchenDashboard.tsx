import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { Order, OrderItem, MenuItem } from '@shared/schema';
import { 
  Clock, 
  ChefHat, 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Timer,
  Users,
  MapPin,
  Phone,
  Utensils,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Filter
} from 'lucide-react';

interface KitchenOrder extends Order {
  items: Array<OrderItem & { menuItem: MenuItem }>;
  timeElapsed: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedCompletion: Date;
}

export default function KitchenDashboard() {
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'time' | 'priority' | 'type'>('priority');
  const [playAlerts, setPlayAlerts] = useState(true);
  const [showOnlyUrgent, setShowOnlyUrgent] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const queryClient = useQueryClient();

  // Sons de notificação
  const playNotificationSound = (type: 'new' | 'urgent' | 'complete') => {
    if (!playAlerts) return;
    
    const frequencies = {
      new: 800,     // Novo pedido
      urgent: 1000, // Pedido urgente
      complete: 600 // Pedido concluído
    };
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequencies[type];
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  // Buscar pedidos ativos (não entregues/cancelados)
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['/api/orders', 'active'],
    queryFn: () => apiRequest('/api/orders'),
    refetchInterval: 3000, // Atualizar a cada 3 segundos para mais responsividade
    select: (data) => data.filter((order: Order) => 
      !['delivered', 'cancelled'].includes(order.status)
    )
  });

  // Buscar menu items para detalhes
  const { data: menuItems = [] } = useQuery({
    queryKey: ['/api/menu-items'],
    queryFn: () => apiRequest('/api/menu-items'),
  });

  // Mutation para atualizar status do pedido
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      return apiRequest(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      playNotificationSound('complete');
    }
  });

  // Processar pedidos com dados adicionais
  const processedOrders: KitchenOrder[] = orders.map((order: Order) => {
    const now = new Date();
    const orderTime = new Date(order.createdAt);
    const timeElapsed = Math.floor((now.getTime() - orderTime.getTime()) / 1000 / 60); // minutos
    
    // Determinar urgência baseada no tempo decorrido e tipo de pedido
    let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const maxTime = order.orderType === 'delivery' ? 45 : order.orderType === 'takeaway' ? 20 : 25;
    
    if (timeElapsed > maxTime * 1.5) urgencyLevel = 'critical';
    else if (timeElapsed > maxTime) urgencyLevel = 'high';
    else if (timeElapsed > maxTime * 0.7) urgencyLevel = 'medium';

    // Estimar tempo de conclusão
    const remainingTime = Math.max(0, maxTime - timeElapsed);
    const estimatedCompletion = new Date(now.getTime() + remainingTime * 60000);

    return {
      ...order,
      items: order.items?.map(item => ({
        ...item,
        menuItem: menuItems.find((mi: MenuItem) => mi.id === item.menuItemId) || {} as MenuItem
      })) || [],
      timeElapsed,
      urgencyLevel,
      estimatedCompletion
    };
  });

  // Filtrar por estação
  const stations = [
    { id: 'all', name: 'Todas as Estações', icon: ChefHat },
    { id: 'cold', name: 'Estação Fria', icon: Users },
    { id: 'hot', name: 'Estação Quente', icon: Utensils },
    { id: 'assembly', name: 'Montagem', icon: Zap }
  ];

  const getItemStation = (category: string) => {
    if (['Aperitivos', 'Saladas'].includes(category)) return 'cold';
    if (['Tacos', 'Quesadillas', 'Fajitas', 'Enchiladas'].includes(category)) return 'hot';
    if (['Burritos', 'Combos'].includes(category)) return 'assembly';
    return 'hot';
  };

  const filteredOrders = processedOrders.filter(order => {
    // Filtro por estação
    if (selectedStation !== 'all') {
      const hasStationItems = order.items.some(item => 
        getItemStation(item.menuItem.category || '') === selectedStation
      );
      if (!hasStationItems) return false;
    }
    
    // Filtro por urgência
    if (showOnlyUrgent) {
      return ['high', 'critical'].includes(order.urgencyLevel);
    }
    
    return true;
  });

  // Ordenar pedidos
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.urgencyLevel] - priorityOrder[a.urgencyLevel];
      case 'type':
        const typeOrder = { 'dine-in': 3, takeaway: 2, delivery: 1 };
        return typeOrder[b.orderType as keyof typeof typeOrder] - typeOrder[a.orderType as keyof typeof typeOrder];
      case 'time':
      default:
        return b.timeElapsed - a.timeElapsed;
    }
  });

  // Estatísticas
  const stats = {
    total: processedOrders.length,
    pending: processedOrders.filter(o => o.status === 'pending').length,
    preparing: processedOrders.filter(o => o.status === 'preparing').length,
    ready: processedOrders.filter(o => o.status === 'ready').length,
    critical: processedOrders.filter(o => o.urgencyLevel === 'critical').length,
    avgTime: processedOrders.length > 0 
      ? Math.round(processedOrders.reduce((sum, o) => sum + o.timeElapsed, 0) / processedOrders.length)
      : 0
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500 text-white border-red-600';
      case 'high': return 'bg-orange-100 text-orange-900 border-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-900 border-yellow-400';
      default: return 'bg-green-100 text-green-900 border-green-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-700';
      case 'preparing': return 'bg-blue-100 text-blue-700';
      case 'ready': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateOrderStatus.mutate({ orderId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Navegação Superior */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Voltar
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <ChefHat className="w-7 h-7 text-red-600" />
              Painel da Cozinha
            </h1>
          </div>
          
          <div className="flex items-center gap-3 mt-2 md:mt-0">
            {/* Ações Rápidas */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setShowOnlyUrgent(!showOnlyUrgent)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  showOnlyUrgent 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                🚨 Urgentes ({stats.critical})
              </button>
              
              <button
                onClick={() => setCompactView(!compactView)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  compactView 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {compactView ? '📋 Compacto' : '📄 Detalhado'}
              </button>
              
              <button
                onClick={() => setPlayAlerts(!playAlerts)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  playAlerts 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {playAlerts ? '🔊' : '🔇'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          {new Date().toLocaleString('pt-AO', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })} • Atualização automática a cada 3 segundos
        </div>
      </div>

      {/* Header com Estatísticas */}
      <div className="mb-6">
        <div className="flex flex-wrap justify-between items-center mb-4">

        </div>

        {/* Cards de Estatísticas Melhoradas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className={`bg-white rounded-lg border p-4 transition-all hover:shadow-md ${stats.total > 0 ? 'border-l-4 border-l-gray-400' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Ativo</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Utensils className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className={`bg-white rounded-lg border p-4 transition-all hover:shadow-md ${stats.pending > 0 ? 'border-l-4 border-l-orange-400 animate-pulse' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 uppercase tracking-wide font-semibold">Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className={`w-8 h-8 text-orange-400 ${stats.pending > 0 ? 'animate-bounce' : ''}`} />
            </div>
          </div>
          
          <div className={`bg-white rounded-lg border p-4 transition-all hover:shadow-md ${stats.preparing > 0 ? 'border-l-4 border-l-blue-400' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 uppercase tracking-wide font-semibold">Em Preparo</p>
                <p className="text-2xl font-bold text-blue-600">{stats.preparing}</p>
              </div>
              <Timer className={`w-8 h-8 text-blue-400 ${stats.preparing > 0 ? 'animate-spin' : ''}`} />
            </div>
          </div>
          
          <div className={`bg-white rounded-lg border p-4 transition-all hover:shadow-md ${stats.ready > 0 ? 'border-l-4 border-l-green-400 bg-green-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 uppercase tracking-wide font-semibold">Prontos</p>
                <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
              </div>
              <CheckCircle className={`w-8 h-8 text-green-400 ${stats.ready > 0 ? 'animate-pulse' : ''}`} />
            </div>
          </div>
          
          <div className={`bg-white rounded-lg border p-4 transition-all hover:shadow-md ${stats.critical > 0 ? 'border-l-4 border-l-red-400 bg-red-50 animate-pulse' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600 uppercase tracking-wide font-semibold">🚨 Urgentes</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <AlertCircle className={`w-8 h-8 text-red-400 ${stats.critical > 0 ? 'animate-bounce' : ''}`} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-4 transition-all hover:shadow-md border-l-4 border-l-purple-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 uppercase tracking-wide">Tempo Médio</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgTime}<span className="text-sm">min</span></p>
              </div>
              <RotateCcw className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Controles */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Estação:</span>
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="px-3 py-1 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            {stations.map(station => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'time' | 'priority' | 'type')}
            className="px-3 py-1 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="priority">Por Urgência</option>
            <option value="time">Por Tempo</option>
            <option value="type">Por Tipo</option>
          </select>
        </div>
        
        {filteredOrders.length !== processedOrders.length && (
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              Mostrando {filteredOrders.length} de {processedOrders.length} pedidos
            </span>
            <button
              onClick={() => {
                setSelectedStation('all');
                setShowOnlyUrgent(false);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm underline ml-2"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista de Pedidos */}
      <div className={`grid gap-6 ${
        compactView 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }`}>
        <AnimatePresence>
          {sortedOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`bg-white rounded-lg border-l-4 shadow-md hover:shadow-lg transition-all ${getUrgencyColor(order.urgencyLevel)}`}
            >
              <div className="p-6">
                {/* Cabeçalho do Pedido */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">#{order.id}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>{order.timeElapsed} min atrás</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status === 'pending' ? 'Pendente' : 
                       order.status === 'preparing' ? 'Preparando' : 
                       order.status === 'ready' ? 'Pronto' : order.status}
                    </div>
                  </div>
                </div>

                {/* Informações do Cliente */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-3 h-3 text-gray-500" />
                    <span className="font-medium">{order.customerName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-3 h-3" />
                    <span>{order.customerPhone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    <span className="capitalize font-medium">
                      {order.orderType === 'delivery' ? 'Entrega' : 
                       order.orderType === 'takeaway' ? 'Retirada' : 
                       `Mesa ${order.tableId || 'N/A'}`}
                    </span>
                  </div>
                </div>

                {/* Items do Pedido */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2">Items:</h4>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.menuItem.name || 'Item Desconhecido'}</span>
                        <span className="text-gray-500">
                          {item.menuItem.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notas do Pedido */}
                {order.notes && (
                  <div className="mb-4 p-2 bg-gray-50 rounded text-sm">
                    <strong>Observações:</strong> {order.notes}
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="space-y-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'preparing')}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Iniciar Preparo
                    </button>
                  )}
                  
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'ready')}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Marcar Pronto
                    </button>
                  )}
                  
                  {order.status === 'ready' && (
                    <div className="w-full text-center bg-green-100 text-green-800 py-2 px-4 rounded-md font-medium">
                      ✓ Pronto para Entrega
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Estado Vazio */}
      {sortedOrders.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum pedido ativo</h3>
          <p className="text-gray-600">Todos os pedidos foram processados!</p>
        </div>
      )}
    </div>
  );
}