## Plano: Criar Edge Function `whatsapp` (alias)

### Contexto

A função atual se chama `whatsapp-webhook` e responde na URL:

```
https://axrjtmmchgzcuswmhmzm.supabase.co/functions/v1/whatsapp-webhook
```

O Meta está configurado para chamar `.../functions/v1/whatsapp`. Precisamos criar uma função com esse nome exato.

### O que será feito

1. **Criar `supabase/functions/whatsapp/index.ts**` — cópia exata do código de `whatsapp-webhook/index.ts`, com uma melhoria: usar `training_instructions` além de `ai_instructions` no `buildSystemPrompt`.
2. **Atualizar `supabase/config.toml**` — adicionar:
  ```toml
   [functions.whatsapp]
   verify_jwt = false
  ```
3. **Deploy automático** — o Lovable fará deploy da nova função, tornando-a acessível em:
  ```
  https://yrdsfqlhdsuhxjyugepd.supabase.co/functions/v1/whatsapp
  ```

### Detalhe técnico

No `buildSystemPrompt`, a prioridade será:

- Usar `training_instructions` se existir
- Fallback para `ai_instructions` se `training_instructions` estiver vazio

Isso garante compatibilidade com o campo que acabamos de criar na tabela `companies`.

### Resultado

Após a implementação, a URL [https://yrdsfqlhdsuhxjyugepd.supabase.co/functions/v1/whatsapp](https://yrdsfqlhdsuhxjyugepd.supabase.co/functions/v1/whatsapp) estará ativa e pronta para ser configurada como webhook no painel da Meta.