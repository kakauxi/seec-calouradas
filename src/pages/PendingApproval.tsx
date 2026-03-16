"use client";

import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Clock, LogOut, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PendingApproval = () => {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 mx-auto">
          <Clock className="text-amber-600" size={40} />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Acesso Pendente</h1>
        <p className="text-slate-500 mb-6">
          Olá, <span className="font-semibold text-slate-700">{user?.email}</span>. 
          Sua conta foi criada com sucesso, mas ainda precisa ser aprovada por um administrador.
        </p>
        
        <div className="bg-slate-50 p-4 rounded-2xl mb-8 flex items-start gap-3 text-left">
          <ShieldAlert className="text-slate-400 shrink-0 mt-0.5" size={18} />
          <p className="text-xs text-slate-500 leading-relaxed">
            Por motivos de segurança, o acesso à lista de convidados é restrito. 
            Entre em contato com o responsável para solicitar a liberação.
          </p>
        </div>

        <Button 
          variant="outline" 
          onClick={signOut}
          className="w-full rounded-xl py-6 border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <LogOut size={18} className="mr-2" /> Sair da Conta
        </Button>
      </div>
    </div>
  );
};

export default PendingApproval;