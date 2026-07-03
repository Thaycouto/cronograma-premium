import { NextResponse } from "next/server";
import {
  chronogramDisclaimer,
  generateChronogram,
  normalizeAiResultToChronogram,
  type DiagnosisAnswers,
} from "@/lib/chronogram";
import { getPremiumSession } from "@/lib/premium-session";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_SIZE_BYTES = 6 * 1024 * 1024;
const MONTHLY_ANALYSIS_LIMIT = 3;
const STORAGE_BUCKET = "hair-analysis-images";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const allowedImageTypes = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);

const extensionByType: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function parseDiagnosis(value: FormDataEntryValue | null): DiagnosisAnswers | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<DiagnosisAnswers>;

    if (
      !parsed ||
      typeof parsed.hairType !== "string" ||
      !Array.isArray(parsed.currentState) ||
      !Array.isArray(parsed.goals) ||
      typeof parsed.chemistry !== "string" ||
      typeof parsed.heatUse !== "string" ||
      typeof parsed.frequency !== "string" ||
      typeof parsed.damageLevel !== "string"
    ) {
      return null;
    }

    return parsed as DiagnosisAnswers;
  } catch {
    return null;
  }
}

function getMonthStartIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

async function uploadImageCopy(
  admin: ReturnType<typeof createSupabaseAdmin>,
  userId: string,
  imageBuffer: Buffer,
  contentType: string,
) {
  try {
    const extension = extensionByType[contentType] ?? "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await admin.storage.from(STORAGE_BUCKET).upload(path, imageBuffer, {
      contentType,
      upsert: false,
    });

    if (error) {
      console.warn("hair-analysis image upload failed", error.message);
      return null;
    }

    return `${STORAGE_BUCKET}/${path}`;
  } catch (error) {
    console.warn("hair-analysis image upload skipped", error);
    return null;
  }
}

async function maybeCallOpenAi(diagnosis: DiagnosisAnswers, imageDataUrl: string) {
  const openAiApiKey = process.env.OPENAI_API_KEY;

  if (!openAiApiKey) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        {
          role: "system",
          content:
            "Você é uma consultora capilar digital. Gere uma análise orientativa, sem promessa de resultado, sem diagnóstico médico, sem marcas obrigatórias e sem procedimento químico agressivo.",
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                task:
                  "Analise o diagnóstico e a foto do cabelo. Retorne somente JSON com visual_summary, main_needs, alerts, suggested_focus, next_steps e plan de 30 dias.",
                diagnosis,
                disclaimer: chronogramDisclaimer,
              }),
            },
            {
              type: "input_image",
              image_url: imageDataUrl,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "couto_hair_program_analysis",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["visual_summary", "main_needs", "alerts", "suggested_focus", "next_steps", "plan", "disclaimer"],
            properties: {
              visual_summary: { type: "string" },
              main_needs: { type: "array", items: { type: "string" } },
              alerts: { type: "array", items: { type: "string" } },
              suggested_focus: { type: "string" },
              next_steps: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["type", "reason"],
                  properties: {
                    type: { type: "string", enum: ["Hidratação", "Nutrição", "Reconstrução", "Pausa"] },
                    reason: { type: "string" },
                  },
                },
              },
              plan: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["day", "week", "type", "title", "objective", "instructions", "observe", "avoid"],
                  properties: {
                    day: { type: "integer" },
                    week: { type: "integer" },
                    type: { type: "string", enum: ["Hidratação", "Nutrição", "Reconstrução", "Pausa"] },
                    title: { type: "string" },
                    objective: { type: "string" },
                    instructions: { type: "string" },
                    observe: { type: "string" },
                    avoid: { type: "string" },
                  },
                },
              },
              disclaimer: { type: "string" },
            },
          },
        },
      },
      max_output_tokens: 7000,
    }),
  });

  const body = (await response.json().catch(() => null)) as {
    output_text?: string;
    output?: Array<{ content?: Array<{ text?: string }> }>;
    error?: unknown;
  } | null;

  if (!response.ok) {
    console.warn("OpenAI hair-analysis failed", body?.error ?? response.statusText);
    return null;
  }

  const outputText =
    body?.output_text ??
    body?.output?.flatMap((item) => item.content ?? []).find((content) => typeof content.text === "string")?.text;

  if (!outputText) {
    return null;
  }

  try {
    return JSON.parse(outputText) as unknown;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const session = await getPremiumSession();

  if (!session) {
    return jsonError("Entre novamente para gerar a análise.", 401);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Envie a foto e o diagnóstico em um formulário válido.", 400);
  }

  const photo = formData.get("photo");
  const diagnosis = parseDiagnosis(formData.get("diagnosis"));

  if (!(photo instanceof File)) {
    return jsonError("Envie uma foto do cabelo para continuar.", 400);
  }

  if (!diagnosis) {
    return jsonError("Responda o diagnóstico antes de gerar o cronograma.", 400);
  }

  if (!allowedImageTypes.has(photo.type)) {
    return jsonError("Use uma imagem em PNG, JPG, JPEG ou WEBP.", 400);
  }

  if (photo.size > MAX_IMAGE_SIZE_BYTES) {
    return jsonError("Envie uma imagem de até 6 MB.", 400);
  }

  const imageBuffer = Buffer.from(await photo.arrayBuffer());
  const imageDataUrl = `data:${photo.type};base64,${imageBuffer.toString("base64")}`;
  const fallbackPlan = generateChronogram(diagnosis);
  let aiResult = await maybeCallOpenAi(diagnosis, imageDataUrl);
  const usedFallback = !aiResult;

  if (!aiResult) {
    aiResult = {
      visual_summary: "Análise por foto em preparação. O cronograma foi criado com base no diagnóstico respondido.",
      main_needs: fallbackPlan.mainNeeds,
      alerts: fallbackPlan.alerts,
      suggested_focus: fallbackPlan.suggestedFocus,
      next_steps: fallbackPlan.nextSteps,
      plan: fallbackPlan.plan,
      disclaimer: chronogramDisclaimer,
    };
  }

  const normalized = normalizeAiResultToChronogram(diagnosis, aiResult);
  let analysisId: string | null = null;
  let imageUrl: string | null = null;

  try {
    const admin = createSupabaseAdmin();
    const monthStart = getMonthStartIso();
    const { count } = await admin
      .from("ai_hair_analyses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.user_id)
      .gte("created_at", monthStart);

    if ((count ?? 0) >= MONTHLY_ANALYSIS_LIMIT) {
      return jsonError("Você já usou as 3 análises disponíveis neste mês.", 429);
    }

    imageUrl = await uploadImageCopy(admin, session.user_id, imageBuffer, photo.type);
    const { data, error } = await admin
      .from("ai_hair_analyses")
      .insert({
        user_id: session.user_id,
        email: session.email,
        image_url: imageUrl,
        diagnosis_json: diagnosis,
        ai_result_json: aiResult,
      })
      .select("id")
      .single();

    if (error) {
      console.warn("hair-analysis insert failed", error.message);
    } else {
      analysisId = data.id;
    }
  } catch (error) {
    console.warn("hair-analysis persistence skipped", error);
  }

  return NextResponse.json({
    analysisId,
    imageUrl,
    result: normalized,
    usedFallback,
    message: usedFallback
      ? "Análise por foto em preparação. Seu cronograma foi criado com base no diagnóstico."
      : "Análise por foto concluída.",
  });
}
