"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createSupabaseRecoveryClient } from "@/lib/supabase-recovery";

export function RequestResetForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setMessage("");

    try {
      const supabase = createSupabaseRecoveryClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });

      if (error) {
        setMessage(
          error.status === 429
            ? "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente."
            : "Não foi possível enviar o e-mail agora. Tente novamente em instantes.",
        );
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
          Se existir uma conta com esse e-mail, você receberá um link para criar uma nova senha. Confira também a pasta de spam.
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
          <button className="cta-gradient mt-7 w-full rounded-full px-6 py-4 text-sm font-extrabold text-white disabled:opacity-70" disabled={isLoading} type="submit">
            {isLoading ? "Enviando..." : "Enviar link de recuperação"}
          </button>
        </>
      )}
      <Link className="mt-6 inline-flex text-sm font-extrabold text-[#ad2d63]" href="/login">Voltar ao login</Link>
    </form>
  );
}
