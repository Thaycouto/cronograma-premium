"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function CreatePasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || password.length < 6) {
      setMessage("Informe um e-mail válido e uma senha com pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    const response = await fetch("/api/auth/create-password", {
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
    } | null;

    if (!response.ok || !result?.ok) {
      setMessage(result?.error || "Não conseguimos concluir agora. Tente novamente em alguns instantes.");
      setIsLoading(false);
      return;
    }

    router.push(result.redirectTo || "/login?senha=criada");
  }

  return (
    <form
      className="premium-shadow w-full max-w-md rounded-[34px] bg-[#fffaf6] p-6 soft-border md:p-8"
      onSubmit={handleSubmit}
    >
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ad2d63]">Acesso premium</p>
      <h1 className="font-editorial mt-5 text-5xl font-black leading-none tracking-[-0.035em]">
        Criar senha
      </h1>
      {message ? (
        <p className="mt-5 rounded-2xl bg-[#f6d4de] px-4 py-3 text-sm font-bold text-[#3e1224]">{message}</p>
      ) : null}
      <label className="mt-8 block text-sm font-extrabold" htmlFor="email">
        Email usado na compra
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
        autoComplete="new-password"
        className="mt-2 w-full rounded-2xl border border-[#140b10]/15 bg-white px-4 py-4 outline-none transition focus:border-[#ad2d63]"
        id="password"
        minLength={6}
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
        {isLoading ? "Criando..." : "Criar minha senha"}
      </button>
      <Link className="mt-5 inline-flex text-sm font-extrabold text-[#ad2d63]" href="/login">
        Já tenho senha
      </Link>
    </form>
  );
}
