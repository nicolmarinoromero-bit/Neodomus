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
  refreshUserProfile: () => Promise<void>;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user_type: string;
  rol?: string;
  role?: string;
  nombre?: string;
  first_name?: string;
  last_name?: string;
  id?: number;
}

interface ClientProfile {
  first_name: string;
  last_name: string;
  email: string;
  telefono_cliente?: number | null;
  address?: string | null;
}

interface EmployeeProfile {
  id_usuario: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rol, setRol] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserProfile = async () => {
    try {
      // Base: usuario almacenado (no depende del estado capturado)
      let base: User | null = null;
      const storedRaw = localStorage.getItem('user');
      if (storedRaw) {
        try {
          base = JSON.parse(storedRaw) as User;
        } catch {
          base = null;
        }
      }
      // El backend identifica a los empleados (administrador, tecnico, etc.) con
      // su rol propio; solo los clientes usan "cliente".
      const isEmployee = (base?.rol || '') !== 'cliente';

      let firstName = '';
      let lastName = '';
      let email = base?.correo || '';
      if (isEmployee) {
        const res = await api.get<EmployeeProfile>('/users/me');
        const profile = res.data;
        firstName = profile.first_name || '';
        lastName = profile.last_name || '';
        email = profile.email || email;
      } else {
        const res = await api.get<ClientProfile>('/clients/me');
        const profile = res.data;
        firstName = profile.first_name || '';
        lastName = profile.last_name || '';
        email = profile.email || email;
      }
      const firstNameResolved = firstName || base?.nombre?.split(' ')[0] || '';
      const lastNameResolved = lastName || (base?.nombre?.split(' ').slice(1).join(' ') || '');
      const fullName = (firstNameResolved && lastNameResolved) ? `${firstNameResolved} ${lastNameResolved}` : (firstNameResolved || base?.nombre || '');
      const updatedUser: User = {
        id: base?.id ?? 0,
        nombre: fullName.trim(),
        correo: email,
        rol: base?.rol || '',
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      if (updatedUser.rol) setRol(updatedUser.rol);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

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
        // Refrescar perfil para obtener nombre real
        refreshUserProfile();
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
      
      // Usar first_name y last_name del API si están disponibles, sino fallback a nombre o email
      const firstName = data.first_name || '';
      const lastName = data.last_name || '';
      const fullName = (firstName && lastName) ? `${firstName} ${lastName}` : (data.nombre || email.split('@')[0]);
      
      const userData: User = {
        id: data.id || 0,
        nombre: fullName.trim(),
        correo: email,
        rol: userRol,
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setRol(userRol);
      setIsAuthenticated(true);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
      
      // Obtener nombre real del perfil
      await refreshUserProfile();
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
    <AuthContext.Provider value={{ user, rol, isAuthenticated, loading, login, logout, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};