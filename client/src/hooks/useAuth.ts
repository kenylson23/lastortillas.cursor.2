import { useState, useEffect } from 'react';

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

  useEffect(() => {
    // Check if user is authenticated
    const authStatus = localStorage.getItem('isAuthenticated');
    const role = localStorage.getItem('userRole') as UserRole;
    setIsAuthenticated(authStatus === 'true');
    setUserRole(role);
    setIsLoading(false);
  }, []);

  const login = (role: UserRole) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole(null);
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
    login,
    logout,
    user: getUserInfo()
  };
}