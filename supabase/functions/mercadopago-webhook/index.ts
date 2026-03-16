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

    // Mercado Pago sends payment notifications
    if (body.type === "payment" && body.data?.id) {
      const paymentId = body.data.id;

      // We need to find which company this payment belongs to
      // MP webhook doesn't tell us, so we check all companies with mp_key
      const { data: companies } = await supabase
        .from("companies")
        .select("id, mp_key, whatsapp_phone_id, whatsapp_token")
        .neq("mp_key", "")
        .not("mp_key", "is", null);

      for (const company of companies || []) {
        try {
          // Fetch payment details from Mercado Pago
          const mpRes = await fetch(
            `https://api.mercadopago.com/v1/payments/${paymentId}`,
            {
              headers: { Authorization: `Bearer ${company.mp_key}` },
            }
          );

          if (!mpRes.ok) continue;

          const payment = await mpRes.json();

          if (payment.status === "approved") {
            // Find the order by amount and company, update to paid
            const { data: orders } = await supabase
              .from("orders")
              .select("*, conversations(customer_phone)")
              .eq("company_id", company.id)
              .eq("payment_status", "pending")
              .eq("amount", payment.transaction_amount)
              .limit(1);

            if (orders && orders.length > 0) {
              const order = orders[0];
              await supabase
                .from("orders")
                .update({
                  payment_status: "paid",
                  paid_at: new Date().toISOString(),
                  payment_method: payment.payment_type_id || "unknown",
                })
                .eq("id", order.id);

              // Notify customer via WhatsApp
              const customerPhone = order.customer_phone || (order as any).conversations?.customer_phone;
              if (customerPhone && company.whatsapp_phone_id && company.whatsapp_token) {
                await fetch(
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
              }
              break; // Found the right company
            }
          }
        } catch (e) {
          console.error(`Error checking company ${company.id}:`, e);
        }
      }
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("mercadopago-webhook error:", err);
    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200, // Always return 200 to MP
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
