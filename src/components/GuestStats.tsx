"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, CheckCircle } from 'lucide-react';

interface GuestStatsProps {
  total: number;
  present: number;
}

const GuestStats = ({ total, present }: GuestStatsProps) => {
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      <Card className="p-4 flex items-center space-x-4 bg-white border-none shadow-sm">
        <div className="p-3 bg-purple-100 rounded-full text-purple-600">
          <Users size={24} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-purple-900">{total}</p>
        </div>
      </Card>
      
      <Card className="p-4 flex items-center space-x-4 bg-white border-none shadow-sm">
        <div className="p-3 bg-green-100 rounded-full text-green-600">
          <CheckCircle size={24} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Presentes</p>
          <p className="text-2xl font-bold text-green-700">{present} <span className="text-sm font-normal text-muted-foreground">({percentage}%)</span></p>
        </div>
      </Card>
    </div>
  );
};

export default GuestStats;