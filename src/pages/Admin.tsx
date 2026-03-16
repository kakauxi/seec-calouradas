"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Navigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  History, 
  ArrowLeft, 
  UserCog, 
  Search,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Admin = () => {
  const { role, loading } = useAuth();
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

  const toggleRole = async (userId: string, currentRole: string) => {
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
            <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="text-white hover:bg-white/10">
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
              {filteredProfiles.map(profile => (
                <Card key={profile.id} className="p-4 flex items-center justify-between bg-white border-none shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <UserCog size={20} className="text-slate-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{profile.email}</p>
                      <Badge variant={profile.role === 'admin_master' ? 'default' : 'secondary'} className={profile.role === 'admin_master' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-none' : ''}>
                        {profile.role === 'admin_master' ? 'Admin Master' : 'Usuário Comum'}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleRole(profile.id, profile.role)}
                    className="rounded-lg"
                  >
                    Alterar Cargo
                  </Button>
                </Card>
              ))}
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