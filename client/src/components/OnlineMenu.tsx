import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { MenuItem, Order, OrderItem } from '@shared/schema';
import EnhancedCart from './EnhancedCart';
import OrderSuccessModal from './OrderSuccessModal';
import OrderTracking from './OrderTracking';

interface CartItem extends MenuItem {
  quantity: number;
  customizations: string[];
}

interface OnlineMenuProps {
  locationId: string;
  onOrderCreated?: (order: Order) => void;
}

export default function OnlineMenu({ locationId, onOrderCreated }: OnlineMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);
  const [showTracking, setShowTracking] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    orderType: 'delivery' as 'delivery' | 'takeaway' | 'dine-in',
    paymentMethod: 'cash' as 'cash' | 'card' | 'transfer',
    notes: '',
    tableId: null as number | null
  });

  const queryClient = useQueryClient();

  const { data: menuItems = [], isLoading, error } = useQuery({
    queryKey: ['/api/menu-items'],
    queryFn: async () => {
      console.log('Fetching menu items...');
      const response = await apiRequest('GET', '/api/menu-items');
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Menu items data:', data);
      return data;
    }
  });

  const { data: availableTables = [] } = useQuery({
    queryKey: ['/api/tables', locationId],
    queryFn: async () => {
      console.log('Fetching tables for location:', locationId);
      const response = await fetch(`/api/tables?location=${locationId}`);
      console.log('Tables response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to fetch tables');
      }
      const data = await response.json();
      console.log('Tables data:', data);
      return data;
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      console.log('Creating order with data:', orderData);
      const response = await apiRequest('POST', '/api/orders', orderData);
      const result = await response.json();
      console.log('Order creation result:', result);
      return result;
    },
    onSuccess: (order) => {
      setCart([]);
      setCustomerInfo({
        name: '',
        phone: '',
        email: '',
        address: '',
        orderType: 'delivery',
        paymentMethod: 'cash',
        notes: '',
        tableId: null
      });
      setIsCartOpen(false);
      
      // Show enhanced success modal
      setLastCreatedOrder(order);
      setIsSuccessModalOpen(true);
      
      onOrderCreated?.(order);
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      // Invalidar todas as queries relacionadas a mesas para sincronizar status
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0] === '/api/tables' 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
    },
    onError: (error) => {
      console.error('Order creation failed:', error);
      alert(`Erro ao criar pedido: ${error.message}`);
    }
  });

  const categories = ['Todos', ...Array.from(new Set(menuItems.map((item: MenuItem) => item.category)))];

  const filteredItems = selectedCategory === 'Todos' 
    ? menuItems
    : menuItems.filter((item: MenuItem) => item.category === selectedCategory);

  // Debug logs (temporarily enabled for troubleshooting)
  console.log('OnlineMenu - menuItems:', menuItems);
  console.log('OnlineMenu - filteredItems:', filteredItems);
  console.log('OnlineMenu - categories:', categories);
  console.log('OnlineMenu - selectedCategory:', selectedCategory);

  const addToCart = (item: MenuItem, customizations: string[] = []) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => 
        cartItem.id === item.id && 
        JSON.stringify(cartItem.customizations) === JSON.stringify(customizations)
      );

      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id && 
          JSON.stringify(cartItem.customizations) === JSON.stringify(customizations)
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [...prev, { ...item, quantity: 1, customizations }];
    });
  };

  const updateQuantity = (itemId: number, customizations: string[], newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(prev => prev.filter(item => 
        !(item.id === itemId && JSON.stringify(item.customizations) === JSON.stringify(customizations))
      ));
    } else {
      setCart(prev => prev.map(item =>
        item.id === itemId && JSON.stringify(item.customizations) === JSON.stringify(customizations)
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const handleSubmitOrder = () => {
    if (cart.length === 0) return;

    const orderItems = cart.map(item => ({
      menuItemId: item.id,
      quantity: item.quantity,
      unitPrice: item.price,
      customizations: item.customizations || [],
      subtotal: (parseFloat(item.price) * item.quantity).toString()
    }));

    const orderData = {
      order: {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email || undefined,
        deliveryAddress: customerInfo.orderType === 'delivery' ? customerInfo.address : undefined,
        orderType: customerInfo.orderType,
        locationId,
        totalAmount: getTotalPrice().toString(),
        paymentMethod: customerInfo.paymentMethod,
        paymentStatus: 'pending',
        notes: customerInfo.notes || undefined,
        estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000)
      },
      items: orderItems
    };

    console.log('Submitting order data:', orderData);
    createOrderMutation.mutate(orderData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Las Tortillas Online</h1>
          {!showTracking && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-red-700 p-2 rounded-full hover:bg-red-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l1.5-6m10 0v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-16 z-30 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setShowTracking(false)}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                !showTracking
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🍽️ Menu
            </button>
            <button
              onClick={() => setShowTracking(true)}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                showTracking
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📍 Rastrear Pedido
            </button>
          </div>
          
          {!showTracking && (
            <div className="flex overflow-x-auto gap-2 pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto p-4">
        {showTracking ? (
          /* Order Tracking Section */
          <div className="bg-white">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Rastrear Pedido</h2>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número do Pedido
                  </label>
                  <input
                    type="text"
                    value={trackingOrderId}
                    onChange={(e) => setTrackingOrderId(e.target.value)}
                    placeholder="Digite o número do seu pedido (ex: 1, 2, 3...)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => {
                    if (trackingOrderId.trim()) {
                      // The OrderTracking component will handle the actual tracking
                    }
                  }}
                  disabled={!trackingOrderId.trim()}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    trackingOrderId.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Buscar
                </button>
              </div>
            </div>
            
            {trackingOrderId.trim() && (
              <div className="mt-6">
                <OrderTracking orderId={trackingOrderId} />
              </div>
            )}
            
            {!trackingOrderId.trim() && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <div className="text-blue-600 text-4xl mb-4">📱</div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Como rastrear seu pedido?</h3>
                <p className="text-blue-700 mb-4">
                  Digite o número do seu pedido no campo acima para acompanhar o status em tempo real.
                </p>
                <div className="text-sm text-blue-600">
                  <p>💡 Você recebeu o número do pedido na confirmação</p>
                  <p>📞 Dúvidas? Entre em contato: +244 949 639 932</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Menu Items Section */
          <>
            {filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">Nenhum item encontrado.</p>
                <p className="text-gray-400 text-sm mt-2">Verifique se há itens disponíveis ou selecione outra categoria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item: MenuItem) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Enhanced Cart Modal */}
      <EnhancedCart
        cart={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onSubmitOrder={(orderData) => {
          console.log('OnlineMenu received order data from EnhancedCart:', orderData);
          createOrderMutation.mutate(orderData);
        }}
        locationId={locationId}
        isSubmitting={createOrderMutation.isPending}
        availableTables={availableTables}
      />

      {/* Success Modal */}
      <OrderSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        order={lastCreatedOrder}
        locationId={locationId}
        onTrackOrder={(orderId) => {
          setTrackingOrderId(orderId);
          setShowTracking(true);
        }}
      />
    </div>
  );
}

// Menu Item Card Component
function MenuItemCard({ item, onAddToCart }: { item: MenuItem; onAddToCart: (item: MenuItem, customizations: string[]) => void }) {
  const [selectedCustomizations, setSelectedCustomizations] = useState<string[]>([]);

  const toggleCustomization = (customization: string) => {
    setSelectedCustomizations(prev =>
      prev.includes(customization)
        ? prev.filter(c => c !== customization)
        : [...prev, customization]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <img
        src={item.image || 'https://via.placeholder.com/300x200'}
        alt={item.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
        <p className="text-gray-600 text-sm mb-3">{item.description}</p>
        
        {/* Customizations */}
        {item.customizations && item.customizations.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Personalizações:</p>
            <div className="flex flex-wrap gap-2">
              {item.customizations.map(customization => (
                <button
                  key={customization}
                  onClick={() => toggleCustomization(customization)}
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${
                    selectedCustomizations.includes(customization)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {customization}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-red-600">{item.price} AOA</span>
          <button
            onClick={() => onAddToCart(item, selectedCustomizations)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Adicionar
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          Tempo de preparo: {item.preparationTime} min
        </div>
      </div>
    </motion.div>
  );
}