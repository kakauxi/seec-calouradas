"use client";

import React from 'react';
import { Guest } from '@/types/guest';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Trash2, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuestCardProps {
  guest: Guest;
  onTogglePresence: (id: string) => void;
  onDelete: (id: string) => void;
}

const GuestCard = ({ guest, onTogglePresence, onDelete }: GuestCardProps) => {
  return (
    <Card className={cn(
      "p-4 mb-3 transition-all duration-300 border-l-4",
      guest.isPresent ? "border-l-green-500 bg-green-50/30" : "border-l-purple-500 bg-white"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className={cn(
            "font-semibold text-lg",
            guest.isPresent && "text-green-700 line-through opacity-70"
          )}>
            {guest.name}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <Phone size={14} className="mr-1" />
            {guest.phone}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(guest.id)}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={18} />
          </Button>
          
          <Button
            variant={guest.isPresent ? "default" : "outline"}
            size="sm"
            onClick={() => onTogglePresence(guest.id)}
            className={cn(
              "rounded-full px-4",
              guest.isPresent ? "bg-green-600 hover:bg-green-700" : "border-purple-200 text-purple-700 hover:bg-purple-50"
            )}
          >
            {guest.isPresent ? (
              <><CheckCircle2 size={16} className="mr-2" /> Presente</>
            ) : (
              <><Circle size={16} className="mr-2" /> Confirmar</>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default GuestCard;