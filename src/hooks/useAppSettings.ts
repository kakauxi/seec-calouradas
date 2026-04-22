"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAppSettings() {
  const [appName, setAppName] = useState('Carregando...');
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'app_name')
        .maybeSingle();

      if (!error && data) {
        setAppName(data.value);
        document.title = data.value;
      }
    } catch (err) {
      console.error("Erro ao buscar configurações:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Realtime para atualizar o nome instantaneamente em todos os dispositivos
    const channel = supabase
      .channel('settings_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'settings', filter: 'key=eq.app_name' },
        (payload) => {
          setAppName(payload.new.value);
          document.title = payload.new.value;
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateAppName = async (newName: string) => {
    const { error } = await supabase
      .from('settings')
      .update({ value: newName, updated_at: new Date().toISOString() })
      .eq('key', 'app_name');
    
    return { error };
  };

  return { appName, loading, updateAppName, refresh: fetchSettings };
}