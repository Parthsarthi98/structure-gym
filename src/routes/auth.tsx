import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Structure Gym" },
      { name: "description", content: "Optional: sync your Structure Gym progress across devices. No account is needed to practise." },
      { property: "og:title", content: "Sign in — Structure Gym" },
      { property: "og:description", content: "Optional sync across devices. No account needed to practise." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/dashboard" } });
        if (error) throw error;
        if (data.session) navigate({ to: "/dashboard" });
        else setSent(true);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm py-8">
      <h1 className="font-display text-4xl">{mode === "in" ? "Sync across devices" : "Create an account to sync"}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Optional. Everything already works without an account and is saved in this browser. Sign in to keep your attempts, lessons and review list on every device; what you have done here moves to your account on first sign-in.</p>
      <Link to="/practice" className="mt-4 inline-flex min-h-12 items-center border-[1.5px] border-foreground px-5 hover:bg-foreground hover:text-background">Continue without an account →</Link>
      {sent ? (
        <p className="mt-6 rounded-md border bg-card p-4 text-sm">Check your email and click the confirmation link, then sign in.</p>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw">Password</Label>
            <Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Sign up"}</Button>
        </form>
      )}
      <button className="mt-4 text-sm text-primary underline-offset-4 hover:underline" onClick={() => { setMode(mode === "in" ? "up" : "in"); setSent(false); }}>
        {mode === "in" ? "No account? Sign up" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
