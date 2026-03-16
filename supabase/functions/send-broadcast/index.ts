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

    // Verify auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.warn("[send-broadcast] No authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.warn("[send-broadcast] Invalid auth token");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { broadcast_id } = await req.json();

    console.log("[send-broadcast] Request from user:", user.id, { broadcast_id });

    if (!broadcast_id) {
      return new Response(JSON.stringify({ error: "Missing broadcast_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get broadcast
    const { data: broadcast, error: broadcastError } = await supabase
      .from("broadcasts")
      .select("*")
      .eq("id", broadcast_id)
      .single();

    if (broadcastError || !broadcast) {
      console.error("[send-broadcast] Broadcast not found:", broadcastError);
      return new Response(JSON.stringify({ error: "Broadcast not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[send-broadcast] Broadcast found:", broadcast.id, { title: broadcast.title, status: broadcast.status });

    // Verify company ownership
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", broadcast.company_id)
      .eq("user_id", user.id)
      .single();

    if (companyError || !company) {
      console.error("[send-broadcast] Company not found or unauthorized:", companyError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!company.whatsapp_phone_id || !company.whatsapp_token) {
      console.warn("[send-broadcast] WhatsApp not configured for company:", broadcast.company_id);
      return new Response(JSON.stringify({ error: "WhatsApp not configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get audience based on filter
    const audienceFilter = broadcast.audience_filter as any;
    const filterType = audienceFilter?.type || "all";

    console.log("[send-broadcast] Fetching audience with filter:", filterType);

    // Get unique phones from conversations
    const { data: conversations, error: convError } = await supabase
      .from("conversations")
      .select("customer_phone")
      .eq("company_id", company.id);

    if (convError) {
      console.error("[send-broadcast] Error fetching conversations:", convError);
      return new Response(JSON.stringify({ error: "Failed to fetch conversations" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let phones = [...new Set((conversations || []).map((c: any) => c.customer_phone))];

    console.log("[send-broadcast] Total unique phones found:", phones.length);

    // Filter by audience type
    if (filterType === "buyers") {
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("customer_phone")
        .eq("company_id", company.id)
        .eq("payment_status", "paid");

      if (ordersError) {
        console.error("[send-broadcast] Error fetching orders:", ordersError);
      }

      const buyerPhones = new Set((orders || []).map((o: any) => o.customer_phone));
      phones = phones.filter((p) => buyerPhones.has(p));
      console.log("[send-broadcast] Filtered to buyers only:", phones.length);
    } else if (filterType === "leads") {
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("customer_phone")
        .eq("company_id", company.id)
        .eq("payment_status", "paid");

      if (ordersError) {
        console.error("[send-broadcast] Error fetching orders:", ordersError);
      }

      const buyerPhones = new Set((orders || []).map((o: any) => o.customer_phone));
      phones = phones.filter((p) => !buyerPhones.has(p));
      console.log("[send-broadcast] Filtered to leads only:", phones.length);
    }

    if (phones.length === 0) {
      console.warn("[send-broadcast] No phones to send to");
      return new Response(JSON.stringify({ status: "sent", total_sent: 0, total_audience: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send messages with rate limiting
    let sent = 0;
    let failed = 0;
    const DELAY_MS = 100; // 100ms between messages to avoid rate limits

    console.log("[send-broadcast] Starting message delivery to", phones.length, "recipients");

    for (let i = 0; i < phones.length; i++) {
      const phone = phones[i];

      try {
        const res = await fetch(
          `https://graph.facebook.com/v18.0/${company.whatsapp_phone_id}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${company.whatsapp_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: phone,
              type: "text",
              text: { body: broadcast.message },
            }),
          }
        );

        if (res.ok) {
          sent++;
          if (sent % 10 === 0) {
            console.log("[send-broadcast] Progress:", sent, "/", phones.length);
          }
        } else {
          failed++;
          const errText = await res.text();
          console.warn("[send-broadcast] Failed to send to", phone, ":", res.status, errText);
        }
      } catch (e) {
        failed++;
        console.error("[send-broadcast] Error sending to", phone, ":", e);
      }

      // Rate limiting delay (except on last message)
      if (i < phones.length - 1) {
        await new Promise((r) => setTimeout(r, DELAY_MS));
      }
    }

    console.log("[send-broadcast] Delivery complete. Sent:", sent, "Failed:", failed);

    // Update broadcast status
    const { error: updateError } = await supabase
      .from("broadcasts")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        total_sent: sent,
      })
      .eq("id", broadcast_id);

    if (updateError) {
      console.error("[send-broadcast] Error updating broadcast status:", updateError);
    }

    return new Response(
      JSON.stringify({
        status: "sent",
        total_sent: sent,
        total_failed: failed,
        total_audience: phones.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[send-broadcast] Unexpected error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
