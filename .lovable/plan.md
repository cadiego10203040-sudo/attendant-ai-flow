

## Plano: Corrigir "Empresa não encontrada" com upsert e auto-criação

### Problema
Todas as telas fazem `if (!company) throw new Error("Empresa não encontrada")` antes do update. Se o usuário não passou pelo onboarding, não existe registro em `companies` e o save falha.

### Correções

**1. Auto-criar empresa no login (`src/hooks/useAuth.tsx`)**
No `onAuthStateChange`, quando `SIGNED_IN`, verificar se existe empresa com `.maybeSingle()`. Se não existir, inserir automaticamente com defaults (`name: 'Minha Empresa'`, `language: 'informal'`).

**2. Atualizar `src/hooks/useCompany.tsx`**
Usar `.maybeSingle()` em vez de `.maybeSingle()` (já usa, confirmar). Garantir que `refetch` funcione após auto-criação.

**3. Substituir throw por upsert em TODAS as telas**
Em cada `handleSave`, remover `if (!company) throw new Error(...)` e substituir por lógica que busca `user_id` via `supabase.auth.getUser()` e faz:
- Se `company` existe: `.update(...).eq("id", company.id)` (já funciona)
- Se `company` não existe: `.insert({ user_id, ...data })` (fallback)

Telas afetadas:
- `DashboardConnections.tsx` (linha 39)
- `DashboardAPI.tsx` (linha 27)
- `DashboardHours.tsx` (linha 36)
- `DashboardSettings.tsx` (linha 47)

**4. Criar helper reutilizável**
Adicionar função `upsertCompany(data, userId, companyId?)` no hook `useCompany` ou em utils para evitar duplicação.

### Resultado
- Novo usuário → login → empresa criada automaticamente → save funciona
- Sem alteração de layout ou design

