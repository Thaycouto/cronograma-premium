import { NextResponse } from "next/server";
import { generateChronogram, normalizeAiResultToChronogram, type DiagnosisAnswers } from "@/lib/chronogram";
import { getPremiumSession } from "@/lib/premium-session";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isDiagnosis(value: unknown): value is DiagnosisAnswers {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const diagnosis = value as Partial<DiagnosisAnswers>;

  return (
    typeof diagnosis.hairType === "string" &&
    Array.isArray(diagnosis.currentState) &&
    Array.isArray(diagnosis.goals) &&
    typeof diagnosis.chemistry === "string" &&
    typeof diagnosis.heatUse === "string" &&
    typeof diagnosis.frequency === "string" &&
    typeof diagnosis.damageLevel === "string"
  );
}

function isMissingStatusColumn(error: { message?: string } | null) {
  return Boolean(error?.message?.toLowerCase().includes("chronograms.status"));
}

async function findSavedChronogram(admin: ReturnType<typeof createSupabaseAdmin>, email: string, select = "*") {
  const activeQuery = await admin
    .from("chronograms")
    .select(select)
    .eq("email", email)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!activeQuery.error || !isMissingStatusColumn(activeQuery.error)) {
    return {
      ...activeQuery,
      supportsStatus: true,
    };
  }

  const legacyQuery = await admin
    .from("chronograms")
    .select(select)
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    ...legacyQuery,
    supportsStatus: false,
  };
}

export async function GET() {
  const session = await getPremiumSession();

  if (!session) {
    return jsonError("Entre novamente para acessar seu cronograma.", 401);
  }

  try {
    const admin = createSupabaseAdmin();
    const { data: chronogram, error: chronogramError } = await findSavedChronogram(admin, session.email);

    if (chronogramError) {
      console.warn("chronogram/get failed", chronogramError.message);
      return jsonError("Não foi possível carregar seu cronograma salvo agora.", 500);
    }

    if (!chronogram) {
      return NextResponse.json({ chronogram: null, logs: [] });
    }

    const savedChronogram = chronogram as unknown as { id: string };
    const { data: logs, error: logsError } = await admin
      .from("treatment_logs")
      .select("*")
      .eq("email", session.email)
      .eq("chronogram_id", savedChronogram.id)
      .order("created_at", { ascending: false });

    if (logsError) {
      console.warn("treatment_logs/get failed", logsError.message);
      return jsonError("Não foi possível carregar seu histórico agora.", 500);
    }

    return NextResponse.json({
      chronogram,
      logs: logs ?? [],
    });
  } catch (error) {
    console.error("chronogram/get unexpected", error);
    return jsonError("Não foi possível carregar seu cronograma salvo agora.", 500);
  }
}

export async function POST(request: Request) {
  const session = await getPremiumSession();

  if (!session) {
    return jsonError("Entre novamente para gerar seu cronograma.", 401);
  }

  const body = (await request.json().catch(() => null)) as {
    diagnosis?: unknown;
    aiResult?: unknown;
  } | null;

  if (!isDiagnosis(body?.diagnosis)) {
    return jsonError("Responda o diagnóstico antes de gerar o cronograma.", 400);
  }

  const plan = body?.aiResult
    ? normalizeAiResultToChronogram(body.diagnosis, body.aiResult)
    : generateChronogram(body.diagnosis);

  try {
    const admin = createSupabaseAdmin();
    const { data: existingChronogram, error: lookupError, supportsStatus } = await findSavedChronogram(admin, session.email, "id");

    if (lookupError) {
      console.warn("chronogram/lookup failed", lookupError.message);
      return jsonError("Não foi possível verificar seu cronograma salvo agora.", 500);
    }

    const payload = {
      email: session.email,
      user_id: session.user_id,
      diagnosis_json: body.diagnosis,
      plan_json: plan,
      current_day: 1,
      updated_at: new Date().toISOString(),
    };
    const payloadWithStatus = supportsStatus ? { ...payload, status: "active" } : payload;

    const saveQuery = existingChronogram
      ? admin.from("chronograms").update(payloadWithStatus).eq("id", (existingChronogram as unknown as { id: string }).id)
      : admin.from("chronograms").insert(payloadWithStatus);

    const { data, error } = await saveQuery.select("*").single();

    if (error) {
      console.warn("chronogram/save failed", error.message);
      return jsonError("Não foi possível salvar seu cronograma agora.", 500);
    }

    return NextResponse.json({ chronogram: data, persisted: true });
  } catch (error) {
    console.error("chronogram/post unexpected", error);
    return jsonError("Não foi possível salvar seu cronograma agora.", 500);
  }
}
