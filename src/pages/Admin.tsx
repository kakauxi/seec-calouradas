"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Navigate, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  History, 
  ArrowLeft, 
  UserCog, 
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const OWNER_EMAIL = 'kakauxi.neto@aluno.uece.br';

const Admin = () => {
  const { role, loading } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState('');

  useEffect(() => {
    if (role === 'admin_master') {
      fetchData();
    }
  }, [role]);

  const fetchData = async () => {
    const { data: profilesData } = await supabase.from('profiles').select('*');
    const { data: logsData } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (profilesData) setProfiles(profilesData);
    if (logsData) setLogs(logsData);
  };

  const toggleRole = async (userId: string, currentRole: string, email: string) => {
    if (email === OWNER_EMAIL) {
      showError('Não é possível alterar o cargo do proprietário.');
      return;
    }

    const newRole = currentRole === 'admin_master' ? 'user' : 'admin_master';
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      showError('Erro ao atualizar permissão.');
    } else {
      showSuccess('Permissão atualizada com sucesso!');
      fetchData();
    }
  };

  const toggleApproval = async (userId: string, currentStatus: boolean, email: string) => {
    if (email === OWNER_EMAIL) {
      showError('Não é possível revogar o acesso do proprietário.');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: !currentStatus })
      .eq('id', userId);

    if (error) {
      showError('Erro ao atualizar status de aprovação.');
    } else {
      showSuccess(currentStatus ? 'Acesso revogado.' : 'Usuário aprovado com sucesso!');
      fetchData();
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (role !== 'admin_master') return <Navigate to="/" />;

  const filteredProfiles = profiles.filter(p => 
    p.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-black text-white py-6 px-4 shadow-lg mb-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')} 
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-amber-400" size={28} />
              <h1 className="text-xl font-bold">Painel Admin Master</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-200 p-1 rounded-xl">
            <TabsTrigger value="users" className="rounded-lg">
              <Users size={18} className="mr-2" /> Usuários
            </TabsTrigger>
            <TabsTrigger value="logs" className="rounded-lg">
              <History size={18} className="mr-2" /> Logs do Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="Buscar usuário por e-mail..." 
                className="pl-10 py-6 rounded-xl border-none shadow-sm"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
              />
            </div>

            <div className="grid gap-4">
              {filteredProfiles.map(profile => {
                const isOwner = profile.email === OWNER_EMAIL;
                
                return (
                  <Card key={profile.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between bg-white border-none shadow-sm gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                        {isOwner ? <Lock size={20} className="text-amber-600" /> : <UserCog size={20} className="text-slate-600" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-none">
                          {profile.email} {isOwner && <span className="text-xs text-amber-600 font-normal ml-1">(Proprietário)</span>}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={profile.role === 'admin_master' ? 'default' : 'secondary'} className={profile.role === 'admin_master' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-none' : ''}>
                            {profile.role === 'admin_master' ? 'Admin Master' : 'Usuário'}
                          </Badge>
                          <Badge variant={profile.is_approved ? 'outline' : 'destructive'} className={profile.is_approved ? 'border-green-200 text-green-700 bg-green-50' : ''}>
                            {profile.is_approved ? 'Aprovado' : 'Pendente'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant={profile.is_approved ? "outline" : "default"}
                        size="sm"
                        disabled={isOwner}
                        onClick={() => toggleApproval(profile.id, profile.is_approved, profile.email)}
                        className={profile.is_approved ? "text-slate-600" : "bg-green-600 hover:bg-green-700 text-white"}
                      >
                        {profile.is_approved ? (
                          <><XCircle size={16} className="mr-2" /> Revogar</>
                        ) : (
                          <><CheckCircle2 size={16} className="mr-2" /> Aprovar</>
                        )}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        disabled={isOwner}
                        onClick={() => toggleRole(profile.id, profile.role, profile.email)}
                        className="text-slate-500"
                      >
                        Alterar Cargo
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <div className="space-y-3">
              {logs.map(log => (
                <Card key={log.id} className="p-4 bg-white border-none shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.action}</span>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-slate-500 text-sm">{log.user_email}</span>
                      </div>
                      <p className="text-sm text-slate-600">{log.details}</p>
                    </div>
                    <div className="flex items-center text-xs text-slate-400 gap-1">
                      <Clock size={12} />
                      {format(new Date(log.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;