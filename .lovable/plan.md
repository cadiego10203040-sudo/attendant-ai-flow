

## Plano: Garantir que "Salvar" funcione em todas as seções

### Problema identificado
Duas páginas não tratam erros do banco ao salvar, podendo falhar silenciosamente:
- **DashboardAPI** — `handleSave` não verifica `error` do Supabase
- **DashboardHours** — `handleSave` não verifica `error` do Supabase

As demais páginas (Conexões, Configurações, Etiquetas, Respostas Rápidas, Fluxos, Transmissão) já possuem tratamento adequado.

### Correções

1. **`src/pages/DashboardAPI.tsx`** — Adicionar verificação de `error` no retorno do `update`, exibir toast de erro se falhar.

2. **`src/pages/DashboardHours.tsx`** — Adicionar verificação de `error` no retorno do `update`, exibir toast de erro se falhar.

3. **Ambas as páginas** — Envolver em try/catch para capturar erros inesperados.

