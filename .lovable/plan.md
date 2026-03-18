## Plano: Corrigir erros de build e garantir Edge Function whatsapp ativa

### Diagnóstico

Os erros de build são causados por **versões incompatíveis de dependências**. Pacotes como `@tanstack/react-query@^5.83`, `recharts@^2.15`, `framer-motion@^12.34`, e `@supabase/supabase-js@^2.97` estão puxando tipos do React 19, mas o projeto usa React 18. Isso causa todos os erros de tipo (`'XAxis' cannot be used as a JSX component`, `'QueryClient' has no exported member`, `Property 'onAuthStateChange' does not exist`, etc.).

O erro `Cannot find package 'vite'` é consequência da corrupção do `node_modules` causada por edições anteriores no lockfile.

### Ações

**1. Corrigir `package.json` — pinar versões estáveis compatíveis com React 18**

Dependências que precisam ser pinadas (sem `^`):

- `@tanstack/react-query`: `"5.56.2"` (última versão estável com React 18)
- `@supabase/supabase-js`: `"2.49.1"` (versão estável)
- `recharts`: `"2.12.7"` (última com tipos React 18 corretos)
- `framer-motion`: `"11.11.17"` (última v11, compatível com React 18)
- `@types/react`: `"18.3.11"` (pinar para evitar drift)
- `@types/react-dom`: `"18.3.1"`

Manter todos os outros pacotes como estão.

**2. Regenerar `bun.lock**`

Deletar o `bun.lock` atual (que está corrompido) para que seja regenerado automaticamente com as versões corretas.

**3. Edge Function `whatsapp` — já existe e está correta**

O arquivo `supabase/functions/whatsapp/index.ts` já existe com toda a lógica necessária (GET verification, POST message processing, conexão com `companies`/`conversations`/`messages`, IA via OpenAI). O `supabase/config.toml` já tem `[functions.whatsapp]` com `verify_jwt = false`.

Nenhuma alteração necessária na Edge Function — ela será redeployada automaticamente quando o build corrigir.

### URL final do webhook

```
https://yrdsfqlhdsuhxjyugepd.supabase.co/functions/v1/whatsapp
```

**Nota importante**: Esta URL aponta para o seu projeto Supabase externo (`yrdsfqlhdsuhxjyugepd`). A Edge Function deste projeto Lovable Cloud é deployada em `https://axrjtmmchgzcuswmhmzm.supabase.co/functions/v1/whatsapp`. Se você quer usar a URL `yrdsfqlhdsuhxjyugepd`, a função precisa existir **naquele** projeto Supabase também.  
  
alterar tudo para este [https://yrdsfqlhdsuhxjyugepd.supabase.co/functions/v1/whatsapp](https://yrdsfqlhdsuhxjyugepd.supabase.co/functions/v1/whatsapp)