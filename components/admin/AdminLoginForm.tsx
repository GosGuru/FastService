"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FiArrowLeft, FiLock, FiLogIn } from "react-icons/fi";
import { signInAdminAction, type AdminLoginState } from "@/app/admin/login/actions";

const initialLoginState: AdminLoginState = {
  message: "",
  email: ""
};

export function AdminLoginForm({ nextPath }: { nextPath: string }) {
  const [state, formAction, isPending] = useActionState(signInAdminAction, initialLoginState);

  return (
    <div className="admin-login-wrapper">
      <Link href="/es" className="admin-login-card__home-link">
        <FiArrowLeft aria-hidden="true" /> Volver al inicio
      </Link>
      <form className="admin-login-card" action={formAction}>
        <input type="hidden" name="nextPath" value={nextPath} />
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
          <input type="email" name="email" defaultValue={state.email} autoComplete="email" required />
        </label>
        <label className="admin-field">
          <span>Contrasena</span>
          <input type="password" name="password" autoComplete="current-password" required />
        </label>
        {state.message ? <p className="admin-login-card__error">{state.message}</p> : null}
        <button type="submit" className="admin-button admin-button--primary" disabled={isPending}>
          <FiLogIn aria-hidden="true" /> {isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
