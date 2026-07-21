"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormField,
  adminInputClass,
} from "@/components/admin/FormField";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Invalid credentials");
      return;
    }
    toast.success("Welcome back");
    router.replace(redirect);
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="admin-content space-y-5">
      <FormField label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@vegear.com"
          className={adminInputClass}
        />
      </FormField>
      <FormField label="Password" htmlFor="password">
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className={adminInputClass}
        />
      </FormField>
      <Button
        type="submit"
        className="w-full rounded-full bg-primary font-semibold uppercase tracking-[0.14em] text-primary-foreground hover:bg-primary/90"
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
        Sign in
      </Button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[480px] w-[480px] -translate-x-1/2 rounded-full opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--primary-rgb) / 0.18) 0%, transparent 65%)",
        }}
        aria-hidden
      />
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl shadow-black/40 sm:p-10">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Image
            src="/images/logo/logo-white.png"
            alt="VE Gear"
            width={400}
            height={160}
            priority
            className="h-9 w-auto"
          />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
              Control room
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">
              Admin Panel
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to manage your store
            </p>
          </div>
        </div>
        <Suspense
          fallback={
            <div className="space-y-5" aria-busy="true" aria-label="Loading">
              <div className="h-10 animate-pulse rounded-xl bg-white/[0.06]" />
              <div className="h-10 animate-pulse rounded-xl bg-white/[0.06]" />
              <div className="h-11 animate-pulse rounded-full bg-white/[0.06]" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
