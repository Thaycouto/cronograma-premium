import Link from "next/link";

const errorMessages: Record<string, string> = {
  dados: "Informe um e-mail válido e uma senha com pelo menos 8 caracteres.",
  "sem-acesso": "Não encontramos uma compra aprovada para este email.",
  "conta-existente": "Esse email já tem uma senha criada. Entre para acessar seu cronograma.",
  conta: "Não foi possível criar sua senha agora. Tente novamente em instantes.",
};

export default function CreatePasswordPage({ searchParams }: { searchParams?: Promise<{ erro?: string }> }) {
  return (
    <main className="grid min-h-svh place-items-center px-5 py-16">
      <form
        action="/api/access/create-password"
        className="premium-shadow w-full max-w-md rounded-[34px] bg-[#fffaf6] p-6 soft-border md:p-8"
        method="post"
      >
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ad2d63]">Acesso premium</p>
        <h1 className="font-editorial mt-5 text-5xl font-black leading-none tracking-[-0.035em]">
          Criar senha
        </h1>
        <ErrorMessage searchParams={searchParams} />
        <label className="mt-8 block text-sm font-extrabold" htmlFor="email">
          Email usado na compra
        </label>
        <input
          className="mt-2 w-full rounded-2xl border border-[#140b10]/15 bg-white px-4 py-4 outline-none transition focus:border-[#ad2d63]"
          id="email"
          name="email"
          required
          type="email"
        />
        <label className="mt-5 block text-sm font-extrabold" htmlFor="password">
          Senha
        </label>
        <input
          className="mt-2 w-full rounded-2xl border border-[#140b10]/15 bg-white px-4 py-4 outline-none transition focus:border-[#ad2d63]"
          id="password"
          minLength={8}
          name="password"
          required
          type="password"
        />
        <button className="cta-gradient mt-7 w-full rounded-full px-6 py-4 text-sm font-extrabold text-white" type="submit">
          Criar minha senha
        </button>
        <Link className="mt-5 inline-flex text-sm font-extrabold text-[#ad2d63]" href="/login">
          Já tenho senha
        </Link>
      </form>
    </main>
  );
}

async function ErrorMessage({ searchParams }: { searchParams?: Promise<{ erro?: string }> }) {
  const params = searchParams ? await searchParams : undefined;
  const message = params?.erro ? errorMessages[params.erro] : undefined;

  if (!message) {
    return null;
  }

  return <p className="mt-5 rounded-2xl bg-[#f6d4de] px-4 py-3 text-sm font-bold text-[#3e1224]">{message}</p>;
}
