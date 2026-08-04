# Checklist de producao

## Variaveis da Vercel

Obrigatorias:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FRONTEND_URL`
- `CORS_ALLOWED_ORIGINS`
- `WEBHOOK_SECRET`

Opcionais:

- `VITE_API_BASE_URL`
- `WEBHOOK_SECRET_HOTMART`
- `WEBHOOK_SECRET_KIWIFY`
- `WEBHOOK_SECRET_STRIPE`
- `WEBHOOK_SECRET_SHOPIFY`
- `WEBHOOK_SECRET_ASAAS`

## Supabase Auth

- Site URL: `https://pixelcontasv2.vercel.app`
- Redirect URLs:
  - `https://pixelcontasv2.vercel.app/*`
  - `http://localhost:5173/*`
  - `http://127.0.0.1:5173/*`

## Migrations

- `20260803000100_initial_pixelcontas_schema.sql`
- `20260803000200_webhook_events.sql`
- `20260803000300_storage_buckets.sql`
- `20260803000400_notifications.sql`

## Testes manuais

- Login
- Cadastro
- Upload de documento
- Download de documento
- Webhook Hotmart de teste
- Acesso a clientes, produtos, notas, integracoes e automacoes
