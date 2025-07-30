import { useState, useEffect } from 'react';
import { auth } from '../../shared/auth';

export type UserRole = 'admin' | 'kitchen';

export interface User {
  firstName: string;
  email: string;
  role: UserRole;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Verificar autenticação atual
    checkAuthStatus();
    
    // Escutar mudanças de autenticação
    const { data: { subscription } } = auth.onAuthStateChange((user) => {
      if (user) {
        setIsAuthenticated(true);
        setUser(user);
        // Determinar role baseado no email ou metadata
        const role = determineUserRole(user);
        setUserRole(role);
        localStorage.setItem('userRole', role);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setUserRole(null);
        localStorage.removeItem('userRole');
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { user, error } = await auth.getCurrentUser();
      if (user && !error) {
        setIsAuthenticated(true);
        setUser(user);
        const role = determineUserRole(user);
        setUserRole(role);
        localStorage.setItem('userRole', role);
      } else {
        // Fallback para credenciais hardcoded
        const authStatus = localStorage.getItem('isAuthenticated');
        const role = localStorage.getItem('userRole') as UserRole;
        if (authStatus === 'true' && role) {
          setIsAuthenticated(true);
          setUserRole(role);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status de autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const determineUserRole = (user: any): UserRole => {
    // Verificar se é um usuário do Supabase
    if (user.email) {
      if (user.email.includes('admin') || user.email === 'admin@lastortillas.com') {
        return 'admin';
      } else if (user.email.includes('cozinha') || user.email === 'cozinha@lastortillas.com') {
        return 'kitchen';
      }
    }
    
    // Fallback para credenciais hardcoded
    const role = localStorage.getItem('userRole') as UserRole;
    return role || 'admin';
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Tentar login com credenciais hardcoded primeiro
      const { data, error } = await auth.signInWithCredentials(username, password);
      
      if (error) {
        throw error;
      }
      
      if (data?.user) {
        setIsAuthenticated(true);
        setUser(data.user);
        const role = data.user.role as UserRole;
        setUserRole(role);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', role);
        return { success: true, error: null };
      }
      
      return { success: false, error: 'Credenciais inválidas' };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: error.message || 'Erro no login' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        throw error;
      }
      
      if (data?.user) {
        setIsAuthenticated(true);
        setUser(data.user);
        const role = determineUserRole(data.user);
        setUserRole(role);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', role);
        return { success: true, error: null };
      }
      
      return { success: false, error: 'Credenciais inválidas' };
    } catch (error) {
      console.error('Erro no login com email:', error);
      return { success: false, error: error.message || 'Erro no login' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setIsAuthenticated(false);
      setUser(null);
      setUserRole(null);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const getUserInfo = (): User | null => {
    if (!isAuthenticated || !userRole) return null;
    
    if (userRole === 'admin') {
      return {
        firstName: 'Administrador',
        email: 'admin@lastortillas.com',
        role: 'admin'
      };
    } else {
      return {
        firstName: 'Cozinha',
        email: 'cozinha@lastortillas.com',
        role: 'kitchen'
      };
    }
  };

  return {
    isAuthenticated,
    isLoading,
    userRole,
    user,
    login,
    loginWithEmail,
    logout,
    userInfo: getUserInfo()
  };
}