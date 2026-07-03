const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://couto-hair-app.netlify.app";
const kiwifyCheckoutUrl = process.env.NEXT_PUBLIC_KIWIFY_CHECKOUT_URL || "#acesso";

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

const supportingResults = [
  {
    image: "/assets/fotos referencia cronograma/antes.cronograma.3.jpeg",
    label: "Antes",
  },
  {
    image: "/assets/fotos referencia cronograma/antes.cronograma.2.jpeg",
    label: "Antes",
  },
];

const hairTypes = [
  {
    name: "Liso",
    care: "Leveza na raiz, hidratação sem excesso e finalização que não pese.",
    avoid: "Máscaras densas em toda lavagem e óleo muito próximo da raiz.",
    focus: "Equilibrar brilho, movimento e controle de pontas secas.",
  },
  {
    name: "Ondulado",
    care: "Hidratação para maleabilidade, nutrição controlada e pausa para observar forma.",
    avoid: "Excesso de creme, escovação agressiva e rotina que desmancha a curvatura.",
    focus: "Reduzir frizz sem perder leveza e definição natural.",
  },
  {
    name: "Cacheado",
    care: "Reposição de água, nutrição para maciez e finalização compatível com a curvatura.",
    avoid: "Reconstrução em excesso e produtos que deixam o cacho rígido.",
    focus: "Definição, brilho e resposta melhor entre uma lavagem e outra.",
  },
  {
    name: "Crespo",
    care: "Nutrição bem distribuída, hidratação frequente e atenção ao desembaraço.",
    avoid: "Pular etapas de maciez e manipular o fio seco sem preparo.",
    focus: "Força, retenção de umidade e rotina com menos quebra.",
  },
];

const previewSchedules = [
  {
    type: "Liso",
    days: [
      ["Segunda", "Hidratação leve"],
      ["Quarta", "Nutrição controlada"],
      ["Sábado", "Pausa ou finalização"],
    ],
  },
  {
    type: "Ondulado",
    days: [
      ["Segunda", "Hidratação"],
      ["Quarta", "Nutrição"],
      ["Sábado", "Definição e observação"],
    ],
  },
  {
    type: "Cacheado",
    days: [
      ["Segunda", "Hidratação"],
      ["Quarta", "Nutrição"],
      ["Sábado", "Hidratação + finalização"],
    ],
  },
  {
    type: "Crespo",
    days: [
      ["Segunda", "Nutrição"],
      ["Quarta", "Hidratação"],
      ["Sábado", "Nutrição ou pausa"],
    ],
  },
];

const premiumFlow = [
  "Enviar foto do cabelo",
  "Responder diagnóstico",
  "Receber cronograma personalizado",
  "Acompanhar etapas",
  "Salvar histórico",
  "Marcar tratamentos realizados",
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

      <section className="relative overflow-hidden px-5 pb-16 pt-28 md:px-10 md:pb-24 md:pt-36">
        <div className="absolute inset-x-0 top-0 -z-10 h-[70%] bg-[radial-gradient(circle_at_70%_18%,rgba(225,74,134,0.16),transparent_28rem)]" />
        <div className="mx-auto grid min-h-[78svh] max-w-6xl gap-12 md:grid-cols-[1.02fr_0.72fr] md:items-center">
          <div className="animate-[fadeUp_1.8s_ease_forwards] opacity-0">
            <h1 className="font-editorial max-w-3xl text-[3.45rem] font-black leading-[0.88] tracking-[-0.045em] md:text-[6.25rem]">
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
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a className="cta-gradient inline-flex justify-center rounded-full px-7 py-4 text-sm font-extrabold text-white shadow-[0_24px_70px_rgba(173,45,99,0.30)] transition hover:-translate-y-1" href={kiwifyCheckoutUrl}>
                Montar meu cronograma
              </a>
              <a className="inline-flex justify-center rounded-full border border-[#140b10]/15 px-7 py-4 text-sm font-extrabold text-[#140b10] transition hover:-translate-y-1 hover:border-[#ad2d63]/40" href={appUrl}>
                Já comprei
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm md:max-w-none">
            <div className="premium-shadow rounded-[36px] bg-[#fffaf6] p-3">
              <div className="rounded-[28px] bg-[linear-gradient(145deg,#3e1224,#140b10)] p-5 text-white">
                <div className="rounded-[26px] bg-[#fff8f2] p-5 text-[#140b10]">
                  <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ad2d63]">Prévia</span>
                  <h2 className="font-editorial mt-3 text-4xl font-black leading-none">Nutrição</h2>
                  <p className="mt-4 text-sm font-semibold leading-6 text-[#5d5055]">
                    Hoje o cuidado foca em devolver maciez e equilíbrio ao comprimento.
                  </p>
                </div>
                <div className="mt-5 divide-y divide-white/12 rounded-[24px] border border-white/12">
                  {["Hidratação", "Nutrição", "Reconstrução"].map((item) => (
                    <p className="flex items-center justify-between px-4 py-4 text-sm font-extrabold" key={item}>
                      <span>{item}</span>
                      <span className="h-2 w-16 rounded-full bg-[#e14a86]" />
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 md:grid-cols-[0.9fr_0.52fr] md:items-end">
            <h2 className="font-editorial text-5xl font-black leading-[0.92] tracking-[-0.035em] md:text-7xl">
              O resultado que inspirou esse cronograma.
            </h2>
            <p className="text-base font-bold leading-7 text-[#5b4d52]">
              Antes de montar o seu, veja o que mudou quando o cuidado passou a ter ordem.
            </p>
          </div>

          <div className="mt-12 grid gap-9">
            {resultPairs.map((item, index) => (
              <article
                className={`grid gap-4 ${item.featured ? "md:mx-auto md:max-w-5xl md:grid-cols-[0.95fr_1.08fr] md:items-end" : "md:ml-auto md:max-w-3xl md:grid-cols-2"}`}
                key={item.before}
              >
                <ResultImage label="Antes" src={item.before} featured={item.featured} />
                <ResultImage label="Depois" src={item.after} featured={item.featured} lift={index === 0} />
              </article>
            ))}

            <div className="grid gap-4 md:grid-cols-[0.8fr_1fr]">
              {supportingResults.map((item, index) => (
                <ResultImage key={item.image} label={item.label} src={item.image} compact wide={index === 1} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#140b10] px-5 py-20 text-white md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <h2 className="font-editorial text-5xl font-black leading-[0.95] tracking-[-0.035em] md:text-7xl">
              Comece entendendo o seu tipo de fio.
            </h2>
          </div>
          <div className="mt-12 divide-y divide-white/12 border-y border-white/12">
            {hairTypes.map((item) => (
              <article className="grid gap-6 py-8 md:grid-cols-[0.45fr_1fr] md:gap-12" key={item.name}>
                <h3 className="font-editorial text-4xl font-black leading-none text-[#f6d4de] md:text-5xl">{item.name}</h3>
                <div className="grid gap-6 md:grid-cols-3">
                  <TextColumn title="Cuidados principais" text={item.care} dark />
                  <TextColumn title="O que evitar" text={item.avoid} dark />
                  <TextColumn title="Foco do cronograma" text={item.focus} dark />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.72fr_1fr]">
          <div>
            <h2 className="font-editorial text-5xl font-black leading-[0.95] tracking-[-0.035em] md:text-7xl">
              Uma amostra do que seu cronograma pode organizar.
            </h2>
            <p className="mt-6 text-base font-bold leading-7 text-[#5b4d52]">
              Essa prévia é geral. O cronograma completo muda com foto, diagnóstico, histórico químico, quebra, frizz, ressecamento e objetivo.
            </p>
          </div>

          <div className="divide-y divide-[#140b10]/14 border-y border-[#140b10]/14">
            {previewSchedules.map((schedule) => (
              <article className="grid gap-5 py-7 md:grid-cols-[150px_1fr]" key={schedule.type}>
                <h3 className="font-editorial text-3xl font-black leading-none text-[#3e1224]">{schedule.type}</h3>
                <div className="grid gap-3">
                  {schedule.days.map(([day, treatment]) => (
                    <p className="grid grid-cols-[92px_1fr] gap-4 text-sm font-bold text-[#3b3035]" key={`${schedule.type}-${day}`}>
                      <span className="text-[#ad2d63]">{day}</span>
                      <span>{treatment}</span>
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10">
        <div className="premium-shadow mx-auto grid max-w-6xl gap-10 rounded-[38px] bg-[#fffaf6] p-6 soft-border md:grid-cols-[0.85fr_1fr] md:p-10">
          <div>
            <h2 className="font-editorial text-5xl font-black leading-[0.95] tracking-[-0.035em] md:text-7xl">
              O completo fica dentro do webapp pago.
            </h2>
            <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-[#5b4d52]">
              A parte gratuita ajuda você a se localizar. O acesso completo cruza suas respostas com a foto do cabelo e organiza uma rotina para o seu momento.
            </p>
          </div>
          <div className="divide-y divide-[#140b10]/12 border-y border-[#140b10]/12">
            {premiumFlow.map((item, index) => (
              <p className="grid grid-cols-[34px_1fr] gap-4 py-5 text-base font-extrabold text-[#140b10]" key={item}>
                <span className="text-xs uppercase tracking-[0.18em] text-[#ad2d63]">{String(index + 1).padStart(2, "0")}</span>
                <span>{item}</span>
              </p>
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
            <a className="cta-gradient inline-flex justify-center rounded-full px-8 py-4 text-sm font-extrabold text-white shadow-[0_24px_70px_rgba(173,45,99,0.30)] transition hover:-translate-y-1" href={kiwifyCheckoutUrl}>
              Quero meu cronograma completo
            </a>
            <a className="inline-flex justify-center rounded-full border border-[#140b10]/15 px-8 py-4 text-sm font-extrabold text-[#140b10] transition hover:-translate-y-1 hover:border-[#ad2d63]/40" href={appUrl}>
              Já comprei
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function ResultImage({
  label,
  src,
  featured,
  compact,
  wide,
  lift,
}: {
  label: string;
  src: string;
  featured?: boolean;
  compact?: boolean;
  wide?: boolean;
  lift?: boolean;
}) {
  const height = compact
    ? wide
      ? "h-[330px] md:h-[420px]"
      : "h-[420px] md:h-[500px]"
    : featured
      ? "h-[470px] md:h-[680px]"
      : "h-[420px] md:h-[500px]";

  return (
    <figure className={`relative overflow-hidden rounded-[30px] bg-[#f3e7de] soft-border premium-shadow ${height} ${lift ? "md:-mb-8" : ""}`}>
      <img alt={`${label} do cronograma`} className="h-full w-full object-contain object-center" src={src} />
      <figcaption className="absolute left-4 top-4 rounded-full bg-[#140b10]/68 px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white backdrop-blur">
        {label}
      </figcaption>
    </figure>
  );
}

function TextColumn({ title, text, dark }: { title: string; text: string; dark?: boolean }) {
  return (
    <div>
      <p className={`text-xs font-black uppercase tracking-[0.18em] ${dark ? "text-[#f6d4de]" : "text-[#ad2d63]"}`}>{title}</p>
      <p className={`mt-3 text-sm font-semibold leading-7 ${dark ? "text-[#f8edf1]/78" : "text-[#5b4d52]"}`}>{text}</p>
    </div>
  );
}
