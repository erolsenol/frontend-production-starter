"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, rememberMe: true }),
    });
    setLoading(false);
    if (!response.ok) {
      setError("E-posta veya parola doğrulanamadı.");
      return;
    }
    router.replace("/");
    router.refresh();
  };

  return <main className="auth-page"><section className="auth-card" aria-labelledby="login-title">
    <div className="brand auth-brand"><span className="brand-mark">F</span><span>Frontend<br /><strong>Production Starter</strong></span></div>
    <h1 id="login-title">Hoş geldiniz</h1>
    <p className="auth-subtitle">Yönetim panelinize giriş yapın.</p>
    <form onSubmit={submit} className="auth-form">
      <label>E-posta<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
      <label>Parola<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="ui-button ui-button-primary ui-button-md" type="submit" disabled={loading}>{loading ? "Giriş yapılıyor..." : "Giriş yap"}</button>
    </form>
  </section></main>;
}
