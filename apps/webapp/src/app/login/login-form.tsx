"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type LoginFormProps = {
  initialMessage?: string;
};

export function LoginForm({ initialMessage }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(initialMessage || "");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setMessage("Informe seu e-mail e senha para entrar.");
      return;
    }

    setIsLoading(true);
    setMessage("");
    console.log("Login submit iniciado", { email: normalizedEmail });

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: normalizedEmail,
        password,
      }),
    });

    const result = (await response.json().catch(() => null)) as {
      ok?: boolean;
      redirectTo?: string;
      error?: string;
      code?: string;
      details?: Record<string, unknown>;
    } | null;

    if (!response.ok || !result?.ok) {
      console.error("Login error", {
        email: normalizedEmail,
        status: response.status,
        error: result?.error,
      });

      setMessage(result?.error || "Não conseguimos concluir agora. Tente novamente em alguns instantes.");
      setIsLoading(false);
      return;
    }

    const redirectTo = result.redirectTo || "/dashboard";
    console.log("Login redirect final", {
      email: normalizedEmail,
      redirectTo,
    });

    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <form
      className="premium-shadow w-full max-w-md rounded-[34px] bg-[#fffaf6] p-6 soft-border md:p-8"
      onSubmit={handleSubmit}
    >
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ad2d63]">Couto Hair Program</p>
      <h1 className="font-editorial mt-5 text-5xl font-black leading-none tracking-[-0.035em]">
        Entrar no cronograma
      </h1>
      {message ? (
        <p className="mt-5 rounded-2xl bg-[#f6d4de] px-4 py-3 text-sm font-bold text-[#3e1224]">{message}</p>
      ) : null}
      <label className="mt-8 block text-sm font-extrabold" htmlFor="email">
        Email
      </label>
      <input
        autoComplete="email"
        className="mt-2 w-full rounded-2xl border border-[#140b10]/15 bg-white px-4 py-4 outline-none transition focus:border-[#ad2d63]"
        id="email"
        name="email"
        onChange={(event) => setEmail(event.target.value)}
        required
        type="email"
        value={email}
      />
      <label className="mt-5 block text-sm font-extrabold" htmlFor="password">
        Senha
      </label>
      <input
        autoComplete="current-password"
        className="mt-2 w-full rounded-2xl border border-[#140b10]/15 bg-white px-4 py-4 outline-none transition focus:border-[#ad2d63]"
        id="password"
        name="password"
        onChange={(event) => setPassword(event.target.value)}
        required
        type="password"
        value={password}
      />
      <button
        className="cta-gradient mt-7 w-full rounded-full px-6 py-4 text-sm font-extrabold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isLoading}
        type="submit"
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </button>
      <Link className="mt-5 inline-flex text-sm font-extrabold text-[#ad2d63]" href="/criar-senha">
        Criar senha com o e-mail da compra
      </Link>
    </form>
  );
}
