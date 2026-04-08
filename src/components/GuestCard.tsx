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
      setShowPresenceConfirm(true);
    } else {
      onTogglePresence(guest.id);
    }
  };

  return (
    <Card className={cn(
      "p-3 sm:p-4 transition-all duration-300 border-l-4",
      guest.isPresent ? "border-l-green-500 bg-green-50/30" : "border-l-slate-900 bg-white"
    )}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className={cn(
              "font-semibold text-sm sm:text-base truncate max-w-[150px] sm:max-w-none",
              guest.isPresent && "text-green-700 line-through opacity-70"
            )}>
              {guest.name}
            </h3>
            {guest.isCourtesy && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-none flex items-center gap-1 text-[10px] px-1.5 py-0">
                <Gift size={10} /> Cortesia
              </Badge>
            )}
          </div>
          <div className="flex items-center text-[11px] sm:text-sm text-muted-foreground mt-0.5">
            <Phone size={12} className="mr-1 shrink-0" />
            <span className="truncate">{guest.phone || 'Sem contato'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0">
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 h-8 w-8 sm:h-9 sm:w-9"
                >
                  <Trash2 size={16} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl w-[90%] max-w-sm mx-auto">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-lg">Excluir convidado?</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm">
                    Remover <strong>{guest.name}</strong> da lista?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row gap-2 sm:gap-0">
                  <AlertDialogCancel className="rounded-xl flex-1 mt-0">Não</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(guest.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl flex-1"
                  >
                    Sim
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
                "rounded-full px-3 sm:px-4 h-8 sm:h-9 text-[11px] sm:text-xs font-bold",
                guest.isPresent ? "bg-green-600 hover:bg-green-700" : "border-slate-200 text-slate-900 hover:bg-slate-50"
              )}
            >
              {guest.isPresent ? (
                <><CheckCircle2 size={14} className="mr-1.5" /> Presente</>
              ) : (
                <><Circle size={14} className="mr-1.5" /> Confirmar</>
              )}
            </Button>
            <AlertDialogContent className="rounded-2xl w-[90%] max-w-sm mx-auto">
              <AlertDialogHeader>
                <div className="flex items-center gap-2 text-amber-600 mb-1">
                  <AlertTriangle size={18} />
                  <AlertDialogTitle className="text-lg">Remover presença?</AlertDialogTitle>
                </div>
                <AlertDialogDescription className="text-sm">
                  Deseja remover a confirmação de <strong>{guest.name}</strong>?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row gap-2 sm:gap-0">
                <AlertDialogCancel className="rounded-xl flex-1 mt-0">Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => {
                    onTogglePresence(guest.id);
                    setShowPresenceConfirm(false);
                  }}
                  className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl flex-1"
                >
                  Confirmar
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