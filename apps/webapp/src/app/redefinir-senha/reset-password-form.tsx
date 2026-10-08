"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { createSupabaseRecoveryClient } from "@/lib/supabase-recovery";

type RecoveryClient = ReturnType<typeof createSupabaseRecoveryClient>;
type RecoveryState = "checking" | "ready" | "invalid" | "complete";

export function ResetPasswordForm() {
  const clientRef = useRef<RecoveryClient | null>(null);
  const startedRef = useRef(false);
  const [state, setState] = useState<RecoveryState>("checking");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function verifyRecoveryLink() {
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = fragment.get("access_token");
      const refreshToken = fragment.get("refresh_token");

      if (fragment.has("error_code") || fragment.get("type") !== "recovery" || !accessToken || !refreshToken) {
        setState("invalid");
        return;
      }

      try {
        const supabase = createSupabaseRecoveryClient();
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (error) {
          setState("invalid");
          return;
        }

        const { data, error: userError } = await supabase.auth.getUser();
        if (userError || !data.user) {
          setState("invalid");
          return;
        }

        clientRef.current = supabase;
        window.history.replaceState(null, "", window.location.pathname);
        setState("ready");
      } catch {
        setMessage("Não foi possível verificar o link agora. Atualize a página para tentar novamente.");
        setState("invalid");
      }
    }

    void verifyRecoveryLink();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading || !clientRef.current) return;

    if (password.length < 6) {
      setMessage("Use uma senha com pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setMessage("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const { error } = await clientRef.current.auth.updateUser({ password });
      if (error) {
        setMessage("Não foi possível alterar a senha. Solicite um novo link e tente novamente.");
        return;
      }

      clientRef.current = null;
      setPassword("");
      setConfirmation("");
      setState("complete");
    } catch {
      setMessage("Não foi possível conectar agora. Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="premium-shadow w-full max-w-md rounded-[34px] bg-[#fffaf6] p-6 soft-border md:p-8">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ad2d63]">Couto Hair Program</p>
      <h1 className="font-editorial mt-5 text-5xl font-black leading-none tracking-[-0.035em]">Nova senha</h1>

      {state === "checking" ? <p className="mt-6 text-sm font-semibold text-[#5b4d52]" role="status">Verificando seu link...</p> : null}
      {state === "invalid" ? (
        <div className="mt-6 space-y-5">
          <p className="text-sm font-semibold leading-6 text-[#3e1224]" role="alert">
            {message || "Este link é inválido ou expirou. Solicite um novo e-mail de recuperação."}
          </p>
          <Link className="inline-flex text-sm font-extrabold text-[#ad2d63]" href="/esqueci-senha">Solicitar novo link</Link>
        </div>
      ) : null}
      {state === "ready" ? (
        <form className="mt-6" onSubmit={handleSubmit}>
          <p className="text-sm leading-6 text-[#5b4d52]">Escolha uma nova senha para entrar no seu cronograma.</p>
          {message ? <p className="mt-5 rounded-2xl bg-[#f6d4de] px-4 py-3 text-sm font-bold text-[#3e1224]" role="alert">{message}</p> : null}
          <label className="mt-7 block text-sm font-extrabold" htmlFor="new-password">Nova senha</label>
          <input autoComplete="new-password" className="mt-2 w-full rounded-2xl border border-[#140b10]/15 bg-white px-4 py-4 outline-none transition focus:border-[#ad2d63]" id="new-password" minLength={6} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          <label className="mt-5 block text-sm font-extrabold" htmlFor="confirm-password">Confirme a nova senha</label>
          <input autoComplete="new-password" className="mt-2 w-full rounded-2xl border border-[#140b10]/15 bg-white px-4 py-4 outline-none transition focus:border-[#ad2d63]" id="confirm-password" minLength={6} onChange={(event) => setConfirmation(event.target.value)} required type="password" value={confirmation} />
          <button className="cta-gradient mt-7 w-full rounded-full px-6 py-4 text-sm font-extrabold text-white disabled:opacity-70" disabled={isLoading} type="submit">{isLoading ? "Salvando..." : "Salvar nova senha"}</button>
        </form>
      ) : null}
      {state === "complete" ? (
        <div className="mt-6 space-y-5">
          <p className="text-sm font-semibold leading-6 text-[#3e1224]" role="status">Senha alterada. Entre com a nova senha para acessar seu cronograma.</p>
          <Link className="cta-gradient inline-flex rounded-full px-6 py-4 text-sm font-extrabold text-white" href="/login">Ir para o login</Link>
        </div>
      ) : null}
    </section>
  );
}
