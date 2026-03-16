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

    const { company_id, phone, message, conversation_id } = await req.json();

    // Verify company belongs to user
    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("id", company_id)
      .eq("user_id", user.id)
      .single();

    if (!company) {
      return new Response(JSON.stringify({ error: "Company not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!company.whatsapp_phone_id || !company.whatsapp_token) {
      return new Response(JSON.stringify({ error: "WhatsApp not configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send via Meta API
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
          to: phone,
          type: "text",
          text: { body: message },
        }),
      }
    );

    if (!waRes.ok) {
      const errText = await waRes.text();
      console.error("WhatsApp API error:", errText);
      return new Response(JSON.stringify({ error: "Failed to send WhatsApp message", details: errText }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If conversation_id provided, save message
    if (conversation_id) {
      await supabase.from("messages").insert({
        conversation_id,
        role: "assistant",
        content: message,
      });
      await supabase
        .from("conversations")
        .update({ last_message: message, last_message_at: new Date().toISOString() })
        .eq("id", conversation_id);
    }

    return new Response(JSON.stringify({ status: "sent" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-message error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
