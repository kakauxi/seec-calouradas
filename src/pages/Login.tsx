"use client";

import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { ShieldCheck } from 'lucide-react';

const Login = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <ShieldCheck className="text-white" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">SEEC Check-in</h1>
          <p className="text-slate-500 text-sm">Faça login para gerenciar sua lista</p>
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#000000',
                  brandAccent: '#333333',
                },
                radii: {
                  buttonRadius: '12px',
                  inputRadius: '12px',
                }
              }
            }
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'E-mail',
                password_label: 'Senha',
                button_label: 'Entrar',
                loading_button_label: 'Entrando...',
                social_provider_text: 'Entrar com {{provider}}',
                link_text: 'Já tem uma conta? Entre',
              },
              sign_up: {
                email_label: 'E-mail',
                password_label: 'Senha',
                button_label: 'Cadastrar',
                loading_button_label: 'Cadastrando...',
                link_text: 'Não tem uma conta? Cadastre-se',
              },
              forgot_password: {
                email_label: 'E-mail',
                password_label: 'Senha',
                button_label: 'Enviar instruções',
                loading_button_label: 'Enviando...',
                link_text: 'Esqueceu sua senha?',
              },
              update_password: {
                password_label: 'Nova senha',
                button_label: 'Atualizar senha',
                loading_button_label: 'Atualizando...',
              },
            }
          }}
          providers={[]}
          theme="light"
        />
      </div>
    </div>
  );
};

export default Login;