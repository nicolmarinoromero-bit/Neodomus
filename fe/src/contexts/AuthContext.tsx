import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '@services/api';

interface User {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

interface AuthContextType {
  user: User | null;
  rol: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user_type: string;
  rol?: string;
  role?: string;
  nombre?: string;
  id?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rol, setRol] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
        setRol(parsedUser.rol);
        setIsAuthenticated(true);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error parsing user', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      const data = response.data;
      const userRol = data.rol || data.role;
      if (!userRol) {
        throw new Error('La respuesta del servidor no incluye el rol');
      }
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      const userData: User = {
        id: data.id || 0,
        nombre: data.nombre || email.split('@')[0],
        correo: email,
        rol: userRol,
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setRol(userRol);
      setIsAuthenticated(true);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setRol(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, rol, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};