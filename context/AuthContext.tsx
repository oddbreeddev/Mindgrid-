
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  isAdmin: boolean;
  loading: boolean;
  setAdminStatus: (status: boolean) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for secret admin session in storage
    const adminSession = localStorage.getItem('mg_admin_vault');
    if (adminSession === 'true') {
      setIsAdmin(true);
    }

    // Check active Supabase sessions
    supabase.auth.getSession()
      .then(({ data: { session } }: any) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
      })
      .catch((err: any) => {
        console.error("Supabase Session Error:", err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({ id: userId, updated_at: new Date().toISOString() })
          .select()
          .single();
        
        if (!createError) {
          setProfile(newProfile);
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching/creating profile:', err);
    }
  };

  const setAdminStatus = (status: boolean) => {
    if (status) localStorage.setItem('mg_admin_vault', 'true');
    else localStorage.removeItem('mg_admin_vault');
    setIsAdmin(status);
  };

  const signOut = async () => {
    localStorage.removeItem('mg_admin_vault');
    setIsAdmin(false);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, setAdminStatus, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
