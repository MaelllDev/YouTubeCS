<p align="center">
  <img src="https://ui-avatars.com/api/?name=YCS&background=ff4444&color=fff&bold=true&size=128" alt="YouTube Comment Studio" width="128" height="128" style="border-radius: 24px;" />
</p>

<h1 align="center">🎬 YouTube Comment Studio</h1>

<p align="center">
  <strong>Crie thumbnails de comentários do YouTube com qualidade profissional</strong>
  <br />
  Editor visual completo com preview em tempo real, busca de canais e exportação em HD
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-red" />
  <img alt="React" src="https://img.shields.io/badge/React-19-blue" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-blue" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-4-blue" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-purple" />
</p>

<br />

## ✨ Funcionalidades

### 📝 Editor de Comentários
- **Nome e handle** do autor com edição inline
- **Avatar** por upload local, URL ou busca automática do YouTube
- **Texto rico** com destaque automático de menções (`@user`), hashtags (`#tag`) e links
- **Engajamento**: likes, dislikes, contagem de respostas
- **Tempo** personalizável com opções predefinidas ou customizado
- **Toggles** para ativar/desativar: botão de like, dislike, responder, traduzir, coração do criador, fixado, selo de verificado, membro do canal

### 🔍 Busca Inteligente de Canais (Cascata)
Busca canais reais do YouTube sem necessidade de API Key (mas com suporte opcional):

| Método | Requer Chave? | Obtém |
|--------|:------------:|-------|
| YouTube Data API v3 | ✅ Sim | Nome, foto, verificação |
| Feed RSS | ❌ Não | Nome real do canal |
| HTML Scraping | ❌ Não | Foto do canal, channel ID |

A busca tenta em cascata: se um método falha (timeout, CORS), passa automaticamente para o próximo. Com API Key configurada, busca dados reais; sem chave, usa RSS + HTML scraping como fallback, e por fim gera dados mockados.

### 🎨 Personalização Visual
- **Background**: cor sólida, gradiente (com ângulo ajustável) ou transparente
- **Card**: cor de fundo, borda (cor, largura, arredondamento), sombra (suave a máxima), padding
- **Blur** no fundo para efeito glassmorphism
- **Grid** para alinhamento preciso
- **Zoom** de 25% a 200%
- **Temas**: claro, escuro ou automático

### 📸 Exportação em Alta Resolução
- **Formatos**: PNG, JPG, WEBP
- **Escalas**: 1x (HD), 2x (2K), 4K (4x), 8K (8x)
- **Fundo transparente** (PNG e WEBP)
- Usa **SVG foreignObject** (`dom-to-image-more`) para renderização perfeita — sem bugs de alinhamento ou fontes
- Fontes nativas do sistema para máxima qualidade (San Francisco no Mac, Segoe UI no Windows)

### 🎯 Templates Prontos
9 templates de um clique para começar rápido:

| Template | Descrição |
|----------|-----------|
| Comentário Simples | Básico sem destaques |
| Comentário Viral | Milhares de likes |
| Comentário Respondido | Com respostas |
| Comentário Fixado | 📌 Fixado pelo criador |
| Comentário do Criador | Badge de criador |
| Comentário com Coração | ❤️ Criador curtiu |
| Comentário de Membro | Membro do canal |
| Comentário Longo | Texto extenso |
| Comentário Curto | Resposta rápida |

### ⌨️ Atalhos de Teclado
| Atalho | Ação |
|--------|------|
| `Ctrl+Z` | Desfazer |
| `Ctrl+Shift+Z` / `Ctrl+Z` (segunda) | Refazer |
| `Ctrl+S` | Salvar |
| `Ctrl+C` (fora de inputs) | Copiar configuração |
| `Delete` / `Backspace` (fora de inputs) | Resetar |
| `Espaço + Arrastar` | Navegar (pan) no canvas |
| `Ctrl + Roda do Mouse` | Zoom |

### 🧩 Extras
- **Histórico ilimitado** com desfazer/refazer (até 50 ações)
- **Painéis retráteis** para máximo espaço de edição
- **Preview em tempo real** com animações suaves (Framer Motion)
- **Auto-save** no localStorage
- **Modo mobile** responsivo
- **Copiar configuração** como JSON para compartilhar
- **Toast notifications** para feedback visual

<br />

## 🚀 Começando

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/MaelllDev/YouTubeCS.git
cd youtube-comment-studio

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

### 🔑 Configurar YouTube API Key (opcional)

Para buscar dados reais do YouTube (nomes, fotos e selo de verificação):

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Crie um projeto e ative a **YouTube Data API v3**
3. Crie uma chave de API (sem restrições ou com restrição HTTP)
4. No Studio, clique no ícone 🔑 ao lado da barra de busca e cole a chave

Sem a chave, o sistema busca via RSS e HTML scraping (nome do canal sempre, foto quando disponível).

<br />

## 🏗️ Arquitetura

```
src/
├── components/
│   ├── CommentEditor.tsx    # Painel de edição do comentário
│   ├── CanvasArea.tsx       # Canvas com zoom, pan e grid
│   ├── YouTubeComment.tsx   # Componente do comentário (renderização)
│   ├── SidebarRight.tsx     # Configurações visuais (cores, bordas, etc.)
│   ├── ExportDialog.tsx     # Diálogo de exportação com preview
│   └── TemplateSelector.tsx # Seletor de templates
├── hooks/
│   ├── useCommentStore.ts   # Estado global + histórico (undo/redo)
│   └── useKeyboardShortcuts.ts
├── services/
│   └── mockChannelService.ts # Busca de canais (cascata: API → RSS → HTML)
├── types/
│   └── index.ts             # Tipos TypeScript + constantes
├── utils/
│   └── index.ts             # Utilitários (formatação, parse, download)
├── App.tsx                  # Layout principal com painéis
├── main.tsx                 # Entry point
└── index.css                # Estilos globais + Tailwind
```

### 🔄 Fluxo de Busca de Canais

```
Input do usuário (URL, @handle, nome)
         │
         ▼
    ┌─────────────┐
    │  Tentativa 1 │  YouTube Data API v3 (se tem API Key)
    └──────┬──────┘
           │ falha
           ▼
    ┌─────────────┐
    │  Tentativa 2 │  Feed RSS (youtube.com/feeds/videos.xml)
    └──────┬──────┘
           │ falha
           ▼
    ┌─────────────┐
    │  Tentativa 3 │  HTML Scraping (youtube.com/@handle/about)
    └──────┬──────┘
           │ falha
           ▼
    ┌─────────────┐
    │  Fallback   │  Dados mockados / gerados
    └─────────────┘
```

Todas as requisições têm **timeout de 5 segundos** via `AbortController`.

<br />

## 🧪 Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (porta 3000) |
| `npm run build` | Build de produção (TypeScript + Vite) |
| `npm run preview` | Preview do build |
| `npm run lint` | Lint com oxlint |

<br />

## 🛠️ Tecnologias

| Tecnologia | Versão | Para quê |
|------------|--------|----------|
| [React](https://react.dev) | 19 | Interface de usuário |
| [TypeScript](https://www.typescriptlang.org) | 6 | Tipagem estática |
| [Vite](https://vitejs.dev) | 8 | Build e dev server |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Estilização utilitária |
| [Framer Motion](https://www.framer.com/motion) | 12 | Animações e transições |
| [Lucide React](https://lucide.dev) | 1 | Ícones |
| [dom-to-image-more](https://github.com/1904labs/dom-to-image-more) | 3 | Exportação via SVG foreignObject |

<br />

## 👨‍💻 Autor

Feito com ❤️ por **MaellDev**

[![GitHub](https://img.shields.io/badge/GitHub-MaellDev-181717?style=flat-square&logo=github)](https://github.com/MaelllDev)

<br />

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
