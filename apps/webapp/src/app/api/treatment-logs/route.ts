import { NextResponse } from "next/server";
import type { ChronogramPlan, ChronogramStep, StepStatus } from "@/lib/chronogram";
import { getPremiumSession } from "@/lib/premium-session";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isStepStatus(value: unknown): value is Exclude<StepStatus, "pendente"> {
  return value === "realizado" || value === "pulado";
}

function updatePlanStatus(planJson: unknown, stepId: string, status: Exclude<StepStatus, "pendente">, notes: string) {
  if (!planJson || typeof planJson !== "object" || Array.isArray(planJson)) {
    return planJson;
  }

  const plan = planJson as ChronogramPlan;

  if (!Array.isArray(plan.plan)) {
    return planJson;
  }

  const updatedPlan = plan.plan.map((step: ChronogramStep) => {
    if (step.id !== stepId) {
      return step;
    }

    return {
      ...step,
      status,
      notes,
      completedAt: new Date().toISOString(),
    };
  });

  return {
    ...plan,
    plan: updatedPlan,
  };
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

  if (!body?.chronogramId || !body.stepId || !body.treatmentType || typeof body.scheduledDay !== "number") {
    return jsonError("Escolha uma etapa válida do cronograma.", 400);
  }

  if (!isStepStatus(body.status)) {
    return jsonError("Escolha se a etapa foi realizada ou pulada.", 400);
  }

  if (body.chronogramId.startsWith("local-")) {
    return NextResponse.json({
      log: {
        id: `local-log-${Date.now()}`,
        email: session.email,
        chronogram_id: body.chronogramId,
        treatment_type: body.treatmentType,
        scheduled_day: body.scheduledDay,
        status: body.status,
        notes: String(body.notes || "").trim(),
        completed_at: body.status === "realizado" ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
      },
    });
  }

  try {
    const admin = createSupabaseAdmin();
    const { data: chronogram, error: chronogramError } = await admin
      .from("chronograms")
      .select("*")
      .eq("id", body.chronogramId)
      .eq("email", session.email)
      .maybeSingle();

    if (chronogramError || !chronogram) {
      console.warn("treatment-log chronogram lookup failed", chronogramError?.message);
      return jsonError("Não foi possível encontrar este cronograma.", 404);
    }

    const notes = String(body.notes || "").trim();
    const completedAt = body.status === "realizado" ? new Date().toISOString() : null;
    const { data: log, error: logError } = await admin
      .from("treatment_logs")
      .insert({
        email: session.email,
        chronogram_id: body.chronogramId,
        treatment_type: body.treatmentType,
        scheduled_day: body.scheduledDay,
        status: body.status,
        notes,
        completed_at: completedAt,
      })
      .select("*")
      .single();

    if (logError) {
      console.warn("treatment-log insert failed", logError.message);
      return jsonError("Não foi possível salvar o histórico agora.", 500);
    }

    const updatedPlanJson = updatePlanStatus(chronogram.plan_json, body.stepId, body.status, notes);
    const { data: updatedChronogram, error: updateError } = await admin
      .from("chronograms")
      .update({
        plan_json: updatedPlanJson,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.chronogramId)
      .select("*")
      .single();

    if (updateError) {
      console.warn("chronogram status update failed", updateError.message);
    }

    return NextResponse.json({
      log,
      chronogram: updatedChronogram ?? {
        ...chronogram,
        plan_json: updatedPlanJson,
      },
    });
  } catch (error) {
    console.error("treatment-log unexpected", error);
    return jsonError("Não foi possível salvar o histórico agora.", 500);
  }
}
