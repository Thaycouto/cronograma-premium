import Link from "next/link";

const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL || "https://couto-hair-program.netlify.app";

export default function NoAccessPage() {
  return (
    <main className="grid min-h-svh place-items-center px-5 py-16">
      <section className="premium-shadow max-w-lg rounded-[34px] bg-[#fffaf6] p-8 text-center soft-border">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ad2d63]">Acesso premium</p>
        <h1 className="font-editorial mt-5 text-5xl font-black leading-none tracking-[-0.035em]">
          Seu acesso ainda não foi liberado.
        </h1>
        <p className="mt-6 text-base font-semibold leading-7 text-[#5b4d52]">
          Quando a compra for confirmada, o cronograma completo fica disponível nesta área.
        </p>
        <div className="mt-8 grid gap-3">
          <Link className="cta-gradient inline-flex justify-center rounded-full px-7 py-4 text-sm font-extrabold text-white" href="/criar-senha">
            Criar senha com outro e-mail
          </Link>
          <a className="inline-flex justify-center rounded-full bg-[#140b10] px-7 py-4 text-sm font-extrabold text-white" href={landingUrl}>
            Voltar para a página de venda
          </a>
        </div>
      </section>
    </main>
  );
}
