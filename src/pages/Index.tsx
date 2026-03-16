"use client";

import React, { useState, useEffect } from 'react';
import { Guest } from '@/types/guest';
import AddGuestForm from '@/components/AddGuestForm';
import GuestCard from '@/components/GuestCard';
import GuestStats from '@/components/GuestStats';
import { Input } from '@/components/ui/input';
import { Search, Users, Gift, CreditCard } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { MadeWithDyad } from "@/components/made-with-dyad";
import logo from '@/assets/logo.png';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const savedGuests = localStorage.getItem('party-guests');
    if (savedGuests) {
      setGuests(JSON.parse(savedGuests));
    }
  }, []);

  // Salvar dados no localStorage sempre que a lista mudar
  useEffect(() => {
    localStorage.setItem('party-guests', JSON.stringify(guests));
  }, [guests]);

  const addGuest = (name: string, phone: string, isCourtesy: boolean) => {
    const newGuest: Guest = {
      id: crypto.randomUUID(),
      name,
      phone,
      isPresent: false,
      isCourtesy,
      createdAt: Date.now(),
    };
    setGuests(prev => [newGuest, ...prev]);
    showSuccess(`${name} adicionado à lista de ${isCourtesy ? 'Cortesias' : 'Pagantes'}!`);
  };

  const togglePresence = (id: string) => {
    setGuests(prev => prev.map(guest => {
      if (guest.id === id) {
        const newStatus = !guest.isPresent;
        if (newStatus) showSuccess(`${guest.name} chegou! 🎉`);
        return { ...guest, isPresent: newStatus };
      }
      return guest;
    }));
  };

  const deleteGuest = (id: string) => {
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
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-black text-white py-6 px-4 shadow-lg mb-8">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <img 
            src={logo} 
            alt="SEEC Logo" 
            className="w-20 h-20 object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold">SEEC Check-in</h1>
            <p className="text-slate-400 text-sm">Gerenciamento de calouradas da SEEC</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4">
        <GuestStats total={guests.length} present={presentCount} />
        
        <AddGuestForm onAdd={addGuest} />

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
      
      <MadeWithDyad />
    </div>
  );
};

export default Index;