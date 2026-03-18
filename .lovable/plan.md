

## Plano: Alterar URL padrão do webhook para o projeto externo

### Problema
A URL de webhook está apontando para `axrjtmmchgzcuswmhmzm.supabase.co` (projeto Lovable Cloud), mas você quer usar `yrdsfqlhdsuhxjyugepd.supabase.co` (seu projeto Supabase externo).

### Alterações

**1. `src/pages/Onboarding.tsx` (linha 49-50)**
- Trocar o fallback e a URL padrão de `axrjtmmchgzcuswmhmzm` para `yrdsfqlhdsuhxjyugepd`
- Mudar o endpoint de `whatsapp-webhook` para `whatsapp`
- Resultado: `https://yrdsfqlhdsuhxjyugepd.supabase.co/functions/v1/whatsapp`

**2. `src/pages/DashboardConnections.tsx` (linha 28)**
- Quando `webhook_url` estiver vazio no banco, usar `https://yrdsfqlhdsuhxjyugepd.supabase.co/functions/v1/whatsapp` como valor padrão em vez de string vazia.

### Nota
Isso faz com que as telas de Onboarding e Conexões já exibam a URL correta do seu projeto externo como padrão. Empresas que já salvaram uma URL diferente no banco continuarão usando a URL salva.

