import Link from "next/link";

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
        <Link className="cta-gradient mt-8 inline-flex rounded-full px-7 py-4 text-sm font-extrabold text-white" href="/">
          Voltar para a página principal
        </Link>
      </section>
    </main>
  );
}
