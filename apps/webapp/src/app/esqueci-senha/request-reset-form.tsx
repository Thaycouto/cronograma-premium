"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

const cooldownStorageKey = "chp_password_recovery_retry_at";

export function RequestResetForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [retryAt, setRetryAt] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const stored = Number(window.sessionStorage.getItem(cooldownStorageKey) || 0);
    setRetryAt(stored);
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const minutesRemaining = retryAt > now ? Math.ceil((retryAt - now) / 60000) : 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading || sent || minutesRemaining > 0) return;

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        retryAfterSeconds?: number;
      } | null;

      if (!response.ok || !result?.ok) {
        setMessage(result?.error || "Não conseguimos enviar o link agora. Tente novamente mais tarde.");
        if (response.status === 429) {
          const until = Date.now() + (result?.retryAfterSeconds || 3600) * 1000;
          window.sessionStorage.setItem(cooldownStorageKey, String(until));
          setRetryAt(until);
        }
        return;
      }

      setSent(true);
    } catch {
      setMessage("Não foi possível conectar agora. Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="premium-shadow w-full max-w-md rounded-[34px] bg-[#fffaf6] p-6 soft-border md:p-8" onSubmit={handleSubmit}>
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ad2d63]">Couto Hair Program</p>
      <h1 className="font-editorial mt-5 text-5xl font-black leading-none tracking-[-0.035em]">Recuperar senha</h1>
      <p className="mt-5 text-sm leading-6 text-[#5b4d52]">Informe o e-mail usado no acesso para receber o link de redefinição.</p>
      {sent ? (
        <p className="mt-6 rounded-2xl bg-[#f3e7de] px-4 py-4 text-sm font-semibold leading-6 text-[#3e1224]" role="status">
          Se houver uma conta com acesso ativo para este e-mail, enviaremos um link para criar uma nova senha. Confira também a pasta de spam.
        </p>
      ) : (
        <>
          {message ? <p className="mt-5 rounded-2xl bg-[#f6d4de] px-4 py-3 text-sm font-bold text-[#3e1224]" role="alert">{message}</p> : null}
          <label className="mt-8 block text-sm font-extrabold" htmlFor="recovery-email">E-mail</label>
          <input
            autoComplete="email"
            className="mt-2 w-full rounded-2xl border border-[#140b10]/15 bg-white px-4 py-4 outline-none transition focus:border-[#ad2d63]"
            id="recovery-email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
          <button className="cta-gradient mt-7 w-full rounded-full px-6 py-4 text-sm font-extrabold text-white disabled:opacity-70" disabled={isLoading || minutesRemaining > 0} type="submit">
            {isLoading ? "Enviando..." : minutesRemaining > 0 ? `Tente novamente em ${minutesRemaining} min` : "Enviar link de recuperação"}
          </button>
        </>
      )}
      <p className="mt-5 text-sm leading-6 text-[#5b4d52]">Não recebeu o link? Confira o e-mail usado na compra ou fale com o suporte.</p>
      <Link className="mt-6 inline-flex text-sm font-extrabold text-[#ad2d63]" href="/login">Voltar ao login</Link>
    </form>
  );
}
