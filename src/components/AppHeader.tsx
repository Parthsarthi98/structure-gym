import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/learn", label: "Learn" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/practice", label: "Practice" },
  { to: "/quick", label: "Quick checks" },
  { to: "/library", label: "Frameworks" },
  { to: "/value-chains", label: "Value chains" },
  { to: "/review", label: "Review" },
  { to: "/history", label: "History" },
  { to: "/glossary", label: "Glossary" },
] as const;

export function useSessionEmail() {
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);
  return email;
}

function useToday() {
  const [d, setD] = useState("");
  useEffect(() => setD(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })), []);
  return d;
}

export function AppHeader() {
  const email = useSessionEmail();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const today = useToday();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };
  if (path.startsWith("/drill/")) return null; // the drill has its own slim header
  const cover = path === "/";
  const account = email ? (
    <button onClick={signOut} className="smallcaps hover:text-destructive">Sign out</button>
  ) : email === null ? (
    <Link to="/auth" className="smallcaps hover:text-destructive">Sync across devices</Link>
  ) : <span />;
  const nav = (
    <nav className="flex gap-x-5 gap-y-1 overflow-x-auto py-2 text-[17px] sm:flex-wrap sm:justify-center">
      {NAV.map((n) => (
        <Link key={n.to} to={n.to} className="whitespace-nowrap smallcaps hover:text-destructive" activeProps={{ className: "text-destructive" }}>
          {n.label}
        </Link>
      ))}
    </nav>
  );
  if (!cover) {
    return (
      <header className="mx-auto max-w-7xl px-5 pt-4">
        <div className="flex items-end justify-between gap-4 border-b-[3px] border-foreground pb-1">
          <Link to="/" className="font-display text-[34px] font-bold leading-none tracking-[-0.02em] sm:text-[44px]">STRUCTURE GYM</Link>
          <div className="text-[15px]">{account}</div>
        </div>
        <div className="border-b border-foreground" style={{ marginTop: 3 }}>{nav}</div>
      </header>
    );
  }
  return (
    <header className="mx-auto max-w-7xl px-5 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-foreground pb-1 text-[15px] smallcaps">
        <span className="nums">Vol. 1 · No. 01</span>
        <span className="hidden sm:inline">The Case Interview Issue</span>
        <span className="nums">{today}</span>
      </div>
      <Link to="/" className="block pt-2 text-center">
        <span className="block whitespace-nowrap font-display font-bold" style={{ fontSize: "clamp(44px, 12vw, 180px)", letterSpacing: "-0.025em", lineHeight: 0.88 }}>STRUCTURE GYM</span>
      </Link>
      <p className="mt-2 text-center text-xl italic text-muted-foreground">A magazine for the daily case drill.</p>
      <div className="mt-3 border-t-[3px] border-foreground" />
      <div className="border-b border-foreground" style={{ marginTop: 3 }}>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">{nav}</div>
          <div className="text-[15px]">{account}</div>
        </div>
      </div>
    </header>
  );
}

export function Colophon() {
  return (
    <footer className="mx-auto mt-20 max-w-7xl px-5 pb-10">
      <div className="rule-double pt-4 grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <div className="smallcaps">Colophon</div>
          <p className="mt-1 italic text-muted-foreground">Set in EB Garamond. Printed on warm paper, in ink and one red.</p>
        </div>
        <div>
          <div className="smallcaps">In this issue</div>
          <p className="mt-1 text-muted-foreground">Six lessons, twelve frameworks, 204 cases, 119 flaw drills, 17 value chains.</p>
        </div>
        <div className="sm:text-right">
          <div className="smallcaps">Structure Gym</div>
          <p className="mt-1 italic text-muted-foreground">Vol. 1 · The Case Interview Issue</p>
        </div>
      </div>
    </footer>
  );
}

/** Feature-spread opener: big issue number + headline + italic standfirst. */
export function Opener({ no, kicker, title, standfirst }: { no?: string | number | undefined; kicker?: string | undefined; title: string; standfirst?: string | undefined }) {
  return (
    <div className="mb-8 grid items-end gap-5 pb-2 sm:grid-cols-[auto_1fr]">
      {no !== undefined && <div className="nums font-display text-7xl font-bold leading-none text-destructive sm:text-8xl">{typeof no === "number" ? String(no).padStart(2, "0") : no}</div>}
      <div>
        {kicker && <div className="kicker mb-2 text-[16px]">{kicker}</div>}
        <h1 className="headline font-display">{title}</h1>
        {standfirst && <p className="mt-4 max-w-[50ch] text-[clamp(21px,2vw,27px)] italic leading-snug text-muted-foreground">{standfirst}</p>}
      </div>
    </div>
  );
}

export const issueNo = (n: number) => `No. ${String(n).padStart(2, "0")}`;

/** Section header: 3px ink top rule and 1px rule 3px apart, then a heading. */
export function SectionHead({ children, kicker, className }: { children: React.ReactNode; kicker?: string | undefined; className?: string | undefined }) {
  return (
    <div className={`mb-5 ${className ?? ""}`}>
      <div className="border-t-[3px] border-foreground" />
      <div className="border-t border-foreground" style={{ marginTop: 3 }} />
      {kicker && <div className="mt-3 text-[15px] smallcaps text-destructive">{kicker}</div>}
      <h2 className="mt-2 font-display text-[clamp(30px,3.4vw,44px)] font-semibold leading-tight">{children}</h2>
    </div>
  );
}

/** Pull quote with a huge red opening mark. */
export function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <figure className="mx-auto my-14 grid max-w-5xl items-start gap-4 border-t-[3px] border-b border-foreground py-6 sm:grid-cols-[auto_1fr]">
      <span aria-hidden className="font-display leading-[0.7] text-destructive" style={{ fontSize: "clamp(120px, 14vw, 200px)" }}>“</span>
      <blockquote className="font-display text-[clamp(28px,3.2vw,46px)] italic leading-[1.15]">{children}</blockquote>
    </figure>
  );
}
