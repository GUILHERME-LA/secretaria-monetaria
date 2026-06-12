"use client";

import { useState, useEffect, Suspense } from "react";

export const dynamic = "force-dynamic";
import { createClient, isDemoMode } from "@/lib/supabase-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const confirmed = searchParams.get("confirmed");

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode()) {
      router.push("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    if (confirmed === "true") {
      setToast("Email confirmado! Faça seu login.");
      window.history.replaceState({}, "", "/login");
      const t = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(t);
    }
  }, [confirmed]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (err) {
      if (err.message?.toLowerCase().includes("email not confirmed")) {
        setError(
          "Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação."
        );
      } else {
        setError(err.message);
      }
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <>
      {toast && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 animate-fade-down rounded-lg bg-green-600 px-4 py-3 text-sm text-white shadow-lg flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          {toast}
        </div>
      )}
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <h1 className="mb-6 text-center text-xl font-bold text-[var(--foreground)]">
            ✦ Secretaria Monetária
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>
            {error && (
              <p className="text-sm text-[var(--destructive)]">{error}</p>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
            Não tem conta?{" "}
            <Link
              href="/register"
              className="font-medium text-[var(--accent)] hover:underline"
            >
              Cadastrar
            </Link>
          </p>
        </Card>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
