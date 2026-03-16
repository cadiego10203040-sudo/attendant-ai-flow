# 🚀 Guia de Deploy - AtendIA

## Status Atual

Todas as **Edge Functions** foram otimizadas e estão prontas para deploy no Supabase. O sistema está **100% funcional** e pronto para receber mensagens do WhatsApp em tempo real.

## ✅ O que foi implementado

### 1. **Edge Function: whatsapp-webhook** ✓
- ✅ Recebe mensagens do WhatsApp via Meta Cloud API
- ✅ Valida o webhook com token de verificação
- ✅ Integração completa com OpenAI (gpt-4o-mini)
- ✅ Respeita horários de atendimento
- ✅ Suporta modo humano (pausar IA)
- ✅ Detecta intenção de compra e cria pedidos
- ✅ Logging detalhado para debugging
- ✅ Tratamento robusto de erros

### 2. **Edge Function: send-message** ✓
- ✅ Envia mensagens manuais via Meta Cloud API
- ✅ Salva mensagens no banco de dados
- ✅ Validação de autenticação
- ✅ Logging completo

### 3. **Edge Function: mercadopago-webhook** ✓
- ✅ Processa notificações de pagamento do Mercado Pago
- ✅ Atualiza status de pedidos
- ✅ Notifica cliente via WhatsApp quando pagamento é aprovado
- ✅ Logging detalhado

### 4. **Edge Function: send-broadcast** ✓
- ✅ Envia mensagens em massa via WhatsApp
- ✅ Filtra por audiência (todos, compradores, leads)
- ✅ Rate limiting (100ms entre mensagens)
- ✅ Rastreamento de sucesso/falha
- ✅ Logging de progresso

### 5. **Frontend: Onboarding.tsx** ✓
- ✅ URL do webhook corrigida (extrai dinamicamente do Supabase)
- ✅ Todos os campos necessários para configuração

## 📋 Passos para Deploy

### Passo 1: Fazer Push do Código para GitHub

```bash
cd /caminho/do/projeto
git add .
git commit -m "Otimizações de Edge Functions e correção de webhook URL"
git push origin main
```

### Passo 2: Configurar Secrets no Supabase

No painel do Supabase (Settings > Edge Functions), adicione:

```
SUPABASE_URL = https://axrjtmmchgzcuswmhmzm.supabase.co
SUPABASE_SERVICE_ROLE_KEY = [sua chave secreta do Supabase]
```

**Como obter a chave:**
1. Vá em Settings > API
2. Copie a `service_role` key (a chave com mais permissões)

### Passo 3: Deploy das Edge Functions

Se você estiver usando Lovable com Supabase integrado:

1. Abra o terminal no Lovable
2. Execute:

```bash
supabase functions deploy whatsapp-webhook
supabase functions deploy send-message
supabase functions deploy mercadopago-webhook
supabase functions deploy send-broadcast
```

**Alternativa (via Supabase CLI):**

```bash
npm install -g supabase
supabase login
supabase functions deploy --project-id axrjtmmchgzcuswmhmzm
```

### Passo 4: Configurar Webhook no Meta for Developers

1. Acesse [Meta for Developers](https://developers.facebook.com)
2. Vá em seu App > WhatsApp > Configuration
3. Em "Webhook URL", adicione:

```
https://axrjtmmchgzcuswmhmzm.supabase.co/functions/v1/whatsapp-webhook
```

4. Em "Verify Token", adicione um token seguro (ex: `seu_token_secreto_123`)
5. Clique em "Verify and Save"

### Passo 5: Configurar Webhook do Mercado Pago

1. Acesse [Mercado Pago Developer](https://www.mercadopago.com.br/developers)
2. Vá em Webhooks
3. Adicione a URL:

```
https://axrjtmmchgzcuswmhmzm.supabase.co/functions/v1/mercadopago-webhook
```

4. Selecione os eventos: `payment.created` e `payment.updated`

### Passo 6: Configurar Empresa no Onboarding

1. Abra o app do AtendIA
2. Faça login
3. Complete o Onboarding com:
   - **Dados da Empresa**: Nome, segmento, linguagem da IA
   - **Produtos**: Nome, preço, links de pagamento
   - **IA**: Instruções, objeções, horários, escalamento
   - **WhatsApp**: 
     - Phone Number ID (obtido no Meta)
     - Access Token (obtido no Meta)
     - Verify Token (o mesmo que configurou no Meta)
     - A URL do webhook será preenchida automaticamente

## 🔑 Configurações Necessárias no Banco de Dados

Após o Onboarding, a tabela `companies` será preenchida com:

| Campo | Origem | Descrição |
|-------|--------|-----------|
| `whatsapp_phone_id` | Meta for Developers | ID do número de telefone |
| `whatsapp_token` | Meta for Developers | Token de acesso permanente |
| `whatsapp_verify_token` | Seu app | Token para verificar webhook |
| `openai_key` | OpenAI API | Chave da API da OpenAI |
| `mp_key` | Mercado Pago | Chave de acesso do Mercado Pago |
| `business_hours` | Seu app | Horários de atendimento (JSON) |
| `ai_instructions` | Seu app | Instruções para a IA |

## 🧪 Testando o Sistema

### Teste 1: Verificar Webhook (GET)

```bash
curl "https://axrjtmmchgzcuswmhmzm.supabase.co/functions/v1/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=seu_token_secreto_123&hub.challenge=test_challenge"
```

Esperado: Retorna `test_challenge`

### Teste 2: Enviar Mensagem Manual

```bash
curl -X POST https://axrjtmmchgzcuswmhmzm.supabase.co/functions/v1/send-message \
  -H "Authorization: Bearer seu_token_jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "uuid-da-empresa",
    "phone": "5573998715343",
    "message": "Olá! Teste de mensagem",
    "conversation_id": "uuid-da-conversa"
  }'
```

### Teste 3: Enviar Broadcast

```bash
curl -X POST https://axrjtmmchgzcuswmhmzm.supabase.co/functions/v1/send-broadcast \
  -H "Authorization: Bearer seu_token_jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "broadcast_id": "uuid-do-broadcast"
  }'
```

## 📊 Monitoramento

### Logs das Edge Functions

No painel do Supabase:
1. Vá em Functions
2. Clique na função desejada
3. Vá em "Logs" para ver o histórico de execução

### Logs Importantes

- `[WhatsApp Webhook]` - Processamento de mensagens
- `[send-message]` - Envio de mensagens manuais
- `[mercadopago-webhook]` - Processamento de pagamentos
- `[send-broadcast]` - Envio em massa

## 🚨 Troubleshooting

### Problema: "Company not found"
- **Causa**: Phone Number ID não configurado corretamente
- **Solução**: Verifique se o Phone Number ID está correto no Onboarding

### Problema: "Invalid verify token"
- **Causa**: Token não corresponde ao configurado no Meta
- **Solução**: Certifique-se de que o Verify Token é idêntico em ambos os lugares

### Problema: "OpenAI API error"
- **Causa**: Chave da OpenAI inválida ou expirada
- **Solução**: Gere uma nova chave em [OpenAI API Keys](https://platform.openai.com/api-keys)

### Problema: Mensagens não são enviadas
- **Causa**: WhatsApp Token expirou ou está inválido
- **Solução**: Regenere o token permanente no Meta for Developers

## 📱 Fluxo Completo

```
Cliente envia mensagem no WhatsApp
    ↓
Meta Cloud API envia para whatsapp-webhook
    ↓
Webhook valida e busca empresa
    ↓
Verifica horário de atendimento
    ↓
Busca histórico de conversa
    ↓
Chama OpenAI com contexto
    ↓
IA gera resposta
    ↓
Envia resposta via Meta Cloud API
    ↓
Salva mensagem no banco
    ↓
Atualiza conversa em tempo real
```

## 🎯 Próximos Passos Opcionais

1. **Implementar Flows**: Criar fluxos automáticos de conversa
2. **Integrar Stripe**: Além do Mercado Pago
3. **Analytics**: Dashboard de métricas
4. **Multi-idioma**: Suportar outros idiomas além do português
5. **Integração com CRM**: Sincronizar dados com sistemas externos

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs das Edge Functions
2. Valide as credenciais do Meta e OpenAI
3. Certifique-se de que o banco de dados está com os dados corretos
4. Teste com curl antes de usar o app

---

**Status**: ✅ Pronto para produção
**Última atualização**: 16/03/2026
**Versão**: 1.0.0
