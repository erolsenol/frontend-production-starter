"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState(""); const [done, setDone] = useState(false); const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setError(null); const token = new URLSearchParams(window.location.search).get("token") ?? ""; if (!token) { setError("Geçerli bir sıfırlama bağlantısı gerekli."); return; } const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, newPassword: password }) }); if (!response.ok) { setError("Bağlantı geçersiz veya süresi dolmuş."); return; } setDone(true); };
  return <main className="auth-page"><section className="auth-card" aria-labelledby="reset-title"><h1 id="reset-title">Yeni parola belirleyin</h1>{done ? <><p className="notification notification-success" role="status">Parolanız güncellendi.</p><Link href="/login" className="auth-link">Giriş yap</Link></> : <form onSubmit={submit} className="auth-form"><label>Yeni parola<input type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="ui-button ui-button-primary ui-button-md" type="submit">Parolayı güncelle</button></form>}</section></main>;
}
