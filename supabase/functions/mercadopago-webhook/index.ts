import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();

    console.log("[mercadopago-webhook] Received notification:", { type: body.type, dataId: body.data?.id });

    // Mercado Pago sends payment notifications
    if (body.type === "payment" && body.data?.id) {
      const paymentId = body.data.id;

      console.log("[mercadopago-webhook] Processing payment:", paymentId);

      // We need to find which company this payment belongs to
      // MP webhook doesn't tell us, so we check all companies with mp_key
      const { data: companies, error: companiesError } = await supabase
        .from("companies")
        .select("id, mp_key, whatsapp_phone_id, whatsapp_token")
        .neq("mp_key", "")
        .not("mp_key", "is", null);

      if (companiesError) {
        console.error("[mercadopago-webhook] Error fetching companies:", companiesError);
        return new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!companies || companies.length === 0) {
        console.warn("[mercadopago-webhook] No companies with Mercado Pago configured");
        return new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let processed = false;

      for (const company of companies) {
        try {
          // Fetch payment details from Mercado Pago
          console.log("[mercadopago-webhook] Checking payment with company:", company.id);

          const mpRes = await fetch(
            `https://api.mercadopago.com/v1/payments/${paymentId}`,
            {
              headers: { Authorization: `Bearer ${company.mp_key}` },
            }
          );

          if (!mpRes.ok) {
            console.warn("[mercadopago-webhook] Payment not found for company:", company.id, mpRes.status);
            continue;
          }

          const payment = await mpRes.json();

          console.log("[mercadopago-webhook] Payment details:", { status: payment.status, amount: payment.transaction_amount });

          if (payment.status === "approved") {
            // Find the order by amount and company, update to paid
            const { data: orders, error: ordersError } = await supabase
              .from("orders")
              .select("*, conversations(customer_phone)")
              .eq("company_id", company.id)
              .eq("payment_status", "pending")
              .eq("amount", payment.transaction_amount)
              .limit(1);

            if (ordersError) {
              console.error("[mercadopago-webhook] Error fetching orders:", ordersError);
              continue;
            }

            if (orders && orders.length > 0) {
              const order = orders[0];

              console.log("[mercadopago-webhook] Updating order:", order.id);

              const { error: updateError } = await supabase
                .from("orders")
                .update({
                  payment_status: "paid",
                  paid_at: new Date().toISOString(),
                  payment_method: payment.payment_type_id || "unknown",
                })
                .eq("id", order.id);

              if (updateError) {
                console.error("[mercadopago-webhook] Error updating order:", updateError);
                continue;
              }

              // Notify customer via WhatsApp
              const customerPhone = order.customer_phone || (order as any).conversations?.customer_phone;

              if (customerPhone && company.whatsapp_phone_id && company.whatsapp_token) {
                console.log("[mercadopago-webhook] Sending WhatsApp notification to:", customerPhone);

                try {
                  const waRes = await fetch(
                    `https://graph.facebook.com/v18.0/${company.whatsapp_phone_id}/messages`,
                    {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${company.whatsapp_token}`,
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        messaging_product: "whatsapp",
                        to: customerPhone,
                        type: "text",
                        text: {
                          body: `✅ Pagamento confirmado! Seu pedido no valor de R$ ${payment.transaction_amount.toFixed(2)} foi aprovado. Obrigado pela compra!`,
                        },
                      }),
                    }
                  );

                  if (!waRes.ok) {
                    console.error("[mercadopago-webhook] Error sending WhatsApp message:", await waRes.text());
                  } else {
                    console.log("[mercadopago-webhook] WhatsApp notification sent successfully");
                  }
                } catch (waErr) {
                  console.error("[mercadopago-webhook] Error sending WhatsApp:", waErr);
                }
              } else {
                console.warn("[mercadopago-webhook] Cannot send WhatsApp notification - missing phone or WhatsApp config");
              }

              processed = true;
              break; // Found the right company
            } else {
              console.log("[mercadopago-webhook] No pending orders found for this amount");
            }
          } else {
            console.log("[mercadopago-webhook] Payment not approved, status:", payment.status);
          }
        } catch (e) {
          console.error("[mercadopago-webhook] Error checking company:", company.id, e);
        }
      }

      if (processed) {
        console.log("[mercadopago-webhook] Payment processed successfully");
      } else {
        console.warn("[mercadopago-webhook] Payment could not be matched to any order");
      }
    } else {
      console.log("[mercadopago-webhook] Ignoring notification type:", body.type);
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[mercadopago-webhook] Unexpected error:", err);
    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200, // Always return 200 to MP
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
