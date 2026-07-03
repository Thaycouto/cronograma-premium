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

export async function GET() {
  const session = await getPremiumSession();

  if (!session) {
    return jsonError("Entre novamente para acessar seu cronograma.", 401);
  }

  try {
    const admin = createSupabaseAdmin();
    const { data: chronogram, error: chronogramError } = await admin
      .from("chronograms")
      .select("*")
      .eq("email", session.email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (chronogramError) {
      console.warn("chronogram/get failed", chronogramError.message);
      return NextResponse.json({ chronogram: null, logs: [], storageReady: false });
    }

    if (!chronogram) {
      return NextResponse.json({ chronogram: null, logs: [], storageReady: true });
    }

    const { data: logs, error: logsError } = await admin
      .from("treatment_logs")
      .select("*")
      .eq("chronogram_id", chronogram.id)
      .order("created_at", { ascending: false });

    if (logsError) {
      console.warn("treatment_logs/get failed", logsError.message);
    }

    return NextResponse.json({
      chronogram,
      logs: logs ?? [],
      storageReady: true,
    });
  } catch (error) {
    console.error("chronogram/get unexpected", error);
    return NextResponse.json({ chronogram: null, logs: [], storageReady: false });
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
    const { data, error } = await admin
      .from("chronograms")
      .insert({
        email: session.email,
        user_id: session.user_id,
        diagnosis_json: body.diagnosis,
        plan_json: plan,
        current_day: 1,
      })
      .select("*")
      .single();

    if (error) {
      console.warn("chronogram/insert failed", error.message);
      return NextResponse.json({
        chronogram: {
          id: `local-${Date.now()}`,
          email: session.email,
          user_id: session.user_id,
          diagnosis_json: body.diagnosis,
          plan_json: plan,
          current_day: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        persisted: false,
        warning: "O cronograma foi criado, mas o banco ainda precisa receber as novas tabelas do schema.",
      });
    }

    return NextResponse.json({ chronogram: data, persisted: true });
  } catch (error) {
    console.error("chronogram/post unexpected", error);
    return NextResponse.json({
      chronogram: {
        id: `local-${Date.now()}`,
        email: session.email,
        user_id: session.user_id,
        diagnosis_json: body.diagnosis,
        plan_json: plan,
        current_day: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      persisted: false,
      warning: "O cronograma foi criado, mas não foi possível salvar no banco agora.",
    });
  }
}
