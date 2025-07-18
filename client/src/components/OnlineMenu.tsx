import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MENU_ITEMS, MENU_CATEGORIES, LOCATIONS, generateOrderId, createWhatsAppOrderMessage, formatPrice } from '../lib/constants';
import EnhancedCart from './EnhancedCart';
import OrderSuccessModal from './OrderSuccessModal';
import OrderTracking from './OrderTracking';
import { useAuth } from '../hooks/useAuth';

interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  preparationTime: number;
  customizations: string[];
  quantity: number;
}

interface OnlineMenuProps {
  locationId: string;
  onOrderCreated?: (order: any) => void;
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
  // Estados com persistência no localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`cart_${locationId}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<any | null>(null);
  const [showTracking, setShowTracking] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState('');
  
  const [customerInfo, setCustomerInfo] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`customerInfo_${locationId}`);
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      name: '',
      phone: '',
      email: '',
      address: '',
      orderType: 'delivery' as 'delivery' | 'takeaway' | 'dine-in',
      paymentMethod: 'cash' as 'cash' | 'card' | 'transfer',
      notes: '',
      tableId: null as number | null
    };
  });

  const { isAuthenticated } = useAuth(); // Detectar se admin está logado

  // Dados estáticos do menu
  const menuItems = MENU_ITEMS.filter(item => item.available);
  const categories = MENU_CATEGORIES;
  const currentLocation = LOCATIONS.find(loc => loc.id === locationId) || LOCATIONS[0];

  // Salvar carrinho no localStorage automaticamente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`cart_${locationId}`, JSON.stringify(cart));
    }
  }, [cart, locationId]);

  // Salvar informações do cliente no localStorage automaticamente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`customerInfo_${locationId}`, JSON.stringify(customerInfo));
    }
  }, [customerInfo, locationId]);

  // Carregar carrinho e dados quando a localização muda
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem(`cart_${locationId}`);
      const savedCustomerInfo = localStorage.getItem(`customerInfo_${locationId}`);
      
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (error) {
          console.error('Erro ao recuperar carrinho:', error);
          setCart([]);
        }
      } else {
        setCart([]);
      }
      
      if (savedCustomerInfo) {
        try {
          setCustomerInfo(JSON.parse(savedCustomerInfo));
        } catch (error) {
          console.error('Erro ao recuperar informações do cliente:', error);
          setCustomerInfo({
            name: '',
            phone: '',
            email: '',
            address: '',
            orderType: 'delivery' as 'delivery' | 'takeaway' | 'dine-in',
            paymentMethod: 'cash' as 'cash' | 'card' | 'transfer',
            notes: '',
            tableId: null as number | null
          });
        }
      }
    }
  }, [locationId]);

  // Mesas disponíveis simuladas (para dine-in)
  const availableTables = [
    { id: 1, number: 1, capacity: 4, status: 'available' },
    { id: 2, number: 2, capacity: 2, status: 'available' },
    { id: 3, number: 3, capacity: 6, status: 'available' },
    { id: 4, number: 4, capacity: 4, status: 'available' },
    { id: 5, number: 5, capacity: 8, status: 'available' }
  ];

  // Função para criar pedido via WhatsApp
  const createOrder = async (orderData: any) => {
    const orderId = generateOrderId();
    const total = calculateTotal();
    
    // Simular criação de pedido local
    const order = {
      id: orderId,
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerEmail: customerInfo.email,
      deliveryAddress: customerInfo.address,
      orderType: customerInfo.orderType,
      locationId: locationId,
      tableId: customerInfo.tableId,
      totalAmount: total,
      paymentMethod: customerInfo.paymentMethod,
      notes: customerInfo.notes,
      status: 'received',
      createdAt: new Date().toISOString(),
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customizations: item.customizations
      }))
    };

    // Criar mensagem WhatsApp
    const whatsappMessage = createWhatsAppOrderMessage({
      customerInfo,
      cart,
      orderId,
      location: currentLocation,
      total
    });

    // Abrir WhatsApp
    const whatsappUrl = `https://wa.me/244949639932?text=${whatsappMessage}`;
    window.open(whatsappUrl, '_blank');

    // Limpar carrinho e dados após envio
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
    
    // Limpar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`cart_${locationId}`);
      localStorage.removeItem(`customerInfo_${locationId}`);
    }
    
    // Mostrar modal de sucesso
    setLastCreatedOrder(order);
    setIsSuccessModalOpen(true);
    
    onOrderCreated?.(order);

    return order;
  };

  const filteredItems = selectedCategory === 'Todos' 
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const addToCart = (item: any, customizations: string[] = []) => {
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

  const calculateTotal = () => {
    const itemsTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = customerInfo.orderType === 'delivery' ? currentLocation.deliveryFee : 0;
    return itemsTotal + deliveryFee;
  };

  const getTotalPrice = () => {
    return calculateTotal();
  };

  // Função para limpar completamente o carrinho e dados (útil para admin)
  const clearAllData = () => {
    setCart([]);
    setCustomerInfo({
      name: '',
      phone: '',
      email: '',
      address: '',
      orderType: 'delivery' as 'delivery' | 'takeaway' | 'dine-in',
      paymentMethod: 'cash' as 'cash' | 'card' | 'transfer',
      notes: '',
      tableId: null as number | null
    });
    
    if (typeof window !== 'undefined') {
      // Limpar todos os dados salvos de todas as localizações
      ['ilha', 'talatona', 'movel'].forEach(loc => {
        localStorage.removeItem(`cart_${loc}`);
        localStorage.removeItem(`customerInfo_${loc}`);
      });
    }
  };

  const handleSubmitOrder = () => {
    if (cart.length === 0) return;

    const orderData = {
      customerInfo,
      cart,
      locationId,
      total: calculateTotal()
    };

    console.log('Submitting order via WhatsApp:', orderData);
    createOrder(orderData);
  };

  const getLocationName = (id: string) => {
    switch (id) {
      case 'ilha': return 'Las Tortillas Ilha';
      case 'talatona': return 'Las Tortillas Talatona';
      case 'movel': return 'Las Tortillas Móvel';
      default: return 'Las Tortillas';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen relative">
      {/* Simplified background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-red-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-60 right-16 w-12 h-12 bg-orange-100 rounded-full opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-14 h-14 bg-red-50 rounded-full opacity-25 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      
      {/* Unified Header with Location Selection */}
      <div className="bg-white shadow-md text-gray-800 sticky top-0 z-40 border-b border-gray-200">
        {/* Main Header */}
        <div className="p-3 sm:p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🌮</div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-gray-800">Las Tortillas</h1>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Pedidos Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={onBackToSite}
                className="bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-300 text-xs sm:text-sm font-semibold border border-gray-300"
              >
                🏠 Voltar
              </button>
              {!showTracking && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className={`relative p-3 sm:p-4 rounded-lg transition-all duration-300 border ${cart.length > 0 ? 'bg-red-500 text-white border-red-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-red-500 hover:text-white hover:border-red-600'}`}
                >
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l1.5-6m10 0v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-orange-500 text-white text-xs sm:text-sm rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-bold shadow-lg">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Location Selection Bar */}
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3">
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:gap-4">
              <span className="text-xs sm:text-sm font-semibold text-gray-700 flex-shrink-0 flex items-center">
                📍 Localização: {getLocationName(locationId)}
              </span>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onLocationChange('ilha')}
                  className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm font-semibold w-full sm:w-auto ${
                    locationId === 'ilha'
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  🏝️ Ilha
                </button>
                <button
                  onClick={() => onLocationChange('talatona')}
                  className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm font-semibold w-full sm:w-auto ${
                    locationId === 'talatona'
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  🏢 Talatona
                </button>
                <button
                  onClick={() => onLocationChange('movel')}
                  className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 text-xs sm:text-sm font-semibold w-full sm:w-auto ${
                    locationId === 'movel'
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  🚚 Móvel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Quick Access Panel - apenas para admins logados */}
      {isAuthenticated && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 border-b">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👨‍💼</span>
                <div>
                  <h3 className="text-white font-bold text-sm">Modo Administrador</h3>
                  <p className="text-blue-100 text-xs">Funcionalidades especiais ativadas</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    // Preenchimento automático para teste rápido
                    setCustomerInfo({
                      ...customerInfo,
                      name: 'Admin Test',
                      phone: '+244999888777',
                      email: 'admin@lastortillas.ao',
                      address: 'Luanda Centro',
                      orderType: 'delivery',
                      paymentMethod: 'cash',
                      notes: 'Pedido de teste - Admin'
                    });
                  }}
                  className="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                >
                  <span>⚡</span>
                  Preencher Teste
                </button>
                
                <a
                  href="/admin"
                  className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-yellow-600 transition-colors flex items-center gap-1.5"
                >
                  <span>📊</span>
                  Painel Admin
                </a>
                
                <button
                  onClick={() => {
                    // Adicionar um item popular automaticamente para teste
                    const popularItem = menuItems.find(item => item.name.includes('Nachos'));
                    if (popularItem) {
                      addToCart(popularItem);
                    }
                  }}
                  className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors flex items-center gap-1.5"
                >
                  <span>🌮</span>
                  Add Popular
                </button>
                
                <button
                  onClick={clearAllData}
                  className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors flex items-center gap-1.5"
                >
                  <span>🗑️</span>
                  Limpar Tudo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="sticky top-20 sm:top-24 z-30 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6">
            <button
              onClick={() => setShowTracking(false)}
              className={`flex-1 sm:flex-none px-6 sm:px-8 py-3.5 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
                !showTracking
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-red-500 hover:text-white border border-gray-300'
              }`}
            >
              <span className="text-base sm:text-lg mr-2">🍽️</span>
              Menu
            </button>
            <button
              onClick={() => setShowTracking(true)}
              className={`flex-1 sm:flex-none px-6 sm:px-8 py-3.5 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
                showTracking
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-red-500 hover:text-white border border-gray-300'
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
                    className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg whitespace-nowrap transition-all duration-300 text-sm sm:text-base flex-shrink-0 font-semibold border ${
                      selectedCategory === category
                        ? 'bg-red-500 text-white shadow-md border-red-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-red-500 hover:border-red-500 hover:text-white'
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
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
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
                      ? 'bg-red-500 text-white hover:bg-red-600'
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
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-gray-600 text-4xl mb-4">📱</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Como rastrear seu pedido?</h3>
                <p className="text-gray-600 mb-4">
                  Digite o número do seu pedido no campo acima para acompanhar o status em tempo real.
                </p>
                <div className="text-sm text-gray-600">
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
                {filteredItems.map((item: any, index) => (
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
        onSubmitOrder={handleSubmitOrder}
        locationId={locationId}
        isSubmitting={false}
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
  item: any; 
  onAddToCart: (item: any, customizations: string[]) => void;
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
          src={item.image}
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
            className="absolute top-3 left-3 bg-red-500/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md backdrop-blur-sm z-20"
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
{formatPrice(item.price)}
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
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-300 font-semibold border ${
                    selectedCustomizations.includes(customization)
                      ? 'bg-red-500 text-white shadow-md border-red-500'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-red-500 hover:text-white hover:border-red-500'
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
          className="w-full bg-red-500 text-white px-6 py-3.5 rounded-lg hover:bg-red-600 transition-all duration-300 text-base font-semibold shadow-md hover:shadow-lg group flex items-center justify-center space-x-2"
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