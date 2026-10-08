import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

// Sign-in only. Admin accounts are created and granted the 'admin' role
// from the Supabase dashboard, never from the site.
const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md border border-gold/20 bg-navy/50 rounded-lg p-10">
      <div className="flex items-center gap-3 mb-8">
        <Lock className="w-5 h-5 text-gold" aria-hidden="true" />
        <h1 className="font-display text-xl font-semibold text-cream">Admin Access</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="admin-email" className="font-body text-xs tracking-wider uppercase text-gold-muted mb-2 block">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-navy-dark border border-gold/20 focus:border-gold/50 px-4 py-3 font-body text-sm text-cream outline-none transition-colors rounded"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="font-body text-xs tracking-wider uppercase text-gold-muted mb-2 block">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-navy-dark border border-gold/20 focus:border-gold/50 px-4 py-3 font-body text-sm text-cream outline-none transition-colors rounded"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors duration-300 disabled:opacity-60 rounded"
        >
          {loading ? "Please wait…" : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
