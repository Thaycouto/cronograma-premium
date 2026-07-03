# Cronograma Premium

Monorepo do Couto Hair Program com duas aplicações Next.js separadas para deploy na Netlify.

## Apps

- `apps/landing`: página pública de venda.
- `apps/webapp`: login, criação de senha, área premium e webhook da Kiwify.
- `packages/shared`: utilidades compartilhadas seguras.
- `supabase`: SQL da estrutura de acesso.

## Deploys Netlify

Landing:

```text
https://couto-hair-program.netlify.app
```

Webapp:

```text
https://couto-hair-app.netlify.app
```

Webhook Kiwify:

```text
https://couto-hair-app.netlify.app/api/webhooks/kiwify
```

Analise capilar por IA:

```text
https://couto-hair-app.netlify.app/api/ai/hair-analysis
```

## Variáveis

Use os arquivos:

- `apps/landing/.env.example`
- `apps/webapp/.env.example`

Nunca suba `.env.local` ou chaves reais para o GitHub.

Configure `OPENAI_API_KEY` somente no deploy do webapp. Essa chave nao deve existir na landing nem em arquivos versionados.

## Supabase

Rode `supabase/schema.sql` no SQL Editor do Supabase. O acesso real vem da tabela `access_grants`, preenchida pelo webhook da Kiwify.

## Scripts

```bash
npm run dev:landing
npm run dev:webapp
npm run build
npm run build:landing
npm run build:webapp
```
Deploy test
