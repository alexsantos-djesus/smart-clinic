# Smart Clinic

Sistema acadêmico de agendamento de consultas médicas, desenvolvido em **Vue 3 + Vite (frontend)** e **Node.js + Express + Prisma (backend)**.

## 📌 Sobre o Projeto
O objetivo do projeto é oferecer uma aplicação simples para clínicas de pequeno porte, permitindo:
- Cadastro de pacientes e profissionais;
- Agendamento de consultas;
- Gestão de atendimentos pelos profissionais;
- Consulta da previsão do tempo no local do paciente no horário da consulta.

Este projeto foi desenvolvido para fins **acadêmicos**.

---

## 🚀 Tecnologias Utilizadas
- **Frontend**: Vue 3, Vite, TailwindCSS, Vue Router, Axios  
- **Backend**: Node.js, Express, Prisma, PostgreSQL  
- **Infraestrutura**: Deploy no **Vercel** (front + back)

---

## ⚙️ Como Rodar Localmente

### 🔹 Pré-requisitos
- Node.js (>= 18)
- PostgreSQL instalado
- NPM ou Yarn

### 🔹 Clonar o repositório
```bash
git clone https://github.com/alexsantos-djesus/smart-clinic
cd smart-clinic
```

### 🔹 Backend
```bash
cd backend
cp .env.example .env
npm install
npm run prisma:gen
npm run prisma:push
npm run seed
npm run dev
```
O backend rodará em `http://localhost:3001`

### 🔹 Frontend
```bash
cd frontend
cp .env.example .env   # configure a variável VITE_API_URL=http://localhost:3001
npm install
npm run dev
```
O frontend rodará em `http://localhost:5173`

---

## 🌐 Deploy
- **Frontend**: configurado para deploy no **Vercel**  
- **Backend**: também pode ser deployado no **Vercel** com `serverless-http`  
- Variáveis de ambiente devem ser configuradas no painel da Vercel:
  - `DATABASE_URL` (URL do banco de dados)
  - `JWT_SECRET` (chave secreta para autenticação)
  - `VITE_API_URL` (para o frontend)

---

## 👨‍💻 Equipe
Projeto acadêmico desenvolvido por **Alex Santos** no curso de Análise e Desenvolvimento de Sistemas.

---

## 📄 Licença
Este projeto é apenas para fins acadêmicos e não deve ser usado em produção.
