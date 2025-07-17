import { supabase, supabaseAdmin } from './supabase';

// Tipos de autenticação
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

// Utilitários de autenticação para frontend
export const auth = {
  // Registrar usuário
  signUp: async (email: string, password: string, metadata?: { name?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  },

  // Login
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Logout
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Obter usuário atual
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
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
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: metadata
    });
    return { data, error };
  },

  // Obter usuário por ID
  getUserById: async (userId: string) => {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    return { data, error };
  },

  // Listar usuários
  listUsers: async () => {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    return { data, error };
  },

  // Deletar usuário
  deleteUser: async (userId: string) => {
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    return { data, error };
  }
};