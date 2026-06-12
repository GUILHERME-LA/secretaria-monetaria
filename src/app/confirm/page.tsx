"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const email = searchParams.get("email") || "";
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleResend() {
    if (!email) return;
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
      },
    });
    if (!error) setResent(true);
    setResending(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-[var(--accent)]/10 p-3">
            <Mail className="h-8 w-8 text-[var(--accent)]" />
          </div>
        </div>

        <h1 className="mb-2 text-xl font-bold text-[var(--foreground)]">
          Verifique seu email
        </h1>

        <p className="mb-1 text-sm text-[var(--muted-foreground)]">
          Enviamos um link de confirmação para
        </p>
        <p className="mb-6 font-medium text-[var(--foreground)]">{email}</p>

        <p className="mb-6 text-sm text-[var(--muted-foreground)]">
          Clique no link para ativar sua conta. Se não encontrar, verifique a
          caixa de spam.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            variant="secondary"
            onClick={handleResend}
            disabled={resending || resent}
          >
            <RefreshCw
              className={`h-4 w-4 ${resending ? "animate-spin" : ""}`}
            />
            {resent ? "Email reenviado" : "Reenviar email"}
          </Button>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o login
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmContent />
    </Suspense>
  );
}
