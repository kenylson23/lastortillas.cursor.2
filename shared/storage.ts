// Temporary stub implementations for storage - to be replaced with proper file storage system
export const storage = {
  // Upload de arquivo
  upload: async (bucket: string, path: string, file: File) => {
    // TODO: Implement proper file upload (could use local filesystem or cloud storage)
    console.log('Storage upload called:', bucket, path);
    return { 
      data: { path: `${bucket}/${path}` }, 
      error: null 
    };
  },

  // Download de arquivo
  download: async (bucket: string, path: string) => {
    // TODO: Implement proper file download
    console.log('Storage download called:', bucket, path);
    return { 
      data: new Blob(['mock file content']), 
      error: null 
    };
  },

  // Obter URL pública
  getPublicUrl: (bucket: string, path: string) => {
    // TODO: Implement proper public URL generation
    console.log('Storage getPublicUrl called:', bucket, path);
    return `/uploads/${bucket}/${path}`;
  },

  // Listar arquivos
  list: async (bucket: string, path?: string) => {
    // TODO: Implement proper file listing
    console.log('Storage list called:', bucket, path);
    return { 
      data: [], 
      error: null 
    };
  },

  // Deletar arquivo
  remove: async (bucket: string, paths: string[]) => {
    // TODO: Implement proper file removal
    console.log('Storage remove called:', bucket, paths);
    return { 
      data: null, 
      error: null 
    };
  },

  // Mock database operations for APIs
  createMenuItem: async (menuItem: any) => {
    console.log('Storage createMenuItem called:', menuItem);
    return { 
      id: Math.floor(Math.random() * 1000),
      ...menuItem,
      createdAt: new Date().toISOString()
    };
  },

  getAllMenuItems: async () => {
    console.log('Storage getAllMenuItems called');
    return [
      {
        id: 1,
        name: "Tacos Especiais",
        description: "Tacos com carne, frango, peixe e vegetarianos",
        price: "15.00",
        category: "Tacos",
        available: true,
        preparationTime: 15,
        customizations: ["sem cebola", "extra queijo"],
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: "Quesadillas",
        description: "Tortillas grelhadas com queijo e recheios variados",
        price: "12.00",
        category: "Quesadillas",
        available: true,
        preparationTime: 10,
        customizations: ["sem cebola", "extra queijo"],
        createdAt: new Date().toISOString()
      }
    ];
  },

  getMenuItemsByCategory: async (category: string) => {
    console.log('Storage getMenuItemsByCategory called:', category);
    return [
      {
        id: 1,
        name: "Tacos Especiais",
        description: "Tacos com carne, frango, peixe e vegetarianos",
        price: "15.00",
        category: category,
        available: true,
        preparationTime: 15,
        customizations: ["sem cebola", "extra queijo"],
        createdAt: new Date().toISOString()
      }
    ];
  },

  createOrder: async (order: any) => {
    console.log('Storage createOrder called:', order);
    return { 
      id: Math.floor(Math.random() * 1000),
      ...order,
      status: "received",
      paymentStatus: "pending",
      createdAt: new Date().toISOString()
    };
  },

  getOrderById: async (id: string) => {
    console.log('Storage getOrderById called:', id);
    return {
      id: parseInt(id),
      customerName: "João Silva",
      customerPhone: "+244 949 639 932",
      customerEmail: "joao@example.com",
      orderType: "delivery",
      locationId: "ilha",
      totalAmount: "27.00",
      paymentMethod: "cash",
      status: "received",
      paymentStatus: "pending",
      createdAt: new Date().toISOString()
    };
  },

  getAllOrders: async () => {
    console.log('Storage getAllOrders called');
    return [
      {
        id: 1,
        customerName: "João Silva",
        customerPhone: "+244 949 639 932",
        orderType: "delivery",
        locationId: "ilha",
        totalAmount: "27.00",
        paymentMethod: "cash",
        status: "received",
        paymentStatus: "pending",
        createdAt: new Date().toISOString()
      }
    ];
  },

  createReservation: async (reservation: any) => {
    console.log('Storage createReservation called:', reservation);
    return { 
      id: Math.floor(Math.random() * 1000),
      ...reservation,
      createdAt: new Date().toISOString()
    };
  },

  getReservationsByDate: async (date: string) => {
    console.log('Storage getReservationsByDate called:', date);
    return [
      {
        id: 1,
        name: "Maria Santos",
        phone: "+244 949 639 932",
        email: "maria@example.com",
        date: date,
        time: "19:00",
        guests: 4,
        notes: "Mesa próxima à janela",
        createdAt: new Date().toISOString()
      }
    ];
  },

  createContact: async (contact: any) => {
    console.log('Storage createContact called:', contact);
    return { 
      id: Math.floor(Math.random() * 1000),
      ...contact,
      createdAt: new Date().toISOString()
    };
  },

  checkAvailability: async (date: string, time: string) => {
    console.log('Storage checkAvailability called:', date, time);
    // Mock: sempre disponível
    return true;
  }
};

// Utilitários administrativos para storage
export const adminStorage = {
  // Criar bucket
  createBucket: async (bucketId: string, options?: any) => {
    // TODO: Implement proper bucket creation
    console.log('Admin createBucket called:', bucketId);
    return { 
      data: { name: bucketId }, 
      error: null 
    };
  },

  // Listar buckets
  listBuckets: async () => {
    // TODO: Implement proper bucket listing
    console.log('Admin listBuckets called');
    return { 
      data: [], 
      error: null 
    };
  },

  // Deletar bucket
  deleteBucket: async (bucketId: string) => {
    // TODO: Implement proper bucket deletion
    console.log('Admin deleteBucket called:', bucketId);
    return { 
      data: null, 
      error: null 
    };
  }
};

// Constantes para buckets
export const STORAGE_BUCKETS = {
  MENU_IMAGES: 'menu-images',
  PROFILE_IMAGES: 'profile-images',
  UPLOADS: 'uploads'
};