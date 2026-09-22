"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState(""); const [sent, setSent] = useState(false); const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setError(null); const response = await fetch("/api/auth/request-password-reset", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, redirectTo: `${window.location.origin}/reset-password` }) }); if (!response.ok) { setError("Parola sıfırlama isteği gönderilemedi."); return; } setSent(true); };
  return <main className="auth-page"><section className="auth-card" aria-labelledby="forgot-title"><div className="brand auth-brand"><span className="brand-mark">F</span><span>Frontend<br /><strong>Production Starter</strong></span></div><h1 id="forgot-title">Parolanızı sıfırlayın</h1><p className="auth-subtitle">E-posta adresinize güvenli bir sıfırlama bağlantısı göndereceğiz.</p>{sent ? <p className="notification notification-success" role="status">E-posta kutunuzu kontrol edin.</p> : <form onSubmit={submit} className="auth-form"><label>E-posta<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="ui-button ui-button-primary ui-button-md" type="submit">Bağlantı gönder</button></form>}<Link href="/login" className="auth-link">Giriş sayfasına dön</Link></section></main>;
}
