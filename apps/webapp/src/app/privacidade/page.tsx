import { getSupportWhatsAppUrl } from "@/app/support-whatsapp";

export const metadata = {
  title: "Política de Privacidade | Couto Hair Program",
  description: "Como o Couto Hair Program usa dados para validar acesso, salvar cronograma e personalizar a experiência.",
};

const sections = [
  {
    title: "1. Quais dados coletamos",
    items: [
      "Nome e e-mail usados na compra e no acesso.",
      "Respostas do diagnóstico capilar.",
      "Fotos enviadas, quando a cliente escolhe usar análise por foto.",
      "Histórico de tratamentos marcados no webapp.",
    ],
  },
  {
    title: "2. Como usamos esses dados",
    items: [
      "Validar seu acesso ao cronograma.",
      "Salvar diagnóstico, cronograma e histórico.",
      "Gerar uma rotina personalizada.",
      "Melhorar sua experiência dentro do Couto Hair Program.",
      "Prestar suporte.",
    ],
  },
  {
    title: "3. Onde os dados ficam armazenados",
    items: [
      "Supabase, para autenticação e dados do cronograma.",
      "Netlify, para hospedagem do site e webapp.",
      "OpenAI, apenas quando a análise por IA/foto for usada.",
    ],
  },
  {
    title: "4. Compartilhamento",
    items: [
      "Não vendemos dados pessoais.",
      "Usamos serviços técnicos necessários para o funcionamento do produto.",
    ],
  },
  {
    title: "5. Direitos da usuária",
    items: [
      "Você pode solicitar acesso, correção ou exclusão dos seus dados.",
      "O suporte pode ser acionado pelo WhatsApp.",
    ],
  },
  {
    title: "6. Segurança",
    items: [
      "Usamos medidas técnicas de proteção e acesso restrito.",
      "Nenhum sistema digital é livre de riscos absolutos.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="px-5 py-12 md:px-10">
      <article className="mx-auto max-w-4xl rounded-[34px] bg-[#fffaf6] p-7 soft-border premium-shadow md:p-10">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ad2d63]">Couto Hair Program</p>
        <h1 className="font-editorial mt-4 text-5xl font-black leading-none tracking-[-0.035em] md:text-7xl">
          Política de Privacidade
        </h1>
        <p className="mt-6 text-sm font-bold leading-7 text-[#5b4d52]">
          Esta página explica como os dados são usados para manter seu acesso e seu cronograma funcionando.
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
            Para suporte, correção ou exclusão de dados, fale com a equipe pelo WhatsApp.
          </p>
          <a className="mt-5 inline-flex rounded-full bg-[#140b10] px-5 py-3 text-sm font-extrabold text-white" href={getSupportWhatsAppUrl()}>
            Falar com suporte
          </a>
        </section>
      </article>
    </main>
  );
}
