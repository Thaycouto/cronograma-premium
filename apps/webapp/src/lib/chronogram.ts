export type TreatmentType = "Hidratação" | "Nutrição" | "Reconstrução" | "Pausa";

export type StepStatus = "pendente" | "realizado" | "pulado";

export type DiagnosisAnswers = {
  hairType: string;
  currentState: string[];
  goals: string[];
  chemistry: string;
  heatUse: string;
  frequency: string;
  damageLevel: string;
  notes?: string;
};

export type ChronogramStep = {
  id: string;
  day: number;
  week: number;
  dateLabel: string;
  type: TreatmentType;
  title: string;
  objective: string;
  instructions: string;
  observe: string;
  avoid: string;
  status: StepStatus;
  notes?: string;
  completedAt?: string;
};

export type ChronogramPlan = {
  visualSummary: string;
  suggestedFocus: string;
  mainNeeds: string[];
  alerts: string[];
  nextSteps: Array<{
    type: TreatmentType;
    reason: string;
  }>;
  plan: ChronogramStep[];
  disclaimer: string;
  source: "local" | "ai";
  generatedAt: string;
};

export const chronogramDisclaimer =
  "A análise é orientativa e não substitui avaliação profissional. Não diagnostica doenças do couro cabeludo, queda severa, alergias ou condições médicas.";

const treatmentCopy: Record<
  TreatmentType,
  {
    title: string;
    objective: string;
    instructions: string;
    observe: string;
    avoid: string;
  }
> = {
  Hidratação: {
    title: "Hidratação",
    objective: "Repor água, melhorar toque e observar brilho sem pesar o fio.",
    instructions:
      "Use um tratamento com foco em reposição de água. Aplique no comprimento e pontas, respeite o tempo indicado e enxágue bem.",
    observe: "Toque, brilho, maleabilidade e se as pontas parecem menos ásperas.",
    avoid: "Excesso de produto na raiz ou repetir a etapa se o fio ainda estiver pesado.",
  },
  Nutrição: {
    title: "Nutrição",
    objective: "Devolver maciez, reduzir frizz e proteger pontas ressecadas.",
    instructions:
      "Use uma máscara nutritiva ou tratamento com foco em lipídios. Concentre no comprimento e nas pontas, evitando pesar a raiz.",
    observe: "Alinhamento, redução de frizz, brilho e sensação de cabelo mais maleável.",
    avoid: "Óleo em excesso na raiz ou nutrição seguida se o cabelo ficar sem movimento.",
  },
  Reconstrução: {
    title: "Reconstrução controlada",
    objective: "Apoiar força e resistência quando há quebra, química, elasticidade ou dano percebido.",
    instructions:
      "Use uma etapa reconstrutora com controle. Aplique no comprimento, respeite o tempo indicado e finalize observando a rigidez do fio.",
    observe: "Redução de quebra, resistência ao toque e se o fio ficou firme sem endurecer.",
    avoid: "Reconstrução em excesso, especialmente se o cabelo ficar rígido ou áspero depois.",
  },
  Pausa: {
    title: "Pausa e observação",
    objective: "Evitar excesso e entender como o cabelo respondeu às etapas anteriores.",
    instructions:
      "Não faça tratamento profundo neste dia. Observe toque, raiz, pontas, frizz e brilho antes da próxima etapa.",
    observe: "Se o fio ficou leve, pesado, áspero, oleoso na raiz ou com pontas pedindo mais cuidado.",
    avoid: "Adicionar novas etapas por impulso sem observar a resposta do cabelo.",
  },
};

function includesAny(values: string[], terms: string[]) {
  const normalized = values.join(" ").toLowerCase();
  return terms.some((term) => normalized.includes(term));
}

function getCareDaysByWeek(diagnosis: DiagnosisAnswers) {
  if (diagnosis.frequency.includes("2")) {
    return [1, 4];
  }

  if (diagnosis.frequency.includes("3")) {
    return [1, 3, 6];
  }

  return diagnosis.damageLevel === "Alto" || diagnosis.currentState.length >= 3 ? [1, 3, 6] : [1, 4];
}

function getTreatmentSequence(diagnosis: DiagnosisAnswers): TreatmentType[] {
  const states = diagnosis.currentState;
  const chemistry = diagnosis.chemistry.toLowerCase();
  const highDamage =
    diagnosis.damageLevel === "Alto" ||
    includesAny(states, ["quebradiço", "elástico"]) ||
    ["progressiva", "coloração", "descoloração", "relaxamento", "outro"].some((item) => chemistry.includes(item));

  const dryOrFrizz = includesAny(states, ["ressecado", "frizz", "sem brilho", "pontas secas"]);
  const oilyRoot = includesAny(states, ["oleoso"]);

  if (highDamage && oilyRoot) {
    return ["Hidratação", "Reconstrução", "Pausa", "Nutrição", "Hidratação", "Reconstrução"];
  }

  if (highDamage) {
    return ["Hidratação", "Nutrição", "Reconstrução", "Pausa", "Hidratação", "Nutrição", "Reconstrução"];
  }

  if (oilyRoot) {
    return ["Hidratação", "Pausa", "Nutrição", "Hidratação", "Pausa"];
  }

  if (dryOrFrizz) {
    return ["Hidratação", "Nutrição", "Hidratação", "Pausa", "Nutrição", "Hidratação", "Reconstrução"];
  }

  return ["Hidratação", "Nutrição", "Pausa", "Hidratação", "Nutrição", "Reconstrução"];
}

function getDateLabel(day: number) {
  const date = new Date();
  date.setDate(date.getDate() + day - 1);

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function getFocus(diagnosis: DiagnosisAnswers) {
  const needs = new Set<string>();

  if (includesAny(diagnosis.currentState, ["ressecado", "pontas secas"])) {
    needs.add("reposição de água e maciez");
  }

  if (includesAny(diagnosis.currentState, ["frizz", "sem brilho"])) {
    needs.add("alinhamento, brilho e controle de frizz");
  }

  if (includesAny(diagnosis.currentState, ["quebradiço", "elástico"]) || diagnosis.damageLevel === "Alto") {
    needs.add("força com reconstrução controlada");
  }

  if (includesAny(diagnosis.currentState, ["oleoso"])) {
    needs.add("leveza na raiz e cuidado no comprimento");
  }

  if (!needs.size) {
    needs.add("manutenção com ritmo e observação");
  }

  return Array.from(needs);
}

export function generateChronogram(diagnosis: DiagnosisAnswers, source: "local" | "ai" = "local"): ChronogramPlan {
  const careDays = getCareDaysByWeek(diagnosis);
  const sequence = getTreatmentSequence(diagnosis);
  let sequenceIndex = 0;

  const plan = Array.from({ length: 30 }, (_, index) => {
    const day = index + 1;
    const week = Math.ceil(day / 7);
    const dayInWeek = ((day - 1) % 7) + 1;
    const isCareDay = careDays.includes(dayInWeek);
    const type = isCareDay ? sequence[sequenceIndex++ % sequence.length] : "Pausa";
    const copy = treatmentCopy[type];

    return {
      id: `day-${day}`,
      day,
      week,
      dateLabel: getDateLabel(day),
      type,
      title: copy.title,
      objective: copy.objective,
      instructions: copy.instructions,
      observe: copy.observe,
      avoid: copy.avoid,
      status: "pendente" as StepStatus,
    };
  });

  const actionableSteps = plan.filter((step) => step.type !== "Pausa");
  const mainNeeds = getFocus(diagnosis);

  return {
    visualSummary:
      source === "ai"
        ? "Análise criada com diagnóstico e foto enviada."
        : "Cronograma criado com base nas respostas do diagnóstico.",
    suggestedFocus: mainNeeds[0],
    mainNeeds,
    alerts: [
      "Ajuste a quantidade de produto conforme a resposta do fio.",
      "Evite excesso de reconstrução se o cabelo ficar rígido ou áspero.",
    ],
    nextSteps: actionableSteps.slice(0, 2).map((step) => ({
      type: step.type,
      reason: step.objective,
    })),
    plan,
    disclaimer: chronogramDisclaimer,
    source,
    generatedAt: new Date().toISOString(),
  };
}

export function normalizeAiResultToChronogram(
  diagnosis: DiagnosisAnswers,
  aiResult: unknown,
): ChronogramPlan {
  if (!aiResult || typeof aiResult !== "object") {
    return generateChronogram(diagnosis);
  }

  const result = aiResult as {
    visual_summary?: string;
    visualSummary?: string;
    main_needs?: string[];
    hair_needs?: string[];
    alerts?: string[];
    risk_notes?: string[];
    suggested_focus?: string;
    recommended_frequency?: string;
    next_steps?: Array<{ type?: TreatmentType; reason?: string }>;
    plan?: Array<Partial<ChronogramStep> & { type?: TreatmentType; title?: string }>;
    thirty_day_plan?: Array<{
      day?: number;
      date_label?: string;
      type?: TreatmentType;
      objective?: string;
      how_to_do?: string;
      what_to_avoid?: string;
    }>;
    disclaimer?: string;
  };

  const fallback = generateChronogram(diagnosis, "ai");
  const rawPlan = result.plan ?? result.thirty_day_plan;

  if (!Array.isArray(rawPlan) || rawPlan.length < 1) {
    return {
      ...fallback,
      visualSummary: result.visual_summary ?? result.visualSummary ?? fallback.visualSummary,
      mainNeeds: result.main_needs ?? result.hair_needs ?? fallback.mainNeeds,
      alerts: result.alerts ?? result.risk_notes ?? fallback.alerts,
    };
  }

  const normalizedPlan = Array.from({ length: 30 }, (_, index) => {
    const raw = rawPlan[index] ?? {};
    const rawStep = raw as Partial<ChronogramStep> & {
      date_label?: string;
      how_to_do?: string;
      what_to_avoid?: string;
    };
    const day = typeof raw.day === "number" ? raw.day : index + 1;
    const type = raw.type && ["Hidratação", "Nutrição", "Reconstrução", "Pausa"].includes(raw.type) ? raw.type : fallback.plan[index].type;
    const copy = treatmentCopy[type];

    return {
      id: `day-${day}`,
      day,
      week: Math.ceil(day / 7),
      dateLabel: typeof rawStep.date_label === "string" ? rawStep.date_label : getDateLabel(day),
      type,
      title: typeof rawStep.title === "string" ? rawStep.title : copy.title,
      objective: typeof rawStep.objective === "string" ? rawStep.objective : copy.objective,
      instructions:
        typeof rawStep.instructions === "string"
          ? rawStep.instructions
          : typeof rawStep.how_to_do === "string"
            ? rawStep.how_to_do
            : copy.instructions,
      observe: typeof rawStep.observe === "string" ? rawStep.observe : copy.observe,
      avoid:
        typeof rawStep.avoid === "string"
          ? rawStep.avoid
          : typeof rawStep.what_to_avoid === "string"
            ? rawStep.what_to_avoid
            : copy.avoid,
      status: "pendente" as StepStatus,
    };
  });

  return {
    visualSummary: result.visual_summary ?? result.visualSummary ?? fallback.visualSummary,
    suggestedFocus: result.suggested_focus ?? result.recommended_frequency ?? fallback.suggestedFocus,
    mainNeeds: result.main_needs ?? result.hair_needs ?? fallback.mainNeeds,
    alerts: result.alerts ?? result.risk_notes ?? fallback.alerts,
    nextSteps:
      Array.isArray(result.next_steps) && result.next_steps.length
        ? result.next_steps.slice(0, 2).map((step) => ({
            type: step.type ?? "Hidratação",
            reason: step.reason ?? "Etapa sugerida para a resposta atual do fio.",
          }))
        : fallback.nextSteps,
    plan: normalizedPlan,
    disclaimer: result.disclaimer ?? chronogramDisclaimer,
    source: "ai",
    generatedAt: new Date().toISOString(),
  };
}
