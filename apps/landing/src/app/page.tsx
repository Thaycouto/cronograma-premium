const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://couto-hair-app.netlify.app";
const kiwifyCheckoutUrl = process.env.NEXT_PUBLIC_KIWIFY_CHECKOUT_URL || "#acesso";

const references = [
  {
    before: "/assets/fotos referencia cronograma/antes.cronograma.jpeg",
    after: "/assets/fotos referencia cronograma/depois.cronograma.jpeg",
  },
  {
    before: "/assets/fotos referencia cronograma/antes.cronograma.principal.jpeg",
    after: "/assets/fotos referencia cronograma/depois.cronograma.2.jpeg",
  },
];

const steps = [
  "Responda o diagnóstico",
  "Receba uma rotina organizada",
  "Acesse o webapp após a compra",
];

export default function LandingPage() {
  return (
    <main>
      <header className="fixed left-3 right-3 top-3 z-20 flex items-center justify-between rounded-[28px] bg-[#fffaf6]/88 px-4 py-3 shadow-[0_18px_60px_rgba(62,18,36,0.10)] backdrop-blur md:left-10 md:right-10">
        <a className="text-sm font-extrabold tracking-[-0.02em]" href="#">
          Couto Hair Program
        </a>
        <a className="rounded-full bg-[#140b10] px-5 py-3 text-xs font-extrabold text-white transition hover:-translate-y-0.5" href={appUrl}>
          Já comprei
        </a>
      </header>

      <section className="min-h-svh px-5 pb-16 pt-28 md:px-10 md:pb-24 md:pt-36">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.02fr_0.78fr] md:items-center">
          <div className="animate-[fadeUp_1.8s_ease_forwards] opacity-0">
            <h1 className="font-editorial max-w-3xl text-[3.7rem] font-black leading-[0.86] tracking-[-0.045em] md:text-[6.6rem]">
              Está pronta para a melhor fase do seu cabelo?
            </h1>
            <div className="mt-8 max-w-xl space-y-5 text-lg font-semibold leading-8 text-[#3b3035]">
              <p>
                Redução de frizz, cabelo deixando de ser quebradiço ou ressecado, brilho invejável, e muito mais.
              </p>
              <p>
                Você vai ter tudo isso e muito mais nesse cronograma capilar montado excepcionalmente pra você, pela pessoa que teve esse resultado abaixo.
              </p>
            </div>
            <a className="cta-gradient mt-9 inline-flex rounded-full px-7 py-4 text-sm font-extrabold text-white shadow-[0_24px_70px_rgba(173,45,99,0.30)] transition hover:-translate-y-1" href={kiwifyCheckoutUrl}>
              Montar meu cronograma
            </a>
          </div>

          <div className="premium-shadow rounded-[36px] bg-[#fffaf6] p-3 md:p-4">
            <div className="rounded-[28px] bg-[linear-gradient(145deg,#3e1224,#140b10)] p-5 text-white">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#f6d4de]">Couto Hair Program</p>
              <div className="mt-10 rounded-[26px] bg-[#fff8f2] p-5 text-[#140b10]">
                <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ad2d63]">Prévia do webapp</span>
                <h2 className="font-editorial mt-2 text-4xl font-black leading-none">Nutrição</h2>
                <p className="mt-4 text-sm font-semibold leading-6 text-[#5d5055]">
                  Hoje o cuidado foca em devolver maciez e equilíbrio ao comprimento.
                </p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-extrabold">
                <span className="rounded-full bg-white/12 px-3 py-3">Hidratação</span>
                <span className="rounded-full bg-[#e14a86] px-3 py-3">Nutrição</span>
                <span className="rounded-full bg-white/12 px-3 py-3">Reconstrução</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 md:grid-cols-[0.9fr_0.55fr] md:items-end">
            <h2 className="font-editorial text-5xl font-black leading-[0.92] tracking-[-0.035em] md:text-7xl">
              Resultados reais de quem seguiu o cronograma
            </h2>
            <p className="text-base font-bold leading-7 text-[#5b4d52]">
              Menos frizz, menos quebra e mais brilho com constância.
            </p>
          </div>

          <div className="mt-12 grid gap-8">
            {references.map((item, index) => (
              <article className={`grid gap-4 ${index === 0 ? "md:mx-auto md:max-w-5xl md:grid-cols-[0.95fr_1.1fr]" : "md:ml-auto md:max-w-3xl md:grid-cols-2"}`} key={item.before}>
                <ReferenceImage label="Antes" src={item.before} featured={index === 0} />
                <ReferenceImage label="Depois" src={item.after} featured={index === 0} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#140b10] px-5 py-20 text-white md:px-10">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.8fr_1fr] md:items-center">
          <h2 className="font-editorial text-5xl font-black leading-[0.95] tracking-[-0.035em] md:text-7xl">
            O cronograma organiza o cuidado em uma sequência simples de seguir.
          </h2>
          <div className="space-y-5 text-lg font-semibold leading-8 text-[#f4dbe4]">
            <p>
              Primeiro você responde o diagnóstico. Depois, o webapp organiza a rotina em hidratação, nutrição e reconstrução.
            </p>
            <p>
              O acesso completo fica no app privado, liberado após a confirmação da compra.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-editorial text-5xl font-black leading-[0.95] tracking-[-0.035em] md:text-7xl">Como funciona</h2>
          <div className="mt-10 divide-y divide-[#140b10]/15 border-y border-[#140b10]/15">
            {steps.map((step, index) => (
              <div className="grid gap-4 py-7 md:grid-cols-[120px_1fr] md:items-center" key={step}>
                <span className="text-xs font-black uppercase tracking-[0.22em] text-[#ad2d63]">0{index + 1}</span>
                <p className="font-editorial text-3xl font-black leading-none md:text-5xl">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="acesso" className="px-5 pb-24 md:px-10">
        <div className="premium-shadow mx-auto grid max-w-5xl gap-8 rounded-[34px] bg-[#fffaf6] p-6 soft-border md:grid-cols-[1fr_0.68fr] md:p-10">
          <div>
            <h2 className="font-editorial text-5xl font-black leading-[0.95] tracking-[-0.035em] md:text-7xl">
              Acesso premium ao seu cronograma.
            </h2>
            <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-[#5b4d52]">
              A compra libera o caminho para entrar no app e criar sua senha com o mesmo e-mail usado na Kiwify.
            </p>
          </div>
          <div className="rounded-[28px] bg-[#140b10] p-6 text-white">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#f6d4de]">Couto Hair Program</p>
            <p className="font-editorial mt-8 text-6xl font-black">R$ 47</p>
            <a className="mt-8 inline-flex w-full justify-center rounded-full bg-white px-6 py-4 text-sm font-extrabold text-[#140b10] transition hover:-translate-y-1" href={kiwifyCheckoutUrl}>
              Comprar pela Kiwify
            </a>
            <a className="mt-3 inline-flex w-full justify-center rounded-full border border-white/20 px-6 py-4 text-sm font-extrabold text-white transition hover:bg-white/10" href={appUrl}>
              Já comprei
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function ReferenceImage({ label, src, featured }: { label: string; src: string; featured?: boolean }) {
  return (
    <figure className={`relative overflow-hidden rounded-[30px] bg-[#f3e7de] soft-border premium-shadow ${featured ? "h-[460px] md:h-[680px]" : "h-[420px] md:h-[430px]"}`}>
      <img alt={`${label} do cronograma`} className="h-full w-full object-contain" src={src} />
      <figcaption className="absolute left-4 top-4 rounded-full bg-[#140b10]/70 px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white backdrop-blur">
        {label}
      </figcaption>
    </figure>
  );
}
