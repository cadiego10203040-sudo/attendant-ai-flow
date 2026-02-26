

## Plano: 3 Correções + Campo WhatsApp do Cliente

### Problemas Identificados

1. **"Configurações Gerais" duplicada no menu** — linha 73 do `DashboardLayout.tsx` aponta para `/dashboard/settings`, mesmo path de "Empresa" (linha 68). Redundante.
2. **"Automação" não abre nada** — linha 61 do `DashboardLayout.tsx` não tem `path`. É um botão morto.
3. **Não existe campo para número do WhatsApp do cliente** — apenas credenciais da API Meta em Conexões.

### Correções

**1. Remover "Configurações Gerais" do menu lateral**
- `src/components/DashboardLayout.tsx` — remover a linha 73 (`{ emoji: "⚙️", label: "Configurações Gerais", path: "/dashboard/settings" }`)

**2. Criar tela de Automação**
- Criar `src/pages/DashboardAutomation.tsx` com cards de configuração: IA ativa/inativa, delay de resposta, detecção de compra, regras de escalamento
- Campos salvos em `companies`: já existem `ai_instructions`, `escalation_rules`; usar esses mesmos campos
- Adicionar rota `/dashboard/automation` no `App.tsx`
- Atualizar `DashboardLayout.tsx` linha 61 para adicionar `path: "/dashboard/automation"`

**3. Adicionar campo `customer_whatsapp` na tabela `companies`**
- Migração SQL: `ALTER TABLE companies ADD COLUMN IF NOT EXISTS customer_whatsapp text DEFAULT '';`

**4. Adicionar campo de WhatsApp na aba "Empresa" de `DashboardSettings.tsx`**
- Novo estado `customerWhatsapp`
- Campo com label "📱 Número do WhatsApp para Atendimento", placeholder "5573998715343", dica abaixo
- Validação: apenas números, mínimo 12 dígitos
- Incluído no `handleSave` → `update({ ..., customer_whatsapp: customerWhatsapp })`

**5. Adicionar campo no Onboarding (step 0)**
- Campo "📱 Seu número do WhatsApp" com placeholder e validação
- Incluído no `finish()` → `insert({ ..., customer_whatsapp })`

**6. Exibir número conectado na sidebar do `DashboardLayout.tsx`**
- Abaixo do logo "AtendIA", mostrar `company.customer_whatsapp` formatado
- Status: 🟢 se preenchido / 🔴 "Não configurado" com link para `/dashboard/settings`

**7. Atualizar `useCompany.tsx`**
- Adicionar `customer_whatsapp` ao tipo `Company`

### Arquivos Afetados
- `src/components/DashboardLayout.tsx` — remover item duplicado, add path automação, exibir WhatsApp
- `src/pages/DashboardAutomation.tsx` — novo arquivo
- `src/pages/DashboardSettings.tsx` — campo customer_whatsapp
- `src/pages/Onboarding.tsx` — campo customer_whatsapp no step 0
- `src/hooks/useCompany.tsx` — tipo Company
- `src/App.tsx` — rota /dashboard/automation
- Migração SQL — coluna customer_whatsapp

