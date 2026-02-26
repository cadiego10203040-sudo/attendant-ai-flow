

## Plano: Webhook URL editável e persistida no banco

### 1. Migração de banco
Adicionar coluna `webhook_url` (text, default `''`) à tabela `companies`.

```sql
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS webhook_url text DEFAULT '' ;
```

### 2. Atualizar `src/pages/DashboardConnections.tsx`
- Remover `const webhookUrl = \`...\`` hardcoded (linha 28)
- Adicionar state `webhookUrl` carregado de `company.webhook_url`
- Tornar o campo Webhook URL um `<Input>` editável (não read-only)
- Botão **Salvar**: validar campos obrigatórios (phone, token, verify, webhook com `https://`), salvar `webhook_url` junto no update
- Botão **Testar Conexão**: fazer fetch GET ao `webhookUrl` do state com `?hub.mode=subscribe&hub.verify_token=...&hub.challenge=12345`, verificar se resposta = "12345"
- Manter botão Copiar ao lado do input

### 3. Atualizar `src/pages/Onboarding.tsx`
- Remover hardcode do webhook (linha 130)
- Adicionar state `webhookUrl` com valor default `https://yrdsfqlhdsuhxjyugepd.supabase.co/functions/v1/whatsapp-webhook`
- Input editável no step 4
- Salvar `webhook_url` no insert da company

### 4. Atualizar `src/hooks/useCompany.tsx`
- Adicionar `webhook_url` ao type `Company`

