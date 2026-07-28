# SIMCHI

Мобильное веб-приложение для электриков: замеры, предварительные сметы, материалы, сравнение поставщиков и заказы.

## Стек

- React + TypeScript + Vite
- Tailwind CSS
- Supabase (Auth, PostgreSQL, Storage, RLS)
- TanStack Query, Zustand, React Hook Form, Zod
- jsPDF, SheetJS
- PWA (vite-plugin-pwa)
- Netlify

## Быстрый старт

```bash
npm install
cp .env.example .env
npm run dev
```

Без ключей Supabase приложение запускается в **демо-режиме** с локальными данными Узбекистана (UZS).

## Подключение Supabase

1. Создайте проект (или используйте `fnzikjawohphbpkfezic`).
2. В `.env` укажите:

```env
VITE_SUPABASE_URL=https://fnzikjawohphbpkfezic.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

3. В SQL Editor выполните по порядку:

- `supabase/migrations/20260328000001_init_schema.sql`
- `supabase/migrations/20260328000002_rls_policies.sql`
- `supabase/migrations/20260328000003_storage.sql`
- `supabase/seed.sql`

4. В Authentication → Providers включите Email.
5. Никогда не коммитьте service role key и `.env`.

## Сборка

```bash
npm run build
```

Артефакт: `dist`.

## Netlify

1. Подключите GitHub-репозиторий.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Добавьте env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
5. SPA redirect уже в `netlify.toml`: `/* → /index.html` (200)

## Роли

- `electrician` — публичная регистрация
- `supplier` / `admin` — назначает администратор

## Основные маршруты

`/`, `/projects`, `/projects/new`, `/clients`, `/catalog`, `/suppliers`, `/orders`, `/profile`, `/settings`, `/estimate/public/:token`, `/admin`, `/supplier`

## Офлайн

Черновики wizard / rooms / points сохраняются в IndexedDB. PWA кэширует shell приложения.
