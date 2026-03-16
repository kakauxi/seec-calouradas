"use client";

import React, { useState } from 'react';
import { Guest } from '@/types/guest';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Trash2, Phone, Gift, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';

interface GuestCardProps {
  guest: Guest;
  onTogglePresence: (id: string) => void;
  onDelete: (id: string) => void;
  canDelete?: boolean;
}

const GuestCard = ({ guest, onTogglePresence, onDelete, canDelete = true }: GuestCardProps) => {
  const [showPresenceConfirm, setShowPresenceConfirm] = useState(false);

  const handlePresenceClick = () => {
    if (guest.isPresent) {
      // Se já está presente, pede confirmação para remover
      setShowPresenceConfirm(true);
    } else {
      // Se não está presente, confirma direto para agilizar
      onTogglePresence(guest.id);
    }
  };

  return (
    <Card className={cn(
      "p-4 mb-3 transition-all duration-300 border-l-4",
      guest.isPresent ? "border-l-green-500 bg-green-50/30" : "border-l-slate-900 bg-white"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "font-semibold text-lg",
              guest.isPresent && "text-green-700 line-through opacity-70"
            )}>
              {guest.name}
            </h3>
            {guest.isCourtesy && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-none flex items-center gap-1">
                <Gift size={12} /> Cortesia
              </Badge>
            )}
          </div>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <Phone size={14} className="mr-1" />
            {guest.phone}
          </div>
        </div>
        
        <div className="flex gap-2">
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={18} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir convidado?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja remover <strong>{guest.name}</strong> da lista? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(guest.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                  >
                    Confirmar Exclusão
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          <AlertDialog open={showPresenceConfirm} onOpenChange={setShowPresenceConfirm}>
            <Button
              variant={guest.isPresent ? "default" : "outline"}
              size="sm"
              onClick={handlePresenceClick}
              className={cn(
                "rounded-full px-4",
                guest.isPresent ? "bg-green-600 hover:bg-green-700" : "border-slate-200 text-slate-900 hover:bg-slate-50"
              )}
            >
              {guest.isPresent ? (
                <><CheckCircle2 size={16} className="mr-2" /> Presente</>
              ) : (
                <><Circle size={16} className="mr-2" /> Confirmar</>
              )}
            </Button>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <AlertTriangle size={20} />
                  <AlertDialogTitle>Remover presença?</AlertDialogTitle>
                </div>
                <AlertDialogDescription>
                  Você está prestes a remover a confirmação de presença de <strong>{guest.name}</strong>. 
                  Deseja continuar?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => {
                    onTogglePresence(guest.id);
                    setShowPresenceConfirm(false);
                  }}
                  className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl"
                >
                  Sim, remover presença
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
};

export default GuestCard;