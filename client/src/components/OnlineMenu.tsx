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
  onLocationChange?: (locationId: string) => void;
  onBackToSite?: () => void;
}

export default function OnlineMenu({ 
  locationId, 
  onOrderCreated, 
  onLocationChange = () => {}, 
  onBackToSite = () => {} 
}: OnlineMenuProps) {
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

  const { data: availableTables = [], isLoading: tablesLoading, refetch: refetchTables } = useQuery({
    queryKey: ['/api/tables', locationId],
    queryFn: async () => {
      console.log('🔍 Fetching tables for location:', locationId);
      const response = await fetch(`/api/tables?location=${locationId}`);
      console.log('📡 Tables response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to fetch tables');
      }
      const data = await response.json();
      console.log('📊 Tables data received:', data);
      console.log('📊 Tables data length:', data.length);
      console.log('📊 Available tables:', data.filter(t => t.status === 'available'));
      return data;
    },
    staleTime: 5 * 1000, // 5 segundos para debug
    refetchOnWindowFocus: true,
    refetchOnMount: true
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
      // Forçar re-fetch das mesas
      queryClient.refetchQueries({ queryKey: ['/api/tables', locationId] });
      // Remover também do cache se necessário
      queryClient.removeQueries({ queryKey: ['/api/tables', locationId] });
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
  console.log('OnlineMenu - locationId:', locationId);
  console.log('OnlineMenu - availableTables:', availableTables);
  console.log('OnlineMenu - tablesLoading:', tablesLoading);

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

  const getLocationName = (id: string) => {
    switch (id) {
      case 'ilha': return 'Las Tortillas Ilha';
      case 'talatona': return 'Las Tortillas Talatona';
      case 'movel': return 'Las Tortillas Móvel';
      default: return 'Las Tortillas';
    }
  };

  return (
    <div className="bg-gradient-to-br from-orange-50/30 via-red-50/20 to-green-50/30 min-h-screen relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-fiesta rounded-full opacity-5 float-animation"></div>
        <div className="absolute top-60 right-16 w-20 h-20 bg-gradient-fresh rounded-full opacity-8 float-animation" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-24 h-24 bg-gradient-mexico rounded-full opacity-6 float-animation" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Unified Header with Location Selection */}
      <div className="glass-morphism backdrop-blur-xl bg-gradient-sunset/80 shadow-lg text-white sticky top-0 z-40 border-b border-white/10">
        {/* Main Header */}
        <div className="p-3 sm:p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🌮</div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide">Las Tortillas</h1>
                <p className="text-xs sm:text-sm text-orange-100 font-medium">Pedidos Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={onBackToSite}
                className="bg-white/20 text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-300 text-xs sm:text-sm font-semibold backdrop-blur-sm border border-white/20"
              >
                🏠 Voltar
              </button>
              {!showTracking && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className={`relative bg-white/20 p-3 sm:p-4 rounded-xl hover:bg-white/30 transition-all duration-300 backdrop-blur-sm border border-white/20 ${cart.length > 0 ? 'bg-white/30' : ''}`}
                >
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l1.5-6m10 0v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs sm:text-sm rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-bold shadow-lg animate-bounce">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Location Selection Bar */}
        <div className="bg-black bg-opacity-20 border-t border-orange-300 border-opacity-30">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:gap-4">
              <span className="text-xs sm:text-sm font-bold text-orange-100 flex-shrink-0 flex items-center">
                📍 Localização atual: {getLocationName(locationId)}
              </span>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onLocationChange('ilha')}
                  className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm font-bold w-full sm:w-auto hover-lift ${
                    locationId === 'ilha'
                      ? 'bg-white text-mexican-red shadow-fiesta'
                      : 'bg-transparent text-white border border-orange-300 hover:bg-white hover:text-mexican-red'
                  }`}
                >
                  🏝️ Ilha
                </button>
                <button
                  onClick={() => onLocationChange('talatona')}
                  className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm font-bold w-full sm:w-auto hover-lift ${
                    locationId === 'talatona'
                      ? 'bg-white text-mexican-red shadow-fiesta'
                      : 'bg-transparent text-white border border-orange-300 hover:bg-white hover:text-mexican-red'
                  }`}
                >
                  🏢 Talatona
                </button>
                <button
                  onClick={() => onLocationChange('movel')}
                  className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm font-bold w-full sm:w-auto hover-lift ${
                    locationId === 'movel'
                      ? 'bg-white text-mexican-red shadow-fiesta'
                      : 'bg-transparent text-white border border-orange-300 hover:bg-white hover:text-mexican-red'
                  }`}
                >
                  🚚 Móvel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-20 sm:top-24 z-30 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6">
            <button
              onClick={() => setShowTracking(false)}
              className={`flex-1 sm:flex-none px-6 sm:px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                !showTracking
                  ? 'bg-gradient-sunset/90 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="text-base sm:text-lg mr-2">🍽️</span>
              Menu
            </button>
            <button
              onClick={() => setShowTracking(true)}
              className={`flex-1 sm:flex-none px-6 sm:px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                showTracking
                  ? 'bg-gradient-mexico/90 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="text-base sm:text-lg mr-2">📍</span>
              Rastrear Pedido
            </button>
          </div>
          
          {!showTracking && (
            <div className="flex overflow-x-auto gap-2 pb-3 -mx-2 px-2">
              {categories.map((category, index) => {
                const categoryEmojis = ['🍽️', '🌮', '🥙', '🌯', '🫔', '🥗'];
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl whitespace-nowrap transition-all duration-300 text-sm sm:text-base flex-shrink-0 font-medium border ${
                      selectedCategory === category
                        ? 'bg-gradient-sunset/90 text-white shadow-md border-orange-200'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-sm sm:text-base mr-1.5">{categoryEmojis[index % categoryEmojis.length]}</span>
                    {category}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 relative z-10">
        {showTracking ? (
          /* Order Tracking Section */
          <div className="bg-white">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Rastrear Pedido</h2>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número do Pedido
                  </label>
                  <input
                    type="text"
                    value={trackingOrderId}
                    onChange={(e) => setTrackingOrderId(e.target.value)}
                    placeholder="Digite o número do seu pedido (ex: 1, 2, 3...)"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
                <button
                  onClick={() => {
                    if (trackingOrderId.trim()) {
                      // The OrderTracking component will handle the actual tracking
                    }
                  }}
                  disabled={!trackingOrderId.trim()}
                  className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredItems.map((item: MenuItem, index) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAddToCart={addToCart}
                    delay={index * 0.1}
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
function MenuItemCard({ 
  item, 
  onAddToCart, 
  delay = 0 
}: { 
  item: MenuItem; 
  onAddToCart: (item: MenuItem, customizations: string[]) => void;
  delay?: number;
}) {
  const [selectedCustomizations, setSelectedCustomizations] = useState<string[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  const toggleCustomization = (customization: string) => {
    setSelectedCustomizations(prev =>
      prev.includes(customization)
        ? prev.filter(c => c !== customization)
        : [...prev, customization]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay,
        type: "spring", 
        stiffness: 100,
        damping: 15 
      }}
      whileHover={{ y: -12, scale: 1.03 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 group cursor-pointer"
    >
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10"></div>
        <img
          src={item.image || '/api/placeholder/400/300'}
          alt={item.name}
          className="w-full h-48 sm:h-56 object-cover transition-all duration-700 group-hover:scale-110"
        />
        
        {/* Floating badges */}
        <motion.div 
          className="absolute top-3 right-3 bg-white/90 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-2xl shadow-md backdrop-blur-sm z-20"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
        >
          ⏱️ {item.preparationTime} min
        </motion.div>
        
        {item.category && (
          <motion.div 
            className="absolute top-3 left-3 bg-gradient-mexico/80 text-white text-xs font-semibold px-3 py-1.5 rounded-2xl shadow-md backdrop-blur-sm z-20"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {item.category}
          </motion.div>
        )}

        {/* Overlay gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10"></div>
        
        {/* Price overlay */}
        <div className="absolute bottom-4 left-4 z-20">
          <motion.div 
            className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {item.price} <span className="text-lg text-red-200">AOA</span>
          </motion.div>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-red-600 group-hover:text-red-700 transition-colors duration-300">
            {item.name}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>
        
        {/* Customizations */}
        {item.customizations && item.customizations.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700 flex items-center">
              <span className="mr-2">🌶️</span>
              Personalizações
            </p>
            <div className="flex flex-wrap gap-2">
              {item.customizations.map(customization => (
                <motion.button
                  key={customization}
                  onClick={() => toggleCustomization(customization)}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1.5 text-xs rounded-2xl transition-all duration-300 font-semibold border ${
                    selectedCustomizations.includes(customization)
                      ? 'bg-red-600 text-white shadow-md border-red-200 scale-105'
                      : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-red-500 hover:text-white hover:scale-105'
                  }`}
                >
                  {customization}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Action button */}
        <motion.button
          onClick={() => onAddToCart(item, selectedCustomizations)}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-red-600 text-white px-6 py-3.5 rounded-xl hover:bg-red-700 transition-all duration-300 text-base font-semibold shadow-md hover:shadow-lg group flex items-center justify-center space-x-2"
        >
          <motion.span
            animate={{ rotate: isHovered ? 360 : 0 }}
            transition={{ duration: 0.5 }}
            className="text-lg"
          >
            🛒
          </motion.span>
          <span>Adicionar ao Carrinho</span>
        </motion.button>
      </div>
    </motion.div>
  );
}