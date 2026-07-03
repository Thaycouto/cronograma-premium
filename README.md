# Cronograma Premium

Base inicial do Couto Hair Program em Next.js, TypeScript, Tailwind CSS e Supabase.

## Estrutura

- `/` landing page pública com CTA de compra.
- `/login` autenticação por email e senha via Supabase Auth.
- `/app` área premium protegida.
- `/api/kiwify/webhook` rota preparada para liberar acesso premium no futuro.

## Variáveis de ambiente

Crie um `.env.local` com base no `.env.example`.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
KIWIFY_WEBHOOK_SECRET=
```

Nunca suba `.env.local` ou chaves reais para o GitHub.

## Supabase

A estrutura espera uma tabela `premium_access` para validar o acesso premium. Um modelo inicial está em `supabase/schema.sql`.

## Scripts

```bash
npm run dev
npm run build
npm run start
```
