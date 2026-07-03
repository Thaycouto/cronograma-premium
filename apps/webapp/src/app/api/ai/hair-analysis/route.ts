import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { userHasPremiumAccess } from "@/lib/access/premium";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_SIZE_BYTES = 6 * 1024 * 1024;
const MONTHLY_ANALYSIS_LIMIT = 3;
const STORAGE_BUCKET = "hair-analysis-images";
const OPENAI_MODEL = "gpt-5.5";

const allowedImageTypes = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);

const extensionByType: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
};

const disclaimer =
  "A análise é orientativa e não substitui avaliação profissional. Não diagnosticar doenças do couro cabeludo, queda severa, alergias ou condições médicas.";

const hairAnalysisSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "visual_summary",
    "hair_needs",
    "risk_notes",
    "main_priorities",
    "recommended_frequency",
    "next_steps",
    "thirty_day_plan",
    "disclaimer",
  ],
  properties: {
    visual_summary: { type: "string" },
    hair_needs: {
      type: "array",
      items: { type: "string" },
    },
    risk_notes: {
      type: "array",
      items: { type: "string" },
    },
    main_priorities: {
      type: "array",
      items: { type: "string" },
    },
    recommended_frequency: { type: "string" },
    next_steps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "reason", "when"],
        properties: {
          type: { type: "string", enum: ["Hidratação", "Nutrição", "Reconstrução", "Pausa"] },
          reason: { type: "string" },
          when: { type: "string" },
        },
      },
    },
    thirty_day_plan: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "date_label", "type", "objective", "how_to_do", "what_to_avoid"],
        properties: {
          day: { type: "integer" },
          date_label: { type: "string" },
          type: { type: "string", enum: ["Hidratação", "Nutrição", "Reconstrução", "Pausa"] },
          objective: { type: "string" },
          how_to_do: { type: "string" },
          what_to_avoid: { type: "string" },
        },
      },
    },
    disclaimer: { type: "string", enum: [disclaimer] },
  },
} as const;

const systemPrompt = `
Você é uma consultora capilar digital do Couto Hair Program.
Analise a foto enviada junto com as respostas do diagnóstico e gere um cronograma capilar orientativo de 30 dias.

Regras obrigatórias:
- Não prometa resultado garantido.
- Não fale como médica.
- Não diagnostique doenças, queda severa, alergias ou condições médicas.
- Não recomende procedimento químico agressivo.
- Não indique produto específico obrigatório nem marcas.
- Fale em categorias de cuidado: hidratação, nutrição, reconstrução e pausa.
- Seja prática, clara, segura e personalizada.
- Use reconstrução com controle quando houver quebra, elasticidade, descoloração ou muita química.
- Priorize hidratação e nutrição quando houver ressecamento, opacidade ou frizz.
- Considere oleosidade de raiz para evitar excesso de peso.
- Ajuste a frequência conforme o tempo disponível informado.
- Retorne exatamente 2 próximas etapas em next_steps.
- Retorne exatamente 30 itens em thirty_day_plan, um para cada dia.
- Retorne somente JSON válido dentro do schema.
- Use exatamente este disclaimer: "${disclaimer}"
`.trim();

type DiagnosisPayload = Record<string, unknown>;

type OpenAIResponseBody = {
  output_text?: unknown;
  output?: unknown;
  error?: unknown;
};

type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function parseDiagnosis(value: FormDataEntryValue | null): DiagnosisPayload | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    return parsed as DiagnosisPayload;
  } catch {
    return null;
  }
}

function getMonthStartIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

function extractOutputText(body: OpenAIResponseBody) {
  if (typeof body.output_text === "string") {
    return body.output_text;
  }

  if (!Array.isArray(body.output)) {
    return null;
  }

  for (const item of body.output) {
    if (!item || typeof item !== "object" || !("content" in item)) {
      continue;
    }

    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) {
      continue;
    }

    for (const contentItem of content) {
      if (!contentItem || typeof contentItem !== "object") {
        continue;
      }

      const text = (contentItem as { text?: unknown }).text;
      if (typeof text === "string") {
        return text;
      }
    }
  }

  return null;
}

function isStructuredHairAnalysisResult(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const result = value as {
    next_steps?: unknown;
    thirty_day_plan?: unknown;
    disclaimer?: unknown;
  };

  return (
    Array.isArray(result.next_steps) &&
    result.next_steps.length === 2 &&
    Array.isArray(result.thirty_day_plan) &&
    result.thirty_day_plan.length === 30 &&
    result.disclaimer === disclaimer
  );
}

async function uploadImageCopy(
  admin: SupabaseAdminClient,
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
      console.warn("Hair analysis image upload failed:", error.message);
      return null;
    }

    return `${STORAGE_BUCKET}/${path}`;
  } catch (error) {
    console.warn("Hair analysis image upload skipped:", error);
    return null;
  }
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("Entre na sua conta para gerar a análise.", 401);
  }

  const hasPremiumAccess = await userHasPremiumAccess(user.id);

  if (!hasPremiumAccess) {
    return jsonError("Seu acesso premium precisa estar ativo para gerar a análise.", 403);
  }

  const openAiApiKey = process.env.OPENAI_API_KEY;

  if (!openAiApiKey) {
    return jsonError("A análise por IA ainda não está configurada no servidor.", 500);
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

  let admin: SupabaseAdminClient;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    return jsonError("A validação premium ainda não está configurada no servidor.", 500);
  }

  const monthStart = getMonthStartIso();
  const { count, error: countError } = await admin
    .from("ai_hair_analyses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", monthStart);

  if (countError) {
    return jsonError("Não foi possível validar o limite de análises agora.", 500);
  }

  if ((count ?? 0) >= MONTHLY_ANALYSIS_LIMIT) {
    return jsonError("Você já usou as 3 análises disponíveis neste mês.", 429);
  }

  const imageBuffer = Buffer.from(await photo.arrayBuffer());
  const imageDataUrl = `data:${photo.type};base64,${imageBuffer.toString("base64")}`;

  const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions: systemPrompt,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                context:
                  "Gerar análise capilar orientativa com base no diagnóstico e na foto enviada pela cliente.",
                diagnosis,
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
          name: "couto_hair_analysis",
          strict: true,
          schema: hairAnalysisSchema,
        },
      },
      max_output_tokens: 7000,
    }),
  });

  let responseBody: OpenAIResponseBody;
  try {
    responseBody = (await openAiResponse.json()) as OpenAIResponseBody;
  } catch {
    return jsonError("A análise voltou sem uma resposta válida.", 502);
  }

  if (!openAiResponse.ok) {
    console.error("OpenAI hair analysis failed:", responseBody.error ?? responseBody);
    return jsonError("Não foi possível gerar a análise agora. Tente novamente em instantes.", 502);
  }

  const outputText = extractOutputText(responseBody);

  if (!outputText) {
    return jsonError("A análise voltou sem um resultado estruturado.", 502);
  }

  let aiResult: unknown;
  try {
    aiResult = JSON.parse(outputText);
  } catch {
    return jsonError("A análise voltou em um formato inesperado.", 502);
  }

  if (!isStructuredHairAnalysisResult(aiResult)) {
    return jsonError("A análise voltou incompleta. Tente gerar novamente.", 502);
  }

  const imageUrl = await uploadImageCopy(admin, user.id, imageBuffer, photo.type);
  const { data: insertedAnalysis, error: insertError } = await admin
    .from("ai_hair_analyses")
    .insert({
      user_id: user.id,
      image_url: imageUrl,
      diagnosis_json: diagnosis,
      ai_result_json: aiResult,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("Hair analysis insert failed:", insertError.message);
    return jsonError("A análise foi gerada, mas não foi possível salvar no seu painel.", 500);
  }

  return NextResponse.json({
    analysisId: insertedAnalysis.id,
    result: aiResult,
    remainingThisMonth: Math.max(MONTHLY_ANALYSIS_LIMIT - (count ?? 0) - 1, 0),
  });
}
