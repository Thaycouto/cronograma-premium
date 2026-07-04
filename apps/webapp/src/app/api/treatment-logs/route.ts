import { NextResponse } from "next/server";
import type { ChronogramPlan, ChronogramStep, StepStatus } from "@/lib/chronogram";
import { getPremiumSession } from "@/lib/premium-session";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PersistedStepStatus = Exclude<StepStatus, "pendente">;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function normalizeStepStatus(value: unknown): PersistedStepStatus | null {
  if (value === "realizado" || value === "completed") {
    return "realizado";
  }

  if (value === "pulado" || value === "skipped") {
    return "pulado";
  }

  return null;
}

function isMissingStatusColumn(error: { message?: string } | null) {
  return Boolean(error?.message?.toLowerCase().includes("chronograms.status"));
}

async function findChronogramForStep(admin: ReturnType<typeof createSupabaseAdmin>, chronogramId: string, email: string) {
  const activeQuery = await admin
    .from("chronograms")
    .select("*")
    .eq("id", chronogramId)
    .eq("email", email)
    .eq("status", "active")
    .maybeSingle();

  if (!activeQuery.error || !isMissingStatusColumn(activeQuery.error)) {
    return activeQuery;
  }

  return admin
    .from("chronograms")
    .select("*")
    .eq("id", chronogramId)
    .eq("email", email)
    .maybeSingle();
}

function updatePlanStatus(planJson: unknown, stepId: string, status: PersistedStepStatus, notes: string) {
  if (!planJson || typeof planJson !== "object" || Array.isArray(planJson)) {
    return planJson;
  }

  const plan = planJson as ChronogramPlan;

  if (!Array.isArray(plan.plan)) {
    return planJson;
  }

  const completedAt = new Date().toISOString();
  const updatedPlan = plan.plan.map((step: ChronogramStep) => {
    if (step.id !== stepId) {
      return step;
    }

    return {
      ...step,
      status,
      notes,
      completedAt,
    };
  });

  return {
    ...plan,
    plan: updatedPlan,
  };
}

export async function GET() {
  const session = await getPremiumSession();

  if (!session) {
    return jsonError("Entre novamente para carregar seu histórico.", 401);
  }

  try {
    const admin = createSupabaseAdmin();
    const { data, error } = await admin
      .from("treatment_logs")
      .select("*")
      .eq("email", session.email)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("treatment-log/get failed", error.message);
      return jsonError("Não foi possível carregar seu histórico agora.", 500);
    }

    return NextResponse.json({ logs: data ?? [] });
  } catch (error) {
    console.error("treatment-log/get unexpected", error);
    return jsonError("Não foi possível carregar seu histórico agora.", 500);
  }
}

export async function POST(request: Request) {
  const session = await getPremiumSession();

  if (!session) {
    return jsonError("Entre novamente para atualizar seu cronograma.", 401);
  }

  const body = (await request.json().catch(() => null)) as {
    chronogramId?: string;
    stepId?: string;
    treatmentType?: string;
    scheduledDay?: number;
    status?: unknown;
    notes?: string;
  } | null;

  const status = normalizeStepStatus(body?.status);

  if (!body?.chronogramId || !body.stepId || !body.treatmentType || typeof body.scheduledDay !== "number") {
    return jsonError("Escolha uma etapa válida do cronograma.", 400);
  }

  if (!status) {
    return jsonError("Escolha se a etapa foi realizada ou pulada.", 400);
  }

  try {
    const admin = createSupabaseAdmin();
    const { data: chronogram, error: chronogramError } = await findChronogramForStep(
      admin,
      body.chronogramId,
      session.email,
    );

    if (chronogramError || !chronogram) {
      console.warn("treatment-log chronogram lookup failed", chronogramError?.message);
      return jsonError("Não foi possível encontrar este cronograma.", 404);
    }

    const notes = String(body.notes || "").trim();
    const completedAt = status === "realizado" ? new Date().toISOString() : null;
    const { data: log, error: logError } = await admin
      .from("treatment_logs")
      .insert({
        email: session.email,
        chronogram_id: body.chronogramId,
        treatment_type: body.treatmentType,
        scheduled_day: body.scheduledDay,
        status,
        notes,
        completed_at: completedAt,
      })
      .select("*")
      .single();

    if (logError) {
      console.warn("treatment-log insert failed", logError.message);
      return jsonError("Não foi possível salvar o histórico agora.", 500);
    }

    const updatedPlanJson = updatePlanStatus(chronogram.plan_json, body.stepId, status, notes);
    const { data: updatedChronogram, error: updateError } = await admin
      .from("chronograms")
      .update({
        plan_json: updatedPlanJson,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.chronogramId)
      .eq("email", session.email)
      .select("*")
      .single();

    if (updateError) {
      console.warn("chronogram status update failed", updateError.message);
      return jsonError("O histórico foi salvo, mas não foi possível atualizar a etapa no cronograma.", 500);
    }

    return NextResponse.json({
      log,
      chronogram: updatedChronogram,
    });
  } catch (error) {
    console.error("treatment-log unexpected", error);
    return jsonError("Não foi possível salvar o histórico agora.", 500);
  }
}
