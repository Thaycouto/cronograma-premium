import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { normalizeEmail } from "@/lib/format/email";

const APPROVED_STATUS = new Set(["approved", "paid", "completed", "active"]);
const CANCELED_STATUS = new Set(["canceled", "cancelled", "refunded", "chargeback", "expired"]);

export async function POST(request: Request) {
  const configuredSecret = process.env.KIWIFY_WEBHOOK_SECRET;
  const url = new URL(request.url);
  const receivedSecret = request.headers.get("x-kiwify-secret") || url.searchParams.get("secret");

  if (!configuredSecret || receivedSecret !== configuredSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const event = readKiwifyEvent(payload);

  if (!event.email) {
    return NextResponse.json({ error: "Missing customer email" }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();
  const email = normalizeEmail(event.email);
  const eventId = event.eventId || event.orderId || `${event.eventType || "kiwify"}:${email}:${Date.now()}`;

  const { error: eventError } = await supabase.from("kiwify_events").upsert(
    {
      event_id: eventId,
      event_type: event.eventType,
      email,
      order_id: event.orderId,
      payload,
    },
    { onConflict: "event_id" },
  );

  if (eventError) {
    return NextResponse.json({ error: "Could not record event" }, { status: 500 });
  }

  if (event.status && CANCELED_STATUS.has(event.status)) {
    const { error } = await supabase
      .from("access_grants")
      .update({
        status: "inactive",
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);

    if (error) {
      return NextResponse.json({ error: "Could not revoke access" }, { status: 500 });
    }

    return NextResponse.json({ received: true, access: "revoked" });
  }

  if (!event.status || !APPROVED_STATUS.has(event.status)) {
    return NextResponse.json({ received: true, access: "ignored" });
  }

  const { error } = await supabase.from("access_grants").upsert(
    {
      email,
      source: "kiwify",
      status: "active",
      order_id: event.orderId,
      product_id: event.productId,
      customer_name: event.customerName,
      purchased_at: event.purchasedAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" },
  );

  if (error) {
    return NextResponse.json({ error: "Could not grant access" }, { status: 500 });
  }

  return NextResponse.json({ received: true, access: "granted" });
}

function readKiwifyEvent(payload: Record<string, unknown>) {
  const customer = readObject(payload.customer) || readObject(payload.Customer) || readObject(payload.buyer);
  const order = readObject(payload.order) || readObject(payload.Order) || readObject(payload.sale);
  const product = readObject(payload.product) || readObject(payload.Product);
  const status = String(payload.status || payload.order_status || order?.status || payload.payment_status || "").toLowerCase();

  return {
    eventId: readString(payload.event_id) || readString(payload.id) || readString(payload.webhook_event_id),
    eventType: readString(payload.event) || readString(payload.event_type) || readString(payload.type),
    email: readString(customer?.email) || readString(payload.email) || readString(order?.email),
    orderId: readString(order?.id) || readString(order?.order_id) || readString(payload.order_id) || readString(payload.sale_id),
    productId: readString(product?.id) || readString(payload.product_id),
    customerName: readString(customer?.name) || readString(payload.customer_name) || readString(payload.name),
    purchasedAt: readString(payload.approved_at) || readString(payload.paid_at) || readString(payload.created_at),
    status,
  };
}

function readObject(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}
