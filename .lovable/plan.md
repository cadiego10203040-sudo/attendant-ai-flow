

## Analise Completa: O que falta para o AtendIA estar rodando e funcionando

### Status Atual

O frontend está completo e bem estruturado. Todas as 15+ telas do dashboard existem, o banco de dados tem todas as tabelas necessárias com RLS configurado, e o fluxo de autenticação (signup/login) funciona. Porém, a aplicação ainda é apenas um **painel de gestão** sem o motor backend que realmente processa mensagens.

### O que JA funciona
- Landing page, Login, Signup, Onboarding
- Todas as telas do dashboard (Conversas, Métricas, Pedidos, Automação, etc.)
- CRUD completo em: labels, quick_replies, flows, broadcasts, products
- Configurações de empresa, horários, WhatsApp, API keys
- Realtime nas conversas e sidebar
- SaveButton padronizado com feedback visual
- Auto-criação de empresa via `ensureCompany()`
- RLS em todas as tabelas

### O que FALTA (itens críticos para funcionar de verdade)

**1. Edge Function `whatsapp-webhook` (CRITICO)**
Não existe nenhuma edge function no projeto. Este é o coração do sistema. Precisa:
- Receber mensagens da Meta Cloud API (POST)
- Responder ao challenge de verificação (GET)
- Identificar a empresa pelo `customer_whatsapp` ou `whatsapp_phone_id`
- Criar/buscar conversa no banco
- Salvar mensagem recebida
- Chamar a OpenAI com contexto (ai_instructions, products, objections, escalation_rules)
- Enviar resposta via Meta Cloud API
- Salvar mensagem da IA no banco
- Respeitar `business_hours` (mensagem offline fora do horário)
- Respeitar status da conversa (não responder se `waiting_human`)
- Detectar intenção de compra e gerar link de pagamento (Mercado Pago)

**2. Edge Function `mercadopago-webhook`**
Para processar notificações de pagamento do Mercado Pago e atualizar status dos pedidos.

**3. Lógica de envio de mensagens manuais**
A tela de Conversas permite "Assumir" e enviar mensagens como humano, mas o `handleSendMessage` apenas salva no banco -- não envia via WhatsApp. Precisa chamar a Meta Cloud API para realmente enviar.

**4. Lógica de Broadcast**
A tela de Transmissão cria registros no banco mas não envia mensagens. Precisa de uma edge function ou trigger para disparar mensagens em massa via WhatsApp.

**5. Audiência - envio de mensagem individual**
O botão "Mensagem" na tela de Audiência apenas fecha o dialog, não envia nada.

**6. Confirmação de email**
O signup pede confirmação de email mas o auto-confirm pode não estar configurado. Verificar configuração de auth.

**7. Webhook URL hardcoded errada no Onboarding**
Linha 48 do Onboarding.tsx tem URL hardcoded `yrdsfqlhdsuhxjyugepd.supabase.co` que não é o projeto atual (`axrjtmmchgzcuswmhmzm`).

### Plano de implementação (prioridade)

**Fase 1 - Webhook WhatsApp (essencial)**
1. Criar `supabase/functions/whatsapp-webhook/index.ts`
   - GET: responder challenge da Meta
   - POST: receber mensagem → buscar empresa → buscar/criar conversa → salvar mensagem → chamar OpenAI → enviar resposta via Meta API → salvar resposta
   - Verificar horário de atendimento
   - Verificar se conversa está em modo humano
   - Usar secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

2. Corrigir webhook URL no Onboarding para usar o project ID correto

**Fase 2 - Envio real de mensagens**
3. Criar helper/edge function para enviar mensagens via Meta API
4. Atualizar `handleSendMessage` em DashboardConversations para chamar essa função

**Fase 3 - Pagamentos**
5. Criar `supabase/functions/mercadopago-webhook/index.ts`
6. Integrar detecção de compra na IA

**Fase 4 - Broadcast**
7. Criar edge function para disparo em massa

### Quer que eu implemente?

Recomendo começar pela **Fase 1** (webhook WhatsApp) pois é o que faz o sistema realmente funcionar. Posso implementar o webhook completo com integração OpenAI + Meta API, respeitando horários, modo humano e configurações da empresa.

