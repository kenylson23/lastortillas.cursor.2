import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { MenuItem, Order, OrderItem } from '@shared/schema';
import EnhancedCart from './EnhancedCart';
import OrderSuccessModal from './OrderSuccessModal';
import OrderTracking from './OrderTracking';
import { useAuth } from '../hooks/useAuth';

interface CartItem extends MenuItem {
  quantity: number;
  customizations: string[];
}

interface OnlineMenuProps {
  locationId: string;
  tableId?: number;
  tableNumber?: number;
  qrCode?: string;
  onOrderCreated?: (order: Order) => void;
  onLocationChange?: (locationId: string) => void;
  onBackToSite?: () => void;
}

export default function OnlineMenu({ 
  locationId, 
  tableId,
  tableNumber,
  qrCode,
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
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);
  const [showTracking, setShowTracking] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [quickSearchFocus, setQuickSearchFocus] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  
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

  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth(); // Detectar se admin está logado

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

  // Atualizar informações da mesa quando QR code é escaneado
  useEffect(() => {
    if (tableId && tableNumber) {
      setCustomerInfo(prev => ({
        ...prev,
        tableId: tableId,
        orderType: 'dine-in', // Automaticamente configurar como "comer no local"
        address: '' // Limpar endereço já que é mesa no restaurante
      }));
      
      // Mostrar notificação visual que a mesa foi identificada
      console.log(`Mesa ${tableNumber} identificada automaticamente via QR Code`);
    }
  }, [tableId, tableNumber]);

  // Keyboard shortcuts for better navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only activate shortcuts when not typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case '/':
          e.preventDefault();
          document.getElementById('search-input')?.focus();
          break;
        case 'c':
          if (e.ctrlKey || e.metaKey) return; // Don't override copy
          e.preventDefault();
          if (cart.length > 0) setIsCartOpen(true);
          break;
        case 'Escape':
          e.preventDefault();
          setIsCartOpen(false);
          setShowAdminPanel(false);
          setSearchQuery('');
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          if (e.ctrlKey || e.metaKey) return;
          e.preventDefault();
          const categoryIndex = parseInt(e.key) - 1;
          const availableCategories = ['Todos', ...Array.from(new Set(menuItems.map((item: MenuItem) => item.category)))];
          if (categoryIndex < availableCategories.length) {
            setSelectedCategory(availableCategories[categoryIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart.length]);

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
      // Limpar carrinho e dados do cliente após pedido bem-sucedido
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
      
      // Limpar localStorage também
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`cart_${locationId}`);
        localStorage.removeItem(`customerInfo_${locationId}`);
      }
      
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

  const filteredItems = useMemo(() => {
    let items = selectedCategory === 'Todos' 
      ? menuItems
      : menuItems.filter((item: MenuItem) => item.category === selectedCategory);
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }
    
    return items;
  }, [menuItems, selectedCategory, searchQuery]);

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
    <div className="bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen relative">
      {/* Simplified background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 bg-red-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-60 right-16 w-12 h-12 bg-orange-100 rounded-full opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-14 h-14 bg-red-50 rounded-full opacity-25 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      
      {/* Clean Header */}
      <div className="bg-white shadow-sm text-gray-800 sticky top-0 z-40 border-b border-gray-200">
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🌮</div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-gray-800">Las Tortillas</h1>
              
              {/* QR Code Table Indicator */}
              {tableId && tableNumber && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ml-2"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Mesa {tableNumber}</span>
                </motion.div>
              )}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Location Selector */}
              <div className="relative">
                <select
                  value={locationId}
                  onChange={(e) => onLocationChange(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded-lg text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                >
                  <option value="">📍 Selecionar Local</option>
                  <option value="ilha">🏖️ Las Tortillas Ilha</option>
                  <option value="talatona">🏢 Las Tortillas Talatona</option>
                  <option value="movel">🚐 Las Tortillas Móvel</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>

              {/* Cart Button */}
              {!showTracking && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                    cart.length > 0 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l1.5-6m10 0v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  <span className="hidden sm:inline text-sm">
                    {cart.length > 0 ? `Carrinho (${cart.reduce((sum, item) => sum + item.quantity, 0)})` : 'Carrinho'}
                  </span>
                  {cart.length > 0 && (
                    <span className="sm:hidden absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </button>
              )}

              {/* Admin Access - Discrete */}
              {isAuthenticated && (
                <button
                  onClick={() => setShowAdminPanel(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Ferramentas Admin"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-16 sm:top-20 z-30 bg-white shadow-sm border-b border-gray-200">
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
            <>
              {/* Quick Search Bar */}
              <div className="mb-4">
                <div className="relative max-w-md">
                  <input
                    id="search-input"
                    type="text"
                    placeholder="🔍 Buscar pratos... (Pressione / para focar)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setQuickSearchFocus(true)}
                    onBlur={() => setQuickSearchFocus(false)}
                    className={`w-full px-4 py-3 pl-12 pr-4 rounded-lg border-2 transition-all duration-300 text-sm ${
                      quickSearchFocus || searchQuery
                        ? 'border-red-500 bg-white shadow-md ring-2 ring-red-100'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <div className="mt-2 text-sm text-gray-600">
                    {filteredItems.length} resultado{filteredItems.length !== 1 ? 's' : ''} para "{searchQuery}"
                  </div>
                )}
              </div>

              {/* Navigation Breadcrumb & Quick Actions */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>📍 {getLocationName(locationId)}</span>
                  <span>→</span>
                  <span className="font-medium text-red-600">{selectedCategory}</span>
                  {searchQuery && (
                    <>
                      <span>→</span>
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded">Busca: "{searchQuery}"</span>
                    </>
                  )}
                </div>
                
                {/* Keyboard Shortcuts Info */}
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Atalhos</span>
                </button>
              </div>

              {/* Quick Actions Panel */}
              {showQuickActions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm">⚡ Navegação Rápida</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <kbd className="px-2 py-1 bg-white rounded border border-gray-300 font-mono">/</kbd>
                      <span>Focar na busca</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <kbd className="px-2 py-1 bg-white rounded border border-gray-300 font-mono">C</kbd>
                      <span>Abrir carrinho</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <kbd className="px-2 py-1 bg-white rounded border border-gray-300 font-mono">ESC</kbd>
                      <span>Fechar modais</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <kbd className="px-2 py-1 bg-white rounded border border-gray-300 font-mono">1-6</kbd>
                      <span>Categorias</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Category Filters */}
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
            </>
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

      {/* Admin Panel Modal - Discrete */}
      {showAdminPanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  🛠️ Ferramentas Admin
                </h3>
                <button
                  onClick={() => setShowAdminPanel(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Quick Test Data */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">🎯 Teste Rápido</h4>
                <button
                  onClick={() => {
                    setCustomerInfo({
                      name: 'João Silva',
                      phone: '+244 912 345 678',
                      email: 'joao@exemplo.com',
                      address: 'Rua das Flores, 123 - Talatona',
                      orderType: 'delivery' as const,
                      paymentMethod: 'cash' as const,
                      notes: 'Teste admin - pedido rápido',
                      tableId: null
                    });
                    setShowAdminPanel(false);
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Preencher Dados de Teste
                </button>
              </div>

              {/* Popular Items */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">🌟 Itens Populares</h4>
                <div className="grid grid-cols-2 gap-2">
                  {menuItems.slice(0, 4).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        addToCart(item, []);
                        setShowAdminPanel(false);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg transition-colors text-xs"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">🚀 Navegação</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      window.location.href = '/admin';
                    }}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    Painel Administrativo
                  </button>
                  <button
                    onClick={() => {
                      clearAllData();
                      setShowAdminPanel(false);
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    Limpar Todos os Dados
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
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