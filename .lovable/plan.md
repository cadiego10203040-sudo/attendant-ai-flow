

## Plano: Corrigir Build + Conectar ao Supabase Externo

### Problema

Dois problemas distintos:
1. **Build quebrado**: Pacotes Radix UI, recharts, react-query e supabase-js estão com versões que puxam tipos do React 19, incompatíveis com React 18
2. **Dashboard não mostra conversas**: O frontend lê do projeto Lovable Cloud (`axrjtmmchgzcuswmhmzm`), mas as mensagens do WhatsApp estão no projeto externo (`yrdsfqlhdsuhxjyugepd`)

### Ações

**1. Corrigir build — pinar TODAS as dependências problemáticas**

O problema persiste porque os pacotes Radix UI (ex: `@radix-ui/react-dialog@^1.1.14`) estão em versões que dependem de `@types/react@^19`. Precisamos:

- Pinar todos os Radix UI para versões compatíveis com React 18 (série `1.0.x` / `1.1.x` mais antiga)
- Alternativa mais simples: adicionar `"overrides"` no `package.json` para forçar `@types/react` e `@types/react-dom` em todo o dependency tree:

```json
"overrides": {
  "@types/react": "18.3.11",
  "@types/react-dom": "18.3.1"
}
```

Isso resolve todos os erros de tipo de uma vez (chart.tsx, sheet.tsx, input-otp.tsx, sidebar.tsx, useAuth.tsx, DashboardMetrics.tsx).

**2. Criar cliente Supabase externo**

Criar `src/integrations/supabase/externalClient.ts` — um segundo cliente Supabase apontando para `https://yrdsfqlhdsuhxjyugepd.supabase.co` com a anon key desse projeto.

Precisarei da **anon key** do projeto `yrdsfqlhdsuhxjyugepd`. Vou perguntar ao usuário se ele ainda não a forneceu.

**3. Atualizar `DashboardConversations.tsx`**

Trocar todas as queries de leitura (`conversations`, `messages`) e subscriptions de realtime para usar o cliente externo. Manter o cliente Lovable Cloud para auth e operações administrativas.

**4. Atualizar `DashboardAILive.tsx` e `DashboardLayout.tsx`**

Esses componentes também fazem queries em `conversations` — precisam usar o cliente externo para mostrar dados corretos.

### Detalhe técnico

```text
┌─────────────────┐     ┌──────────────────────┐
│  Auth / Company  │────▶│  Lovable Cloud       │
│  (login, config) │     │  axrjtmmchgzcuswmhmzm│
└─────────────────┘     └──────────────────────┘

┌─────────────────┐     ┌──────────────────────┐
│  Conversations   │────▶│  Supabase Externo    │
│  Messages, AI    │     │  yrdsfqlhdsuhxjyugepd│
└─────────────────┘     └──────────────────────┘
```

### Pré-requisito

Preciso da **anon key** do projeto Supabase externo (`yrdsfqlhdsuhxjyugepd`). Vou solicitá-la antes de implementar.

### Resultado

- Build corrigido e funcionando
- Dashboard lendo conversas e mensagens do projeto externo
- Realtime ativo no projeto externo
- Novas mensagens aparecem em tempo real

