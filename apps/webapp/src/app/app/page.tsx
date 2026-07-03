import { redirect } from "next/navigation";
import { userHasPremiumAccess } from "@/lib/access/premium";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type NextStep = {
  type: string;
  reason: string;
  when: string;
};

type HairAnalysisResult = {
  visual_summary?: string;
  main_priorities?: string[];
  next_steps?: NextStep[];
};

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

function parseAnalysisResult(value: unknown): HairAnalysisResult | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as HairAnalysisResult;
}

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

  const { data: latestAnalysis } = await supabase
    .from("ai_hair_analyses")
    .select("ai_result_json, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const analysis = parseAnalysisResult(latestAnalysis?.ai_result_json);
  const nextSteps = analysis?.next_steps?.slice(0, 2) ?? [];

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

        <section className="mt-8 rounded-[34px] bg-[#fffaf6] p-6 soft-border premium-shadow md:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ad2d63]">Análise por foto</p>
              <h2 className="font-editorial mt-4 text-4xl font-black leading-none tracking-[-0.025em] text-[#140b10] md:text-5xl">
                O que a IA salvou no seu painel
              </h2>
              <p className="mt-5 text-sm font-semibold leading-7 text-[#5b4d52]">
                Quando o diagnóstico com foto for concluído, o resumo e as próximas etapas aparecem aqui.
              </p>
            </div>

            {analysis ? (
              <div className="rounded-[28px] bg-[#140b10] p-5 text-white md:p-6">
                <p className="text-sm font-semibold leading-7 text-[#f6d4de]">{analysis.visual_summary}</p>

                {analysis.main_priorities?.length ? (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {analysis.main_priorities.slice(0, 4).map((priority) => (
                      <span
                        className="rounded-full border border-[#f6d4de]/25 bg-white/5 px-3 py-2 text-xs font-extrabold text-[#f6d4de]"
                        key={priority}
                      >
                        {priority}
                      </span>
                    ))}
                  </div>
                ) : null}

                {nextSteps.length ? (
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {nextSteps.map((step) => (
                      <article className="rounded-[22px] border border-white/10 bg-white/[0.06] p-4" key={step.when}>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f6d4de]">{step.when}</p>
                        <h3 className="font-editorial mt-3 text-3xl font-black leading-none">{step.type}</h3>
                        <p className="mt-3 text-xs font-semibold leading-6 text-white/75">{step.reason}</p>
                      </article>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-[#d8c7bc] bg-[#fff8f2] p-6">
                <p className="font-editorial text-3xl font-black leading-none text-[#140b10]">
                  Nenhuma análise gerada ainda.
                </p>
                <p className="mt-4 text-sm font-semibold leading-7 text-[#5b4d52]">
                  Responda o diagnóstico e envie uma foto do cabelo para gerar uma rotina personalizada.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
