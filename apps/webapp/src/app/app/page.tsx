import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { userHasPremiumAccess } from "@/lib/access/premium";

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

export default async function PremiumAppPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const hasPremiumAccess = await userHasPremiumAccess(user.id);

  if (!hasPremiumAccess) {
    redirect("/sem-acesso");
  }

  return (
    <main className="min-h-svh px-5 py-8 md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 rounded-[30px] bg-[#140b10] p-6 text-white md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f6d4de]">Área premium</p>
            <h1 className="font-editorial mt-3 text-5xl font-black leading-none tracking-[-0.035em]">
              Seu cronograma
            </h1>
          </div>
          <p className="max-w-sm text-sm font-semibold leading-6 text-[#f6d4de]">
            Acompanhe a sequência, marque o que foi feito e observe a resposta do fio com constância.
          </p>
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
      </div>
    </main>
  );
}
