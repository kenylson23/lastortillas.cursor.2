import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import OnlineMenu from '../components/OnlineMenu';
import { Order } from '@shared/schema';

export default function Menu() {
  const [, setLocation] = useLocation();
  const [selectedLocationId, setSelectedLocationId] = useState<string>('ilha');
  const [tableInfo, setTableInfo] = useState<{
    tableId?: number;
    tableNumber?: number;
    qrCode?: string;
  }>({});

  // Processar parâmetros da URL quando o QR code é escaneado
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tableId = urlParams.get('table');
    const locationId = urlParams.get('location');
    const qrCode = urlParams.get('code');
    const tableNumber = urlParams.get('t');

    if (tableId && locationId && qrCode && tableNumber) {
      // Atualizar informações da mesa
      setTableInfo({
        tableId: parseInt(tableId),
        tableNumber: parseInt(tableNumber),
        qrCode: qrCode
      });
      
      // Atualizar localização
      setSelectedLocationId(locationId);
      
      console.log('QR Code escaneado:', {
        tableId: parseInt(tableId),
        locationId,
        tableNumber: parseInt(tableNumber),
        qrCode
      });
    }
  }, []);

  const handleOrderCreated = (order: Order) => {
    // Modal melhorado já é exibido automaticamente no OnlineMenu
    // Não precisamos de mensagem adicional aqui
    console.log('Pedido criado com sucesso:', order);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Menu Component - Header será unificado dentro do componente */}
      <OnlineMenu
        locationId={selectedLocationId}
        tableId={tableInfo.tableId}
        tableNumber={tableInfo.tableNumber}
        qrCode={tableInfo.qrCode}
        onOrderCreated={handleOrderCreated}
        onLocationChange={setSelectedLocationId}
        onBackToSite={() => setLocation('/')}
      />
    </div>
  );
}