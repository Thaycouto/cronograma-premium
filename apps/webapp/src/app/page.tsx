import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL || "https://couto-hair-program.netlify.app";

export default async function WebappHomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/app");
  }

  return (
    <main className="grid min-h-svh place-items-center px-5 py-16">
      <section className="premium-shadow max-w-xl rounded-[34px] bg-[#fffaf6] p-8 text-center soft-border">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ad2d63]">Couto Hair Program</p>
        <h1 className="font-editorial mt-5 text-5xl font-black leading-none tracking-[-0.035em] md:text-6xl">
          Entre no seu cronograma
        </h1>
        <p className="mt-6 text-base font-semibold leading-7 text-[#5b4d52]">
          Use o mesmo e-mail informado na compra para criar sua senha e acessar a área premium.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link className="cta-gradient rounded-full px-6 py-4 text-sm font-extrabold text-white" href="/criar-senha">
            Criar senha
          </Link>
          <Link className="rounded-full bg-[#140b10] px-6 py-4 text-sm font-extrabold text-white" href="/login">
            Já tenho senha
          </Link>
        </div>
        <a className="mt-6 inline-flex text-sm font-extrabold text-[#ad2d63]" href={landingUrl}>
          Voltar para a página de venda
        </a>
      </section>
    </main>
  );
}
