"use client";

import { useState, useEffect } from "react";

export const dynamic = "force-dynamic";
import { createClient, isDemoMode } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isDemoMode()) {
      router.push("/dashboard");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      setLoading(false);
      return;
    }

    const timeout = new Promise<{ error: any }>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 20000)
    );

    const signup = supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
      },
    });

    const result = await Promise.race([signup, timeout]).catch((err) => {
      if (err.message === "timeout") {
        return { error: new Error("O servidor não está respondendo. Verifique sua conexão ou tente novamente mais tarde.") };
      }
      return { error: err };
    });

    const { data, error: err } = result as any;

    if (err) {
      if (err.message?.toLowerCase().includes("already registered")) {
        setError("Este email já está cadastrado. Faça login.");
      } else {
        setError(err.message);
      }
      setLoading(false);
    } else if (data?.session) {
      router.push("/dashboard");
    } else if (isDemoMode()) {
      router.push("/dashboard");
    } else {
      router.push(`/confirm?email=${encodeURIComponent(email)}`);
    }
  }

  return (
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
          <div className="relative">
            <Input
              label="Senha"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="relative">
            <Input
              label="Confirmar senha"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[38px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && (
            <p className="text-sm text-[var(--destructive)]">{error}</p>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? "Criando..." : "Criar Conta"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--accent)] hover:underline"
          >
            Entrar
          </Link>
        </p>
      </Card>
    </div>
  );
}
