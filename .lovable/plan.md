

## Plano: Adicionar páginas de Política de Privacidade, Termos de Uso e Exclusão de Dados

### O que será feito

Criar 3 novas páginas públicas e adicionar links no footer da landing page:

### Implementação

1. **Criar `src/pages/PrivacyPolicy.tsx`** — Página com conteúdo de Política de Privacidade do AtendIA (LGPD, coleta de dados, cookies, direitos do usuário, etc.)

2. **Criar `src/pages/TermsOfService.tsx`** — Página com Termos de Uso (definições, responsabilidades, uso da plataforma, pagamentos, rescisão, etc.)

3. **Criar `src/pages/DataDeletion.tsx`** — Página com instruções e formulário/link para exclusão de dados do usuário (conformidade Meta/LGPD)

4. **Atualizar `src/App.tsx`** — Adicionar 3 rotas públicas:
   - `/privacidade` → PrivacyPolicy
   - `/termos` → TermsOfService
   - `/exclusao-dados` → DataDeletion

5. **Atualizar footer em `src/pages/Index.tsx`** — Adicionar os 3 links no footer:
   - Política de Privacidade → `/privacidade`
   - Termos de Uso → `/termos`
   - Exclusão de Dados → `/exclusao-dados`

### URLs finais
- `https://attendant-ai-flow.lovable.app/privacidade`
- `https://attendant-ai-flow.lovable.app/termos`
- `https://attendant-ai-flow.lovable.app/exclusao-dados`

As páginas seguirão o design escuro atual com a fonte Plus Jakarta Sans e cores do tema.

