import { getSupportWhatsAppUrl } from "@/app/support-whatsapp";

export const metadata = {
  title: "Política de Privacidade | Couto Hair Program",
  description: "Como o Couto Hair Program coleta, usa e protege dados usados no cronograma capilar personalizado.",
};

const sections = [
  {
    title: "1. Quais dados coletamos",
    items: [
      "Nome e e-mail usados na compra e no acesso.",
      "Respostas do diagnóstico capilar.",
      "Fotos enviadas pela cliente, quando a análise por foto for usada.",
      "Histórico de tratamentos marcados dentro do webapp.",
    ],
  },
  {
    title: "2. Como usamos esses dados",
    items: [
      "Validar o acesso ao cronograma.",
      "Salvar diagnóstico, cronograma e histórico.",
      "Gerar uma rotina personalizada de cuidado capilar.",
      "Melhorar a experiência dentro do webapp.",
      "Prestar suporte quando necessário.",
    ],
  },
  {
    title: "3. Onde os dados ficam armazenados",
    items: [
      "Supabase, para autenticação, acesso premium e dados do cronograma.",
      "Netlify, para hospedagem do site e webapp.",
      "OpenAI, apenas quando a análise por IA/foto for usada.",
    ],
  },
  {
    title: "4. Compartilhamento",
    items: [
      "Não vendemos dados pessoais.",
      "Usamos serviços técnicos necessários para o funcionamento do produto, como hospedagem, banco de dados, autenticação e análise quando solicitada.",
    ],
  },
  {
    title: "5. Direitos da usuária",
    items: [
      "Você pode solicitar acesso, correção ou exclusão dos seus dados.",
      "O suporte pode ser solicitado pelo WhatsApp indicado nesta página.",
    ],
  },
  {
    title: "6. Segurança",
    items: [
      "Usamos medidas técnicas de proteção e acesso restrito para reduzir riscos.",
      "Nenhum sistema digital é livre de riscos absolutos, por isso mantemos apenas os dados necessários para a experiência.",
    ],
  },
];

export default function PrivacyPage() {
  const supportUrl = getSupportWhatsAppUrl();

  return (
    <main className="px-5 py-12 md:px-10">
      <article className="mx-auto max-w-4xl rounded-[34px] bg-[#fffaf6] p-7 soft-border premium-shadow md:p-10">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ad2d63]">Couto Hair Program</p>
        <h1 className="font-editorial mt-4 text-5xl font-black leading-none tracking-[-0.035em] md:text-7xl">
          Política de Privacidade
        </h1>
        <p className="mt-6 text-sm font-bold leading-7 text-[#5b4d52]">
          Esta política explica, de forma simples, quais dados podem ser usados no Couto Hair Program e por quê.
        </p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-editorial text-3xl font-black leading-none">{section.title}</h2>
              <ul className="mt-4 space-y-3 text-sm font-semibold leading-7 text-[#5b4d52]">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-[26px] bg-[#f3e7de] p-5">
          <h2 className="font-editorial text-3xl font-black leading-none">7. Contato</h2>
          <p className="mt-4 text-sm font-semibold leading-7 text-[#5b4d52]">
            Para falar sobre privacidade, acesso ou exclusão de dados, entre em contato pelo suporte.
          </p>
          <a className="mt-5 inline-flex rounded-full bg-[#140b10] px-5 py-3 text-sm font-extrabold text-white" href={supportUrl}>
            Falar com suporte
          </a>
        </section>
      </article>
    </main>
  );
}
