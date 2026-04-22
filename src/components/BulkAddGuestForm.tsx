"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Gift, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface BulkAddGuestFormProps {
  onAddBulk: (names: string[], isCourtesy: boolean) => Promise<void>;
}

const BulkAddGuestForm = ({ onAddBulk }: BulkAddGuestFormProps) => {
  const [bulkText, setBulkText] = useState('');
  const [isCourtesy, setIsCourtesy] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const names = bulkText
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (names.length === 0) return;

    setLoading(true);
    await onAddBulk(names, isCourtesy);
    setBulkText('');
    setIsCourtesy(false);
    setLoading(false);
  };

  return (
    <Card className="p-6 mb-8 bg-slate-100 border-none shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bulk-names" className="text-slate-900 font-medium">Lista de Nomes (um por linha)</Label>
          <Textarea
            id="bulk-names"
            placeholder="João Silva&#10;Maria Oliveira&#10;Pedro Santos"
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            className="bg-white border-slate-200 focus:ring-black min-h-[120px] rounded-xl"
            required
          />
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            Dica: Você pode copiar e colar uma lista do WhatsApp aqui.
          </p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-slate-200">
          <Switch 
            id="bulk-courtesy" 
            checked={isCourtesy} 
            onCheckedChange={setIsCourtesy}
          />
          <Label htmlFor="bulk-courtesy" className="flex items-center cursor-pointer text-slate-700">
            <Gift size={16} className="mr-2 text-amber-500" />
            Marcar todos como Cortesia
          </Label>
        </div>

        <Button 
          type="submit" 
          disabled={loading || !bulkText.trim()}
          className="w-full bg-black hover:bg-slate-800 text-white font-bold py-6 rounded-xl transition-all"
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2" />
          ) : (
            <Users className="mr-2" />
          )}
          Adicionar {bulkText.split('\n').filter(n => n.trim()).length} Convidados
        </Button>
      </form>
    </Card>
  );
};

export default BulkAddGuestForm;