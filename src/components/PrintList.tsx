"use client";

import React from 'react';
import { Guest } from '@/types/guest';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PrintListProps {
  guests: Guest[];
  type: string;
  appName: string;
}

const PrintList = ({ guests, type, appName }: PrintListProps) => {
  const dateStr = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  const title = type === 'courtesy' ? 'Lista de Cortesias' : 'Lista de Pagantes';

  return (
    <div className="hidden print:block p-8 bg-white text-black">
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase">{appName}</h1>
          <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
        </div>
        <div className="text-right text-sm">
          <p>Gerado em: {dateStr}</p>
          <p>Total: {guests.length} convidados</p>
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="py-2 text-left w-12">#</th>
            <th className="py-2 text-left">Nome do Convidado</th>
            <th className="py-2 text-left">Telefone / Contato</th>
            <th className="py-2 text-center w-24">Presente</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((guest, index) => (
            <tr key={guest.id} className="border-b border-gray-200">
              <td className="py-2 text-gray-500">{index + 1}</td>
              <td className="py-2 font-medium">{guest.name}</td>
              <td className="py-2 text-gray-600">{guest.phone || '---'}</td>
              <td className="py-2 text-center">
                <div className="w-5 h-5 border border-black mx-auto rounded-sm">
                  {guest.isPresent && "✓"}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-12 pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
        <p>© 2026 SEEC Desenvolvimento de Software - Documento Oficial de Check-in</p>
      </div>
    </div>
  );
};

export default PrintList;