import { redirect } from "next/navigation";
import { signIn } from "@/app/login/sign-in-action";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/app");
  }

  return (
    <main className="grid min-h-svh place-items-center px-5 py-16">
      <form action={signIn} className="premium-shadow w-full max-w-md rounded-[34px] bg-[#fffaf6] p-6 soft-border md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ad2d63]">Couto Hair Program</p>
        <h1 className="font-editorial mt-5 text-5xl font-black leading-none tracking-[-0.035em]">
          Entrar no cronograma
        </h1>
        <label className="mt-8 block text-sm font-extrabold" htmlFor="email">
          Email
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
          name="password"
          required
          type="password"
        />
        <button className="cta-gradient mt-7 w-full rounded-full px-6 py-4 text-sm font-extrabold text-white" type="submit">
          Entrar
        </button>
        <a className="mt-5 inline-flex text-sm font-extrabold text-[#ad2d63]" href="/criar-senha">
          Criar senha com o e-mail da compra
        </a>
      </form>
    </main>
  );
}
