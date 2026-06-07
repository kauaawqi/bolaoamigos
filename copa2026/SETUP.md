# 🏆 Bolão Copa 2026 — Guia de Setup Completo

## O que você vai precisar
- Conta gratuita no [Supabase](https://supabase.com) (backend/banco)
- Conta gratuita no [Netlify](https://netlify.com) ou [Vercel](https://vercel.com) (hospedagem)

Tempo estimado: **10 minutos**

---

## PASSO 1 — Criar projeto no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com) e clique em **New Project**
2. Escolha um nome (ex: `bolao-copa2026`) e uma senha forte para o banco
3. Selecione a região **South America (São Paulo)** para menor latência
4. Clique em **Create new project** e aguarde ~2 minutos

---

## PASSO 2 — Criar as tabelas

1. No painel do projeto, vá em **SQL Editor** (menu lateral esquerdo)
2. Clique em **New Query**
3. Copie e cole todo o conteúdo do arquivo `schema.sql` deste projeto
4. Clique em **Run** (ou Ctrl+Enter)
5. Você deve ver a mensagem `Success. No rows returned`

---

## PASSO 3 — Pegar as credenciais

1. No painel, vá em **Project Settings → API**
2. Copie os dois valores:
   - **Project URL** → algo como `https://xyzxyz.supabase.co`
   - **anon public** (em "Project API keys")

---

## PASSO 4 — Configurar o app

Abra o arquivo `app.js` e substitua as duas primeiras linhas:

```js
// ANTES:
const SUPABASE_URL      = 'COLE_SUA_URL_AQUI';
const SUPABASE_ANON_KEY = 'COLE_SUA_ANON_KEY_AQUI';

// DEPOIS (com seus dados reais):
const SUPABASE_URL      = 'https://xyzxyz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

---

## PASSO 5 — Fazer o deploy

### Opção A: Netlify (mais fácil)
1. Acesse [app.netlify.com](https://app.netlify.com)
2. Clique em **Add new site → Deploy manually**
3. Arraste a pasta `copa2026` inteira para a área de upload
4. Pronto! O Netlify te dá um link como `https://bolao-xyz.netlify.app`

### Opção B: Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Faça push da pasta para um repositório GitHub
3. No Vercel, clique em **Add New Project** e selecione o repo
4. Clique em **Deploy**

### Opção C: GitHub Pages
1. Crie um repositório no GitHub
2. Suba os 4 arquivos (index.html, style.css, app.js, jogos.js) na raiz
3. Vá em **Settings → Pages → Branch: main** e salve
4. Acesse em `https://seu-usuario.github.io/nome-do-repo`

---

## PASSO 6 — Compartilhar com os amigos

Manda o link gerado no deploy para todo mundo. Todos que abrirem o link verão o mesmo ranking em tempo real — qualquer bilhete adicionado ou editado aparece na tela de todos instantaneamente.

---

## Dicas extras

### Habilitar Realtime no Supabase
Se os dados não atualizarem automaticamente:
1. Vá em **Database → Replication**
2. Clique em **0 tables** ao lado de `supabase_realtime`
3. Ative as tabelas `participantes` e `bilhetes`

### Quero restringir quem pode editar
Por padrão o sistema é aberto (qualquer um que tiver o link pode adicionar bilhetes). Se quiser adicionar senha/login, avisa que posso adicionar autenticação com senha simples.

### Arquivos do projeto
```
copa2026/
├── index.html   → Estrutura da página
├── style.css    → Visual/tema escuro
├── app.js       → Lógica + integração Supabase
├── jogos.js     → Tabela completa dos 72 jogos
├── schema.sql   → Script para criar as tabelas
└── SETUP.md     → Este guia
```
