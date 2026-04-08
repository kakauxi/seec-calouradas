"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Guest } from '@/types/guest';
import AddGuestForm from '@/components/AddGuestForm';
import GuestCard from '@/components/GuestCard';
import GuestStats from '@/components/GuestStats';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Gift, CreditCard, LogOut, Settings, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/components/AuthProvider';
import { Link } from 'react-router-dom';
import { logAction } from '@/utils/logger';
import { supabase } from '@/integrations/supabase/client';

const PAGE_SIZE = 20;

const Index = () => {
  const { signOut, user, role } = useAuth();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('paying');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [filteredTotal, setFilteredTotal] = useState(0);

  const canAddGuests = role === 'admin_master' || role === 'coordenador';
  const canDeleteGuests = role === 'admin_master';

  const fetchStats = useCallback(async () => {
    const { count, error } = await supabase
      .from('guests')
      .select('*', { count: 'exact', head: true });
    
    if (!error && count !== null) setTotalCount(count);

    const { count: present, error: pError } = await supabase
      .from('guests')
      .select('*', { count: 'exact', head: true })
      .eq('is_present', true);
    
    if (!pError && present !== null) setPresentCount(present);
  }, []);

  const fetchGuests = useCallback(async (pageNum: number, search: string, tab: string) => {
    setLoading(true);

    let query = supabase
      .from('guests')
      .select('*', { count: 'exact' })
      .eq('is_courtesy', tab === 'courtesy') // Filtra por tipo na consulta
      .order('name', { ascending: true })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, count, error } = await query;

    if (error) {
      showError('Erro ao carregar lista de convidados.');
    } else if (data) {
      const formatted = data.map(g => ({
        id: g.id,
        name: g.name,
        phone: g.phone || '',
        isPresent: g.is_present,
        isCourtesy: g.is_courtesy,
        createdAt: new Date(g.created_at).getTime()
      }));

      setGuests(formatted);
      setFilteredTotal(count || 0);
    }
    
    setLoading(false);
  }, []);

  // Resetar página ao trocar de aba ou buscar
  useEffect(() => {
    setPage(0);
  }, [activeTab, searchTerm]);

  // Buscar dados quando página, aba ou busca mudar
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGuests(page, searchTerm, activeTab);
      fetchStats();
    }, 300);

    return () => clearTimeout(timer);
  }, [page, searchTerm, activeTab, fetchGuests, fetchStats]);

  useEffect(() => {
    const channel = supabase
      .channel('guests-realtime-index')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guests' },
        () => {
          fetchStats();
          fetchGuests(page, searchTerm, activeTab);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats, fetchGuests, page, searchTerm, activeTab]);

  const addGuest = async (name: string, phone: string, isCourtesy: boolean) => {
    if (!canAddGuests) return;

    const { data: existing } = await supabase
      .from('guests')
      .select('id')
      .ilike('name', name.trim())
      .maybeSingle();

    if (existing) {
      showError(`O nome "${name}" já está na lista!`);
      return;
    }
    
    const { error } = await supabase
      .from('guests')
      .insert([{ 
        name: name.trim(), 
        phone, 
        is_courtesy: isCourtesy,
        is_present: false 
      }]);

    if (error) {
      showError('Erro ao salvar convidado.');
    } else {
      showSuccess(`${name} adicionado!`);
      logAction('Adicionar Convidado', `Adicionou ${name}`);
      // Se adicionou uma cortesia e está na aba de pagantes (ou vice-versa), avisa o usuário
      if ((isCourtesy && activeTab === 'paying') || (!isCourtesy && activeTab === 'courtesy')) {
        showSuccess(`Dica: O convidado foi adicionado na aba de ${isCourtesy ? 'Cortesias' : 'Pagantes'}.`);
      }
      fetchGuests(page, searchTerm, activeTab);
      fetchStats();
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
      fetchStats();
      fetchGuests(page, searchTerm, activeTab);
      
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
      fetchStats();
      fetchGuests(page, searchTerm, activeTab);
      if (guest) {
        logAction('Excluir Convidado', `Removeu ${guest.name}`);
      }
      showSuccess('Convidado removido.');
    }
  };

  const totalPages = Math.ceil(filteredTotal / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-black text-white py-6 px-4 shadow-lg mb-8">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden">
              <img 
                src="/logo.png" 
                alt="SEEC Logo" 
                className="w-full h-full object-contain p-1"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">No Sigilo (SEEC/SPOTTED) Check-in</h1>
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
              onClick={() => { fetchGuests(page, searchTerm, activeTab); fetchStats(); }}
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
        <GuestStats total={totalCount} present={presentCount} />
        
        {canAddGuests && <AddGuestForm onAdd={addGuest} />}

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-6 bg-white border-none shadow-sm rounded-xl"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-200 rounded-xl p-1">
            <TabsTrigger value="paying" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <CreditCard size={16} className="mr-2" /> Pagantes
            </TabsTrigger>
            <TabsTrigger value="courtesy" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Gift size={16} className="mr-2" /> Cortesias
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="animate-spin mx-auto text-slate-400 mb-2" />
              <p className="text-slate-500">Carregando lista...</p>
            </div>
          ) : (
            <>
              <TabsContent value="paying" className="space-y-1 mt-0">
                {guests.length > 0 ? (
                  guests.map(guest => (
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
                    <p className="text-muted-foreground">Nenhum pagante encontrado.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="courtesy" className="space-y-1 mt-0">
                {guests.length > 0 ? (
                  guests.map(guest => (
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
                    <p className="text-muted-foreground">Nenhuma cortesia encontrada.</p>
                  </div>
                )}
              </TabsContent>

              {totalPages > 1 && (
                <div className="mt-8 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(prev => Math.max(0, prev - 1))}
                      disabled={page === 0}
                      className="rounded-xl border-slate-200"
                    >
                      <ChevronLeft size={18} />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = i;
                        if (totalPages > 5 && page > 2) {
                          pageNum = Math.min(page - 2 + i, totalPages - 1);
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 rounded-xl ${page === pageNum ? "bg-black text-white" : "border-slate-200 text-slate-600"}`}
                          >
                            {pageNum + 1}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={page === totalPages - 1}
                      className="rounded-xl border-slate-200"
                    >
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400">
                    Página {page + 1} de {totalPages} ({filteredTotal} resultados nesta categoria)
                  </p>
                </div>
              )}
            </>
          )}
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;