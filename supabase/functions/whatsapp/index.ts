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

    console.log("[WhatsApp] GET verification request", { mode, token: token ? "***" : "missing", challenge: challenge ? "***" : "missing" });

    if (mode === "subscribe" && token && challenge) {
      const { data: company, error } = await supabase
        .from("companies")
        .select("id")
        .eq("whatsapp_verify_token", token)
        .maybeSingle();

      if (error) {
        console.error("[WhatsApp] Error finding company:", error);
        return new Response("Error", { status: 500, headers: corsHeaders });
      }

      if (company) {
        console.log("[WhatsApp] Verification successful for company:", company.id);
        return new Response(challenge, { status: 200, headers: corsHeaders });
      }

      console.warn("[WhatsApp] Invalid verify token");
      return new Response("Invalid verify token", { status: 403, headers: corsHeaders });
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  }

  // ── POST: incoming WhatsApp message ──
  if (req.method === "POST") {
    try {
      const body = await req.json();
      console.log("[WhatsApp] Received POST", { hasEntry: !!body?.entry, hasChanges: !!body?.entry?.[0]?.changes });

      const entry = body?.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (!value?.messages || value.messages.length === 0) {
        console.log("[WhatsApp] No messages in payload");
        return new Response(JSON.stringify({ status: "no messages" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const msg = value.messages[0];
      const phoneNumberId = value.metadata?.phone_number_id;
      const customerPhone = msg.from;
      const customerName = value.contacts?.[0]?.profile?.name || "";
      const messageText = msg.text?.body || "";

      console.log("[WhatsApp] Processing message", { phoneNumberId, customerPhone, messageText: messageText.substring(0, 50) });

      if (!phoneNumberId || !messageText) {
        console.log("[WhatsApp] Missing phoneNumberId or messageText");
        return new Response(JSON.stringify({ status: "ignored" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find the company
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("whatsapp_phone_id", phoneNumberId)
        .maybeSingle();

      if (companyError) {
        console.error("[WhatsApp] Error finding company:", companyError);
        return new Response(JSON.stringify({ status: "error", error: "Company lookup failed" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!company) {
        console.error("[WhatsApp] Company not found for phone_number_id:", phoneNumberId);
        return new Response(JSON.stringify({ status: "company not found" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("[WhatsApp] Company found:", company.id);

      // Find or create conversation
      let { data: conversation, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .eq("company_id", company.id)
        .eq("customer_phone", customerPhone)
        .neq("status", "closed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (convError) {
        console.error("[WhatsApp] Error finding conversation:", convError);
        throw convError;
      }

      if (!conversation) {
        const { data: newConv, error: insertError } = await supabase
          .from("conversations")
          .insert({
            company_id: company.id,
            customer_phone: customerPhone,
            customer_name: customerName,
            status: "open",
          })
          .select()
          .single();

        if (insertError) {
          console.error("[WhatsApp] Error creating conversation:", insertError);
          throw insertError;
        }

        conversation = newConv;
        console.log("[WhatsApp] New conversation created:", conversation.id);
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
      const { error: msgError } = await supabase.from("messages").insert({
        conversation_id: conversation.id,
        role: "user",
        content: messageText,
      });

      if (msgError) {
        console.error("[WhatsApp] Error saving message:", msgError);
      }

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
        console.log("[WhatsApp] Conversation in human mode, skipping AI response");
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

        console.log("[WhatsApp] Outside business hours, sending offline message");

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
      const { data: history, error: historyError } = await supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true })
        .limit(20);

      if (historyError) {
        console.error("[WhatsApp] Error fetching history:", historyError);
      }

      // Get products for context
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("name, description, price, pix_link, card_link")
        .eq("company_id", company.id)
        .eq("active", true);

      if (productsError) {
        console.error("[WhatsApp] Error fetching products:", productsError);
      }

      // Build AI prompt
      const systemPrompt = buildSystemPrompt(company, products || []);
      const aiMessages = [
        { role: "system", content: systemPrompt },
        ...(history || []).map((m: any) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
        { role: "user", content: messageText },
      ];

      // Call OpenAI
      const openaiKey = company.openai_key;
      if (!openaiKey) {
        const fallback = "Desculpe, nosso atendimento automático está temporariamente indisponível. Um atendente entrará em contato em breve.";
        console.warn("[WhatsApp] No OpenAI key configured");

        await sendWhatsAppMessage(company, customerPhone, fallback);
        await supabase.from("messages").insert({ conversation_id: conversation.id, role: "assistant", content: fallback });
        await supabase.from("conversations").update({ last_message: fallback, last_message_at: new Date().toISOString() }).eq("id", conversation.id);

        return new Response(JSON.stringify({ status: "no openai key" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("[WhatsApp] Calling OpenAI API");

      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: aiMessages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        console.error("[WhatsApp] OpenAI error:", errText);
        throw new Error(`OpenAI API error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      let reply = aiData.choices?.[0]?.message?.content || "Desculpe, não entendi. Pode reformular?";

      console.log("[WhatsApp] AI response generated:", reply.substring(0, 50));

      // Detect checkout intent
      if (reply.includes("[CHECKOUT]")) {
        reply = reply.replace("[CHECKOUT]", "").trim();
        console.log("[WhatsApp] Checkout intent detected");

        if (products && products.length > 0) {
          const matchedProduct = products.find((p: any) =>
            messageText.toLowerCase().includes(p.name.toLowerCase())
          ) || products[0];

          const { error: orderError } = await supabase.from("orders").insert({
            company_id: company.id,
            conversation_id: conversation.id,
            customer_name: customerName,
            customer_phone: customerPhone,
            amount: matchedProduct.price || 0,
            product_id: undefined,
            payment_status: "pending",
          });

          if (orderError) {
            console.error("[WhatsApp] Error creating order:", orderError);
          }
        }
      }

      // Send AI reply via WhatsApp
      const sendResult = await sendWhatsAppMessage(company, customerPhone, reply);

      if (!sendResult.ok) {
        console.error("[WhatsApp] Failed to send WhatsApp message");
      }

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

      console.log("[WhatsApp] Message processed successfully");

      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("[WhatsApp] Error:", err);
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 200,
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
    const errText = await res.text();
    console.error("[WhatsApp API] Send error:", errText);
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
      return true;
    }
  } else {
    hours = businessHours;
  }

  if (!hours.days || !Array.isArray(hours.days)) return true;

  const now = new Date();
  const brTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const dayIndex = (brTime.getUTCDay() + 6) % 7;
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

  // Prioridade: training_instructions > ai_instructions
  const instructions = company.training_instructions || company.ai_instructions;
  if (instructions) {
    prompt += `INSTRUÇÕES ESPECÍFICAS:\n${instructions}\n\n`;
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
