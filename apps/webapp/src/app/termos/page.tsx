import { getSupportWhatsAppUrl } from "@/app/support-whatsapp";

export const metadata = {
  title: "Termos de Uso | Couto Hair Program",
  description: "Termos para acesso e uso do Couto Hair Program.",
};

const sections = [
  {
    title: "1. Sobre o Couto Hair Program",
    text: "O Couto Hair Program é uma experiência digital de cronograma capilar personalizado, com diagnóstico, organização de rotina e acompanhamento dentro do webapp.",
  },
  {
    title: "2. Acesso ao produto",
    text: "O acesso é liberado para o e-mail usado na compra. A criação de senha e o login devem ser feitos com esse mesmo e-mail.",
  },
  {
    title: "3. Uso do cronograma",
    text: "O cronograma organiza hidratação capilar, nutrição capilar, reconstrução capilar e pausas conforme diagnóstico, objetivo e sinais informados.",
  },
  {
    title: "4. Limitações",
    text: "O cronograma é uma orientação de cuidados capilares e não substitui avaliação de cabeleireiro, dermatologista ou profissional especializado, especialmente em casos de queda intensa, feridas, alergias, irritações ou condições no couro cabeludo.",
  },
  {
    title: "5. Reembolso",
    text: "Solicitações de reembolso seguem as regras da plataforma de pagamento usada na compra, incluindo as regras da Kiwify quando aplicável.",
  },
  {
    title: "6. Responsabilidade da usuária",
    text: "A usuária deve responder o diagnóstico com informações reais, observar a resposta do cabelo e evitar produtos ou procedimentos que já tenham causado alergia, irritação ou sensibilidade.",
  },
  {
    title: "7. Suporte",
    text: "O suporte ajuda com acesso e uso do produto. Dúvidas que exigem avaliação presencial devem ser levadas a um profissional especializado.",
  },
  {
    title: "8. Alterações futuras",
    text: "O Couto Hair Program pode receber melhorias, novos conteúdos e ajustes. Mudanças relevantes poderão ser comunicadas nos canais do produto.",
  },
];

export default function TermsPage() {
  return (
    <main className="px-5 py-12 md:px-10">
      <article className="mx-auto max-w-4xl rounded-[34px] bg-[#fffaf6] p-7 soft-border premium-shadow md:p-10">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ad2d63]">Couto Hair Program</p>
        <h1 className="font-editorial mt-4 text-5xl font-black leading-none tracking-[-0.035em] md:text-7xl">
          Termos de Uso
        </h1>
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-editorial text-3xl font-black leading-none">{section.title}</h2>
              <p className="mt-4 text-sm font-semibold leading-7 text-[#5b4d52]">{section.text}</p>
            </section>
          ))}
        </div>
        <a className="mt-10 inline-flex rounded-full bg-[#140b10] px-5 py-3 text-sm font-extrabold text-white" href={getSupportWhatsAppUrl()}>
          Falar com suporte
        </a>
      </article>
    </main>
  );
}
