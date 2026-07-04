const defaultMessage = "Olá! Tenho uma dúvida sobre o Couto Hair Program.";
const defaultSupportUrl = `https://wa.me/5562991439591?text=${encodeURIComponent(defaultMessage)}`;

export function getSupportWhatsAppUrl() {
  return process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_URL || defaultSupportUrl;
}

export function SupportWhatsAppButton() {
  return (
    <a
      aria-label="Abrir suporte pelo WhatsApp"
      className="fixed bottom-5 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-[#140b10]/10 bg-[#fffaf6]/95 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#140b10] shadow-[0_20px_60px_rgba(62,18,36,0.18)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[#ad2d63]/35 md:right-6"
      href={getSupportWhatsAppUrl()}
      rel="noreferrer"
      target="_blank"
    >
      <span className="grid size-6 place-items-center rounded-full bg-[#140b10] text-[10px] text-white">WA</span>
      Dúvidas?
    </a>
  );
}
