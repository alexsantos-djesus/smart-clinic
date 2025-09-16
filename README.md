# Central da Saúde – Sistema de Atendimento Inteligente

Monorepo com **backend** (Node.js + Express + Prisma + PostgreSQL/Neon) e **frontend** (Vue 3 + Vite + Tailwind).
Siga o README inline e o `.env.example`.

## Rodando rapidamente
- Configure o Neon e copie `DATABASE_URL` com SSL obrigatório.
- Backend: `cd backend && cp ../.env.example .env && npm i && npm run prisma:gen && npm run prisma:push && npm run dev`
- Frontend: `cd ../frontend && cp ../.env.example .env && npm i && npm run dev`
