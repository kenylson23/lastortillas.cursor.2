import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { MenuItem, Order, OrderItem } from '@shared/schema';

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
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    orderType: 'delivery' as 'delivery' | 'takeaway' | 'dine-in',
    paymentMethod: 'cash' as 'cash' | 'card' | 'transfer',
    notes: ''
  });

  const queryClient = useQueryClient();

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['/api/menu'],
    queryFn: async () => {
      const response = await apiRequest('/api/menu');
      return response.json();
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      return response.json();
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
        notes: ''
      });
      setIsCartOpen(false);
      
      // Show success message
      alert(`Pedido #${order.id} criado com sucesso! Total: ${order.totalAmount} AOA`);
      
      onOrderCreated?.(order);
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    }
  });

  const categories = ['Todos', ...Array.from(new Set(menuItems.map((item: MenuItem) => item.category)))];

  const filteredItems = selectedCategory === 'Todos' 
    ? menuItems 
    : menuItems.filter((item: MenuItem) => item.category === selectedCategory);

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
      customizations: item.customizations,
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
        notes: customerInfo.notes || undefined,
        estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000) // 45 minutes from now
      },
      items: orderItems
    };

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
          <h1 className="text-2xl font-bold">Menu Online</h1>
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
        </div>
      </div>

      {/* Categories */}
      <div className="sticky top-16 z-30 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto p-4">
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
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item: MenuItem) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      </div>

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
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
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Carrinho</h2>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Carrinho vazio</p>
                ) : (
                  <>
                    {/* Cart Items */}
                    <div className="space-y-4 mb-6">
                      {cart.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="flex items-center gap-4 p-4 border rounded-lg">
                          <img
                            src={item.image || 'https://via.placeholder.com/80x80'}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.name}</h4>
                            {item.customizations.length > 0 && (
                              <p className="text-sm text-gray-600">
                                {item.customizations.join(', ')}
                              </p>
                            )}
                            <p className="text-red-600 font-bold">{item.price} AOA</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.customizations, item.quantity - 1)}
                              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.customizations, item.quantity + 1)}
                              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Customer Info Form */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Informações do Pedido</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Nome completo"
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                          className="border rounded-lg p-3"
                          required
                        />
                        <input
                          type="tel"
                          placeholder="Telefone"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                          className="border rounded-lg p-3"
                          required
                        />
                        <input
                          type="email"
                          placeholder="Email (opcional)"
                          value={customerInfo.email}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                          className="border rounded-lg p-3"
                        />
                        <select
                          value={customerInfo.orderType}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, orderType: e.target.value as any }))}
                          className="border rounded-lg p-3"
                        >
                          <option value="delivery">Delivery</option>
                          <option value="takeaway">Takeaway</option>
                          <option value="dine-in">Comer no local</option>
                        </select>
                        {customerInfo.orderType === 'delivery' && (
                          <input
                            type="text"
                            placeholder="Endereço de entrega"
                            value={customerInfo.address}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                            className="border rounded-lg p-3 md:col-span-2"
                            required
                          />
                        )}
                        <select
                          value={customerInfo.paymentMethod}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                          className="border rounded-lg p-3"
                        >
                          <option value="cash">Dinheiro</option>
                          <option value="card">Cartão</option>
                          <option value="transfer">Transferência</option>
                        </select>
                        <textarea
                          placeholder="Observações (opcional)"
                          value={customerInfo.notes}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                          className="border rounded-lg p-3 md:col-span-2"
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="border-t pt-6 mt-6">
                      <div className="flex justify-between text-xl font-bold mb-4">
                        <span>Total:</span>
                        <span>{getTotalPrice().toFixed(2)} AOA</span>
                      </div>
                      <button
                        onClick={handleSubmitOrder}
                        disabled={!customerInfo.name || !customerInfo.phone || createOrderMutation.isPending}
                        className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {createOrderMutation.isPending ? 'Processando...' : 'Finalizar Pedido'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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