"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import type { ChronogramPlan, ChronogramStep, DiagnosisAnswers, StepStatus } from "@/lib/chronogram";

type Tab = "inicio" | "diagnostico" | "cronograma" | "historico" | "perfil";

type ChronogramRecord = {
  id: string;
  email: string;
  user_id?: string | null;
  diagnosis_json: DiagnosisAnswers;
  plan_json: ChronogramPlan;
  current_day?: number | null;
  created_at?: string;
  updated_at?: string;
};

type TreatmentLog = {
  id?: string;
  chronogram_id: string;
  treatment_type: string;
  scheduled_day: number;
  status: "realizado" | "pulado";
  notes?: string;
  completed_at?: string | null;
  created_at?: string;
};

type DashboardAppProps = {
  email: string;
};

const hairTypes = ["Liso", "Ondulado", "Cacheado", "Crespo", "Não sei dizer"];
const currentStateOptions = ["Ressecado", "Quebradiço", "Com frizz", "Sem brilho", "Elástico", "Oleoso na raiz", "Pontas secas"];
const goalOptions = [
  "Reduzir frizz",
  "Recuperar danos",
  "Melhorar brilho",
  "Reduzir quebra",
  "Crescimento saudável",
  "Definição",
  "Manter saudável",
];
const chemistryOptions = ["Não", "Progressiva", "Coloração", "Descoloração", "Relaxamento", "Outro"];
const heatOptions = ["Quase nunca", "1 a 2 vezes por semana", "3 ou mais vezes por semana"];
const frequencyOptions = ["2 vezes por semana", "3 vezes por semana", "Quero que o sistema sugira"];
const damageOptions = ["Baixo", "Médio", "Alto"];

const emptyDiagnosis: DiagnosisAnswers = {
  hairType: "",
  currentState: [],
  goals: [],
  chemistry: "",
  heatUse: "",
  frequency: "",
  damageLevel: "",
  notes: "",
};

const motionEase = [0.16, 1, 0.3, 1] as const;

const panelMotion = {
  initial: { opacity: 0, y: 18, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -10, filter: "blur(6px)" },
  transition: { duration: 0.42, ease: motionEase },
};

const softItemMotion = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-8% 0px" },
  transition: { duration: 0.48, ease: motionEase },
};

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getStepTone(type: string) {
  if (type === "Nutrição") {
    return "border-[#caa56a]/40 bg-[#fff5df]";
  }

  if (type === "Reconstrução") {
    return "border-[#3e1224]/25 bg-[#f6d4de]";
  }

  if (type === "Pausa") {
    return "border-[#140b10]/10 bg-[#f3e7de]";
  }

  return "border-[#e14a86]/25 bg-[#fff8f2]";
}

function getTodayStep(plan?: ChronogramPlan) {
  if (!plan?.plan.length) {
    return null;
  }

  return plan.plan.find((step) => step.status === "pendente" && step.type !== "Pausa") ?? plan.plan.find((step) => step.status === "pendente") ?? plan.plan[0];
}

function getNextActionableSteps(plan?: ChronogramPlan) {
  if (!plan?.plan.length) {
    return [];
  }

  return plan.plan.filter((step) => step.status === "pendente" && step.type !== "Pausa").slice(0, 3);
}

function getProgress(plan?: ChronogramPlan) {
  if (!plan?.plan.length) {
    return 0;
  }

  const actionable = plan.plan.filter((step) => step.type !== "Pausa");

  if (!actionable.length) {
    return 0;
  }

  const done = actionable.filter((step) => step.status === "realizado").length;

  return Math.round((done / actionable.length) * 100);
}

function groupByWeek(plan?: ChronogramPlan) {
  const groups = new Map<number, ChronogramStep[]>();

  for (const step of plan?.plan ?? []) {
    groups.set(step.week, [...(groups.get(step.week) ?? []), step]);
  }

  return Array.from(groups.entries()).map(([week, steps]) => ({ week, steps }));
}

export function DashboardApp({ email }: DashboardAppProps) {
  const [activeTab, setActiveTab] = useState<Tab>("inicio");
  const [chronogram, setChronogram] = useState<ChronogramRecord | null>(null);
  const [logs, setLogs] = useState<TreatmentLog[]>([]);
  const [diagnosis, setDiagnosis] = useState<DiagnosisAnswers>(emptyDiagnosis);
  const [selectedStep, setSelectedStep] = useState<ChronogramStep | null>(null);
  const [stepNotes, setStepNotes] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEntrance, setShowEntrance] = useState(true);

  const plan = chronogram?.plan_json;
  const todayStep = getTodayStep(plan);
  const nextSteps = getNextActionableSteps(plan);
  const progress = getProgress(plan);
  const weeks = useMemo(() => groupByWeek(plan), [plan]);

  useEffect(() => {
    const entranceTimer = window.setTimeout(() => setShowEntrance(false), 1900);
    return () => window.clearTimeout(entranceTimer);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadChronogram() {
      setIsLoading(true);
      const response = await fetch("/api/chronogram", { cache: "no-store" });
      const result = (await response.json().catch(() => null)) as {
        chronogram?: ChronogramRecord | null;
        logs?: TreatmentLog[];
        error?: string;
      } | null;

      if (!active) {
        return;
      }

      if (!response.ok) {
        setMessage(result?.error ?? "Não foi possível carregar seus dados salvos agora.");
        setIsLoading(false);
        return;
      }

      if (result?.chronogram) {
        setChronogram(result.chronogram);
        setDiagnosis(result.chronogram.diagnosis_json);
      } else {
        setChronogram(null);
        setDiagnosis(emptyDiagnosis);
      }

      setLogs(result?.logs ?? []);
      setIsLoading(false);
    }

    loadChronogram();

    return () => {
      active = false;
    };
  }, []);

  function setSingleField(field: keyof DiagnosisAnswers, value: string) {
    setDiagnosis((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleCurrentState(value: string) {
    setDiagnosis((current) => ({
      ...current,
      currentState: current.currentState.includes(value)
        ? current.currentState.filter((item) => item !== value)
        : [...current.currentState, value],
    }));
  }

  function toggleGoal(value: string) {
    setMessage("");
    setDiagnosis((current) => {
      if (current.goals.includes(value)) {
        return {
          ...current,
          goals: current.goals.filter((item) => item !== value),
        };
      }

      if (current.goals.length >= 3) {
        setMessage("Escolha no máximo 3 prioridades para manter o cronograma preciso.");
        return current;
      }

      return {
        ...current,
        goals: [...current.goals, value],
      };
    });
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type)) {
      setMessage("Use uma foto em PNG, JPG, JPEG ou WEBP.");
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      setMessage("Envie uma imagem de até 6 MB.");
      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setMessage("");
  }

  function validateDiagnosis() {
    if (!diagnosis.hairType) return "Escolha o tipo de fio.";
    if (!diagnosis.currentState.length) return "Escolha pelo menos um estado atual do cabelo.";
    if (!diagnosis.goals.length) return "Escolha pelo menos um objetivo.";
    if (!diagnosis.chemistry) return "Informe se o cabelo passou por química.";
    if (!diagnosis.heatUse) return "Informe o uso de calor.";
    if (!diagnosis.frequency) return "Escolha a frequência desejada.";
    if (!diagnosis.damageLevel) return "Escolha o nível de dano percebido.";
    return "";
  }

  async function submitDiagnosis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationMessage = validateDiagnosis();

    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    setIsGenerating(true);
    setMessage("");
    let aiResult: unknown = null;
    let aiMessage = "";

    if (photo) {
      const formData = new FormData();
      formData.append("diagnosis", JSON.stringify(diagnosis));
      formData.append("photo", photo);

      const aiResponse = await fetch("/api/ai/hair-analysis", {
        method: "POST",
        body: formData,
      });
      const aiPayload = (await aiResponse.json().catch(() => null)) as {
        result?: unknown;
        message?: string;
        error?: string;
      } | null;

      if (aiResponse.ok) {
        aiResult = aiPayload?.result ?? null;
        aiMessage = aiPayload?.message ?? "";
      } else {
        aiMessage = aiPayload?.error ?? "Análise por foto em preparação. O cronograma será criado pelo diagnóstico.";
      }
    }

    const response = await fetch("/api/chronogram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        diagnosis,
        aiResult,
      }),
    });
    const result = (await response.json().catch(() => null)) as {
      chronogram?: ChronogramRecord;
      warning?: string;
      error?: string;
    } | null;

    if (!response.ok || !result?.chronogram) {
      setMessage(result?.error ?? "Não foi possível gerar o cronograma agora.");
      setIsGenerating(false);
      return;
    }

    setChronogram(result.chronogram);
    setLogs([]);
    setActiveTab("cronograma");
    setMessage(aiMessage || result.warning || "Cronograma gerado.");
    setIsGenerating(false);
  }

  async function updateStep(step: ChronogramStep, status: Exclude<StepStatus, "pendente">) {
    if (!chronogram) {
      return;
    }

    const notes = stepNotes.trim();
    const updatedPlan = {
      ...chronogram.plan_json,
      plan: chronogram.plan_json.plan.map((item) =>
        item.id === step.id
          ? {
              ...item,
              status,
              notes,
              completedAt: new Date().toISOString(),
            }
          : item,
      ),
    };
    const localLog: TreatmentLog = {
      id: `local-${Date.now()}`,
      chronogram_id: chronogram.id,
      treatment_type: step.type,
      scheduled_day: step.day,
      status,
      notes,
      completed_at: status === "realizado" ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
    };

    const previousChronogram = chronogram;
    const previousLogs = logs;
    setChronogram({ ...chronogram, plan_json: updatedPlan });
    setLogs((current) => [localLog, ...current]);
    setSelectedStep(null);
    setStepNotes("");
    setMessage(status === "realizado" ? "Tratamento marcado como realizado." : "Etapa marcada como pulada.");

    const response = await fetch("/api/treatment-logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chronogramId: chronogram.id,
        stepId: step.id,
        treatmentType: step.type,
        scheduledDay: step.day,
        status,
        notes,
      }),
    });
    const result = (await response.json().catch(() => null)) as {
      chronogram?: ChronogramRecord;
      log?: TreatmentLog;
    } | null;

    if (!response.ok || !result?.chronogram) {
      setChronogram(previousChronogram);
      setLogs(previousLogs);
      setMessage("Não foi possível salvar essa etapa. Tente novamente.");
      return;
    }

    setChronogram(result.chronogram);
    if (result.log) {
      setLogs((current) => [result.log as TreatmentLog, ...current.filter((item) => item.id !== localLog.id)]);
    }
  }

  function refazerDiagnostico() {
    setDiagnosis(chronogram?.diagnosis_json ?? emptyDiagnosis);
    setPhoto(null);
    setPhotoPreview("");
    setMessage("");
    setActiveTab("diagnostico");
  }

  return (
    <main className="min-h-svh pb-24 md:pb-10">
      <AnimatePresence>
        {showEntrance ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-[#fff8f2]/92 px-6 backdrop-blur-sm"
            exit={{ opacity: 0, filter: "blur(8px)" }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.p
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              className="font-editorial max-w-3xl text-center text-5xl font-black leading-[0.95] tracking-[-0.04em] text-[#140b10] md:text-7xl"
              initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Pronta para viver a melhor fase do seu cabelo?
            </motion.p>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-8">
        <header className="rounded-[30px] bg-[#140b10] p-5 text-white md:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#f6d4de]">Couto Hair Program</p>
              <h1 className="font-editorial mt-3 text-4xl font-black leading-none tracking-[-0.035em] md:text-6xl">
                Seu cronograma capilar
              </h1>
              <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-[#f3e7de]">
                Diagnóstico, foto, rotina de 30 dias, acompanhamento e histórico em um só lugar.
              </p>
            </div>
            <div className="md:text-right">
              <p className="text-xs font-bold text-[#f6d4de]">{email}</p>
              <form action="/api/auth/logout" method="post">
                <button className="mt-3 rounded-full bg-white px-5 py-3 text-xs font-extrabold text-[#140b10]" type="submit">
                  Sair
                </button>
              </form>
            </div>
          </div>
          <nav className="mt-6 hidden gap-2 md:flex">
            {[
              ["inicio", "Início"],
              ["diagnostico", "Diagnóstico"],
              ["cronograma", "Cronograma"],
              ["historico", "Histórico"],
              ["perfil", "Perfil"],
            ].map(([value, label]) => (
              <button
                className={classNames(
                  "rounded-full px-4 py-3 text-xs font-extrabold transition",
                  activeTab === value ? "bg-[#f6d4de] text-[#140b10]" : "bg-white/10 text-white hover:bg-white/15",
                )}
                key={value}
                onClick={() => setActiveTab(value as Tab)}
                type="button"
              >
                {label}
              </button>
            ))}
          </nav>
        </header>

        {message ? (
          <p className="mt-5 rounded-[22px] bg-[#f6d4de] px-5 py-4 text-sm font-extrabold text-[#3e1224]">{message}</p>
        ) : null}

        {isLoading ? (
          <section className="mt-8 rounded-[30px] bg-[#fffaf6] p-8 soft-border premium-shadow">
            <p className="font-editorial text-4xl font-black">Carregando seu painel...</p>
          </section>
        ) : null}

        <AnimatePresence mode="wait">
          {!isLoading ? (
            <motion.div key={activeTab} {...panelMotion}>
              {activeTab === "inicio" ? (
                <HomeView
                  chronogram={chronogram}
                  nextSteps={nextSteps}
                  progress={progress}
                  todayStep={todayStep}
                  onOpenSchedule={() => setActiveTab("cronograma")}
                  onOpenDiagnosis={refazerDiagnostico}
                  onOpenPhoto={() => setActiveTab("diagnostico")}
                  onOpenStep={setSelectedStep}
                  onQuickDone={(step) => updateStep(step, "realizado")}
                />
              ) : null}

              {activeTab === "diagnostico" ? (
                <DiagnosisView
                  diagnosis={diagnosis}
                  isGenerating={isGenerating}
                  photoPreview={photoPreview}
                  onChangeField={setSingleField}
                  onChangeNotes={(value) => setDiagnosis((current) => ({ ...current, notes: value }))}
                  onPhotoChange={handlePhotoChange}
                  onRemovePhoto={() => {
                    setPhoto(null);
                    setPhotoPreview("");
                  }}
                  onSubmit={submitDiagnosis}
                  onToggleCurrentState={toggleCurrentState}
                  onToggleGoal={toggleGoal}
                />
              ) : null}

              {activeTab === "cronograma" ? (
                <ScheduleView chronogram={chronogram} onOpenDiagnosis={refazerDiagnostico} onOpenStep={setSelectedStep} weeks={weeks} />
              ) : null}

              {activeTab === "historico" ? <HistoryView logs={logs} /> : null}

              {activeTab === "perfil" ? <ProfileView chronogram={chronogram} onOpenDiagnosis={refazerDiagnostico} /> : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedStep ? (
          <TreatmentDetail
            notes={stepNotes}
            step={selectedStep}
            onChangeNotes={setStepNotes}
            onClose={() => setSelectedStep(null)}
            onSkip={() => updateStep(selectedStep, "pulado")}
            onDone={() => updateStep(selectedStep, "realizado")}
          />
        ) : null}
      </AnimatePresence>

      <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-full border border-[#140b10]/10 bg-[#fffaf6]/95 p-2 shadow-[0_20px_70px_rgba(62,18,36,0.18)] backdrop-blur md:hidden">
        {[
          ["inicio", "Início"],
          ["diagnostico", "Diag."],
          ["cronograma", "Plano"],
          ["historico", "Hist."],
          ["perfil", "Perfil"],
        ].map(([value, label]) => (
          <button
            className={classNames(
              "min-w-0 truncate whitespace-nowrap rounded-full px-1 py-3 text-center text-[10px] font-black leading-none transition min-[390px]:px-2 min-[390px]:text-[11px]",
              activeTab === value ? "bg-[#140b10] text-white" : "text-[#5b4d52]",
            )}
            key={value}
            onClick={() => setActiveTab(value as Tab)}
            type="button"
          >
            {label}
          </button>
        ))}
      </nav>
    </main>
  );
}

function HomeView({
  chronogram,
  nextSteps,
  progress,
  todayStep,
  onOpenSchedule,
  onOpenDiagnosis,
  onOpenPhoto,
  onOpenStep,
  onQuickDone,
}: {
  chronogram: ChronogramRecord | null;
  nextSteps: ChronogramStep[];
  progress: number;
  todayStep: ChronogramStep | null;
  onOpenSchedule: () => void;
  onOpenDiagnosis: () => void;
  onOpenPhoto: () => void;
  onOpenStep: (step: ChronogramStep) => void;
  onQuickDone: (step: ChronogramStep) => void;
}) {
  if (!chronogram || !todayStep) {
    return (
      <section className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[34px] bg-[#fffaf6] p-7 soft-border premium-shadow md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ad2d63]">Primeiro passo</p>
          <h2 className="font-editorial mt-4 text-5xl font-black leading-none tracking-[-0.035em]">
            Responda o diagnóstico para gerar sua rotina.
          </h2>
          <p className="mt-5 max-w-2xl text-sm font-bold leading-7 text-[#5b4d52]">
            O plano considera tipo de fio, sinais atuais, química, calor, frequência disponível e objetivos. A foto ajuda a refinar a leitura quando enviada.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button className="cta-gradient rounded-full px-6 py-4 text-sm font-extrabold text-white" onClick={onOpenDiagnosis} type="button">
              Começar diagnóstico
            </button>
            <button className="rounded-full border border-[#140b10]/15 px-6 py-4 text-sm font-extrabold" onClick={onOpenPhoto} type="button">
              Enviar foto do cabelo
            </button>
          </div>
        </div>
        <div className="rounded-[34px] bg-[#140b10] p-7 text-white md:p-10">
          <p className="font-editorial text-4xl font-black leading-none">O que será criado</p>
          <div className="mt-8 space-y-5 text-sm font-semibold leading-6 text-[#f3e7de]">
            <p>Calendário de 30 dias com hidratação, nutrição, reconstrução e pausas.</p>
            <p>Detalhe de cada etapa com objetivo, como fazer, o que observar e o que evitar.</p>
            <p>Histórico para acompanhar constância e resposta do fio.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[34px] bg-[#fffaf6] p-7 soft-border premium-shadow md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ad2d63]">Etapa atual</p>
          <h2 className="font-editorial mt-4 text-5xl font-black leading-none tracking-[-0.035em]">{todayStep.title}</h2>
          <p className="mt-5 text-base font-bold leading-7 text-[#5b4d52]">{todayStep.objective}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button className="cta-gradient rounded-full px-6 py-4 text-sm font-extrabold text-white" onClick={() => onQuickDone(todayStep)} type="button">
              Marcar como realizado
            </button>
            <button className="rounded-full border border-[#140b10]/15 px-6 py-4 text-sm font-extrabold" onClick={() => onOpenStep(todayStep)} type="button">
              Ver tratamento de hoje
            </button>
          </div>
        </article>
        <article className="rounded-[34px] bg-[#140b10] p-7 text-white md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f6d4de]">Progresso</p>
          <p className="font-editorial mt-4 text-6xl font-black leading-none">{progress}%</p>
          <div className="mt-5 h-3 rounded-full bg-white/10">
            <div className="h-3 rounded-full bg-[#e14a86]" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-5 text-sm font-semibold leading-6 text-[#f3e7de]">{chronogram.plan_json.suggestedFocus}</p>
        </article>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {nextSteps.map((step, index) => (
          <motion.article
            className={classNames("rounded-[30px] border p-6", getStepTone(step.type))}
            key={step.id}
            {...softItemMotion}
            transition={{ ...softItemMotion.transition, delay: index * 0.06 }}
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ad2d63]">
              {index === 0 ? "Hoje" : index === 1 ? "Próxima etapa" : "Depois"}
            </p>
            <h3 className="font-editorial mt-4 text-4xl font-black leading-none">{step.title}</h3>
            <p className="mt-4 text-sm font-bold leading-6 text-[#5b4d52]">{step.objective}</p>
            <button className="mt-6 rounded-full bg-[#140b10] px-5 py-3 text-sm font-extrabold text-white" onClick={() => onOpenStep(step)} type="button">
              Ver detalhes
            </button>
          </motion.article>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button className="rounded-full bg-[#140b10] px-6 py-4 text-sm font-extrabold text-white" onClick={onOpenSchedule} type="button">
          Ver cronograma completo
        </button>
        <button className="rounded-full border border-[#140b10]/15 px-6 py-4 text-sm font-extrabold" onClick={onOpenDiagnosis} type="button">
          Refazer diagnóstico
        </button>
      </div>
    </section>
  );
}

function DiagnosisView({
  diagnosis,
  isGenerating,
  photoPreview,
  onChangeField,
  onChangeNotes,
  onPhotoChange,
  onRemovePhoto,
  onSubmit,
  onToggleCurrentState,
  onToggleGoal,
}: {
  diagnosis: DiagnosisAnswers;
  isGenerating: boolean;
  photoPreview: string;
  onChangeField: (field: keyof DiagnosisAnswers, value: string) => void;
  onChangeNotes: (value: string) => void;
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleCurrentState: (value: string) => void;
  onToggleGoal: (value: string) => void;
}) {
  return (
    <form className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]" onSubmit={onSubmit}>
      <section className="rounded-[34px] bg-[#fffaf6] p-6 soft-border premium-shadow md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ad2d63]">Diagnóstico</p>
        <h2 className="font-editorial mt-4 text-5xl font-black leading-none tracking-[-0.035em]">Leitura do cabelo</h2>
        <p className="mt-5 text-sm font-bold leading-7 text-[#5b4d52]">
          Responda com o estado atual do fio. O cronograma muda conforme sinais de ressecamento, frizz, quebra, química, calor e tempo disponível.
        </p>

        <div className="mt-8">
          <p className="text-sm font-black">Foto do cabelo</p>
          <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-[#ad2d63]/35 bg-[#fff8f2] p-5 text-center">
            <AnimatePresence mode="wait">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <motion.img
                  alt="Prévia da foto do cabelo"
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  className="max-h-80 w-full rounded-[22px] object-contain"
                  exit={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
                  initial={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
                  src={photoPreview}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                />
              ) : (
                <motion.span
                  animate={{ opacity: 1, y: 0 }}
                  className="py-8 text-sm font-extrabold text-[#5b4d52]"
                  exit={{ opacity: 0, y: -6 }}
                  initial={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.3 }}
                >
                  Selecionar foto em JPG, PNG ou WEBP
                </motion.span>
              )}
            </AnimatePresence>
            <input accept="image/png,image/jpeg,image/jpg,image/webp" className="sr-only" onChange={onPhotoChange} type="file" />
          </label>
          {photoPreview ? (
            <button className="mt-3 rounded-full border border-[#140b10]/15 px-5 py-3 text-xs font-extrabold" onClick={onRemovePhoto} type="button">
              Remover foto
            </button>
          ) : null}
          <p className="mt-3 text-xs font-bold leading-5 text-[#7a6870]">
            Se a análise por foto ainda não estiver disponível no servidor, o cronograma será criado pelo diagnóstico.
          </p>
          <p className="mt-4 rounded-[20px] bg-[#f3e7de] p-4 text-xs font-bold leading-5 text-[#5b4d52]">
            As informações e fotos enviadas são usadas para gerar seu cronograma personalizado. A análise é orientativa e não substitui avaliação profissional.
          </p>
        </div>
      </section>

      <section className="rounded-[34px] bg-[#fffaf6] p-6 soft-border premium-shadow md:p-8">
        <Question title="Tipo de fio">
          <ChoiceGroup options={hairTypes} selected={[diagnosis.hairType]} onSelect={(value) => onChangeField("hairType", value)} />
        </Question>

        <Question title="Estado atual" text="Pode selecionar mais de uma opção.">
          <ChoiceGroup multiple options={currentStateOptions} selected={diagnosis.currentState} onSelect={onToggleCurrentState} />
        </Question>

        <Question title="Objetivo principal" text={`Escolha até 3 prioridades. ${diagnosis.goals.length} de 3 selecionados.`}>
          <ChoiceGroup multiple options={goalOptions} selected={diagnosis.goals} onSelect={onToggleGoal} />
        </Question>

        <Question title="Tem química?">
          <ChoiceGroup options={chemistryOptions} selected={[diagnosis.chemistry]} onSelect={(value) => onChangeField("chemistry", value)} />
        </Question>

        <Question title="Uso de calor">
          <ChoiceGroup options={heatOptions} selected={[diagnosis.heatUse]} onSelect={(value) => onChangeField("heatUse", value)} />
        </Question>

        <Question title="Frequência desejada">
          <ChoiceGroup options={frequencyOptions} selected={[diagnosis.frequency]} onSelect={(value) => onChangeField("frequency", value)} />
        </Question>

        <Question title="Nível de dano percebido">
          <ChoiceGroup options={damageOptions} selected={[diagnosis.damageLevel]} onSelect={(value) => onChangeField("damageLevel", value)} />
        </Question>

        <label className="mt-7 block">
          <span className="text-sm font-black">Observação livre</span>
          <textarea
            className="mt-3 min-h-28 w-full rounded-[24px] border border-[#140b10]/12 bg-white px-4 py-4 text-sm font-semibold outline-none focus:border-[#ad2d63]"
            onChange={(event) => onChangeNotes(event.target.value)}
            placeholder="Conte algo que você percebe no toque, na raiz, nas pontas ou depois da lavagem."
            value={diagnosis.notes}
          />
        </label>

        <button className="cta-gradient mt-7 w-full rounded-full px-6 py-4 text-sm font-extrabold text-white disabled:opacity-60" disabled={isGenerating} type="submit">
          {isGenerating ? "Gerando cronograma..." : "Gerar meu cronograma"}
        </button>
      </section>
    </form>
  );
}

function Question({ title, text, children }: { title: string; text?: string; children: ReactNode }) {
  return (
    <div className="mt-7 first:mt-0">
      <p className="text-sm font-black">{title}</p>
      {text ? <p className="mt-1 text-xs font-bold text-[#7a6870]">{text}</p> : null}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ChoiceGroup({
  options,
  selected,
  multiple,
  onSelect,
}: {
  options: string[];
  selected: string[];
  multiple?: boolean;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option);

        return (
          <motion.button
            className={classNames(
              "rounded-full border px-4 py-3 text-xs font-extrabold transition",
              isSelected ? "border-[#140b10] bg-[#140b10] text-white" : "border-[#140b10]/12 bg-white text-[#3e1224] hover:border-[#ad2d63]",
            )}
            key={option}
            onClick={() => onSelect(option)}
            type="button"
            aria-pressed={multiple ? isSelected : undefined}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            {option}
          </motion.button>
        );
      })}
    </div>
  );
}

function ScheduleView({
  chronogram,
  weeks,
  onOpenDiagnosis,
  onOpenStep,
}: {
  chronogram: ChronogramRecord | null;
  weeks: Array<{ week: number; steps: ChronogramStep[] }>;
  onOpenDiagnosis: () => void;
  onOpenStep: (step: ChronogramStep) => void;
}) {
  if (!chronogram) {
    return (
      <section className="mt-8 rounded-[34px] bg-[#fffaf6] p-8 soft-border premium-shadow">
        <h2 className="font-editorial text-5xl font-black leading-none">Seu cronograma ainda não foi gerado.</h2>
        <p className="mt-5 text-sm font-bold leading-7 text-[#5b4d52]">Responda o diagnóstico para criar o calendário de 30 dias.</p>
        <button className="cta-gradient mt-7 rounded-full px-6 py-4 text-sm font-extrabold text-white" onClick={onOpenDiagnosis} type="button">
          Responder diagnóstico
        </button>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="rounded-[34px] bg-[#fffaf6] p-6 soft-border premium-shadow md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ad2d63]">30 dias</p>
            <h2 className="font-editorial mt-3 text-5xl font-black leading-none tracking-[-0.035em]">Cronograma</h2>
          </div>
          <p className="max-w-xl text-sm font-bold leading-6 text-[#5b4d52]">{chronogram.plan_json.visualSummary}</p>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {weeks.map((group, groupIndex) => (
          <motion.section
            className="rounded-[34px] bg-[#fffaf6] p-5 soft-border md:p-7"
            key={group.week}
            {...softItemMotion}
            transition={{ ...softItemMotion.transition, delay: groupIndex * 0.08 }}
          >
            <h3 className="font-editorial text-4xl font-black leading-none">Semana {group.week}</h3>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {group.steps.map((step, stepIndex) => (
                <motion.article
                  className={classNames("rounded-[26px] border p-5", getStepTone(step.type))}
                  key={step.id}
                  initial={{ opacity: 0, y: 12 }}
                  transition={{ delay: stepIndex * 0.035, duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                  whileHover={{ y: -3 }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ad2d63]">{step.dateLabel}</p>
                      <h4 className="font-editorial mt-3 text-3xl font-black leading-none">{step.title}</h4>
                    </div>
                    <span className="rounded-full bg-white/80 px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#3e1224]">
                      {step.status}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-bold leading-6 text-[#5b4d52]">{step.objective}</p>
                  <button className="mt-5 rounded-full bg-[#140b10] px-5 py-3 text-xs font-extrabold text-white" onClick={() => onOpenStep(step)} type="button">
                    Ver detalhes
                  </button>
                </motion.article>
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </section>
  );
}

function TreatmentDetail({
  step,
  notes,
  onChangeNotes,
  onClose,
  onDone,
  onSkip,
}: {
  step: ChronogramStep;
  notes: string;
  onChangeNotes: (value: string) => void;
  onClose: () => void;
  onDone: () => void;
  onSkip: () => void;
}) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 grid place-items-end bg-[#140b10]/45 p-3 backdrop-blur-sm md:place-items-center"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
    >
      <motion.section
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="max-h-[92svh] w-full max-w-2xl overflow-auto rounded-[34px] bg-[#fffaf6] p-6 soft-border premium-shadow md:p-8"
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      >
        <button className="rounded-full border border-[#140b10]/15 px-4 py-2 text-xs font-extrabold" onClick={onClose} type="button">
          Fechar
        </button>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-[#ad2d63]">Dia {step.day}</p>
        <h2 className="font-editorial mt-3 text-5xl font-black leading-none tracking-[-0.035em]">{step.title}</h2>
        <DetailBlock title="Objetivo" text={step.objective} />
        <DetailBlock title="Como fazer" text={step.instructions} />
        <DetailBlock title="O que observar" text={step.observe} />
        <DetailBlock title="O que evitar" text={step.avoid} />
        <label className="mt-6 block">
          <span className="text-sm font-black">Observação da etapa</span>
          <textarea
            className="mt-3 min-h-24 w-full rounded-[22px] border border-[#140b10]/12 bg-white px-4 py-4 text-sm font-semibold outline-none focus:border-[#ad2d63]"
            onChange={(event) => onChangeNotes(event.target.value)}
            placeholder="Como o cabelo respondeu depois desse cuidado?"
            value={notes}
          />
        </label>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button className="cta-gradient rounded-full px-6 py-4 text-sm font-extrabold text-white" onClick={onDone} type="button">
            Marcar como realizado
          </button>
          <button className="rounded-full border border-[#140b10]/15 px-6 py-4 text-sm font-extrabold" onClick={onSkip} type="button">
            Pular etapa
          </button>
        </div>
      </motion.section>
    </motion.div>
  );
}

function DetailBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-6">
      <p className="text-sm font-black">{title}</p>
      <p className="mt-2 text-sm font-bold leading-7 text-[#5b4d52]">{text}</p>
    </div>
  );
}

function HistoryView({ logs }: { logs: TreatmentLog[] }) {
  return (
    <section className="mt-8 rounded-[34px] bg-[#fffaf6] p-6 soft-border premium-shadow md:p-8">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ad2d63]">Histórico</p>
      <h2 className="font-editorial mt-3 text-5xl font-black leading-none tracking-[-0.035em]">Tratamentos registrados</h2>
      {!logs.length ? (
        <p className="mt-6 text-sm font-bold leading-7 text-[#5b4d52]">Você ainda não marcou nenhum tratamento como realizado.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {logs.map((log, index) => (
            <motion.article
              className="rounded-[24px] border border-[#140b10]/10 bg-white p-5"
              key={log.id ?? `${log.scheduled_day}-${log.created_at}`}
              initial={{ opacity: 0, y: 14 }}
              transition={{ delay: index * 0.05, duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-editorial text-3xl font-black leading-none">{log.treatment_type}</p>
                <span className="w-fit rounded-full bg-[#f6d4de] px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#3e1224]">
                  {log.status}
                </span>
              </div>
              <p className="mt-3 text-sm font-bold text-[#5b4d52]">Dia {log.scheduled_day}</p>
              {log.notes ? <p className="mt-3 text-sm font-semibold leading-6 text-[#5b4d52]">{log.notes}</p> : null}
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
}

function ProfileView({ chronogram, onOpenDiagnosis }: { chronogram: ChronogramRecord | null; onOpenDiagnosis: () => void }) {
  const diagnosis = chronogram?.diagnosis_json;

  return (
    <section className="mt-8 rounded-[34px] bg-[#fffaf6] p-6 soft-border premium-shadow md:p-8">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ad2d63]">Perfil do cabelo</p>
      <h2 className="font-editorial mt-3 text-5xl font-black leading-none tracking-[-0.035em]">Resumo do diagnóstico</h2>
      {!diagnosis ? (
        <p className="mt-6 text-sm font-bold leading-7 text-[#5b4d52]">Responda o diagnóstico para preencher o perfil do cabelo.</p>
      ) : (
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <ProfileItem label="Tipo de fio" value={diagnosis.hairType} />
          <ProfileItem label="Principais queixas" value={diagnosis.currentState.join(", ")} />
          <ProfileItem label="Objetivos" value={diagnosis.goals.join(", ")} />
          <ProfileItem label="Histórico químico" value={diagnosis.chemistry} />
          <ProfileItem label="Uso de calor" value={diagnosis.heatUse} />
          <ProfileItem label="Frequência" value={diagnosis.frequency} />
          <ProfileItem label="Nível de dano" value={diagnosis.damageLevel} />
          <ProfileItem label="Última análise" value={chronogram?.plan_json.generatedAt ? new Date(chronogram.plan_json.generatedAt).toLocaleDateString("pt-BR") : "Não registrada"} />
        </div>
      )}
      <button className="cta-gradient mt-7 rounded-full px-6 py-4 text-sm font-extrabold text-white" onClick={onOpenDiagnosis} type="button">
        Refazer diagnóstico
      </button>
    </section>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[24px] border border-[#140b10]/10 bg-white p-5">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ad2d63]">{label}</p>
      <p className="mt-3 text-sm font-extrabold leading-6 text-[#3e1224]">{value || "Não informado"}</p>
    </article>
  );
}
