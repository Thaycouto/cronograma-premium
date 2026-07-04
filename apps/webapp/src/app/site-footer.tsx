import Link from "next/link";
import { getSupportWhatsAppUrl } from "@/app/support-whatsapp";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#140b10]/10 px-5 py-10 pb-28 md:px-10 md:pb-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm font-bold text-[#5b4d52] md:flex-row md:items-center md:justify-between">
        <p>© 2026 Couto Hair Program. Todos os direitos reservados.</p>
        <nav className="flex flex-wrap gap-4">
          <Link className="transition hover:text-[#ad2d63]" href="/privacidade">
            Política de Privacidade
          </Link>
          <Link className="transition hover:text-[#ad2d63]" href="/termos">
            Termos de Uso
          </Link>
          <a className="transition hover:text-[#ad2d63]" href={getSupportWhatsAppUrl()} rel="noreferrer" target="_blank">
            Suporte
          </a>
        </nav>
      </div>
    </footer>
  );
}
