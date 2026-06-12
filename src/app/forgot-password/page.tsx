"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-[var(--foreground)]">
            Email enviado!
          </h1>
          <p className="mb-6 text-sm text-[var(--muted-foreground)]">
            Enviamos um link de recuperação para{" "}
            <strong className="text-[var(--foreground)]">{email}</strong>.
            Verifique sua caixa de entrada e spam.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 text-sm text-[var(--accent)] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o login
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-2 text-xl font-bold text-[var(--foreground)]">
          Recuperar senha
        </h1>
        <p className="mb-6 text-sm text-[var(--muted-foreground)]">
          Digite seu email e enviaremos um link para redefinir sua senha.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && (
            <p className="text-sm text-[var(--destructive)]">{error}</p>
          )}
          <Button type="submit" disabled={loading}>
            <Send className="h-4 w-4" />
            {loading ? "Enviando..." : "Enviar link de recuperação"}
          </Button>
        </form>

        <Link
          href="/login"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o login
        </Link>
      </Card>
    </div>
  );
}
