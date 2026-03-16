import { supabase } from "@/integrations/supabase/client";

export const logAction = async (action: string, details?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    await supabase.from('logs').insert({
      user_id: user.id,
      user_email: user.email,
      action,
      details
    });
  }
};