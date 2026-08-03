# Teste manual de webhook

Este teste envia uma venda simulada da Hotmart para o backend da PixelConta.

## Antes de executar

1. Rode a migration `supabase/migrations/20260803000200_webhook_events.sql` no Supabase.
2. Confirme que a variavel `WEBHOOK_SECRET` esta cadastrada na Vercel.
3. Pegue o `id` da empresa na tabela `companies` do Supabase.

## Comando

No PowerShell, dentro da pasta do projeto:

```powershell
.\scripts\test-webhook-hotmart.ps1 `
  -CompanyId "COLE_AQUI_O_ID_DA_EMPRESA" `
  -Secret "COLE_AQUI_O_WEBHOOK_SECRET"
```

## O que deve acontecer

Depois do comando, confira no Supabase:

- `webhook_events`: deve ter um evento com `status = processed`.
- `clients`: deve ter o cliente `Cliente Teste Webhook`.
- `sales`: deve ter uma venda com `origin = hotmart`.
- `automations`: se existir uma automacao ativa compativel, `total_executions` deve aumentar.

Para repetir o teste criando uma nova venda, altere o `EventId`:

```powershell
.\scripts\test-webhook-hotmart.ps1 `
  -CompanyId "COLE_AQUI_O_ID_DA_EMPRESA" `
  -Secret "COLE_AQUI_O_WEBHOOK_SECRET" `
  -EventId "test-hotmart-002"
```
