

## Plano: Padronizar botões "Salvar" com estados visuais e tratamento de erros

### 1. Criar hook `src/hooks/useSave.ts`
Hook reutilizável com estados `idle | loading | success | error`, transição automática para `idle` após 3s, e integração com toast.

### 2. Criar componente `src/components/SaveButton.tsx`
Botão reutilizável que consome o status do `useSave` e exibe:
- Idle: fundo `#FF6B2B`, ícone 💾, "Salvar"
- Loading: fundo com opacidade, spinner, "Salvando...", disabled
- Success: fundo `#22D3A5`, ícone ✅, "Salvo!" (3s)
- Error: fundo `#FF5252`, ícone ❌, "Erro ao salvar" (3s)

### 3. Atualizar TODAS as páginas com save

**DashboardAPI.tsx** — Adicionar verificação de `error` no retorno do Supabase, usar `SaveButton`, toast "🔑 Chaves de API salvas com sucesso!"

**DashboardHours.tsx** — Idem, toast "🕐 Horários de atendimento salvos!"

**DashboardConnections.tsx** — Já tem tratamento de erro, trocar botão por `SaveButton`, toast "🔌 Configurações do WhatsApp salvas!"

**DashboardSettings.tsx** — Já tem try/catch, trocar botão por `SaveButton`, toasts personalizados "⚙️ Configurações salvas!"

**DashboardLabels.tsx** — Adicionar verificação de `error`, trocar botão por `SaveButton`, toast "🏷️ Etiqueta salva!"

**DashboardQuickReplies.tsx** — Idem, toast "💬 Resposta rápida salva!"

**DashboardFlows.tsx** — Idem no `createFlow` e `toggleFlow`, toast "⚡ Fluxo atualizado!"

### 4. Toast customizado
Usar o toast existente do projeto (`@/hooks/use-toast`) com estilos customizados para sucesso (fundo verde escuro) e erro (fundo vermelho escuro), sem criar sistema paralelo.

### Regras
- Não alterar layout, cores de fundo ou estrutura visual das telas
- Não limpar campos após salvar
- Dados carregados do banco ao abrir (já implementado em todas)
- Botão disabled durante loading

