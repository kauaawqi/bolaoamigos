# 🏆 Bolão Copa 2026 — Guia de Setup (com Login)

## O que você vai precisar
- Conta gratuita no [Supabase](https://supabase.com) — banco + auth
- Conta gratuita no [Vercel](https://vercel.com) ou [Netlify](https://netlify.com) — hospedagem

Tempo estimado: **15 minutos**

---

## PASSO 1 — Criar projeto no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com) → **New Project**
2. Nome: `bolao-copa2026` · Região: **South America (São Paulo)**
3. Aguarde ~2 min até o projeto ficar pronto

---

## PASSO 2 — Criar as tabelas

1. Vá em **SQL Editor → New Query**
2. Cole todo o conteúdo do arquivo `schema.sql`
3. Clique em **Run** — deve aparecer `Success`

---

## PASSO 3 — Configurar o Auth

1. No painel do Supabase vá em **Authentication → Providers**
2. Confirme que **Email** está habilitado (vem ativo por padrão)
3. Em **Authentication → Email Templates** você pode personalizar o e-mail de confirmação (opcional)

> **Dica:** Se não quiser que os amigos precisem confirmar e-mail, vá em
> **Authentication → Settings** e desative a opção **"Enable email confirmations"**.

---

## PASSO 4 — Pegar as credenciais

1. Vá em **Project Settings → API**
2. Copie:
   - **Project URL** → `https://xyzxyz.supabase.co`
   - **anon public** (em Project API Keys)

---

## PASSO 5 — Configurar o app.js

Abra `app.js` e edite as três primeiras constantes:

```js
const SUPABASE_URL      = 'https://xyzxyz.supabase.co';   // sua URL
const SUPABASE_ANON_KEY = 'eyJhbGci...';                  // sua anon key
const CODIGO_CONVITE    = 'copa2026';                      // mude para o código secreto que vai passar para os amigos
```

---

## PASSO 6 — Deploy

### Netlify (mais fácil, sem GitHub)
1. Acesse [app.netlify.com](https://app.netlify.com) → **Add new site → Deploy manually**
2. Arraste a pasta `copa2026` inteira para a área de upload
3. Pronto — você recebe um link como `https://bolao-xyz.netlify.app`

### Vercel (via GitHub)
1. Suba os arquivos num repositório GitHub
2. No Vercel → **Add New Project** → selecione o repo
3. Em **Root Directory** coloque `copa2026` (se a pasta estiver dentro do repo)
4. Clique em **Deploy**

---

## PASSO 7 — Compartilhar com os amigos

Mande para cada amigo:
- O **link** do site
- O **código de convite** (o que você definiu em `CODIGO_CONVITE`)

Cada um cria a própria conta com e-mail e senha. O ranking aparece para todos, mas os bilhetes detalhados são visíveis apenas para o dono.

---

## Estrutura dos arquivos

```
copa2026/
├── index.html    → Estrutura HTML (tela de login + app)
├── style.css     → Visual tema escuro
├── app.js        → Lógica completa + Supabase Auth
├── jogos.js      → 72 jogos da fase de grupos
├── schema.sql    → SQL para criar tabelas e políticas de segurança
└── SETUP.md      → Este guia
```

## Como funciona a segurança

- **Row Level Security (RLS):** cada usuário só lê e escreve seus próprios bilhetes no banco, mesmo que alguém tente fazer chamadas diretas à API.
- **Ranking público via VIEW:** uma view SQL agrega só os totais (greens/reds), sem expor detalhes de nenhum bilhete.
- **Código de convite:** verificado no front-end antes de criar a conta. Só quem tiver o código consegue se cadastrar.
