"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { FiLock, FiLogIn } from "react-icons/fi";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AdminLoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    startTransition(() => {
      void (async () => {
        try {
          const supabase = createSupabaseBrowserClient();
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });

          if (error || !data.user) {
            setErrorMessage("Email o contrasena incorrectos.");
            return;
          }

          const { data: adminUser, error: adminError } = await supabase
            .from("admin_users")
            .select("user_id")
            .eq("user_id", data.user.id)
            .maybeSingle();

          if (adminError || !adminUser) {
            await supabase.auth.signOut();
            setErrorMessage("Este usuario no tiene permisos de administrador.");
            return;
          }

          router.replace(nextPath);
          router.refresh();
        } catch (error) {
          setErrorMessage(error instanceof Error ? error.message : "No se pudo iniciar sesion.");
        }
      })();
    });
  }

  return (
    <form className="admin-login-card" onSubmit={handleSubmit}>
      <span className="admin-login-card__icon">
        <FiLock aria-hidden="true" />
      </span>
      <div>
        <p className="admin-kicker">Acceso seguro</p>
        <h1>Admin FastServices</h1>
        <p>Solo usuarios marcados como admin en Supabase pueden entrar.</p>
      </div>
      <label className="admin-field">
        <span>Email</span>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
      </label>
      <label className="admin-field">
        <span>Contrasena</span>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
      </label>
      {errorMessage ? <p className="admin-login-card__error">{errorMessage}</p> : null}
      <button type="submit" className="admin-button admin-button--primary" disabled={isPending}>
        <FiLogIn aria-hidden="true" /> {isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
