import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem } from '@shared/schema';

interface CartItem extends MenuItem {
  quantity: number;
  customizations: string[];
}

interface EnhancedCartProps {
  cart: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (itemId: number, customizations: string[], newQuantity: number) => void;
  onSubmitOrder: (orderData: any) => void;
  locationId: string;
  isSubmitting?: boolean;
}

export default function EnhancedCart({
  cart,
  isOpen,
  onClose,
  onUpdateQuantity,
  onSubmitOrder,
  locationId,
  isSubmitting = false
}: EnhancedCartProps) {
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    orderType: 'delivery' as 'delivery' | 'takeaway' | 'dine-in',
    paymentMethod: 'cash' as 'cash' | 'card' | 'transfer',
    notes: ''
  });

  const [deliveryFee, setDeliveryFee] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(45);

  useEffect(() => {
    // Calcular taxa de entrega baseada no tipo de pedido
    if (customerInfo.orderType === 'delivery') {
      setDeliveryFee(500); // 500 AOA para delivery
      setEstimatedTime(45);
    } else {
      setDeliveryFee(0);
      setEstimatedTime(customerInfo.orderType === 'takeaway' ? 15 : 20);
    }
  }, [customerInfo.orderType]);

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const getTotalPrice = () => {
    return getSubtotal() + deliveryFee;
  };

  const getPreparationTime = () => {
    const maxTime = Math.max(...cart.map(item => item.preparationTime || 15));
    return maxTime + (customerInfo.orderType === 'delivery' ? 30 : 0);
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
        paymentStatus: 'pending',
        notes: customerInfo.notes || undefined,
        estimatedDeliveryTime: new Date(Date.now() + getPreparationTime() * 60 * 1000).toISOString()
      },
      items: orderItems
    };

    console.log('EnhancedCart submitting order:', orderData);

    onSubmitOrder(orderData);
  };

  const isFormValid = () => {
    return customerInfo.name.trim() !== '' && 
           customerInfo.phone.trim() !== '' && 
           (customerInfo.orderType !== 'delivery' || customerInfo.address.trim() !== '');
  };

  const getLocationName = (locationId: string) => {
    switch (locationId) {
      case 'ilha': return 'Las Tortillas Ilha';
      case 'talatona': return 'Las Tortillas Talatona';
      case 'movel': return 'Las Tortillas Móvel';
      default: return locationId;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Carrinho</h2>
                  <p className="text-sm text-gray-600">{getLocationName(locationId)}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🛒</div>
                  <p className="text-gray-500 text-lg">Seu carrinho está vazio</p>
                  <p className="text-gray-400 text-sm mt-2">Adicione alguns itens deliciosos!</p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {cart.map((item, index) => (
                      <motion.div
                        key={`${item.id}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <img
                          src={item.image || '/api/placeholder/80/80'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{item.name}</h4>
                          {item.customizations.length > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                              {item.customizations.join(', ')}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-red-600 font-bold">{item.price} AOA</p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onUpdateQuantity(item.id, item.customizations, item.quantity - 1)}
                                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                              >
                                −
                              </button>
                              <span className="w-8 text-center font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => onUpdateQuantity(item.id, item.customizations, item.quantity + 1)}
                                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Resumo do Pedido</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{getSubtotal().toFixed(2)} AOA</span>
                      </div>
                      {deliveryFee > 0 && (
                        <div className="flex justify-between">
                          <span>Taxa de entrega:</span>
                          <span>{deliveryFee.toFixed(2)} AOA</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-red-600">{getTotalPrice().toFixed(2)} AOA</span>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      <p>⏱️ Tempo estimado: {getPreparationTime()} minutos</p>
                    </div>
                  </div>

                  {/* Customer Info Form */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Informações do Pedido</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Nome completo *"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                        className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Telefone *"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email (opcional)"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <select
                        value={customerInfo.orderType}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, orderType: e.target.value as any }))}
                        className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="delivery">🚚 Delivery (+500 AOA)</option>
                        <option value="takeaway">🏃 Takeaway</option>
                        <option value="dine-in">🍽️ Comer no local</option>
                      </select>
                      {customerInfo.orderType === 'delivery' && (
                        <input
                          type="text"
                          placeholder="Endereço de entrega *"
                          value={customerInfo.address}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                          className="border rounded-lg p-3 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        />
                      )}
                      <select
                        value={customerInfo.paymentMethod}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                        className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="cash">💵 Dinheiro</option>
                        <option value="card">💳 Cartão</option>
                        <option value="transfer">📱 Transferência</option>
                      </select>
                      <textarea
                        placeholder="Observações (opcional)"
                        value={customerInfo.notes}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                        className="border rounded-lg p-3 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitOrder}
                    disabled={!isFormValid() || isSubmitting}
                    className={`w-full mt-6 py-4 rounded-lg font-semibold text-lg transition-colors ${
                      isFormValid() && !isSubmitting
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processando...
                      </div>
                    ) : (
                      `Fazer Pedido • ${getTotalPrice().toFixed(2)} AOA`
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}