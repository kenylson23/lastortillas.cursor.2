import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, MapPin, Phone, CopyIcon, Share } from 'lucide-react';
import { Order } from '@shared/schema';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  locationId: string;
  onTrackOrder?: (orderId: string) => void;
}

export default function OrderSuccessModal({ isOpen, onClose, order, locationId, onTrackOrder }: OrderSuccessModalProps) {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const getLocationName = (locationId: string) => {
    switch (locationId) {
      case 'ilha': return 'Las Tortillas Ilha';
      case 'talatona': return 'Las Tortillas Talatona';
      case 'movel': return 'Las Tortillas Móvel';
      default: return locationId;
    }
  };

  const getEstimatedTime = () => {
    if (order.orderType === 'delivery') return '45-60 minutos';
    if (order.orderType === 'takeaway') return '15-20 minutos';
    return '20-25 minutos';
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOrder = () => {
    const message = `🌮 Pedido Las Tortillas #${order.id}\n\n✅ Confirmado!\n💰 Total: ${order.totalAmount} AOA\n⏱️ Tempo estimado: ${getEstimatedTime()}\n📍 ${getLocationName(locationId)}\n\nAcompanhe seu pedido: ${window.location.origin}/rastreamento`;
    
    if (navigator.share) {
      navigator.share({
        title: `Pedido Las Tortillas #${order.id}`,
        text: message
      });
    } else {
      // Fallback para WhatsApp
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
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
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Icon */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
              >
                <CheckCircle className="w-10 h-10 text-green-600" />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-gray-900 mb-2"
              >
                Pedido Confirmado!
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600"
              >
                Seu pedido foi recebido com sucesso
              </motion.p>
            </div>

            {/* Order Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Número do Pedido</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-600">#{order.id}</span>
                  <button
                    onClick={copyOrderId}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Copiar número do pedido"
                  >
                    <CopyIcon className={`w-4 h-4 ${copied ? 'text-green-600' : 'text-gray-500'}`} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="font-bold text-xl text-green-600">{order.totalAmount} AOA</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Tempo Estimado
                </span>
                <span className="font-semibold text-orange-600">{getEstimatedTime()}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Local
                </span>
                <span className="font-semibold">{getLocationName(locationId)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Tipo de Pedido
                </span>
                <span className="font-semibold capitalize">
                  {order.orderType === 'delivery' ? 'Entrega' : 
                   order.orderType === 'takeaway' ? 'Retirada' : 'Mesa'}
                </span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <button
                onClick={() => {
                  if (onTrackOrder) {
                    onTrackOrder(order.id.toString());
                    onClose();
                  } else {
                    window.location.href = '/rastreamento';
                  }
                }}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Clock className="w-5 h-5" />
                Acompanhar Pedido
              </button>

              <div className="flex gap-3">
                <button
                  onClick={shareOrder}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Share className="w-4 h-4" />
                  Compartilhar
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>

            {/* Status Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <p className="text-sm text-blue-800 text-center">
                📱 Você receberá atualizações do seu pedido em breve
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}