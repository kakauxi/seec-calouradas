"use client";

import React, { useState, useEffect } from 'react';
import { Guest } from '@/types/guest';
import AddGuestForm from '@/components/AddGuestForm';
import GuestCard from '@/components/GuestCard';
import GuestStats from '@/components/GuestStats';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Gift, CreditCard, LogOut, ShieldCheck, Settings } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/components/AuthProvider';
import { Link } from 'react-router-dom';
import { logAction } from '@/utils/logger';

const Index = () => {
  const { signOut, user, role } = useAuth();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const canManageList = role === 'admin_master';

  useEffect(() => {
    const savedGuests = localStorage.getItem('party-guests');
    if (savedGuests) {
      setGuests(JSON.parse(savedGuests));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('party-guests', JSON.stringify(guests));
  }, [guests]);

  const addGuest = (name: string, phone: string, isCourtesy: boolean) => {
    if (!canManageList) return;
    const newGuest: Guest = {
      id: crypto.randomUUID(),
      name,
      phone,
      isPresent: false,
      isCourtesy,
      createdAt: Date.now(),
    };
    setGuests(prev => [newGuest, ...prev]);
    showSuccess(`${name} adicionado à lista!`);
    logAction('Adicionar Convidado', `Adicionou ${name} (${isCourtesy ? 'Cortesia' : 'Pagante'})`);
  };

  const togglePresence = (id: string) => {
    setGuests(prev => prev.map(guest => {
      if (guest.id === id) {
        const newStatus = !guest.isPresent;
        if (newStatus) {
          showSuccess(`${guest.name} chegou! 🎉`);
          logAction('Check-in', `Confirmou presença de ${guest.name}`);
        }
        return { ...guest, isPresent: newStatus };
      }
      return guest;
    }));
  };

  const deleteGuest = (id: string) => {
    if (!canManageList) return;
    const guest = guests.find(g => g.id === id);
    if (guest) {
      logAction('Excluir Convidado', `Removeu ${guest.name} da lista`);
    }
    setGuests(prev => prev.filter(guest => guest.id !== id));
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
                  {role === 'admin_master' ? 'Admin' : role === 'membro' ? 'Membro' : 'Usuário'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
        
        {canManageList && <AddGuestForm onAdd={addGuest} />}

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-6 bg-white border-none shadow-sm rounded-xl"
          />
        </div>

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
                  canDelete={canManageList}
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
                  canDelete={canManageList}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-muted-foreground">Nenhuma cortesia na lista.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;