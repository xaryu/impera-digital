import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type AdminState = {
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
};

const hasAdminRole = async (userId: string) => {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) throw error;
  return data === true;
};

export const signOutAdmin = async () => {
  await supabase.auth.signOut();
  toast.success("Signed out");
};

// Being signed in is not enough: the account must hold the 'admin' role
// (see the admin_role migration). The database enforces the same rule via RLS,
// so this only decides what UI to show. The role check is cached per user, so
// every component can call this without repeating the request.
export const useAdmin = (): AdminState => {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    // Fires immediately with the current session, then on every auth change.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setSessionLoaded(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  const { data: isAdmin = false, isPending } = useQuery({
    queryKey: ["is-admin", userId],
    queryFn: () => hasAdminRole(userId!),
    enabled: !!userId,
    staleTime: Infinity,
  });

  return {
    session,
    isAdmin: !!userId && isAdmin,
    loading: !sessionLoaded || (!!userId && isPending),
  };
};
