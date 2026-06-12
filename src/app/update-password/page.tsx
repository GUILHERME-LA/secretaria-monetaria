"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(
      ({ data: { user } }: { data: { user: User | null } }) => {
        if (!user) {
          router.push("/login");
        } else {
          setChecking(false);
        }
      }
    );
  }, [supabase, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      setLoading(false);
      return;
    }

    if (password !== confirm) {
      setError("As senhas não conferem.");
      setLoading(false);
      return;
    }

    const { error: err } = await supabase.auth.updateUser({ password });

    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      await supabase.auth.signOut();
      setDone(true);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-[var(--foreground)]">
            Senha atualizada!
          </h1>
          <p className="mb-6 text-sm text-[var(--muted-foreground)]">
            Sua senha foi redefinida com sucesso.
          </p>
          <Button onClick={() => router.push("/login")}>Fazer login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-[var(--accent)]/10 p-3">
            <Lock className="h-6 w-6 text-[var(--accent)]" />
          </div>
        </div>

        <h1 className="mb-6 text-center text-xl font-bold text-[var(--foreground)]">
          Redefinir senha
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nova senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirmar senha"
            type="password"
            placeholder="Repita a nova senha"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          {error && (
            <p className="text-sm text-[var(--destructive)]">{error}</p>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Redefinir senha"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
