import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { 
  Clock, 
  ChefHat, 
  CheckCircle, 
  AlertCircle, 
  Timer,
  Users,
  Phone,
  Utensils,
  Play
} from 'lucide-react';

export default function SimpleKitchenDashboard() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const queryClient = useQueryClient();

  // Buscar pedidos
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: () => apiRequest('/api/orders'),
    refetchInterval: 5000,
  });

  // Buscar menu items
  const { data: menuItems = [] } = useQuery({
    queryKey: ['/api/menu-items'],
    queryFn: () => apiRequest('/api/menu-items'),
  });

  // Mutation para atualizar status
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      return apiRequest(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    }
  });

  // Filtrar apenas pedidos ativos
  const activeOrders = orders.filter((order: any) => 
    !['delivered', 'cancelled'].includes(order.status)
  );

  // Estatísticas básicas
  const stats = {
    total: activeOrders.length,
    pending: activeOrders.filter((o: any) => o.status === 'pending').length,
    preparing: activeOrders.filter((o: any) => o.status === 'preparing').length,
    ready: activeOrders.filter((o: any) => o.status === 'ready').length,
  };

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateOrderStatus.mutate({ orderId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando painel da cozinha...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Voltar
            </button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <ChefHat className="w-7 h-7 text-red-600" />
              Painel da Cozinha
            </h1>
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleTimeString('pt-AO')}
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Utensils className="w-6 h-6 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600">Pendentes</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            <Clock className="w-6 h-6 text-orange-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Preparando</p>
              <p className="text-2xl font-bold text-blue-600">{stats.preparing}</p>
            </div>
            <Timer className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Prontos</p>
              <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeOrders.map((order: any) => {
          const orderTime = new Date(order.createdAt);
          const now = new Date();
          const minutesAgo = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
          
          return (
            <div
              key={order.id}
              className="bg-white rounded-lg border shadow-md hover:shadow-lg transition-all p-6"
            >
              {/* Cabeçalho do Pedido */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">#{order.id}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span>{minutesAgo} min atrás</span>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                  order.status === 'preparing' ? 'bg-blue-100 text-blue-700' : 
                  order.status === 'ready' ? 'bg-green-100 text-green-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  {order.status === 'pending' ? 'Pendente' : 
                   order.status === 'preparing' ? 'Preparando' : 
                   order.status === 'ready' ? 'Pronto' : order.status}
                </div>
              </div>

              {/* Cliente */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-3 h-3 text-gray-500" />
                  <span className="font-medium">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-3 h-3" />
                  <span>{order.customerPhone}</span>
                </div>
                <div className="text-sm">
                  <span className="capitalize font-medium">
                    {order.orderType === 'delivery' ? 'Entrega' : 
                     order.orderType === 'takeaway' ? 'Retirada' : 
                     `Mesa ${order.tableId || 'N/A'}`}
                  </span>
                </div>
              </div>

              {/* Items */}
              {order.items && order.items.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2">Items:</h4>
                  <div className="space-y-1">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.menuItem?.name || 'Item'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Observações */}
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
                    disabled={updateOrderStatus.isPending}
                  >
                    <Play className="w-4 h-4" />
                    Iniciar Preparo
                  </button>
                )}
                
                {order.status === 'preparing' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'ready')}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                    disabled={updateOrderStatus.isPending}
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
          );
        })}
      </div>

      {/* Estado Vazio */}
      {activeOrders.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum pedido ativo</h3>
          <p className="text-gray-600">Todos os pedidos foram processados!</p>
        </div>
      )}
    </div>
  );
}