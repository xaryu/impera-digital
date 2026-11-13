import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { company } from "@/config/company";

const emailSchema = z.string().trim().email().max(255);

// Where the form-submit Edge Function sends contact messages, leads and job applications.
// One row in site_settings; empty means the fallback company.email.
const SettingsPanel = () => {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("notification_email").single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) setEmail(settings.notification_email ?? "");
  }, [settings]);

  const save = useMutation({
    mutationFn: async (value: string | null) => {
      // RLS turns a forbidden update into a silent no-op, so ask for the row back.
      const { data, error } = await supabase
        .from("site_settings")
        .update({ notification_email: value })
        .eq("id", true)
        .select("notification_email");
      if (error) throw error;
      if (!data.length) throw new Error("Nothing was saved. Check that this account has the admin role.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
      toast.success("Settings saved");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return save.mutate(null);
    const result = emailSchema.safeParse(trimmed);
    if (!result.success) {
      toast.error("Enter a valid email address, or leave the field empty.");
      return;
    }
    save.mutate(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="border border-gold/10 bg-navy/30 rounded-lg p-6 space-y-4 max-w-xl">
      <div>
        <label htmlFor="notification-email" className="font-body text-xs tracking-wider uppercase text-gold-muted mb-2 block">
          Notification email
        </label>
        <input
          id="notification-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          maxLength={255}
          placeholder={company.email}
          aria-describedby="notification-email-help"
          className="w-full bg-navy-dark border border-gold/20 focus:border-gold/50 px-4 py-3 font-body text-sm text-cream outline-none transition-colors rounded placeholder:text-gold-muted/40"
        />
        <p id="notification-email-help" className="font-body text-xs text-gold-muted/70 mt-2">
          New contact messages, exit-popup leads and job applications are emailed here. Leave it empty to use{" "}
          {company.email}.
        </p>
      </div>
      <button
        type="submit"
        disabled={isLoading || save.isPending}
        className="px-6 py-2.5 bg-gold text-navy-dark font-body text-xs font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors rounded disabled:opacity-50"
      >
        {save.isPending ? "Saving…" : "Save"}
      </button>
    </form>
  );
};

export default SettingsPanel;
