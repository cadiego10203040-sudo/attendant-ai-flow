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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { broadcast_id } = await req.json();

    // Get broadcast
    const { data: broadcast } = await supabase
      .from("broadcasts")
      .select("*")
      .eq("id", broadcast_id)
      .single();

    if (!broadcast) {
      return new Response(JSON.stringify({ error: "Broadcast not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify company ownership
    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("id", broadcast.company_id)
      .eq("user_id", user.id)
      .single();

    if (!company) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!company.whatsapp_phone_id || !company.whatsapp_token) {
      return new Response(JSON.stringify({ error: "WhatsApp not configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get audience based on filter
    const audienceFilter = broadcast.audience_filter as any;
    const filterType = audienceFilter?.type || "all";

    // Get unique phones from conversations
    const { data: conversations } = await supabase
      .from("conversations")
      .select("customer_phone")
      .eq("company_id", company.id);

    let phones = [...new Set((conversations || []).map((c: any) => c.customer_phone))];

    // Filter by audience type
    if (filterType === "buyers") {
      const { data: orders } = await supabase
        .from("orders")
        .select("customer_phone")
        .eq("company_id", company.id)
        .eq("payment_status", "paid");
      const buyerPhones = new Set((orders || []).map((o: any) => o.customer_phone));
      phones = phones.filter((p) => buyerPhones.has(p));
    } else if (filterType === "leads") {
      const { data: orders } = await supabase
        .from("orders")
        .select("customer_phone")
        .eq("company_id", company.id)
        .eq("payment_status", "paid");
      const buyerPhones = new Set((orders || []).map((o: any) => o.customer_phone));
      phones = phones.filter((p) => !buyerPhones.has(p));
    }

    // Send messages
    let sent = 0;
    for (const phone of phones) {
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
        if (res.ok) sent++;
        // Small delay to avoid rate limits
        await new Promise((r) => setTimeout(r, 100));
      } catch (e) {
        console.error(`Failed to send to ${phone}:`, e);
      }
    }

    // Update broadcast status
    await supabase
      .from("broadcasts")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        total_sent: sent,
      })
      .eq("id", broadcast_id);

    return new Response(
      JSON.stringify({ status: "sent", total_sent: sent, total_audience: phones.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-broadcast error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
