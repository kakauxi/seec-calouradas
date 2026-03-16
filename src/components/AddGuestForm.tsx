"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AddGuestFormProps {
  onAdd: (name: string, phone: string) => void;
}

const AddGuestForm = ({ onAdd }: AddGuestFormProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name, phone);
    setName('');
    setPhone('');
  };

  return (
    <Card className="p-6 mb-8 bg-slate-100 border-none shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-900 font-medium">Nome do Convidado</Label>
            <Input
              id="name"
              placeholder="Ex: João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white border-slate-200 focus:ring-black"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-900 font-medium">Telefone / Contato</Label>
            <Input
              id="phone"
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-white border-slate-200 focus:ring-black"
            />
          </div>
        </div>
        <Button type="submit" className="w-full bg-black hover:bg-slate-800 text-white font-bold py-6 rounded-xl transition-all transform hover:scale-[1.01]">
          <PlusCircle className="mr-2" /> Adicionar à Lista
        </Button>
      </form>
    </Card>
  );
};

export default AddGuestForm;