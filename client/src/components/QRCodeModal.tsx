import { useState } from 'react';
import { QrCode, Download, Printer, X, Copy, Check } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: {
    id: number;
    tableNumber: number;
    locationId: string;
    seats: number;
    qrCode?: string;
    qrCodeUrl?: string;
  };
}

export default function QRCodeModal({ isOpen, onClose, table }: QRCodeModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{
    qrCodeUrl: string;
    qrCode: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getLocationName = (locationId: string) => {
    switch (locationId) {
      case 'ilha': return 'Las Tortillas Ilha';
      case 'talatona': return 'Las Tortillas Talatona';
      case 'movel': return 'Las Tortillas Móvel';
      default: return 'Las Tortillas';
    }
  };

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/tables/${table.id}/qr-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setQrCodeData({
          qrCodeUrl: data.qrCodeUrl,
          qrCode: data.qrCode
        });
      } else {
        throw new Error('Erro ao gerar QR code');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao gerar QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeData) {
      window.open(`/api/tables/${table.id}/qr-code.svg`, '_blank');
    }
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && qrCodeData) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - Mesa ${table.tableNumber}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px;
                background: white;
              }
              .header {
                margin-bottom: 20px;
                color: #DC2626;
              }
              .qr-container {
                margin: 20px 0;
                padding: 20px;
                border: 2px solid #DC2626;
                border-radius: 15px;
                background: #FEF2F2;
              }
              .instructions {
                margin-top: 20px;
                font-size: 14px;
                color: #666;
              }
              .logo {
                font-size: 24px;
                font-weight: bold;
                color: #DC2626;
                margin-bottom: 10px;
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">🌮 Las Tortillas Mexican Grill</div>
              <h2>Mesa ${table.tableNumber} - ${getLocationName(table.locationId)}</h2>
              <p>Capacidade: ${table.seats} pessoas</p>
            </div>
            
            <div class="qr-container">
              <img src="/api/tables/${table.id}/qr-code.svg" alt="QR Code Mesa ${table.tableNumber}" style="max-width: 300px;" />
            </div>
            
            <div class="instructions">
              <h3>📱 Como usar:</h3>
              <p>1. Aponte a câmera do seu celular para o QR Code</p>
              <p>2. Toque na notificação que aparecer</p>
              <p>3. Faça seu pedido diretamente pelo site</p>
              <p>4. Aguarde a entrega na sua mesa</p>
              <br>
              <p><strong>📞 Dúvidas? Ligue: +244 949 639 932</strong></p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const copyToClipboard = async () => {
    if (qrCodeData) {
      try {
        await navigator.clipboard.writeText(qrCodeData.qrCodeUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Erro ao copiar:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <QrCode className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">QR Code da Mesa</h2>
              <p className="text-sm text-gray-600">Mesa {table.tableNumber} - {getLocationName(table.locationId)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!qrCodeData ? (
            <div className="text-center py-8">
              <div className="bg-red-50 p-8 rounded-xl mb-6">
                <QrCode className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Gerar QR Code para Mesa {table.tableNumber}
                </h3>
                <p className="text-gray-600 mb-6">
                  Crie um QR code único que permitirá aos clientes fazer pedidos diretamente da mesa.
                </p>
                <button
                  onClick={generateQRCode}
                  disabled={isGenerating}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 font-semibold"
                >
                  {isGenerating ? 'Gerando...' : '🔥 Gerar QR Code'}
                </button>
              </div>
              
              <div className="text-left bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">💡 Como funciona:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Clientes escaneiam o QR com o celular</li>
                  <li>• Abre o menu automaticamente com a mesa selecionada</li>
                  <li>• Fazem pedido diretamente pelo site</li>
                  <li>• Pedido aparece automaticamente na cozinha</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* QR Code Display */}
              <div className="text-center">
                <div className="bg-white p-6 rounded-xl border-2 border-red-200 inline-block mb-4">
                  <img 
                    src={`/api/tables/${table.id}/qr-code.svg`} 
                    alt={`QR Code Mesa ${table.tableNumber}`}
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  QR Code para Mesa {table.tableNumber} - {table.seats} lugares
                </p>
              </div>

              {/* URL Display */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Link do QR Code:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={qrCodeData.qrCodeUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                    title="Copiar link"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={downloadQRCode}
                  className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Baixar SVG</span>
                </button>
                <button
                  onClick={printQRCode}
                  className="flex-1 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center justify-center space-x-2"
                >
                  <Printer className="w-5 h-5" />
                  <span>Imprimir</span>
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">📋 Instruções:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Imprima o QR code e coloque na mesa</li>
                  <li>• Oriente os clientes a escanearem com a câmera</li>
                  <li>• O pedido chegará automaticamente na cozinha</li>
                  <li>• Acompanhe o status no painel da cozinha</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}