import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: Record<string, boolean>;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: string | null;
  checkPermission: (permission: string) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userRole: null,
  checkPermission: () => false,
  login: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const getAllUsers = () => JSON.parse(localStorage.getItem('users') || '[]');

  const login = async (email: string, password: string) => {
    // For demo purposes, accept any user from users.json with a simple password check
    const foundUser = getAllUsers().find(u => u.email === email);
    
    if (foundUser && password === 'password123') { // In a real app, use proper password hashing
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      navigate('/');
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  const checkPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions[permission] ?? false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      userRole: user?.role ?? null, 
      checkPermission,
      login,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};