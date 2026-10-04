# Novo utilitário: Gerador de Documentação Markdown + Site Docsify para Workspaces Deno

> **Nota de integração**: Este prompt descreve **apenas o comportamento e as responsabilidades da Engine**. O CLI usará o Cliffy e apenas invoca a Engine passando um objeto de opções tipado. Não assuma nenhuma estrutura de diretórios, nomes de arquivos ou organização de projeto — adapte-se à estrutura existente.

> deverá **perguntar ou inferir** a estrutura atual antes de criar arquivos, e que deve entregar **apenas a Engine** (mais tipos, testes e um snippet de integração), sem reorganizar o projeto e a opção Cli como temos com os outros utilitários. A geração do Docsify deve ser tratada como um **módulo separado e opt-in**, uma opção adicional além da geração dos markdown de documentação, nunca acoplado à lógica de extração de documentação.

> para este novo utilitário também teremso um arquivo de configuração .jsonc que será utilizado para gerar a documentação, assim como temos os configs jsonc dos outros utilitários

---

## 🎯 Objetivo

Criar uma **Engine** (módulo TypeScript puro, sem CLI próprio) que:

1. Recebe um objeto de opções tipado (definido pelo CLI que vai usar o Cliffy).
2. Lê um `deno.jsonc` (ou `deno.json`) de um **monorepo/workspace Deno**.
3. Descobre todos os módulos **internos do workspace** (membros declarados em `workspace` e/ou entradas em `exports`).
4. Usa **`@deno/doc`** (JSR) para extrair a documentação, deixando a biblioteca resolver automaticamente a cadeia de imports/exports.
5. Filtra para manter **apenas símbolos públicos internos**.
6. Gera artefatos **Markdown** organizados, prontos para blog/site estático.
7. **Opcionalmente** gera um **site estático completo com Docsify** (HTML + assets + config), consumindo os Markdown gerados.
8. Retorna um resultado estruturado (paths gerados, contadores, avisos) para o CLI exibir.

**A Engine não deve**:
- Parsear `Deno.args` nem interagir com o terminal.
- Fazer `console.log` de UI (use um logger injetável ou retorne dados).
- Assumir estrutura de pastas do projeto — todos os caminhos vêm das opções.

---

## 🛠️ Stack Técnica Obrigatória

| Dependência | Uso |
|-------------|-----|
| **`@deno/doc`** (JSR) | Extração de `DocNode`s via `doc()` |
| **`@std/jsonc`** (JSR) | Parse do `deno.jsonc` |
| **`@std/path`** (JSR) | `resolve`, `toFileUrl`, `fromFileUrl`, `relative`, `join` |
| **`@std/fs`** (JSR) | `walk`, `expandGlob`, `ensureDir` para varredura |
| **`@std/front-matter`** (JSR, opcional) | Frontmatter YAML |
| **`@std/collections`** (JSR) | `groupBy`, `sortBy` |

**Não use** Node.js, `npm:` packages, nem dependências fora do ecossistema Deno/JSR. Se o projeto já tiver um logger ou abstração de FS, **prefira injetá-los** em vez de usar `Deno.*` diretamente.

**Para o Docsify**: use **CDN** (jsDelivr/unpkg). Não baixe arquivos locais — o `index.html` deve referenciar as URLs públicas.

---

## 📐 Contrato da Engine

### Assinatura sugerida mas adaptar ao estilo já existente nos outros utilitários

```ts
export interface DocgenOptions {
  /** Caminho do deno.jsonc raiz (padrão: "deno.jsonc" no cwd). */
  configPath?: string;
  /** Diretório de saída para os .md (obrigatório). */
  outDir: string;
  /** Formato dos arquivos de conteúdo. */
  format?: "markdown" | "mdx";
  /** Inclui símbolos marcados com @internal. */
  includePrivate?: boolean;
  /** Emite blocos de @example. */
  includeExamples?: boolean;
  /** Gera diagrama Mermaid de dependências internas. */
  includeArchitecture?: boolean;
  /** Gera sidebar/TOC global. */
  includeSidebar?: boolean;
  /** Nível de log. */
  verbosity?: "silent" | "info" | "verbose";
  /** Logger injetável (default: no-op). */
  logger?: Logger;
  /** Abstração de FS injetável (default: Deno.*). */ 
  fs?: FsAdapter; // AVALIAR SE É REALMENTE NECESSÀRIO POIS VAMOS USAR APENAS O DENO MESMO

  /** ---- Configurações do site Docsify (opcional) ---- */
  docsify?: DocsifyOptions;
}

export interface DocsifyOptions {
  /** Habilita a geração do site estático. */
  enabled: true;
  /** Título exibido na navbar e no <title>. */
  title: string;
  /** Nome do site (usado no cabeçalho). */
  name?: string;
  /** Descrição (meta description). */
  description?: string;
  /** Nome do arquivo principal de conteúdo. */
  homepage?: string; // default: "README.md"
  /** Arquivo de sidebar. */
  sidebar?: string; // default: "_sidebar.md"
  /** Arquivo de navbar (opcional). */
  navbar?: string; // default: "_navbar.md"
  /** Arquivo de coverpage (opcional). */
  coverpage?: string; // default: "_coverpage.md"
  /** Tema visual. */
  theme?: "vue" | "dark" | "buble" | "pure";
  /** Ativa busca no texto. */
  search?: boolean; // default: true
  /** Ativa paginação (prev/next). */
  pagination?: boolean; // default: true
  /** Ativa botão "copiar código". */
  copyCode?: boolean; // default: true
  /** Ativa suporte a Mermaid nos .md. */
  mermaid?: boolean; // default: false
  /** Ativa modo escuro toggle. */
  darkModeToggle?: boolean; // default: true
  /** ID do Google Analytics (opcional). */
  ga?: string;
  /** Plugin "edit on GitHub" (opcional). */
  repo?: { url: string; branch?: string; path?: string };
  /** Subdiretório onde os assets extras serão salvos (relativo ao outDir). */
  assetsDir?: string; // default: "_assets"
}

export interface DocgenResult {
  /** Arquivos gerados, com metadados. */
  generated: Array<{
    path: string;
    kind: "readme" | "api" | "sidebar" | "navbar" | "coverpage" | "architecture" | "docsify-html" | "docsify-asset";
    bytes: number;
  }>;
  /** Contadores de filtragem. */
  stats: {
    filesScanned: number;
    filesInternal: number;
    nodesTotal: number;
    nodesKept: number;
    nodesDroppedExternal: number;
    nodesDroppedInternal: number;
    nodesDroppedNoDoc: number;
  };
  /** Avisos não fatais. */
  warnings: string[];
}

export async function runDocgen(options: DocgenOptions): Promise<DocgenResult>;
```

**Regras do contrato**:
- Nunca lançar erro por falta de JSDoc — apenas registrar em `warnings`.
- Erros fatais (config inválido, permissão negada, `outDir` inacessível, `docsify.enabled` sem `title`) devem lançar exceções tipadas.
- O retorno deve ser serializável (o CLI pode imprimir como JSON com `--json`).
- Todas as operações de FS passam pelo `fs` injetado, permitindo testes com FS em memória. Mas avalie se é necessário termos realmente esta opção pois estaremos usando o DENO sempre, seria necessário apenas para testes ?
- **A geração do Docsify é opt-in**: só roda se `options.docsify?.enabled === true`.

---

## 🔍 Comportamento Detalhado

### 1. Leitura do `deno.jsonc`
- Parse via `@std/jsonc`.
- Extraia: `workspace`, `exports`, `imports`, `name`, `version`.
- Suporte a membros com `deno.jsonc` próprio (herança leve).
- Se `workspace` estiver ausente, trate o pacote raiz como único membro.

### 2. Descoberta do workspace
- Para cada membro, use `walk` para coletar **todos os `.ts`/`.tsx` internos**.
- Exclua sempre: `node_modules`, `.git`, `dist`, `build`, `coverage`, `vendor`, `.deno`, `outDir`.
- Normalize caminhos para `file://` URLs antes de passar ao `doc()`.

### 3. Extração via `@deno/doc`
- Chame `await doc(fileUrls, { includeAll: false })`.
- Passe todos os arquivos internos de uma vez — a lib resolve o grafo.
- **Permissões** necessárias em runtime: `--allow-read` e `--allow-import` (ou `--allow-net` quando houver fontes remotas referenciadas internamente).

### 4. Filtragem (etapa crítica)

Para cada `DocNode` no `Record<string, DocNode[]>`:

**Manter apenas se**:
- A chave do Record é um caminho `file://` **dentro de um diretório de membro do workspace**.
- `node.declarationKind === "export"`.
- O JSDoc **não contém** `@internal` nem `@ignore`.
- Se `includePrivate === false`, aplicar a regra acima estritamente.

**Descartar e contabilizar**:
- URLs `jsr:`, `npm:`, `https://`, `node:`, `data:` → `nodesDroppedExternal`.
- Arquivos internos com símbolos não exportados → `nodesDroppedInternal`.
- Símbolos sem JSDoc (quando política exigir) → `nodesDroppedNoDoc`.

### 5. Artefatos Markdown a gerar

#### A) `README.md` (raiz da doc)
- Título do pacote + versão.
- Descrição do JSDoc `@module`/`@packageDocumentation` do `mod.ts`.
- Instalação (`deno add jsr:@escopo/pacote` quando `name` disponível).
- **Quick Start**: primeiros `@example` dos símbolos mais referenciados internamente.
- Link para o índice.

#### B) `api/<slug-do-modulo>.md`
Um por arquivo interno com ≥ 1 símbolo mantido. Estrutura:

```markdown
---
title: <nome do módulo>
description: <primeira linha do JSDoc do módulo>
---

# <nome do módulo>

<descrição completa do JSDoc do módulo>

## Índice
- [Funções](#funções)
- [Classes](#classes)
- [Interfaces](#interfaces)
- [Tipos](#tipos)
- [Constantes](#constantes)

## Funções

### `nomeDaFuncao`

> <primeira linha do JSDoc>

**Assinatura:**
```ts
<assinatura reconstruída de functionDef>
```

**Parâmetros:**

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|

**Retorno:** `<tipo>` — <descrição de @returns>

**Lança:** <erros de @throws>

**Exemplo:**
```ts
<@example>
```

**Desde:** `<@since>` · **Veja também:** `<@see>`
```

Repita para `Classes`, `Interfaces`, `TypeAliases`, `Variables`, `Enums`.

#### C) `_sidebar.md` (TOC global)
- Árvore: pacote → módulo → símbolos agrupados por `kind`.
- Emojis discretos: 🔧 Funções · 🏛️ Classes · 📐 Tipos · 🔢 Constantes.
- Links relativos entre os `.md`.
- Sintaxe **específica do Docsify** (`- [texto](caminho.md)`), mas legível também em outros renderizadores.

#### D) `_navbar.md` (opcional)
- Só gerar se `docsify.navbar` estiver definido **ou** `docsify.repo` estiver presente.
- Links: Home, API, Repositório (se `repo`), versão.

#### E) `_coverpage.md` (opcional)
- Só gerar se `docsify.coverpage` estiver definido **ou** `docsify.name` + `docsify.description` estiverem presentes.
- Estrutura: título grande, subtítulo, botão "Começar" apontando para `#/<homepage>`.

#### F) `architecture.md` (opcional)
- Diagrama Mermaid `graph LR` com dependências **internas**.
- Arestas extraídas dos imports entre arquivos internos.
- Ignore qualquer aresta para módulos externos.
- **Importante**: se `docsify.mermaid === true`, o Mermaid será renderizado no site automaticamente; caso contrário, permanece como bloco de código.

### 6. Geração do site Docsify (opt-in)

Quando `options.docsify?.enabled === true`, a Engine também gera:

#### G) `index.html` (na raiz de `outDir`)
Template com:
- `<!DOCTYPE html>` + `<html lang="pt-BR">`
- `<meta charset>`, `<meta name="viewport">`, `<meta name="description">` (de `docsify.description`)
- `<title>` = `docsify.title`
- CSS do tema escolhido via CDN:
  - Base: `https://cdn.jsdelivr.net/npm/docsify@4/lib/themes/<theme>.css`
  - Se `theme === "vue"`, é o padrão; para `dark`, `buble`, `pure`, usar os respectivos caminhos.
- CSS customizado mínimo (inline `<style>`) para:
  - Ajustar largura da sidebar se necessário.
  - Variáveis CSS do Docsify sobrescrevíveis: `--theme-color`, `--sidebar-width`, `--content-max-width`.
  - Estilo do botão de dark mode toggle (se habilitado).
- Script de configuração `window.$docsify = { ... }` com:
  - `name`, `repo` (se definido), `loadSidebar: true`, `loadNavbar: true/false`, `coverpage: true/false`, `homepage: docsify.homepage`, `subMaxLevel: 3`, `search: docsify.search ? { ... } : false`, `pagination: docsify.pagination`, `copyCode: docsify.copyCode`, `darkModeToggle: docsify.darkModeToggle`.
- CDN scripts (na ordem correta):
  1. `docsify@4` (core)
  2. `docsify@4/lib/plugins/search.min.js` (se `search`)
  3. `docsify@4/lib/plugins/pagination.min.js` (se `pagination`)
  4. `docsify-copy-code` (se `copyCode`)
  5. `docsify-darklight-theme` (se `darkModeToggle`)
  6. `docsify-mermaid` (se `mermaid`)
  7. Google Analytics (se `ga`)
- Fallback `<noscript>` com aviso e link para o repositório (boa prática de acessibilidade).

#### H) Assets extras (opcional)
- Se `docsify.assetsDir` for definido, gerar:
  - `_assets/custom.css` (sobrescritas do usuário — vazio por padrão, com comentários).
  - `_assets/favicon.ico` **não gerar** — apenas referenciar se existir em `outDir`.
- Sempre referenciar via caminhos relativos.

#### I) `.nojekyll` (vazio)
- Para evitar que GitHub Pages ignore arquivos começando com `_` (`_sidebar.md`, `_navbar.md`, etc.).

### 7. Ordem de execução
1. Ler config.
2. Descobrir workspace.
3. Extrair + filtrar (via `@deno/doc`).
4. Gerar Markdown (README, api/*.md, sidebar, navbar, coverpage, architecture).
5. Se `docsify.enabled`, gerar `index.html`, `.nojekyll` e assets.
6. Retornar `DocgenResult`.

---

## 📋 Regras de Formatação

- **Idioma**: Markdown em pt-BR, termos técnicos em inglês quando consagrados.
- **Títulos**: `#` módulo, `##` categoria, `###` símbolo.
- **Código**: sempre com linguagem explícita (` ```ts `).
- **Links**: relativos entre `.md`.
- **IDs de âncora**: slugify simples (minúsculas, hífens).
- **Não duplicar** o código-fonte; apenas assinaturas e `@example`.
- Símbolo sem JSDoc: entrada mínima com `> ⚠️ Sem documentação.` (a menos que `--check`).
- Saída determinística: ordem alfabética dentro de cada `kind`, ordem fixa de categorias (Funções, Classes, Interfaces, Tipos, Constantes, Enums) para diffs estáveis em Git.
- **Frontmatter YAML** apenas em `README.md` e `api/*.md` — nos arquivos `_sidebar.md`, `_navbar.md`, `_coverpage.md` e `index.html` **não** usar frontmatter.

---

## ⚙️ Opções da Engine (já mapeadas ao CLI existente)

| Opção | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `configPath` | string | `./deno.jsonc` | Caminho do config |
| `outDir` | string | — | Diretório de saída |
| `format` | `"markdown" \| "mdx"` | `"markdown"` | Formato |
| `includePrivate` | boolean | `false` | Inclui `@internal` |
| `includeExamples` | boolean | `true` | Emite `@example` |
| `includeArchitecture` | boolean | `false` | Gera Mermaid |
| `includeSidebar` | boolean | `true` | Gera sidebar |
| `verbosity` | `"silent" \| "info" \| "verbose"` | `"info"` | Log |
| `logger` | `Logger` | no-op | Injetável |
| `fs` | `FsAdapter` | `Deno.*` | Injetável |
| `docsify` | `DocsifyOptions \| undefined` | `undefined` | Config do site |

**O CLI (Cliffy) já existente** é responsável por:
- Declarar essas opções como flags (`--docsify`, `--docsify-title`, `--docsify-theme`, etc.).
- Validar antes de chamar `runDocgen`.
- Formatar `DocgenResult` para o usuário (`--json`, tabelas, etc.).
- Retornar exit codes apropriados.

A Engine **não deve** saber da existência do Cliffy.

---

## ✅ Critérios de Aceite

1. Em workspace com 2+ membros, gera `.md` **apenas** para símbolos públicos internos.
2. `@internal` **não aparece** no output.
3. Módulos externos (`jsr:`, `npm:`, URLs) **não aparecem**.
4. Cada `.md` de módulo contém assinatura, parâmetros, retorno e exemplo (quando no JSDoc).
5. `_sidebar.md` reflete a hierarquia real do workspace.
6. `architecture.md` contém Mermaid renderizável no GitHub.
7. `deno check` passa sem erros de tipo.
8. `runDocgen` é testável com FS em memória — nenhum acesso direto a `Deno.*` fora do adaptador padrão.
9. Saída é determinística: rodar duas vezes gera arquivos byte-a-byte idênticos.
10. **Com `docsify.enabled: true`**, o `index.html` gerado abre corretamente em `file://` ou servidor estático simples (ex.: `deno run -A jsr:@std/http/file-server`), carregando sidebar, navbar (se habilitada), busca (se habilitada) e conteúdo.
11. **Com `docsify.mermaid: true` e `includeArchitecture: true`**, o diagrama em `architecture.md` renderiza no site.
12. **`.nojekyll`** é sempre gerado quando `docsify.enabled: true`, para compatibilidade com GitHub Pages.

---

## 📚 Recursos de Referência

- `@deno/doc` — `jsr:@deno/doc` (`doc()`, `DocNode`, `DocNodeKind`)
- `@std/jsonc`, `@std/path`, `@std/fs`, `@std/collections`
- JSDoc: `@param`, `@returns`, `@throws`, `@example`, `@since`, `@deprecated`, `@see`, `@internal`, `@module`, `@packageDocumentation`
- **Docsify** — config oficial: `https://docsify.js.org/#/configuration`
- Plugins Docsify úteis: `docsify-copy-code`, `docsify-pagination`, `docsify-darklight-theme`, `docsify-mermaid`

---

## 🧭 Princípios de Design

1. **Engine pura e testável**: sem I/O direto fora do adaptador; sem dependência do CLI.
2. **Filtragem auditável**: `--verbose` expõe contadores de mantidos/descartados e motivos.
3. **Markdown estável**: saída determinística para diffs limpos.
4. **Extensível**: camada de formatação permite novos formatos (MDX, JSON) sem tocar na extração.
5. **Sem dependências fora do JSR/Deno std**.
6. **Docsify opt-in e via CDN**: nada de arquivos locais do Docsify no repositório; o `index.html` deve funcionar sozinho com um `outDir` publicado em qualquer host estático (GitHub Pages, Netlify, Cloudflare Pages, Deno Deploy).
7. **Deploy-friendly**: a estrutura gerada em `outDir` deve ser publicável como está, sem build adicional.

---

## 📦 Entregáveis

1. Código da Engine completo, organizado internamente conforme convenção do projeto existente (não imponha estrutura — pergunte ou adapte).
2. Tipos exportados: `DocgenOptions`, `DocsifyOptions`, `DocgenResult`, `Logger`, `FsAdapter`, erros tipados.
3. Testes unitários com FS em memória para as etapas: descoberta, filtragem, formatação Markdown, geração do `index.html` do Docsify.
4. Um exemplo mínimo de invocação a partir do CLI existente (só para ilustrar a integração — sem alterar o CLI).
5. Um `README.md` de exemplo gerado com `docsify.enabled: true`, mostrando a estrutura final de `outDir`:
   ```
   outDir/
   ├── index.html
   ├── .nojekyll
   ├── README.md
   ├── _sidebar.md
   ├── _navbar.md
   ├── _coverpage.md
   ├── architecture.md
   └── api/
       ├── core.md
       └── utils.md
   ```

---

