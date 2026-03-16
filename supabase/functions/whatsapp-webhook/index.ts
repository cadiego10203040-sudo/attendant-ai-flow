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

  const url = new URL(req.url);
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // ── GET: Meta webhook verification challenge ──
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token && challenge) {
      // Find company by verify token
      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("whatsapp_verify_token", token)
        .maybeSingle();

      if (company) {
        return new Response(challenge, { status: 200, headers: corsHeaders });
      }
      return new Response("Invalid verify token", { status: 403, headers: corsHeaders });
    }
    return new Response("OK", { status: 200, headers: corsHeaders });
  }

  // ── POST: incoming WhatsApp message ──
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const entry = body?.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (!value?.messages || value.messages.length === 0) {
        return new Response(JSON.stringify({ status: "no messages" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const msg = value.messages[0];
      const phoneNumberId = value.metadata?.phone_number_id;
      const customerPhone = msg.from;
      const customerName = value.contacts?.[0]?.profile?.name || "";
      const messageText = msg.text?.body || "";

      if (!phoneNumberId || !messageText) {
        return new Response(JSON.stringify({ status: "ignored" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find the company
      const { data: company } = await supabase
        .from("companies")
        .select("*")
        .eq("whatsapp_phone_id", phoneNumberId)
        .maybeSingle();

      if (!company) {
        console.error("Company not found for phone_number_id:", phoneNumberId);
        return new Response(JSON.stringify({ status: "company not found" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find or create conversation
      let { data: conversation } = await supabase
        .from("conversations")
        .select("*")
        .eq("company_id", company.id)
        .eq("customer_phone", customerPhone)
        .neq("status", "closed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!conversation) {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert({
            company_id: company.id,
            customer_phone: customerPhone,
            customer_name: customerName,
            status: "open",
          })
          .select()
          .single();
        conversation = newConv;
      } else if (customerName && !conversation.customer_name) {
        await supabase
          .from("conversations")
          .update({ customer_name: customerName })
          .eq("id", conversation.id);
      }

      if (!conversation) {
        throw new Error("Failed to create/find conversation");
      }

      // Save incoming message
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        role: "user",
        content: messageText,
      });

      // Update conversation
      await supabase
        .from("conversations")
        .update({
          last_message: messageText,
          last_message_at: new Date().toISOString(),
          status: conversation.status === "closed" ? "open" : conversation.status,
        })
        .eq("id", conversation.id);

      // Check if human mode — don't auto-respond
      if (conversation.status === "waiting_human") {
        return new Response(JSON.stringify({ status: "human mode" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check business hours
      if (!isWithinBusinessHours(company.business_hours)) {
        const offlineMsg =
          (typeof company.business_hours === "object" &&
            company.business_hours?.offlineMessage) ||
          "Estamos fora do horário de atendimento. Retornaremos em breve!";

        await sendWhatsAppMessage(company, customerPhone, offlineMsg);
        await supabase.from("messages").insert({
          conversation_id: conversation.id,
          role: "assistant",
          content: offlineMsg,
        });
        await supabase
          .from("conversations")
          .update({ last_message: offlineMsg, last_message_at: new Date().toISOString() })
          .eq("id", conversation.id);

        return new Response(JSON.stringify({ status: "offline" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get conversation history (last 20 messages for context)
      const { data: history } = await supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true })
        .limit(20);

      // Get products for context
      const { data: products } = await supabase
        .from("products")
        .select("name, description, price, pix_link, card_link")
        .eq("company_id", company.id)
        .eq("active", true);

      // Build AI prompt
      const systemPrompt = buildSystemPrompt(company, products || []);
      const aiMessages = [
        { role: "system", content: systemPrompt },
        ...(history || []).map((m: any) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
      ];

      // Call OpenAI
      const openaiKey = company.openai_key;
      if (!openaiKey) {
        const fallback = "Desculpe, nosso atendimento automático está temporariamente indisponível. Um atendente entrará em contato em breve.";
        await sendWhatsAppMessage(company, customerPhone, fallback);
        await supabase.from("messages").insert({ conversation_id: conversation.id, role: "assistant", content: fallback });
        await supabase.from("conversations").update({ last_message: fallback, last_message_at: new Date().toISOString() }).eq("id", conversation.id);
        return new Response(JSON.stringify({ status: "no openai key" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: aiMessages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!aiResponse.ok) {
        console.error("OpenAI error:", await aiResponse.text());
        throw new Error("OpenAI API error");
      }

      const aiData = await aiResponse.json();
      let reply = aiData.choices?.[0]?.message?.content || "Desculpe, não entendi. Pode reformular?";

      // Detect checkout intent
      if (reply.includes("[CHECKOUT]")) {
        reply = reply.replace("[CHECKOUT]", "").trim();
        // Try to create order from context
        if (products && products.length > 0) {
          const matchedProduct = products.find((p: any) =>
            messageText.toLowerCase().includes(p.name.toLowerCase())
          ) || products[0];

          await supabase.from("orders").insert({
            company_id: company.id,
            conversation_id: conversation.id,
            customer_name: customerName,
            customer_phone: customerPhone,
            amount: matchedProduct.price || 0,
            product_id: undefined,
            payment_status: "pending",
          });
        }
      }

      // Send AI reply via WhatsApp
      await sendWhatsAppMessage(company, customerPhone, reply);

      // Save AI reply
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        role: "assistant",
        content: reply,
      });

      await supabase
        .from("conversations")
        .update({ last_message: reply, last_message_at: new Date().toISOString() })
        .eq("id", conversation.id);

      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Webhook error:", err);
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 200, // Return 200 to Meta to avoid retries
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  return new Response("Method not allowed", { status: 405, headers: corsHeaders });
});

// ── Helpers ──

async function sendWhatsAppMessage(company: any, to: string, text: string) {
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
        to,
        type: "text",
        text: { body: text },
      }),
    }
  );
  if (!res.ok) {
    console.error("WhatsApp send error:", await res.text());
  }
  return res;
}

function isWithinBusinessHours(businessHours: any): boolean {
  if (!businessHours) return true;

  let hours: any;
  if (typeof businessHours === "string") {
    try {
      hours = JSON.parse(businessHours);
    } catch {
      return true; // Can't parse, assume open
    }
  } else {
    hours = businessHours;
  }

  if (!hours.days || !Array.isArray(hours.days)) return true;

  const now = new Date();
  // Brazil timezone (UTC-3)
  const brTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const dayIndex = (brTime.getUTCDay() + 6) % 7; // Monday=0
  const dayConfig = hours.days[dayIndex];

  if (!dayConfig || !dayConfig.enabled) return false;

  const currentMinutes = brTime.getUTCHours() * 60 + brTime.getUTCMinutes();
  const [startH, startM] = (dayConfig.start || "08:00").split(":").map(Number);
  const [endH, endM] = (dayConfig.end || "18:00").split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

function buildSystemPrompt(company: any, products: any[]): string {
  const tone = company.language === "formal" ? "formal e profissional" : company.language === "technical" ? "técnica e precisa" : "informal e amigável";

  let prompt = `Você é o assistente virtual da empresa "${company.name}".
Seu tom de comunicação deve ser ${tone}.
Responda sempre em português brasileiro.
Seja conciso e objetivo. Máximo 3 parágrafos por resposta.

`;

  if (company.ai_instructions) {
    prompt += `INSTRUÇÕES ESPECÍFICAS:\n${company.ai_instructions}\n\n`;
  }

  if (company.objections) {
    prompt += `OBJEÇÕES E RESPOSTAS:\n${company.objections}\n\n`;
  }

  if (company.escalation_rules) {
    prompt += `REGRAS DE ESCALAMENTO: Quando as seguintes situações ocorrerem, responda educadamente que vai transferir para um atendente humano:\n${company.escalation_rules}\n\n`;
  }

  if (products.length > 0) {
    prompt += `PRODUTOS/SERVIÇOS DISPONÍVEIS:\n`;
    products.forEach((p: any) => {
      prompt += `- ${p.name}: ${p.description || "Sem descrição"}. Preço: R$ ${p.price || "Consultar"}`;
      if (p.pix_link) prompt += `. Link PIX: ${p.pix_link}`;
      if (p.card_link) prompt += `. Link Cartão: ${p.card_link}`;
      prompt += `\n`;
    });
    prompt += `\nQuando o cliente demonstrar clara intenção de compra, inclua a tag [CHECKOUT] no início da sua resposta e envie o link de pagamento apropriado.\n`;
  }

  if (company.address) {
    prompt += `\nENDEREÇO: ${company.address}\n`;
  }

  return prompt;
}
