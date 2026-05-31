"use client";

import Link from "next/link";
import Image from "next/image";
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
      <section className="admin-login-panel" aria-labelledby="admin-login-title">
        <Link href="/es" className="admin-login-card__home-link">
          <FiArrowLeft aria-hidden="true" /> Volver al inicio
        </Link>
        <form className="admin-login-card" action={formAction}>
          <input type="hidden" name="nextPath" value={nextPath} />
          <div className="admin-login-card__brand">
            <Image
              src="/logonegro.PNG"
              alt="FastService"
              width={602}
              height={106}
              priority
              className="admin-login-card__logo"
            />
            <span className="admin-login-card__status">
              <FiLock aria-hidden="true" /> Acceso seguro
            </span>
          </div>
          <h1 id="admin-login-title">FastService Management</h1>
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
      </section>
      <div className="admin-login-visual" aria-hidden="true" />
    </div>
  );
}
