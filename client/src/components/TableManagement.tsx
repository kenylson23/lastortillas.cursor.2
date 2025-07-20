import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Users, MapPin, AlertCircle, CheckCircle, Clock, Wrench, X, Copy, Zap, Grid, QrCode } from 'lucide-react';
import { Table, InsertTable } from '@shared/schema';
import QRCodeModal from './QRCodeModal';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table | null;
  onSave: (table: Partial<Table>) => void;
  allTables: Table[];
}

function TableModal({ isOpen, onClose, table, onSave, allTables }: TableModalProps) {
  const [formData, setFormData] = useState<Partial<InsertTable>>({
    tableNumber: table?.tableNumber || 1,
    locationId: table?.locationId || 'talatona',
    seats: table?.seats || 2,
    status: table?.status || 'available'
  });

  const [bulkCreate, setBulkCreate] = useState(false);
  const [bulkQuantity, setBulkQuantity] = useState(5);
  const [startNumber, setStartNumber] = useState(1);

  // Auto-ajustar número da mesa ao mudar local
  useEffect(() => {
    if (!table && formData.locationId) {
      const tablesInLocation = allTables.filter(t => t.locationId === formData.locationId);
      const maxNumber = tablesInLocation.length > 0 
        ? Math.max(...tablesInLocation.map(t => t.tableNumber)) 
        : 0;
      const nextNumber = maxNumber + 1;
      setFormData(prev => ({ ...prev, tableNumber: nextNumber }));
      setStartNumber(nextNumber);
    }
  }, [formData.locationId, allTables, table]);

  const locations = [
    { id: 'talatona', name: 'Talatona' },
    { id: 'ilha', name: 'Ilha de Luanda' },
    { id: 'movel', name: 'Unidade Móvel' }
  ];

  const statusOptions = [
    { value: 'available', label: 'Disponível', color: 'bg-green-100 text-green-800' },
    { value: 'occupied', label: 'Ocupada', color: 'bg-red-100 text-red-800' },
    { value: 'reserved', label: 'Reservada', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'maintenance', label: 'Manutenção', color: 'bg-gray-100 text-gray-800' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (bulkCreate) {
      // Criar múltiplas mesas
      const tablesInLocation = allTables.filter(t => t.locationId === formData.locationId);
      const existingNumbers = tablesInLocation.map(t => t.tableNumber);
      
      for (let i = 0; i < bulkQuantity; i++) {
        let newNumber = startNumber + i;
        
        // Pular números já existentes
        while (existingNumbers.includes(newNumber)) {
          newNumber++;
        }
        
        const newTable = {
          ...formData,
          tableNumber: newNumber
        };
        
        onSave(newTable);
        existingNumbers.push(newNumber);
      }
    } else {
      onSave(formData);
    }
    
    onClose();
  };

  const getNextAvailableNumbers = (quantity: number) => {
    const tablesInLocation = allTables.filter(t => t.locationId === formData.locationId);
    const existingNumbers = new Set(tablesInLocation.map(t => t.tableNumber));
    const availableNumbers = [];
    let current = startNumber;
    
    while (availableNumbers.length < quantity) {
      if (!existingNumbers.has(current)) {
        availableNumbers.push(current);
      }
      current++;
    }
    
    return availableNumbers;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {table ? 'Editar Mesa' : 'Nova Mesa'}
          </h2>
          
          {!table && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBulkCreate(!bulkCreate)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors ${
                  bulkCreate 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {bulkCreate ? <Grid className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                {bulkCreate ? 'Criação em lote' : 'Criação rápida'}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Modo de criação em lote */}
          {bulkCreate && !table && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Grid className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Criação em Lote</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1">Quantidade</label>
                  <input
                    type="number"
                    value={bulkQuantity}
                    onChange={(e) => setBulkQuantity(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                    className="w-full p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max="20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1">Começar do nº</label>
                  <input
                    type="number"
                    value={startNumber}
                    onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                    className="w-full p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>
              </div>
              
              <div className="text-sm text-blue-700">
                <strong>Mesas a criar:</strong> {getNextAvailableNumbers(bulkQuantity).join(', ')}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {bulkCreate ? 'Número inicial' : 'Número da Mesa'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              {(() => {
                const existingNumbers = allTables
                  .filter(t => t.locationId === formData.locationId && t.id !== table?.id)
                  .map(t => t.tableNumber);
                
                const isDuplicate = existingNumbers.includes(formData.tableNumber || 0);
                
                return (
                  <>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.tableNumber}
                        onChange={(e) => setFormData({ ...formData, tableNumber: parseInt(e.target.value) })}
                        className={`w-full p-2 border rounded-md ${isDuplicate 
                          ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        required
                        min="1"
                      />
                      {isDuplicate && (
                        <div className="absolute right-2 top-2">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    
                    {isDuplicate && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <p className="text-sm text-red-700">
                            <strong>Mesa {formData.tableNumber} já existe</strong> no local {locations.find(l => l.id === formData.locationId)?.name}
                          </p>
                        </div>
                        <p className="text-xs text-red-600 mt-1">
                          Por favor, escolha um número diferente.
                        </p>
                      </div>
                    )}
                    
                    {existingNumbers.length > 0 && !isDuplicate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Mesas existentes: {existingNumbers.sort((a, b) => a - b).join(', ')}
                      </p>
                    )}
                  </>
                );
              })()}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Capacidade 
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.seats}
                  onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                  className="w-full p-2 pr-8 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="1"
                  max="12"
                />
                <Users className="absolute right-2 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Entre 1 e 12 pessoas</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Local 
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.locationId}
                onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                className="w-full p-2 pr-8 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                required
              >
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
              <MapPin className="absolute right-2 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {!bulkCreate && (
            <div>
              <label className="block text-sm font-medium mb-1">Status inicial</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          )}



          {/* Sugestões rápidas para capacidade */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Sugestões rápidas</h4>
            <div className="grid grid-cols-4 gap-2">
              {[2, 4, 6, 8].map(capacity => (
                <button
                  key={capacity}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, seats: capacity }))}
                  className={`p-2 rounded-md text-sm transition-colors ${
                    formData.seats === capacity
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-white border border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <Users className="w-4 h-4 mx-auto mb-1" />
                  {capacity}p
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {bulkCreate 
                ? `Criando ${bulkQuantity} mesas em ${locations.find(l => l.id === formData.locationId)?.name}`
                : `Mesa ${formData.tableNumber} em ${locations.find(l => l.id === formData.locationId)?.name}`
              }
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancelar
              </button>
              {(() => {
                const existingNumbers = allTables
                  .filter(t => t.locationId === formData.locationId && t.id !== table?.id)
                  .map(t => t.tableNumber);
                
                const isDuplicate = !bulkCreate && existingNumbers.includes(formData.tableNumber || 0);
                const isFormValid = formData.tableNumber && formData.seats && formData.locationId && !isDuplicate;

                return (
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`flex items-center gap-2 px-6 py-2 rounded-md transition-colors ${isFormValid 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {bulkCreate ? <Grid className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {table 
                      ? 'Atualizar Mesa' 
                      : bulkCreate 
                        ? `Criar ${bulkQuantity} Mesas` 
                        : 'Criar Mesa'
                    }
                  </button>
                );
              })()}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Toast Component para notificações elegantes
function Toast({ message, type, onClose }: { message: string; type: 'error' | 'success' | 'info'; onClose: () => void }) {
  const bgColor = type === 'error' ? 'bg-red-50 border-red-200' : 
                  type === 'success' ? 'bg-green-50 border-green-200' : 
                  'bg-blue-50 border-blue-200';
  
  const textColor = type === 'error' ? 'text-red-800' : 
                    type === 'success' ? 'text-green-800' : 
                    'text-blue-800';
  
  const iconColor = type === 'error' ? 'text-red-500' : 
                    type === 'success' ? 'text-green-500' : 
                    'text-blue-500';

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md ${bgColor} border rounded-lg shadow-lg p-4 animate-in slide-in-from-top-2`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${iconColor}`}>
          {type === 'error' && <AlertCircle className="w-5 h-5" />}
          {type === 'success' && <CheckCircle className="w-5 h-5" />}
          {type === 'info' && <AlertCircle className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-semibold ${textColor} mb-1`}>
            {type === 'error' ? 'Erro ao criar mesa' : 
             type === 'success' ? 'Sucesso' : 
             'Informação'}
          </h3>
          <p className={`text-sm ${textColor.replace('800', '700')}`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${iconColor} hover:opacity-70 transition-opacity`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function TableManagement() {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrSelectedTable, setQrSelectedTable] = useState<Table | null>(null);
  const queryClient = useQueryClient();

  // Função centralizada para invalidar cache de mesas
  const invalidateTableCache = () => {
    console.log('🔄 Invalidating table cache...');
    // Invalidar todas as queries relacionadas a mesas
    queryClient.invalidateQueries({ predicate: (query) => 
      query.queryKey[0] === '/api/tables' 
    });
    // Remover cache para forçar refetch
    queryClient.removeQueries({ predicate: (query) => 
      query.queryKey[0] === '/api/tables' 
    });
    // Refetch imediato
    queryClient.refetchQueries({ predicate: (query) => 
      query.queryKey[0] === '/api/tables' 
    });
  };

  const { data: tables, isLoading, error } = useQuery({
    queryKey: ['/api/tables'],
    queryFn: async () => {
      const response = await fetch('/api/tables');
      if (!response.ok) {
        throw new Error('Failed to fetch tables');
      }
      return response.json();
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
    refetchIntervalInBackground: true, // Keep refreshing even when tab is not active
  });

  // Debug log
  console.log('Tables data:', tables);
  console.log('Tables loading:', isLoading);
  console.log('Tables error:', error);

  const createTableMutation = useMutation({
    mutationFn: async (table: InsertTable) => {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(table)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao criar mesa');
      }
      return response.json();
    },
    onSuccess: () => {
      console.log('✅ Table created successfully');
      invalidateTableCache();
      setModalOpen(false);
      setSelectedTable(null);
      setToast({ message: 'Mesa criada com sucesso!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: Error) => {
      console.error('❌ Error creating table:', error.message);
      setToast({ 
        message: error.message.includes('Já existe') 
          ? `${error.message}. Por favor, escolha um número diferente.`
          : error.message, 
        type: 'error' 
      });
      // Auto-hide toast after 5 seconds
      setTimeout(() => setToast(null), 5000);
    }
  });

  const updateTableMutation = useMutation({
    mutationFn: async ({ id, table }: { id: number; table: Partial<Table> }) => {
      const response = await fetch(`/api/tables/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(table)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao atualizar mesa');
      }
      return response.json();
    },
    onSuccess: () => {
      console.log('✅ Table updated successfully');
      invalidateTableCache();
      setModalOpen(false);
      setSelectedTable(null);
      setToast({ message: 'Mesa atualizada com sucesso!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (error: Error) => {
      console.error('❌ Error updating table:', error.message);
      setToast({ 
        message: error.message.includes('Já existe') 
          ? `${error.message}. Por favor, escolha um número diferente.`
          : error.message, 
        type: 'error' 
      });
      // Auto-hide toast after 5 seconds
      setTimeout(() => setToast(null), 5000);
    }
  });

  const deleteTableMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/tables/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete table');
      }
      return response.json();
    },
    onSuccess: () => {
      console.log('✅ Table deleted successfully');
      invalidateTableCache();
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/tables/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        throw new Error('Failed to update table status');
      }
      return response.json();
    },
    onSuccess: () => {
      console.log('✅ Table status updated successfully');
      invalidateTableCache();
    }
  });

  const handleSaveTable = (tableData: Partial<Table>) => {
    if (selectedTable) {
      updateTableMutation.mutate({ id: selectedTable.id, table: tableData });
    } else {
      createTableMutation.mutate(tableData as InsertTable);
    }
    setSelectedTable(null);
  };

  const handleEditTable = (table: Table) => {
    setSelectedTable(table);
    setModalOpen(true);
  };

  const handleDeleteTable = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta mesa?')) {
      deleteTableMutation.mutate(id);
    }
  };

  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'occupied':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'reserved':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'maintenance':
        return <Wrench className="w-5 h-5 text-gray-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponível';
      case 'occupied':
        return 'Ocupada';
      case 'reserved':
        return 'Reservada';
      case 'maintenance':
        return 'Manutenção';
      default:
        return status;
    }
  };

  const filteredTables = Array.isArray(tables) ? tables.filter((table: Table) => 
    selectedLocation === 'all' || table.locationId === selectedLocation
  ) : [];

  const locations = [
    { id: 'all', name: 'Todos os Locais' },
    { id: 'talatona', name: 'Talatona' },
    { id: 'ilha', name: 'Ilha de Luanda' },
    { id: 'movel', name: 'Unidade Móvel' }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Mesas</h2>
          <p className="text-gray-600 mt-1">Gerencie mesas de todos os locais do restaurante</p>
        </div>
        
        <div className="flex gap-3">
          {/* Template rápido para restaurante típico */}
          <button
            onClick={() => {
              if (window.confirm('Criar 10 mesas típicas (2-6 pessoas) para Talatona?')) {
                // Criar conjunto padrão de mesas
                const defaultTables = [
                  { tableNumber: 1, seats: 2, locationId: 'talatona', status: 'available' },
                  { tableNumber: 2, seats: 2, locationId: 'talatona', status: 'available' },
                  { tableNumber: 3, seats: 4, locationId: 'talatona', status: 'available' },
                  { tableNumber: 4, seats: 4, locationId: 'talatona', status: 'available' },
                  { tableNumber: 5, seats: 4, locationId: 'talatona', status: 'available' },
                  { tableNumber: 6, seats: 6, locationId: 'talatona', status: 'available' },
                  { tableNumber: 7, seats: 6, locationId: 'talatona', status: 'available' },
                  { tableNumber: 8, seats: 2, locationId: 'talatona', status: 'available' },
                  { tableNumber: 9, seats: 8, locationId: 'talatona', status: 'available' },
                  { tableNumber: 10, seats: 4, locationId: 'talatona', status: 'available' },
                ];
                
                defaultTables.forEach(table => {
                  createTableMutation.mutate(table as InsertTable);
                });
              }
            }}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span>Setup Rápido</span>
          </button>
          
          <button
            onClick={() => {
              setSelectedTable(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Mesa</span>
          </button>
        </div>
      </div>

      {/* Estatísticas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {locations.slice(1).map(location => {
          const locationTables = Array.isArray(tables) ? tables.filter((table: Table) => table.locationId === location.id) : [];
          const availableCount = locationTables.filter(t => t.status === 'available').length;
          const occupiedCount = locationTables.filter(t => t.status === 'occupied').length;
          
          return (
            <div key={location.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{location.name}</h3>
                <MapPin className="w-4 h-4 text-gray-400" />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">{locationTables.length}</div>
                <div className="text-xs text-gray-500">
                  {availableCount} disponíveis • {occupiedCount} ocupadas
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-red-900">Total Geral</h3>
            <Users className="w-4 h-4 text-red-500" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-red-900">{Array.isArray(tables) ? tables.length : 0}</div>
            <div className="text-xs text-red-700">mesas em todos os locais</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
        >
          {locations.map(location => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            Disponível
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
            Ocupada
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
            Reservada
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
            Manutenção
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTables.map((table: Table) => (
          <div 
            key={table.id} 
            className={`bg-white rounded-lg shadow-md border-l-4 transition-all hover:shadow-lg ${
              table.status === 'available' ? 'border-green-500' :
              table.status === 'occupied' ? 'border-red-500' :
              table.status === 'reserved' ? 'border-yellow-500' :
              'border-gray-500'
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Mesa {table.tableNumber}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{locations.find(l => l.id === table.locationId)?.name}</span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setQrSelectedTable(table);
                      setQrModalOpen(true);
                    }}
                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                    title="QR Code da mesa"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditTable(table)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Editar mesa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTable(table.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Excluir mesa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">{table.seats} pessoas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(table.status)}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(table.status)}`}>
                      {getStatusText(table.status)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Alterar Status:
                  </label>
                  <select
                    value={table.status}
                    onChange={(e) => handleStatusChange(table.id, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="available">Disponível</option>
                    <option value="occupied">Ocupada</option>
                    <option value="reserved">Reservada</option>
                    <option value="maintenance">Manutenção</option>
                  </select>
                </div>

                <div className="border-t pt-2 text-xs text-gray-500">
                  <div>ID: {table.id}</div>
                  <div>Criada: {new Date(table.createdAt).toLocaleDateString('pt-AO')}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTables.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-6xl mb-4">🪑</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Nenhuma mesa encontrada
          </h3>
          <p className="text-gray-600">
            Comece criando sua primeira mesa para este local.
          </p>
        </div>
      )}

      <TableModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        table={selectedTable}
        onSave={handleSaveTable}
        allTables={tables || []}
      />

      {/* QR Code Modal */}
      {qrSelectedTable && (
        <QRCodeModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          table={qrSelectedTable}
        />
      )}

      {/* Toast de notificação */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}