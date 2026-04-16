"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const OWNER_EMAIL = 'kakauxi.neto@aluno.uece.br';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: string | null;
  isApproved: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, userEmail?: string) => {
    try {
      // Se for o dono, já define como admin master preventivamente
      if (userEmail === OWNER_EMAIL) {
        setRole('admin_master');
        setIsApproved(true);
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_approved')
        .eq('id', userId)
        .maybeSingle();
      
      if (!error && data) {
        setRole(data.role);
        setIsApproved(data.is_approved);
      } else if (userEmail === OWNER_EMAIL) {
        // Reforça acesso do dono mesmo se a query falhar
        setRole('admin_master');
        setIsApproved(true);
      }
    } catch (err) {
      console.error("[Auth] Erro ao buscar perfil:", err);
      // Em caso de erro crítico, se for o dono, garantimos o acesso
      if (userEmail === OWNER_EMAIL) {
        setRole('admin_master');
        setIsApproved(true);
      }
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user.id, session.user.email);
          }
        }
      } catch (err) {
        console.error("[Auth] Erro na inicialização:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email);
        } else {
          setRole(null);
          setIsApproved(false);
        }
        
        // Garante que o loading saia de true após qualquer mudança de estado
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setRole(null);
    setIsApproved(false);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, role, isApproved, loading, signOut, refreshProfile }}>
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