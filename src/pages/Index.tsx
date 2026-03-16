"use client";

import React, { useState, useEffect } from 'react';
import { Guest } from '@/types/guest';
import AddGuestForm from '@/components/AddGuestForm';
import GuestCard from '@/components/GuestCard';
import GuestStats from '@/components/GuestStats';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { MadeWithDyad } from "@/components/made-with-dyad";
import logo from '@/assets/logo.png';

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

  const addGuest = (name: string, phone: string) => {
    const newGuest: Guest = {
      id: crypto.randomUUID(),
      name,
      phone,
      isPresent: false,
      createdAt: Date.now(),
    };
    setGuests(prev => [newGuest, ...prev]);
    showSuccess(`${name} adicionado à lista!`);
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
            <p className="text-slate-400 text-sm">Gerencie seus convidados com facilidade</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4">
        <GuestStats total={guests.length} present={presentCount} />
        
        <AddGuestForm onAdd={addGuest} />

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Buscar convidado por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-6 bg-white border-none shadow-sm rounded-xl"
          />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-700 mb-4 px-1">
            {searchTerm ? 'Resultados da busca' : 'Lista de Convidados'}
          </h2>
          
          {filteredGuests.length > 0 ? (
            filteredGuests.map(guest => (
              <GuestCard
                key={guest.id}
                guest={guest}
                onTogglePresence={togglePresence}
                onDelete={deleteGuest}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum convidado encontrado.' : 'A lista está vazia. Adicione convidados acima!'}
              </p>
            </div>
          )}
        </div>
      </main>
      
      <MadeWithDyad />
    </div>
  );
};

export default Index;