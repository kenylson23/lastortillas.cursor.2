import { supabase } from './supabase';

// Storage usando Supabase real
export const storage = {
  // Upload de arquivo
  upload: async (bucket: string, path: string, file: File) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);
      
      if (error) throw error;
      
      return { 
        data: { path: data.path }, 
        error: null 
      };
    } catch (error) {
      console.error('Erro no upload:', error);
      return { 
        data: null, 
        error: error.message 
      };
    }
  },

  // Download de arquivo
  download: async (bucket: string, path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);
      
      if (error) throw error;
      
      return { 
        data, 
        error: null 
      };
    } catch (error) {
      console.error('Erro no download:', error);
      return { 
        data: null, 
        error: error.message 
      };
    }
  },

  // Obter URL pública
  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  // Listar arquivos
  list: async (bucket: string, path?: string) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path);
      
      if (error) throw error;
      
      return { 
        data: data || [], 
        error: null 
      };
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      return { 
        data: [], 
        error: error.message 
      };
    }
  },

  // Deletar arquivo
  remove: async (bucket: string, paths: string[]) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove(paths);
      
      if (error) throw error;
      
      return { 
        data, 
        error: null 
      };
    } catch (error) {
      console.error('Erro ao remover arquivos:', error);
      return { 
        data: null, 
        error: error.message 
      };
    }
  },

  // Database operations usando Supabase
  createMenuItem: async (menuItem: any) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert(menuItem)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Erro ao criar menu item:', error);
      throw error;
    }
  },

  getAllMenuItems: async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar menu items:', error);
      return [];
    }
  },

  getMenuItemsByCategory: async (category: string) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar menu items por categoria:', error);
      return [];
    }
  },

  createOrder: async (order: any) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
  },

  getOrderById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      return null;
    }
  },

  getAllOrders: async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      return [];
    }
  },

  createReservation: async (reservation: any) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert(reservation)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      throw error;
    }
  },

  getReservationsByDate: async (date: string) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('date', date)
        .order('time', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar reservas por data:', error);
      return [];
    }
  },

  createContact: async (contact: any) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert(contact)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Erro ao criar contato:', error);
      throw error;
    }
  },

  checkAvailability: async (date: string, time: string) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('guests')
        .eq('date', date)
        .eq('time', time);
      
      if (error) throw error;
      
      // Calcular capacidade total e ocupada
      const totalCapacity = 50; // Capacidade total do restaurante
      const occupiedSeats = data?.reduce((sum, reservation) => sum + reservation.guests, 0) || 0;
      
      return occupiedSeats < totalCapacity;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return true; // Fallback: sempre disponível
    }
  }
};

// Utilitários administrativos para storage
export const adminStorage = {
  // Criar bucket
  createBucket: async (bucketId: string, options?: any) => {
    try {
      const { data, error } = await supabase.storage.createBucket(bucketId, options);
      
      if (error) throw error;
      
      return { 
        data: { name: bucketId }, 
        error: null 
      };
    } catch (error) {
      console.error('Erro ao criar bucket:', error);
      return { 
        data: null, 
        error: error.message 
      };
    }
  },

  // Listar buckets
  listBuckets: async () => {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) throw error;
      
      return { 
        data: data || [], 
        error: null 
      };
    } catch (error) {
      console.error('Erro ao listar buckets:', error);
      return { 
        data: [], 
        error: error.message 
      };
    }
  },

  // Deletar bucket
  deleteBucket: async (bucketId: string) => {
    try {
      const { data, error } = await supabase.storage.deleteBucket(bucketId);
      
      if (error) throw error;
      
      return { 
        data, 
        error: null 
      };
    } catch (error) {
      console.error('Erro ao deletar bucket:', error);
      return { 
        data: null, 
        error: error.message 
      };
    }
  }
};

// Constantes para buckets
export const STORAGE_BUCKETS = {
  MENU_IMAGES: 'menu-images',
  PROFILE_IMAGES: 'profile-images',
  UPLOADS: 'uploads'
};