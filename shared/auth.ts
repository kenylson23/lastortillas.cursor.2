import { supabase } from './supabase';

// Tipos de autenticação
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

// Sistema de autenticação integrado com Supabase
export const auth = {
  // Registrar usuário
  signUp: async (email: string, password: string, metadata?: { name?: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro no signUp:', error);
      return { data: null, error };
    }
  },

  // Login
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro no signIn:', error);
      return { data: null, error };
    }
  },

  // Login com credenciais hardcoded (para compatibilidade)
  signInWithCredentials: async (username: string, password: string) => {
    // Credenciais hardcoded para admin e cozinha
    if (username === 'administrador' && password === 'lasTortillas2025!') {
      return { 
        data: { 
          user: { 
            id: 'admin-1', 
            email: 'admin@lastortillas.com',
            role: 'admin'
          } 
        }, 
        error: null 
      };
    } else if (username === 'cozinha' && password === 'lasTortillas2025Cozinha!') {
      return { 
        data: { 
          user: { 
            id: 'kitchen-1', 
            email: 'cozinha@lastortillas.com',
            role: 'kitchen'
          } 
        }, 
        error: null 
      };
    } else {
      return { 
        data: null, 
        error: { message: 'Credenciais inválidas' } 
      };
    }
  },

  // Logout
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Erro no signOut:', error);
      return { error };
    }
  },

  // Obter usuário atual
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return { user: null, error };
    }
  },

  // Escutar mudanças de autenticação
  onAuthStateChange: (callback: (user: any) => void) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }
};

// Utilitários administrativos para backend
export const adminAuth = {
  // Criar usuário administrativamente
  createUser: async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: metadata
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return { data: null, error };
    }
  },

  // Obter usuário por ID
  getUserById: async (userId: string) => {
    try {
      const { data, error } = await supabase.auth.admin.getUserById(userId);
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao obter usuário por ID:', error);
      return { data: null, error };
    }
  },

  // Listar usuários
  listUsers: async () => {
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return { data: null, error };
    }
  },

  // Deletar usuário
  deleteUser: async (userId: string) => {
    try {
      const { data, error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return { data: null, error };
    }
  }
};