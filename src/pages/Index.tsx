"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Guest } from '@/types/guest';
import AddGuestForm from '@/components/AddGuestForm';
import GuestCard from '@/components/GuestCard';
import GuestStats from '@/components/GuestStats';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Gift, CreditCard, LogOut, ShieldCheck, Settings, RefreshCw } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/components/AuthProvider';
import { Link } from 'react-router-dom';
import { logAction } from '@/utils/logger';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { signOut, user, role } = useAuth();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Permissões refinadas
  const canAddGuests = role === 'admin_master' || role === 'coordenador';
  const canDeleteGuests = role === 'admin_master';

  const fetchGuests = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      showError('Erro ao carregar lista de convidados.');
    } else if (data) {
      setGuests(data.map(g => ({
        id: g.id,
        name: g.name,
        phone: g.phone || '',
        isPresent: g.is_present,
        isCourtesy: g.is_courtesy,
        createdAt: new Date(g.created_at).getTime()
      })));
    }
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    fetchGuests();

    // Configurar Realtime para a tabela de convidados
    const channel = supabase
      .channel('guests-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guests'
        },
        () => {
          // Atualiza a lista silenciosamente quando houver qualquer mudança
          fetchGuests(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchGuests]);

  const addGuest = async (name: string, phone: string, isCourtesy: boolean) => {
    if (!canAddGuests) return;
    
    const { error } = await supabase
      .from('guests')
      .insert([{ 
        name, 
        phone, 
        is_courtesy: isCourtesy,
        is_present: false 
      }]);

    if (error) {
      showError('Erro ao salvar convidado no banco de dados.');
    } else {
      showSuccess(`${name} adicionado à lista!`);
      logAction('Adicionar Convidado', `Adicionou ${name} (${isCourtesy ? 'Cortesia' : 'Pagante'})`);
    }
  };

  const togglePresence = async (id: string) => {
    const guest = guests.find(g => g.id === id);
    if (!guest) return;

    const newStatus = !guest.isPresent;
    
    const { error } = await supabase
      .from('guests')
      .update({ is_present: newStatus })
      .eq('id', id);

    if (error) {
      showError('Erro ao atualizar presença.');
    } else {
      if (newStatus) {
        showSuccess(`${guest.name} chegou! 🎉`);
        logAction('Check-in', `Confirmou presença de ${guest.name}`);
      } else {
        logAction('Remover Presença', `Removeu presença de ${guest.name}`);
      }
    }
  };

  const deleteGuest = async (id: string) => {
    if (!canDeleteGuests) return;
    
    const guest = guests.find(g => g.id === id);
    
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', id);

    if (error) {
      showError('Erro ao excluir convidado.');
    } else {
      if (guest) {
        logAction('Excluir Convidado', `Removeu ${guest.name} da lista`);
      }
      showSuccess('Convidado removido.');
    }
  };

  const filteredGuests = guests.filter(guest => 
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.phone.includes(searchTerm)
  );

  const payingGuests = filteredGuests.filter(g => !g.isCourtesy);
  const courtesyGuests = filteredGuests.filter(g => g.isCourtesy);

  const presentCount = guests.filter(g => g.isPresent).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-black text-white py-6 px-4 shadow-lg mb-8">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold">SEEC Check-in</h1>
              <div className="flex items-center gap-2">
                <p className="text-slate-400 text-xs">{user?.email}</p>
                <span className="bg-white/10 text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  {role === 'admin_master' ? 'Admin' : role === 'coordenador' ? 'Coordenador' : role === 'membro' ? 'Membro' : 'Usuário'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => fetchGuests()}
              className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </Button>
            {role === 'admin_master' && (
              <Link to="/admin">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full">
                  <Settings size={20} />
                </Button>
              </Link>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={signOut}
              className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
            >
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 flex-grow w-full pb-12">
        <GuestStats total={guests.length} present={presentCount} />
        
        {canAddGuests && <AddGuestForm onAdd={addGuest} />}

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-6 bg-white border-none shadow-sm rounded-xl"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="animate-spin mx-auto text-slate-400 mb-2" />
            <p className="text-slate-500">Carregando lista...</p>
          </div>
        ) : (
          <Tabs defaultValue="paying" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-200 rounded-xl p-1">
              <TabsTrigger value="paying" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <CreditCard size={16} className="mr-2" /> Pagantes ({payingGuests.length})
              </TabsTrigger>
              <TabsTrigger value="courtesy" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Gift size={16} className="mr-2" /> Cortesias ({courtesyGuests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="paying" className="space-y-1">
              {payingGuests.length > 0 ? (
                payingGuests.map(guest => (
                  <GuestCard
                    key={guest.id}
                    guest={guest}
                    onTogglePresence={togglePresence}
                    onDelete={deleteGuest}
                    canDelete={canDeleteGuests}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                  <p className="text-muted-foreground">Nenhum pagante na lista.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="courtesy" className="space-y-1">
              {courtesyGuests.length > 0 ? (
                courtesyGuests.map(guest => (
                  <GuestCard
                    key={guest.id}
                    guest={guest}
                    onTogglePresence={togglePresence}
                    onDelete={deleteGuest}
                    canDelete={canDeleteGuests}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                  <p className="text-muted-foreground">Nenhuma cortesia na lista.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;