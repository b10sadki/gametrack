import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { pb, PBUser } from '../lib/pocketbase';
import { RecordAuthResponse } from 'pocketbase';

interface AuthContextType {
  user: PBUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<RecordAuthResponse<PBUser>>;
  register: (email: string, password: string, passwordConfirm: string, name?: string) => Promise<RecordAuthResponse<PBUser>>;
  logout: () => void;
  updateProfile: (data: Partial<PBUser>) => Promise<PBUser>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<PBUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      if (pb.authStore.isValid && pb.authStore.model) {
        setUser(pb.authStore.model as PBUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const unsubscribe = pb.authStore.onChange((_token, model) => {
      if (model) {
        setUser(model as PBUser);
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<RecordAuthResponse<PBUser>> => {
    try {
      const authData = await pb.collection('users').authWithPassword<PBUser>(email, password);
      setUser(authData.record);
      return authData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (
    email: string, 
    password: string, 
    passwordConfirm: string, 
    name?: string
  ): Promise<RecordAuthResponse<PBUser>> => {
    try {
      // Create the user
      const userData = {
        email,
        password,
        passwordConfirm,
        name: name || email.split('@')[0], // Use email prefix as default name
      };

      await pb.collection('users').create<PBUser>(userData);
      
      // Authenticate the user
      const authData = await pb.collection('users').authWithPassword<PBUser>(email, password);
      setUser(authData.record);
      
      return authData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setUser(null);
  };

  const updateProfile = async (data: Partial<PBUser>): Promise<PBUser> => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      const updatedUser = await pb.collection('users').update<PBUser>(user.id, data);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user && pb.authStore.isValid,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;