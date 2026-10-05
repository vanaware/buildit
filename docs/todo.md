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

# Adendo ao Prompt: Funcionalidades Avançadas de Documentação (com Priorização)

> **Como usar**: este adendo **complementa** o prompt anterior da Engine. Ele deve ser entregue à IA **junto** com o prompt principal. O prompt principal define a base (extração via `@deno/doc`, filtragem, geração Markdown + Docsify). Este adendo define **funcionalidades avançadas** que elevam a qualidade da documentação, com **priorização explícita** para orientar a ordem de implementação.

---

## 🎯 Objetivo do Adendo

Adicionar à Engine um conjunto de funcionalidades inspiradas em ferramentas maduras do ecossistema (TypeDoc, Documentation.js, API Extractor, RSPress) que transformam a saída de "dump de JSDoc" em **documentação navegável, auditável e versionável**.

As funcionalidades estão divididas em **três tiers de prioridade**:
- **P0 (Must-have)**: implementar na v1 da Engine.
- **P1 (Should-have)**: implementar logo após a v1 estabilizar.
- **P2 (Nice-to-have)**: incrementos futuros, sem bloquear releases.

Cada funcionalidade é descrita com: **o que é**, **por que importa**, **como implementar** e **critérios de aceite**.

---

## 🥇 Prioridade P0 — Implementar na v1

Estas três funcionalidades têm o maior impacto na experiência de leitura e são o **diferencial** da Engine em relação a um simples gerador de Markdown.

### P0.1 — Cross-Links Automáticos entre Símbolos Internos

**O que é**: em assinaturas como `parseConfig(input: string): Config`, transformar `Config` em um link clicável para a própria definição, sempre que o símbolo for interno e público.

**Por que importa**: é o recurso que mais melhora a leitura. Sem ele, o leitor precisa buscar manualmente cada tipo referenciado. Ferramentas como `rspress-plugin-api-extractor` fazem isso nativamente.

**Como implementar**:
1. **Construir um índice de símbolos** antes de renderizar qualquer Markdown:
   ```ts
   interface SymbolIndex {
     byName: Map<string, { url: string; anchor: string; kind: DocNodeKind }>;
     byFile: Map<string, SymbolIndexEntry[]>;
   }
   ```
   Percorra todos os `DocNode`s mantidos após a filtragem e popule o mapa com chave = `node.name`.
2. **Criar um renderizador de tipos**: função `renderTypeRef(typeRef, index): string` que, dado um tipo (via `node.functionDef.params[].tsType` ou `node.variableDef.tsType`), percorra recursivamente a estrutura e substitua nomes que existam no índice por `[`Nome`](url#anchor)`.
3. **Aplicar em**:
   - Bloco **Assinatura** de cada função/método.
   - Tabela **Parâmetros** (coluna "Tipo").
   - Campo **Retorno**.
   - Campo **Lança** (`@throws`).
   - Assinatura de propriedades de classes e interfaces.
4. **Também aplicar dentro do texto do JSDoc**: detectar `{@link Nome}` e transformar em link; detectar `` `Nome` `` (código inline) quando `Nome` existir no índice — este último é opcional, mas muito útil.

**Critérios de aceite**:
- Dado `parseConfig(input: string): Config`, o `.md` gerado contém `[`Config`](api/types.md#config)`.
- Tipos genéricos aninhados (`Promise<Config>`, `Record<string, Config>`) também são resolvidos.
- Tipos externos (`string`, `Promise`, `Record`) **não** viram links.
- Se um tipo for interno mas **não** estiver documentado (sem JSDoc), ainda vira link para a âncora (que mostrará "⚠️ Sem documentação").

---

### P0.2 — Relatório de Superfície de API (`_api-surface.md`)

**O que é**: um arquivo Markdown que lista **apenas as assinaturas** de todos os símbolos públicos internos, em ordem determinística, sem descrições. Serve como "contrato visual" da API.

**Por que importa**: inspirado no `api.md` do API Extractor da Microsoft. Commitado no Git, qualquer diff em PR sinaliza **possível breaking change**. É a defesa mais barata contra quebras acidentais.

**Como implementar**:
1. Novo módulo `markdown/api-surface.ts`.
2. Estrutura do arquivo:
   ```markdown
   # Superfície de API

   > **Aviso**: este arquivo é gerado automaticamente. Não edite manualmente.
   > Diferenças neste arquivo entre commits indicam mudanças na API pública.
   
   Versão: 1.4.2
   Gerado em: 2026-10-04T12:00:00Z
   Hash do conteúdo: `abc123...`

   ## `@meu-pacote/core`

   ### Funções
   - `parseConfig(input: string, options?: ParseOptions): Config`
   - `resolvePath(base: string, ...segments: string[]): string`

   ### Classes
   - `class DocumentBuilder implements Builder`
     - `constructor(options: BuilderOptions)`
     - `build(): Document`
     - `reset(): void`

   ### Tipos
   - `interface ParseOptions { strict: boolean; encoding: string }`
   - `type Config = { name: string; version: string }`
   ```
3. **Determinismo absoluto**: ordenar por `kind` (ordem fixa), depois alfabético por nome, depois por assinatura.
4. **Hash de conteúdo**: calcular SHA-256 do bloco de assinaturas e incluir no topo. Útil para detectar mudanças sem diff linha-a-linha.
5. **Não incluir descrições, exemplos, ou tags** — apenas a superfície.

**Critérios de aceite**:
- O arquivo é gerado sempre que `runDocgen` é executado (a menos que `--no-api-surface` seja passado).
- Rodar duas vezes produz o mesmo hash.
- Adicionar um parâmetro em uma função pública muda o hash e gera diff visível.

---

### P0.3 — Relatório de Cobertura de Documentação (`_coverage.md`)

**O que é**: um arquivo Markdown com uma tabela por módulo, mostrando quantos símbolos públicos internos possuem JSDoc completo.

**Por que importa**: dá **visibilidade objetiva** do estado da doc. Permite priorizar onde escrever JSDoc. Em CI, pode falhar o build se a cobertura cair.

**Como implementar**:
1. Novo módulo `markdown/coverage.ts`.
2. **Definição de "documentado"**: um símbolo é considerado documentado se:
   - Tem `jsDoc.doc` não vazio, **e**
   - Se for função/método, tem `@param` para cada parâmetro **e** `@returns` (quando o retorno não for `void`/`undefined`).
3. **Cálculo por módulo**:
   ```ts
   interface CoverageRow {
     module: string;      // caminho relativo
     symbols: number;     // total público interno
     documented: number;  // com JSDoc completo
     percentage: number;  // documentado / total * 100
   }
   ```
4. **Estrutura do `_coverage.md`**:
   ```markdown
   # Cobertura de Documentação

   | Módulo | Símbolos | Documentados | Cobertura |
   |--------|----------|--------------|-----------|
   | api/core.ts | 12 | 10 | 🟢 83% |
   | api/utils.ts | 8 | 3 | 🔴 37% |
   | api/types.ts | 5 | 5 | 🟢 100% |
   | **Total** | **25** | **18** | **🟢 72%** |

   ## Símbolos sem documentação

   - 🔴 `api/utils.ts` → `internalHelper`, `parseRaw`, ...
   ```
5. **Faixas de cor**:
   - 🟢 ≥ 90%
   - 🟡 70–89%
   - 🟠 50–69%
   - 🔴 < 50%
6. **Modo `--check`**: se `options.checkThreshold` for definido (ex.: `80`), `runDocgen` lança erro tipado quando a cobertura total ficar abaixo. Exit code não-zero para CI.

**Critérios de aceite**:
- A tabela reflete corretamente os símbolos mantidos após a filtragem.
- Símbolos com `@internal` **não** contam na cobertura (já são excluídos antes).
- `--check --check-threshold 80` falha se cobertura < 80%.

---

## 🥈 Prioridade P1 — Implementar após v1

Estas funcionalidades são incrementais e não bloqueiam a v1, mas agregam muito valor.

### P1.1 — Links para o Código-Fonte

**O que é**: cada símbolo ganha um link direto para a linha exata no GitHub/GitLab/Bitbucket.

**Como implementar**:
1. Adicionar `DocsifyOptions.repo` já prever `url`, `branch`, `path`.
2. Estender `DocgenOptions` com:
   ```ts
   sourceLinks?: {
     provider: "github" | "gitlab" | "bitbucket" | "custom";
     baseUrl: string;   // ex.: "https://github.com/org/repo"
     branch?: string;   // default: "main"
     lineTemplate?: string; // default depende do provider
   };
   ```
3. Templates padrão:
   - GitHub: `{baseUrl}/blob/{branch}/{path}#L{line}`
   - GitLab: `{baseUrl}/-/blob/{branch}/{path}#L{line}`
   - Bitbucket: `{baseUrl}/src/{branch}/{path}#lines-{line}`
4. Renderizar como: `[📄 ver código-fonte](url)` ao final do bloco de cada símbolo.

**Critérios de aceite**:
- Se `sourceLinks` estiver configurado, todo símbolo mantido tem link.
- O link usa `location.filename` (convertido para caminho relativo à raiz do repo) e `location.line`.

---

### P1.2 — Badges de Status (`@since`, `@deprecated`, `@experimental`)

**O que é**: transformar tags JSDoc em badges visuais no topo de cada símbolo.

**Como implementar**:
1. Extrair de `node.jsDoc.tags`: `@since`, `@deprecated`, `@experimental`, `@beta`, `@alpha`.
2. Renderizar:
   - `@since 1.2.0` → `> ![since](https://img.shields.io/badge/since-1.2.0-blue)`
   - `@deprecated Use parseConfigV2 em vez disso` → `> ⚠️ **Depreciado**. Use [`parseConfigV2`](#parseconfigv2).` (detectar nomes de símbolos no texto via SymbolIndex e transformar em link)
   - `@experimental` → `> 🧪 **Experimental** — API sujeita a mudanças.`
   - `@beta` → `> 🔶 **Beta**`
3. Ordem: badges em uma única linha no topo, antes da descrição.

**Critérios de aceite**:
- Símbolos marcados com essas tags mostram os badges correspondentes.
- Texto do `@deprecated` passa pelo mesmo mecanismo de cross-links do P0.1.

---

### P1.3 — TOC Local por Página

**O que é**: no topo de cada `api/<modulo>.md`, um índice com links âncora para cada símbolo daquele módulo.

**Como implementar**:
1. Reaproveitar o índice já construído para `_sidebar.md`.
2. Estrutura:
   ```markdown
   ## Índice
   - 🔧 [parseConfig](#parseconfig)
   - 🔧 [resolvePath](#resolvepath)
   - 🏛️ [DocumentBuilder](#documentbuilder)
   - 📐 [Config](#config)
   ```
3. Ordem idêntica à do corpo do arquivo.

**Critérios de aceite**:
- Todo `api/*.md` começa com TOC.
- Âncoras batem com os headings gerados.

---

### P1.4 — Agrupamento por `@category`

**O que é**: permitir que o autor agrupe símbolos semanticamente (ex.: "Configuração", "Parsers") via tag customizada `@category`, em vez de sempre agrupar por `kind`.

**Como implementar**:
1. Ler `@category` de `node.jsDoc.tags`.
2. Se **ao menos um** símbolo do módulo tiver `@category`, agrupar todos por categoria (símbolos sem `@category` vão para "Outros").
3. Se **nenhum** tiver, manter agrupamento por `kind` (comportamento atual).
4. Refletir no TOC e na sidebar.

**Critérios de aceite**:
- Módulos sem `@category` mantêm o comportamento antigo.
- Módulos com `@category` agrupam conforme especificado.

---

### P1.5 — Link "Executar no Deno Playground" para Exemplos

**O que é**: para cada bloco `@example`, gerar um link para o Deno Playground com o código pré-preenchido.

**Como implementar**:
1. Detectar `@example` no JSDoc.
2. URL base: `https://dash.deno.com/playground/new` (ou `https://deno.com/playground` conforme disponível).
3. Codificar o exemplo como parâmetro `?code=` (URL-encoded, base64).
4. Renderizar: `[▶️ Executar no Deno Playground](url)`.

**Critérios de aceite**:
- Cada `@example` gera o botão quando `DocsifyOptions.denoPlayground !== false`.
- O link abre o playground com o código correto.

---

## 🥉 Prioridade P2 — Incrementos Futuros

Funcionalidades valiosas, mas que podem aguardar feedback da v1.

### P2.1 — Índice de Busca Pré-gerado (`search-index.json`)

**O que é**: um JSON com `{ title, description, url, kind, tags, params }` para cada símbolo, consumível por plugins de busca.

**Por que P2**: Docsify já tem busca client-side via `docsify-search` que funciona bem para bases pequenas. Só vale a pena o índice pré-gerado em bases grandes (>500 símbolos) ou quando quiser busca por parâmetros/tags.

**Como implementar**:
1. Novo módulo `markdown/search-index.ts`.
2. Extrair de cada `DocNode` mantido: `name`, `kind`, primeira linha do `jsDoc.doc`, `@param` names, `@tags`.
3. Gerar `search-index.json` na raiz de `outDir`.
4. Documentar no README do projeto como plugar no `docsify-search`.

---

### P2.2 — Detecção de Breaking Changes entre Versões

**O que é**: comparar o `_api-surface.md` atual com o de uma versão anterior e listar mudanças.

**Por que P2**: requer manter histórico de `_api-surface.md` versionado. Vale a pena depois que o fluxo de P0.2 estiver maduro.

**Como implementar**:
1. Adicionar `DocgenOptions.previousApiSurface?: string` (caminho do arquivo anterior).
2. Parsear ambos, comparar por nome de símbolo:
   - Símbolo removido → 🔴 breaking.
   - Assinatura alterada → 🔴 breaking (ou 🟡 se apenas parâmetros opcionais adicionados).
   - Símbolo adicionado → 🟢 não-breaking.
3. Gerar `_changelog.md` com a lista.

---

### P2.3 — Twoslash / Hover Tooltips

**O que é**: ao passar o mouse sobre um tipo em um bloco de código, exibir a definição completa.

**Por que P2**: requer integração com Shiki/Monaco e pré-processamento dos blocos de código. Alto custo de implementação, ganho incremental.

**Como implementar** (esboço):
1. Pré-processar cada bloco ```ts``` com `@typescript/twoslash`.
2. Injetar no HTML gerado os atributos `data-*` que o Monaco/Shiki precisa.
3. Carregar o runtime via CDN no `index.html`.

---

### P2.4 — Temas Customizáveis via `_assets/custom.css`

**O que é**: gerar um CSS pré-configurado com variáveis do Docsify para facilitar troca de cores.

**Por que P2**: Docsify já aceita variáveis CSS inline no `index.html`. Um arquivo separado é mais organizado, mas não muda a experiência.

**Como implementar**:
1. Se `docsify.assetsDir` estiver definido, gerar `_assets/custom.css` com variáveis comentadas.
2. Referenciar no `index.html` via `<link>`.

---

### P2.5 — Suporte a MDX

**O que é**: gerar arquivos `.mdx` em vez de `.md`, permitindo componentes interativos em sites como Astro/Next.

**Por que P2**: só faz sentido se o consumidor usar MDX. Docsify não suporta MDX.

**Como implementar**:
1. Adicionar `format: "mdx"`.
2. Trocar extensões e adaptar blocos (ex.: `<Tabs>` em vez de headings).

---

## 📊 Resumo Visual das Prioridades

| # | Funcionalidade | Tier | Impacto | Custo |
|---|----------------|------|---------|-------|
| P0.1 | Cross-links automáticos | **P0** | 🔥🔥🔥 | Médio |
| P0.2 | Superfície de API | **P0** | 🔥🔥🔥 | Baixo |
| P0.3 | Cobertura de documentação | **P0** | 🔥🔥 | Baixo |
| P1.1 | Links para código-fonte | P1 | 🔥🔥 | Baixo |
| P1.2 | Badges de status | P1 | 🔥🔥 | Baixo |
| P1.3 | TOC local | P1 | 🔥 | Baixo |
| P1.4 | Agrupamento por `@category` | P1 | 🔥 | Médio |
| P1.5 | Link Deno Playground | P1 | 🔥 | Baixo |
| P2.1 | Índice de busca | P2 | 🔥 | Médio |
| P2.2 | Detecção de breaking changes | P2 | 🔥🔥 | Alto |
| P2.3 | Twoslash tooltips | P2 | 🔥 | Alto |
| P2.4 | `custom.css` | P2 | 🔥 | Baixo |
| P2.5 | Suporte a MDX | P2 | 🔥 | Médio |

---

## 🔧 Extensões ao Contrato da Engine

Adicionar a `DocgenOptions`:

```ts
export interface DocgenOptions {
  // ... opções do prompt principal ...

  /** Links para código-fonte (P1.1). */
  sourceLinks?: {
    provider: "github" | "gitlab" | "bitbucket" | "custom";
    baseUrl: string;
    branch?: string;
    lineTemplate?: string;
  };

  /** Geração de relatórios extras. */
  reports?: {
    apiSurface?: boolean;   // default: true  (P0.2)
    coverage?: boolean;     // default: true  (P0.3)
    changelog?: boolean;    // default: false (P2.2)
  };

  /** Caminho do _api-surface.md anterior para comparação (P2.2). */
  previousApiSurface?: string;

  /** Threshold mínimo de cobertura em % (P0.3). 0 = sem threshold. */
  checkThreshold?: number;

  /** Habilita botão "Executar no Deno Playground" nos exemplos (P1.5). */
  denoPlayground?: boolean;
}
```

Adicionar a `DocgenResult.generated[].kind`:
- `"api-surface"` (P0.2)
- `"coverage"` (P0.3)
- `"changelog"` (P2.2)
- `"search-index"` (P2.1)

Adicionar a `DocgenResult.stats`:
```ts
coverage: {
  symbolsTotal: number;
  symbolsDocumented: number;
  percentage: number;
};
crossLinks: {
  linksResolved: number;
  linksFailed: number;
};
```

---

## ✅ Critérios de Aceite Globais do Adendo

1. **Todas as funcionalidades P0** estão implementadas e cobertas por testes unitários com FS em memória.
2. **Cross-links (P0.1)** funcionam em assinaturas, tabelas de parâmetros, retorno, `@throws` e `{@link}` no texto.
3. **`_api-surface.md` (P0.2)** é determinístico: hash idêntico entre execuções com a mesma API.
4. **`_coverage.md` (P0.3)** contém tabela por módulo e lista de símbolos não documentados.
5. **`--check --check-threshold N`** retorna exit code não-zero quando cobertura < N.
6. Funcionalidades **P1** podem ser desabilitadas via opções (opt-out).
7. Funcionalidades **P2** são **opt-in** (default: desabilitadas), exceto `custom.css` que é gerado quando `assetsDir` está definido.
8. Nenhuma funcionalidade introduz dependência fora do JSR/Deno std, exceto `@typescript/twoslash` (P2.3), que deve ser **lazy-loaded** apenas quando a feature é ativada.
9. Documentação interna da Engine (README do projeto) explica cada funcionalidade, sua flag correspondente e exemplo de uso.

---

## 🧭 Princípios para Implementação

1. **P0 primeiro, sem exceção**: não avançar para P1 antes de P0 estar estável, testado e documentado.
2. **Opt-in para P2**: tudo que é P2 deve ser desabilitado por padrão, para não inflar a saída de quem não precisa.
3. **Determinismo sempre**: qualquer artefato gerado deve ser byte-a-byte idêntico entre execuções com o mesmo input.
4. **Fail-soft para doc, fail-hard para config**: falta de JSDoc nunca quebra o build; config inválida sempre quebra.
5. **Zero acoplamento ao Docsify**: cross-links, api-surface, coverage e badges devem funcionar mesmo sem `docsify.enabled: true`. O Docsify é apenas um consumidor da saída Markdown.

---

> **Ao usar este adendo**: entregue-o à IA **imediatamente após** o prompt principal. Esclareça que a IA deve implementar **apenas P0** na v1, e deixar P1/P2 como **stubs documentados** ou comentários `TODO` claros no código, para não sobrecarregar a primeira entrega. Peça que a IA **pergunte antes de implementar P1** se houver tempo, e que **nunca implemente P2 sem confirmação explícita**.