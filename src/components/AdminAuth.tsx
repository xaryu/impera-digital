import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Lock } from "lucide-react";
import { toast } from "sonner";

const AdminAuth = ({
  onClose,
  onLoggedIn,
}: {
  onClose: () => void;
  onLoggedIn: () => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Account created! You can now log in.");
        setMode("login");
        setLoading(false);
        return;
      }
      toast.success("Logged in as admin");
      onLoggedIn();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/80 backdrop-blur-sm">
      <div className="relative bg-background border border-gold/20 p-10 w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-8">
          <Lock className="w-5 h-5 text-gold" />
          <h2 className="font-display text-xl font-semibold text-foreground">
            Admin Access
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-body text-xs tracking-wider uppercase text-muted-foreground mb-2 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border border-border focus:border-gold/50 px-4 py-3 font-body text-sm text-foreground outline-none transition-colors"
            />
          </div>
          <div>
            <label className="font-body text-xs tracking-wider uppercase text-muted-foreground mb-2 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border border-border focus:border-gold/50 px-4 py-3 font-body text-sm text-foreground outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors duration-300 disabled:opacity-60"
          >
            {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
        <p className="mt-4 text-center font-body text-xs text-muted-foreground">
          {mode === "login" ? (
            <>
              No account?{" "}
              <button onClick={() => setMode("signup")} className="text-gold hover:underline">
                Create one
              </button>
            </>
          ) : (
            <>
              Already have one?{" "}
              <button onClick={() => setMode("login")} className="text-gold hover:underline">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AdminAuth;
