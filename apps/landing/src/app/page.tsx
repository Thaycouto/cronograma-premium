import { getSupportWhatsAppUrl } from "@/app/support-whatsapp";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://couto-hair-app.netlify.app";
const kiwifyCheckoutUrl = process.env.NEXT_PUBLIC_KIWIFY_CHECKOUT_URL || "#acesso";
const supportUrl = getSupportWhatsAppUrl();

const resultPairs = [
  {
    before: "/assets/fotos referencia cronograma/antes.cronograma.jpeg",
    after: "/assets/fotos referencia cronograma/depois.cronograma.jpeg",
    featured: true,
  },
  {
    before: "/assets/fotos referencia cronograma/antes.cronograma.principal.jpeg",
    after: "/assets/fotos referencia cronograma/depois.cronograma.2.jpeg",
    featured: false,
  },
];

const premiumFlow = [
  "Diagnóstico do cabelo",
  "Análise por foto",
  "Cronograma personalizado",
  "Instruções de cada etapa",
  "Histórico e acompanhamento",
];

const previewItems = [
  {
    title: "Próxima etapa sugerida",
    text: "Nutrição ou hidratação, de acordo com o diagnóstico.",
    open: true,
  },
  {
    title: "Organização da semana",
    text: "O plano mostra o que fazer, quando fazer e por que aquela etapa entra ali.",
    open: true,
  },
  {
    title: "Calendário completo",
    text: "Liberado no acesso premium.",
    open: false,
  },
  {
    title: "Instruções e histórico",
    text: "Liberado no acesso premium.",
    open: false,
  },
];

const faqItems = [
  {
    question: "Cronograma capilar funciona para cabelo quebradiço?",
    answer:
      "Ajuda a organizar cuidados como hidratação, nutrição, reconstrução e pausas. O resultado depende do estado do fio, constância e histórico químico.",
  },
  {
    question: "Cabelo quebradiço: o que fazer?",
    answer:
      "O primeiro passo é entender se o fio precisa de água, lipídios, força ou pausa. Por isso o diagnóstico vem antes do cronograma.",
  },
  {
    question: "O cronograma serve para cabelo com química?",
    answer:
      "Sim, mas o cuidado precisa ser mais controlado. O excesso de reconstrução ou produtos pesados pode deixar o fio rígido ou sobrecarregado.",
  },
  {
    question: "Preciso comprar vários produtos?",
    answer: "Não necessariamente. O cronograma organiza categorias de cuidado, não obriga marcas específicas.",
  },
  {
    question: "O cronograma é igual para todo mundo?",
    answer:
      "Não. O acesso completo considera diagnóstico, objetivo, sinais do fio e, quando disponível, foto do cabelo.",
  },
  {
    question: "Em quanto tempo vejo resultado?",
    answer:
      "Algumas pessoas percebem melhora no toque e brilho nas primeiras semanas, mas não prometemos resultado garantido. O foco é constância e cuidado correto.",
  },
];

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function LandingPage() {
  return (
    <main>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
        type="application/ld+json"
      />
      <header className="fixed left-3 right-3 top-3 z-20 flex items-center justify-between rounded-[28px] bg-[#fffaf6]/88 px-4 py-3 shadow-[0_18px_60px_rgba(62,18,36,0.10)] backdrop-blur md:left-10 md:right-10">
        <a className="text-sm font-extrabold tracking-[-0.02em]" href="#">
          Couto Hair Program
        </a>
        <a
          className="rounded-full bg-[#140b10] px-5 py-3 text-xs font-extrabold text-white transition hover:-translate-y-0.5"
          href={appUrl}
        >
          Já comprei
        </a>
      </header>

      <section className="relative overflow-hidden px-5 pb-14 pt-28 md:px-10 md:pb-20 md:pt-36">
        <div className="absolute inset-x-0 top-0 -z-10 h-[68%] bg-[radial-gradient(circle_at_74%_18%,rgba(225,74,134,0.14),transparent_28rem)]" />
        <div className="mx-auto grid min-h-[78svh] max-w-6xl gap-12 md:grid-cols-[1.02fr_0.72fr] md:items-center">
          <div className="animate-[fadeUp_1.8s_ease_forwards] opacity-0">
            <h1 className="font-editorial max-w-3xl text-[3.3rem] font-black leading-[0.9] tracking-[-0.045em] md:text-[6rem]">
              Está pronta para a melhor fase do seu cabelo?
            </h1>
            <div className="mt-8 max-w-xl space-y-5 text-lg font-semibold leading-8 text-[#3b3035]">
              <p>
                Redução de frizz, cabelo deixando de ser quebradiço ou ressecado, brilho invejável, e muito mais.
              </p>
              <p>
                Você vai ter tudo isso e muito mais nesse cronograma capilar montado excepcionalmente pra você, pela
                pessoa que teve esse resultado abaixo.
              </p>
            </div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                className="cta-gradient inline-flex justify-center rounded-full px-7 py-4 text-sm font-extrabold text-white shadow-[0_24px_70px_rgba(173,45,99,0.30)] transition hover:-translate-y-1"
                href={kiwifyCheckoutUrl}
              >
                Montar meu cronograma
              </a>
              <a
                className="inline-flex justify-center rounded-full border border-[#140b10]/15 px-7 py-4 text-sm font-extrabold text-[#140b10] transition hover:-translate-y-1 hover:border-[#ad2d63]/40"
                href={appUrl}
              >
                Já comprei
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm animate-[fadeUp_2.4s_ease_0.25s_forwards] opacity-0 md:max-w-none">
            <div className="premium-shadow rounded-[36px] bg-[#fffaf6] p-3">
              <div className="rounded-[28px] bg-[linear-gradient(145deg,#3e1224,#140b10)] p-5 text-white">
                <div className="rounded-[26px] bg-[#fff8f2] p-5 text-[#140b10]">
                  <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ad2d63]">Prévia</span>
                  <h2 className="font-editorial mt-3 text-4xl font-black leading-none">Seu plano começa aqui</h2>
                  <p className="mt-4 text-sm font-semibold leading-6 text-[#5d5055]">
                    O calendário completo fica dentro do acesso premium.
                  </p>
                </div>
                <div className="mt-5 divide-y divide-white/12 rounded-[24px] border border-white/12">
                  {["Diagnóstico", "Foto", "Cronograma"].map((item, index) => (
                    <p className="flex items-center justify-between px-4 py-4 text-sm font-extrabold" key={item}>
                      <span>{item}</span>
                      <span className={`h-2 rounded-full ${index === 2 ? "w-10 bg-white/22" : "w-16 bg-[#e14a86]"}`} />
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 pt-8 md:px-10 md:pb-24 md:pt-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <h2 className="font-editorial text-5xl font-black leading-[0.92] tracking-[-0.035em] md:text-7xl">
              O resultado que inspirou esse cronograma.
            </h2>
            <p className="mt-6 max-w-xl text-base font-bold leading-7 text-[#5b4d52]">
              Antes de montar o seu, veja o que mudou quando o cuidado passou a ter direção.
            </p>
          </div>

          <div className="mt-12 space-y-10">
            {resultPairs.map((item, index) => (
              <article
                className={`grid gap-4 ${
                  item.featured
                    ? "md:grid-cols-[0.95fr_1.08fr] md:items-end"
                    : "md:ml-auto md:max-w-4xl md:grid-cols-2 md:items-start"
                }`}
                key={item.before}
              >
                <ResultImage label="Antes" src={item.before} featured={item.featured} />
                <ResultImage label="Depois" src={item.after} featured={item.featured} lift={index === 0} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#140b10] px-5 py-20 text-white md:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.9fr_1fr] md:items-start">
          <div>
            <h2 className="font-editorial text-5xl font-black leading-[0.95] tracking-[-0.035em] md:text-7xl">
              O cronograma completo não é uma lista pronta.
            </h2>
            <p className="mt-6 max-w-xl text-base font-semibold leading-7 text-[#f8edf1]/78">
              Ele muda conforme diagnóstico, foto, histórico químico, frizz, quebra, ressecamento e objetivo.
            </p>
          </div>

          <div className="divide-y divide-white/12 border-y border-white/12">
            {premiumFlow.map((item, index) => (
              <p className="grid grid-cols-[42px_1fr] gap-4 py-5 text-base font-extrabold text-white" key={item}>
                <span className="text-xs uppercase tracking-[0.18em] text-[#f6d4de]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{item}</span>
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.8fr_1fr] md:items-start">
          <div>
            <h2 className="font-editorial text-5xl font-black leading-[0.95] tracking-[-0.035em] md:text-7xl">
              Uma prévia do que você vai receber.
            </h2>
            <p className="mt-6 max-w-xl text-base font-bold leading-7 text-[#5b4d52]">
              Você vê o começo. O plano completo fica dentro do acesso.
            </p>
            <a
              className="cta-gradient mt-8 inline-flex justify-center rounded-full px-7 py-4 text-sm font-extrabold text-white shadow-[0_24px_70px_rgba(173,45,99,0.30)] transition hover:-translate-y-1"
              href={kiwifyCheckoutUrl}
            >
              Liberar cronograma completo
            </a>
          </div>

          <div className="relative overflow-hidden rounded-[34px] bg-[#fffaf6] p-4 soft-border premium-shadow md:p-5">
            <div className="absolute inset-x-6 bottom-0 h-24 bg-gradient-to-t from-[#fffaf6] to-transparent" />
            <div className="grid gap-3">
              {previewItems.map((item) => (
                <PreviewRow key={item.title} open={item.open} text={item.text} title={item.title} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <h2 className="font-editorial text-5xl font-black leading-[0.95] tracking-[-0.035em] md:text-7xl">
              Dúvidas comuns antes de começar.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {faqItems.map((item) => (
              <article className="rounded-[28px] bg-[#fffaf6] p-6 soft-border" key={item.question}>
                <h3 className="font-editorial text-3xl font-black leading-none text-[#140b10]">{item.question}</h3>
                <p className="mt-4 text-sm font-bold leading-7 text-[#5b4d52]">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="acesso" className="px-5 pb-24 md:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-editorial text-5xl font-black leading-[0.95] tracking-[-0.035em] md:text-7xl">
            Quero meu cronograma completo.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg font-semibold leading-8 text-[#5b4d52]">
            O acesso completo libera diagnóstico, análise por foto e rotina personalizada.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              className="cta-gradient inline-flex justify-center rounded-full px-8 py-4 text-sm font-extrabold text-white shadow-[0_24px_70px_rgba(173,45,99,0.30)] transition hover:-translate-y-1"
              href={kiwifyCheckoutUrl}
            >
              Quero meu cronograma completo
            </a>
            <a
              className="inline-flex justify-center rounded-full border border-[#140b10]/15 px-8 py-4 text-sm font-extrabold text-[#140b10] transition hover:-translate-y-1 hover:border-[#ad2d63]/40"
              href={appUrl}
            >
              Já comprei
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#140b10]/10 px-5 py-10 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 text-sm font-bold text-[#5b4d52] md:flex-row md:items-center md:justify-between">
          <p>© 2026 Couto Hair Program. Todos os direitos reservados.</p>
          <nav className="flex flex-wrap gap-4">
            <a className="transition hover:text-[#ad2d63]" href="/privacidade">
              Política de Privacidade
            </a>
            <a className="transition hover:text-[#ad2d63]" href="/termos">
              Termos de Uso
            </a>
            <a className="transition hover:text-[#ad2d63]" href={supportUrl} rel="noreferrer" target="_blank">
              Suporte
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}

function ResultImage({
  label,
  src,
  featured,
  lift,
}: {
  label: string;
  src: string;
  featured?: boolean;
  lift?: boolean;
}) {
  const height = featured ? "h-[470px] md:h-[680px]" : "h-[440px] md:h-[540px]";

  return (
    <figure
      className={`relative overflow-hidden rounded-[30px] bg-[#f3e7de] soft-border premium-shadow ${height} ${
        lift ? "md:-mb-8" : ""
      }`}
    >
      <img alt={`${label} do cronograma`} className="h-full w-full object-contain object-center" src={src} />
      <figcaption className="absolute left-4 top-4 rounded-full bg-[#140b10]/68 px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white backdrop-blur">
        {label}
      </figcaption>
    </figure>
  );
}

function PreviewRow({ title, text, open }: { title: string; text: string; open: boolean }) {
  return (
    <article
      className={`relative rounded-[26px] border p-5 ${
        open ? "border-[#140b10]/10 bg-[#fff8f2]" : "border-[#140b10]/8 bg-[#f3e7de]/70"
      }`}
    >
      {!open ? (
        <div className="absolute right-5 top-5 rounded-full border border-[#140b10]/10 px-3 py-1 text-[0.66rem] font-black uppercase tracking-[0.16em] text-[#ad2d63]">
          Bloqueado
        </div>
      ) : null}
      <h3 className="font-editorial pr-28 text-3xl font-black leading-none text-[#140b10]">{title}</h3>
      <p className={`mt-4 text-sm font-semibold leading-6 text-[#5b4d52] ${open ? "" : "blur-[1.5px]"}`}>{text}</p>
      {!open ? (
        <div className="mt-5 space-y-2">
          <span className="block h-2 w-3/4 rounded-full bg-[#140b10]/12" />
          <span className="block h-2 w-1/2 rounded-full bg-[#140b10]/10" />
        </div>
      ) : null}
    </article>
  );
}
