import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { Order, OrderItem, MenuItem } from '@shared/schema';

interface OrderWithItems extends Order {
  items: OrderItem[];
}

export default function OrderManagement() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/orders', selectedStatus, selectedLocation],
    queryFn: async () => {
      let url = '/api/orders';
      const params = new URLSearchParams();
      
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      if (selectedLocation !== 'all') {
        params.append('location', selectedLocation);
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await apiRequest(url);
      return response.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['/api/menu'],
    queryFn: async () => {
      const response = await apiRequest('/api/menu');
      return response.json();
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await apiRequest(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setSelectedOrder(null);
    }
  });

  const fetchOrderDetails = async (orderId: number) => {
    const response = await apiRequest(`/api/orders/${orderId}`);
    const orderDetails = await response.json();
    setSelectedOrder(orderDetails);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      case 'ilha': return 'Las Tortillas Ilha';
      case 'talatona': return 'Las Tortillas Talatona';
      case 'movel': return 'Las Tortillas Móvel';
      default: return locationId;
    }
  };

  const getOrderTypeText = (orderType: string) => {
    switch (orderType) {
      case 'delivery': return 'Delivery';
      case 'takeaway': return 'Takeaway';
      case 'dine-in': return 'Comer no local';
      default: return orderType;
    }
  };

  const getMenuItemName = (menuItemId: number) => {
    const item = menuItems.find((item: MenuItem) => item.id === menuItemId);
    return item ? item.name : `Item #${menuItemId}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Gestão de Pedidos</h1>
            <button
              onClick={() => refetch()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Atualizar
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="all">Todos os Status</option>
              <option value="received">Recebido</option>
              <option value="preparing">Preparando</option>
              <option value="ready">Pronto</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="all">Todas as Localizações</option>
              <option value="ilha">Las Tortillas Ilha</option>
              <option value="talatona">Las Tortillas Talatona</option>
              <option value="movel">Las Tortillas Móvel</option>
            </select>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order: Order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => fetchOrderDetails(order.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Pedido #{order.id}</h3>
                  <p className="text-sm text-gray-600">{order.customerName}</p>
                  <p className="text-sm text-gray-600">{order.customerPhone}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Localização:</span>
                  <span className="text-sm font-medium">{getLocationName(order.locationId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tipo:</span>
                  <span className="text-sm font-medium">{getOrderTypeText(order.orderType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="text-sm font-bold text-red-600">{order.totalAmount} AOA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Data:</span>
                  <span className="text-sm">{new Date(order.createdAt!).toLocaleString('pt-AO')}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                {order.status === 'received' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateStatusMutation.mutate({ orderId: order.id, status: 'preparing' });
                    }}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
                  >
                    Preparar
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateStatusMutation.mutate({ orderId: order.id, status: 'ready' });
                    }}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                  >
                    Pronto
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateStatusMutation.mutate({ orderId: order.id, status: 'delivered' });
                    }}
                    className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                  >
                    Entregue
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Details Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Pedido #{selectedOrder.id}</h2>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Informações do Cliente</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Nome:</p>
                          <p className="font-medium">{selectedOrder.customerName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Telefone:</p>
                          <p className="font-medium">{selectedOrder.customerPhone}</p>
                        </div>
                        {selectedOrder.customerEmail && (
                          <div>
                            <p className="text-sm text-gray-600">Email:</p>
                            <p className="font-medium">{selectedOrder.customerEmail}</p>
                          </div>
                        )}
                        {selectedOrder.deliveryAddress && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">Endereço:</p>
                            <p className="font-medium">{selectedOrder.deliveryAddress}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Itens do Pedido</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{getMenuItemName(item.menuItemId)}</p>
                            {item.customizations && item.customizations.length > 0 && (
                              <p className="text-sm text-gray-600">
                                Personalizações: {item.customizations.join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{item.quantity}x {item.unitPrice} AOA</p>
                            <p className="text-sm text-gray-600">= {item.subtotal} AOA</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Resumo do Pedido</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Status:</p>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                            {getStatusText(selectedOrder.status)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Localização:</p>
                          <p className="font-medium">{getLocationName(selectedOrder.locationId)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Tipo:</p>
                          <p className="font-medium">{getOrderTypeText(selectedOrder.orderType)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Pagamento:</p>
                          <p className="font-medium">{selectedOrder.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total:</p>
                          <p className="text-xl font-bold text-red-600">{selectedOrder.totalAmount} AOA</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Data:</p>
                          <p className="font-medium">{new Date(selectedOrder.createdAt!).toLocaleString('pt-AO')}</p>
                        </div>
                      </div>
                      {selectedOrder.notes && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600">Observações:</p>
                          <p className="font-medium">{selectedOrder.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Update Actions */}
                  <div className="flex gap-2">
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => updateStatusMutation.mutate({ orderId: selectedOrder.id, status: e.target.value })}
                      className="border rounded-lg px-4 py-2 flex-1"
                    >
                      <option value="received">Recebido</option>
                      <option value="preparing">Preparando</option>
                      <option value="ready">Pronto</option>
                      <option value="delivered">Entregue</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}