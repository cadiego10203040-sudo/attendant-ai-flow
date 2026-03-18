
Objetivo: corrigir os dois problemas reportados no dashboard: (1) “assumir conversa” falhando/sem efeito visível e (2) “IA ao vivo” não atualizando.

Diagnóstico já confirmado (com base no código + logs):
1) `DashboardAILive.tsx` tem dependência errada no `useEffect` (`[company]`), mas usa `externalCompanyId`. Isso pode impedir carregamento/atualização quando o ID externo chega depois.
2) Logs da função `send-message` mostram erro de FK ao salvar mensagem com `conversation_id` externo na base local:
- `messages_conversation_id_fkey` violada (conversation não existe localmente).
- A mensagem é enviada ao WhatsApp com sucesso, mas a persistência local falha; no painel externo o usuário pode não ver feedback imediato e parecer que “não funcionou”.
3) `handleAssume`/`pauseAI` atualizam `status` sem tratar erro. Se a atualização falhar (RLS/schema externo), a UI pode aparentar sucesso sem realmente pausar IA.
4) O “ao vivo” depende de realtime; se o projeto externo não estiver com realtime/publication ideal, o feed fica parado.

Plano de implementação (arquivos):
1) `src/pages/DashboardAILive.tsx`
- Corrigir dependências para usar `externalCompanyId`.
- Extrair `fetchData` com `useCallback`.
- Tornar filtro robusto: tratar `status` ausente como “open” para não zerar lista indevidamente.
- Adicionar fallback de polling (ex.: 5s) além do realtime.
- Tratar erros de query/update com `toast` claro.

2) `src/pages/DashboardConversations.tsx`
- Em `handleAssume` e `handleClose`: validar retorno da atualização (`error`), só mudar estado local quando sucesso; em erro, mostrar toast e manter estado anterior.
- Em `handleSendMessage`:
  - parar de enviar `conversation_id` para `send-message` (evita erro FK local),
  - após sucesso, inserir mensagem no banco externo (`messages`) e atualizar `last_message` da conversa externa para feedback imediato no painel,
  - adicionar estado `sending` para evitar clique duplo.
- Adicionar fallback de polling para lista de conversas e mensagens quando realtime não chegar.

3) `src/hooks/useExternalCompany.tsx`
- Melhorar robustez: tratar `error` do lookup e expor estado claro quando não encontrar mapeamento (em vez de falha silenciosa).

4) (Opcional, mas recomendado) `src/components/DashboardLayout.tsx`
- Tornar contagem de abertas resiliente (`status` ausente => contabilizar como aberta ou separar “indefinido”).
- Evitar sensação de painel “parado” quando schema externo variar.

Validação E2E após correção:
1) Abrir `/dashboard`, selecionar conversa e clicar “Assumir”.
2) Confirmar badge/estado “Humano atendendo” persistindo após refresh.
3) Enviar mensagem manual e confirmar:
- aparece imediatamente no painel,
- chega no WhatsApp do cliente.
4) Abrir `/dashboard/ai-live` e confirmar que lista carrega e atualiza (realtime ou polling).
5) Conferir logs da função `send-message`: não deve mais aparecer erro FK de `conversation_id`.

Risco conhecido (e como tratar):
- Se o banco externo negar UPDATE/INSERT por política, a UI passará a mostrar erro explícito em vez de “falso sucesso”. Nesse caso, o próximo passo é ajustar permissões no backend externo para `conversations.status` e `messages`.

Sem migração de banco local necessária para esta correção; é ajuste de fluxo/front e tratamento de persistência entre base local e base externa.

<lov-actions>
<lov-suggestion message="Teste o fluxo completo ponta a ponta: assumir conversa, enviar mensagem manual e verificar atualização em /dashboard e /dashboard/ai-live.">Verificar que funciona end-to-end</lov-suggestion>
<lov-suggestion message="Adicionar um painel de diagnóstico de sincronização (status de realtime, último polling, último erro de update/insert externo) para facilitar suporte.">Adicionar diagnóstico de sincronização</lov-suggestion>
<lov-suggestion message="Atualizar também DashboardOrders e DashboardBroadcast para usar a mesma estratégia resiliente (realtime + polling + tratamento explícito de erros externos).">Padronizar resiliência nos outros módulos</lov-suggestion>
</lov-actions>
