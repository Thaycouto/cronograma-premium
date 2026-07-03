import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getPremiumSession, premiumSessionCookieName } from "@/lib/premium-session";

const schedule = [
  {
    day: "Hoje",
    title: "Nutrição",
    text: "Devolver maciez e equilibrar o comprimento sem pesar a raiz.",
  },
  {
    day: "Próxima etapa",
    title: "Hidratação",
    text: "Repor água e observar como o fio responde ao toque.",
  },
  {
    day: "Depois",
    title: "Reconstrução controlada",
    text: "Fortalecer com cuidado, sem excesso de rigidez.",
  },
];

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const hasPremiumCookie = Boolean(cookieStore.get(premiumSessionCookieName)?.value);
  const session = await getPremiumSession();

  console.log("/dashboard carregou", {
    hasPremiumCookie,
    premiumSessionValid: Boolean(session),
    email: session?.email || null,
  });

  if (!session) {
    console.log("/dashboard redirect decidido", {
      redirectTo: "/api/auth/logout?next=/login",
      reason: hasPremiumCookie ? "invalid_chp_session" : "missing_chp_session",
    });
    redirect("/api/auth/logout?next=/login");
  }

  return (
    <main className="min-h-svh px-5 py-8 md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 rounded-[30px] bg-[#140b10] p-6 text-white md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f6d4de]">Dashboard liberado</p>
            <h1 className="font-editorial mt-3 text-5xl font-black leading-none tracking-[-0.035em]">
              Seu cronograma
            </h1>
          </div>
          <div className="max-w-sm">
            <p className="text-sm font-semibold leading-6 text-[#f6d4de]">
              Acesso premium ativo para {session.email}.
            </p>
            <form action="/api/auth/logout" method="post">
              <button className="mt-4 rounded-full bg-white px-5 py-3 text-xs font-extrabold text-[#140b10]" type="submit">
                Sair
              </button>
            </form>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {schedule.map((item) => (
            <article className="premium-shadow rounded-[30px] bg-[#fffaf6] p-6 soft-border" key={item.day}>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ad2d63]">{item.day}</p>
              <h2 className="font-editorial mt-5 text-4xl font-black leading-none">{item.title}</h2>
              <p className="mt-5 text-sm font-semibold leading-6 text-[#5b4d52]">{item.text}</p>
              <button className="mt-7 w-full rounded-full bg-[#140b10] px-5 py-3 text-sm font-extrabold text-white">
                Marcar como realizado
              </button>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-[34px] bg-[#fffaf6] p-6 soft-border premium-shadow md:p-8">
          <div className="grid gap-5 md:grid-cols-3">
            {["Diagnóstico", "Cronograma completo", "Histórico"].map((item) => (
              <article className="rounded-[26px] bg-[#fff8f2] p-5 soft-border" key={item}>
                <p className="font-editorial text-3xl font-black leading-none text-[#140b10]">{item}</p>
                <p className="mt-4 text-sm font-semibold leading-6 text-[#5b4d52]">
                  Área premium pronta para revisão do fluxo interno.
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
