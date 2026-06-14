"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Save, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import type { User } from "@supabase/supabase-js";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(
      ({ data: { user } }: { data: { user: User | null } }) => {
        if (!user) {
          router.push("/login");
        } else {
          setUser(user);
          setNewEmail(user.email || "");
        }
        setLoadingUser(false);
      }
    );
  }, [supabase, router]);

  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailLoading(true);
    setEmailError("");
    setEmailSuccess("");

    if (!user) return;
    if (newEmail === user.email) {
      setEmailError("O novo email é igual ao atual.");
      setEmailLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) {
      setEmailError(error.message);
    } else {
      setEmailSuccess(
        "Enviamos um link de confirmação para o novo email. Verifique sua caixa de entrada."
      );
    }
    setEmailLoading(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    if (!user) return;
    if (newPassword.length < 6) {
      setPasswordError("A nova senha deve ter no mínimo 6 caracteres.");
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não conferem.");
      setPasswordLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      setPasswordError("Senha atual incorreta.");
      setPasswordLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordLoading(false);
  }

  if (loadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold text-[var(--foreground)]">
          Configurações da conta
        </h1>

        <Card className="mb-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Mail className="h-5 w-5" />
            Alterar email
          </h2>
          <form onSubmit={handleChangeEmail} className="flex flex-col gap-4">
            <Input label="Email atual" value={user?.email || ""} disabled />
            <Input
              label="Novo email"
              type="email"
              placeholder="novo@email.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
            {emailError && (
              <p className="text-sm text-[var(--destructive)]">{emailError}</p>
            )}
            {emailSuccess && (
              <p className="text-sm text-green-500">{emailSuccess}</p>
            )}
            <Button type="submit" disabled={emailLoading}>
              <Save className="h-4 w-4" />
              {emailLoading ? "Salvando..." : "Alterar email"}
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Lock className="h-5 w-5" />
            Alterar senha
          </h2>
          <form
            onSubmit={handleChangePassword}
            className="flex flex-col gap-4"
          >
            <Input
              label="Senha atual"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="Nova senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirmar nova senha"
              type="password"
              placeholder="Repita a nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {passwordError && (
              <p className="text-sm text-[var(--destructive)]">
                {passwordError}
              </p>
            )}
            {passwordSuccess && (
              <p className="text-sm text-green-500">{passwordSuccess}</p>
            )}
            <Button type="submit" disabled={passwordLoading}>
              <Save className="h-4 w-4" />
              {passwordLoading ? "Salvando..." : "Alterar senha"}
            </Button>
          </form>
        </Card>
      </main>
    </>
  );
}
