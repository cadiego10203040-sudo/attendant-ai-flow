## O que falta para o AtendIA ficar pronto e funcionando

### Situação hoje
- Telas, login e configurações: prontos.
- Conversas do WhatsApp já aparecem no painel (lidas do seu banco externo `yrdsfqlhdsuhxjyugepd`).
- **Não funciona ainda:** botão "Assumir", "Pausar IA", "IA ao Vivo" atualizando sozinho e envio de mensagem manual aparecendo no chat.

### Por que não funciona
1. A tabela `conversations` do banco externo **não tem a coluna `status`** — então "Assumir/Pausar/Fechar" não têm onde salvar, e o bot não sabe que um humano assumiu.
2. "IA ao Vivo" espera a empresa errada carregar e nunca atualiza.
3. Ao enviar mensagem manual, ela chega no WhatsApp mas falha ao salvar (procura a conversa no banco errado), então não aparece no chat.
4. Os erros são escondidos — o botão parece funcionar mas não faz nada.
5. "Bate Papo ao Vivo" é só uma página de aviso.

### Etapa 1 — No seu banco externo (você roda no SQL Editor dele)
```sql
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS status text DEFAULT 'open';
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message text;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations, messages;
```
Mais permissões de leitura/escrita para `conversations` e `messages` (vou te passar o SQL pronto).
E a função `whatsapp` do bot externo precisa **não responder quando `status = 'waiting_human'`** (vou te passar o trecho).

### Etapa 2 — No painel (eu faço)
- **Conversas:** Assumir/Fechar só mudam se salvar de verdade; mostrar erro claro se falhar; mensagem manual enviada pelo WhatsApp e gravada no banco externo, aparecendo na hora; trava contra clique duplo.
- **IA ao Vivo:** corrigir carregamento, atualizar em tempo real + checagem a cada 5s como reserva, "Pausar IA" com confirmação.
- **Bate Papo ao Vivo:** virar lista real das conversas em que um humano assumiu, com chat para responder.
- **Contadores da barra lateral:** não quebrar quando faltar dado.
- Aviso na tela quando a empresa não for encontrada no banco externo (Phone Number ID diferente).

### Etapa 3 — Teste completo
Abrir conversa → Assumir → enviar mensagem → conferir no WhatsApp → atualizar página e ver estado mantido → IA ao Vivo atualizando com nova mensagem.

### Detalhes técnicos
- `DashboardAILive.tsx`: deps `[externalCompanyId]`, `useCallback`, polling, `status ?? 'open'`.
- `DashboardConversations.tsx`: checar `error` nos updates; `send-message` sem `conversation_id` (evita FK local) e insert em `externalSupabase.messages`.
- `DashboardLiveChat.tsx`: reaproveitar lógica filtrando `waiting_human`.
- `useExternalCompany.tsx`: expor `notFound`/erro.
- Pendente com você: rodar o SQL no banco externo e ajustar a função `whatsapp` de lá — sem isso o "Assumir" não pausa o bot.
