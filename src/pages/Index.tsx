"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Guest } from '@/types/guest';
import AddGuestForm from '@/components/AddGuestForm';
import GuestCard from '@/components/GuestCard';
import GuestStats from '@/components/GuestStats';
import Footer from '@/components/Footer';
import PrintList from '@/components/PrintList';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Gift, CreditCard, LogOut, Settings, RefreshCw, ChevronLeft, ChevronRight, Printer } from 'lucide-react';
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
  const [allGuestsForPrint, setAllGuestsForPrint] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('paying');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [filteredTotal, setFilteredTotal] = useState(0);

  const isAdmin = role === 'admin_master';
  const canAddGuests = isAdmin || role === 'coordenador';
  const canDeleteGuests = isAdmin;

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
      .eq('is_courtesy', tab === 'courtesy')
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

  useEffect(() => {
    setPage(0);
  }, [activeTab, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGuests(page, searchTerm, activeTab);
      fetchStats();
    }, 300);

    return () => clearTimeout(timer);
  }, [page, searchTerm, activeTab, fetchGuests, fetchStats]);

  const handlePrint = async () => {
    try {
      // Busca TODOS os convidados da categoria atual para a impressão
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('is_courtesy', activeTab === 'courtesy')
        .order('name', { ascending: true });

      if (error) throw error;

      if (data) {
        const formatted = data.map(g => ({
          id: g.id,
          name: g.name,
          phone: g.phone || '',
          isPresent: g.is_present,
          isCourtesy: g.is_courtesy,
          createdAt: new Date(g.created_at).getTime()
        }));
        
        setAllGuestsForPrint(formatted);
        
        // Pequeno delay para garantir que o React renderizou o componente oculto
        setTimeout(() => {
          window.print();
          logAction('Imprimir Lista', `Imprimiu lista de ${activeTab}`);
        }, 100);
      }
    } catch (err) {
      showError('Erro ao preparar lista para impressão.');
    }
  };

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
      {/* Componente de Impressão (Oculto na tela, visível apenas no papel/PDF) */}
      <PrintList guests={allGuestsForPrint} type={activeTab} />

      <header className="bg-black text-white py-4 px-4 shadow-lg mb-6 sticky top-0 z-50 print:hidden">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden shrink-0">
              <img 
                src="/logo.png" 
                alt="SEEC Logo" 
                className="w-full h-full object-contain p-1"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold truncate">No Sigilo Check-in</h1>
              <div className="flex items-center gap-2">
                <p className="text-slate-400 text-[10px] sm:text-xs truncate max-w-[120px] sm:max-w-none">{user?.email}</p>
                <span className="bg-white/10 text-white text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                  {role === 'admin_master' ? 'Admin' : role === 'coordenador' ? 'Coord' : 'Membro'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => { fetchGuests(page, searchTerm, activeTab); fetchStats(); }}
              className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full h-9 w-9"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </Button>
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full h-9 w-9">
                  <Settings size={18} />
                </Button>
              </Link>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={signOut}
              className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full h-9 w-9"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 flex-grow w-full pb-8 print:hidden">
        <GuestStats total={totalCount} present={presentCount} />
        
        {canAddGuests && <AddGuestForm onAdd={addGuest} />}

        <div className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-5 bg-white border-none shadow-sm rounded-xl text-sm"
            />
          </div>
          {isAdmin && (
            <Button 
              onClick={handlePrint} 
              className="bg-white text-black hover:bg-slate-100 border-none shadow-sm rounded-xl h-auto px-4"
              title="Imprimir Lista / Salvar PDF"
            >
              <Printer size={18} />
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-200 rounded-xl p-1 h-11">
            <TabsTrigger value="paying" className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <CreditCard size={14} className="mr-1.5 sm:mr-2" /> Pagantes
            </TabsTrigger>
            <TabsTrigger value="courtesy" className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Gift size={14} className="mr-1.5 sm:mr-2" /> Cortesias
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="animate-spin mx-auto text-slate-400 mb-2" />
              <p className="text-slate-500 text-sm">Carregando lista...</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
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
                    <p className="text-muted-foreground text-sm">Nenhum registro encontrado.</p>
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(prev => Math.max(0, prev - 1))}
                      disabled={page === 0}
                      className="rounded-lg border-slate-200 h-9 w-9"
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                        let pageNum = i;
                        if (totalPages > 3 && page > 1) {
                          pageNum = Math.min(page - 1 + i, totalPages - 1);
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            className={`w-9 h-9 rounded-lg text-xs ${page === pageNum ? "bg-black text-white" : "border-slate-200 text-slate-600"}`}
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
                      className="rounded-lg border-slate-200 h-9 w-9"
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Página {page + 1} de {totalPages}
                  </p>
                </div>
              )}
            </>
          )}
        </Tabs>
      </main>
      
      <footer className="print:hidden">
        <Footer />
      </footer>
    </div>
  );
};

export default Index;