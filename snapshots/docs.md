> **INSTRUÇÃO PARA A IA:** 
> O texto abaixo contém a DOCUMENTAÇÃO e diretrizes arquiteturais do projeto.
> Cada arquivo começa com um título indicando seu caminho relativo exato (ex: `## Arquivo: src/main.ts`).
> Sempre que sugerir alterações, indique claramente qual arquivo deve ser modificado com base nesses caminhos e forneça o novo código completo do arquivo.

---

# Contexto Exportado do Projeto BuildIt - Modo: DOCS

Gerado automaticamente em: 2026-09-25T17:27:51.111Z

---

## Arquivo: `.tool-versions`

```tool-versions
deno 2.9.7

```

---

## Arquivo: `docs/api.md`

````md
# 📖 Referência da API e Configurações do BuildIt

Documentação técnica oficial dos utilitários da biblioteca `@vanaware/buildit`. Este guia abrange a **API programática em TypeScript**, **arquitetura de CLI** e **todas as configurações possíveis via arquivos JSONC/JSON** para os 6 utilitários:

1. [⚡ Motor esbuild (`esbuild.jsonc`)](#-1-motor-esbuild-esbuildjsonc) — [Ver Topologia](./topology-esbuild.md)
2. [👀 Motor Watch (`watch.jsonc`)](#-2-motor-watch-watchjsonc) — [Ver Topologia](./topology-watch.md)
3. [📦 Motor Deno.bundle (`denobuild.jsonc`)](#-3-motor-denobundle-denobuildjsonc) — [Ver Topologia](./topology-denobuild.md)
4. [📝 Exportador de Contexto para IA (`export.jsonc`)](#-4-exportador-de-contexto-para-ia-exportjsonc) — [Ver Topologia](./topology-export.md)
5. [🧼 Sanitizador de Versão (`sanitize-version`)](#-5-sanitizador-e-publicador-de-versão-sanitize-version--tag-version) — [Ver Topologia](./topology-sanitize-version.md)
6. [🏷️ Publicador de Versão (`tag-version`)](#-5-sanitizador-e-publicador-de-versão-sanitize-version--tag-version) — [Ver Topologia](./topology-tag-version.md)
7. [💡 Como Usar os Schemas no Editor ($schema)](#-6-como-usar-os-schemas-no-editor-schema)
8. [🛠️ Utilitários de Versão e CLI](#-7-utilitários-de-versão-e-cli)
9. [💻 API Programática em TypeScript](#-8-api-programática-em-typescript)
10. [📂 Impacto do `baseDir` na Resolução de Caminhos](./impacto-basedir.md)

---

## ⚡ 1. Motor esbuild (`esbuild.jsonc`)

O motor `esbuild` orquestra empacotamento ultrarrápido para produção utilizando o esbuild e o plugin oficial `@deno/esbuild-plugin`, incluindo limpeza de pastas, cópia de ativos estáticos, injeção de versão semântica (`__APP_VERSION__`), substituição de variáveis e geração de manifestos de cache.

### Estrutura Raiz do Arquivo (`esbuild.jsonc`)

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `$schema` | `string` | Não | Caminho relativo ou URL do JSON Schema para autocomplete e validação. |
| `version` | `string` | Não | Versão semântica da configuração do projeto. |
| `versionPaths` | `string[]` | Não | Caminhos onde o arquivo `version.ts` sincronizado é gerado. |
| `forcepackagesversion` | `boolean` | Não | Se `true`, sincroniza a nova versão para todos os pacotes do workspace. |
| `targets` / `alvos` | `Record<string, TargetConfig>` | Sim | Dicionário de alvos de compilação em lote. |

---

### Opções de Cada Alvo (`TargetConfig`)

#### 🔄 Pipeline e Gestão de Arquivos (Pré/Pós Build)

| Propriedade | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `default` | `boolean` | `true` | Se `true`, roda automaticamente quando nenhum alvo específico é passado na CLI. |
| `srcdir` | `string` | `"."` | Diretório base dos fontes do alvo (relativo à raiz de execução). |
| `distdir` | `string` | `"."` | Diretório de destino final onde os artefatos compilados são gravados. |
| `publicdir` | `string` | `undefined` | Diretório de ativos estáticos copiados recursivamente para `distdir`. |
| `indexHtml` | `boolean` | `false` | Se `true`, busca o `index.html` em `srcdir` e copia para `distdir`. |
| `clean` | `string[]` | `[]` | Lista de caminhos para limpar antes do build (relativos a `distdir`). Use `["."]` para esvaziar todo o diretório. |

#### ⚙️ Opções do Compilador esbuild

| Propriedade | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `entryPoints` | `string[]` | **Obrigatório** | Arquivos de entrada a serem compilados (relativos a `srcdir`). |
| `platform` | `"browser" \| "node" \| "neutral"` | `"browser"` | Plataforma alvo de execução do bundle gerado. |
| `format` | `"esm" \| "cjs" \| "iife"` | `"esm"` | Formato do módulo de saída. |
| `bundle` | `boolean` | `true` | Se agrupa dependências e imports externos em arquivos consolidados. |
| `minify` | `boolean` | `false` | Se aplica minificação total (código, espaços em branco e identificadores). |
| `sourcemap` | `boolean \| "linked" \| "inline" \| "external"` | `"linked"` | Estratégia de geração de mapa de fontes (`.map`). |
| `jsx` | `"automatic" \| "transform" \| "preserve"` | `"automatic"` | Modo de transformação de JSX/TSX. |
| `jsxImportSource` | `string` | `undefined` | Pacote para runtime automático do JSX (ex: `"preact"`, `"react"`). |
| `conditions` | `string[]` | `[]` | Condições personalizadas de resolução de export do `package.json`. |
| `define` | `Record<string, string>` | `{}` | Mapa de constantes globais substituídas em compilação. `__APP_VERSION__` é injetado automaticamente. |
| `drop` | `("console" \| "debugger")[]` | `[]` | Instruções a serem eliminadas do código compilado (ex: `["debugger"]`). |
| `external` | `string[]` | `[]` | Módulos a não empacotar, mantendo como imports externos em runtime. |
| `metafile` | `boolean` | `false` | Se gera arquivo de metadados em formato JSON para análise de bundles. |
| `write` | `boolean` | `true` | Se grava os arquivos compilados no disco. Se `false`, mantém em memória. |
| `treeShaking` | `boolean` | `true` | Habilita eliminação de código inativo (dead-code elimination). |
| `legalComments` | `"none" \| "inline" \| "eof" \| "linked" \| "external"` | `"eof"` | Preservação e posicionamento de comentários de licença. |
| `keepNames` | `boolean` | `true` | Preserva os nomes originais de funções e classes em builds minificados. |
| `outfile` | `string` | `undefined` | Nome ou caminho do arquivo de saída gerado (relativo ao `distdir`). |
| `splitting` | `boolean` | `false` | Habilita divisão de código em chunks sob demanda (requer `format: "esm"`). |
| `loader` | `Record<string, EsbuildLoader>` | `{}` | Mapeamento de extensões para loaders esbuild (`js`, `jsx`, `ts`, `tsx`, `css`, `json`, `text`, `base64`, `dataurl`, `file`, `binary`, `empty`, `copy`). |
| `alias` | `Record<string, string>` | `{}` | Mapeamento de aliases de importação de módulos. |
| `inject` | `string[]` | `[]` | Arquivos executados antes de cada ponto de entrada (ex: polyfills). |
| `banner` | `{ js?: string; css?: string }` | `undefined` | Bloco de texto inserido no início dos arquivos gerados. |
| `footer` | `{ js?: string; css?: string }` | `undefined` | Bloco de texto inserido no final dos arquivos gerados. |
| `target` | `"sw" \| string` | `"esnext"` | Ambientes alvos de compatibilidade. Se o nome do alvo (chave no config) for `"sw"`, o motor injeta automaticamente a constante `__GENERATED_ASSETS__` (lista de caminhos de arquivos no `distdir`) para facilitar a configuração de cache do Service Worker. |
| `charset` | `"ascii" \| "utf8"` | `"utf8"` | Codificação de caracteres do arquivo emitido. |
| `logLevel` | `"verbose" \| "debug" \| "info" \| "warning" \| "error" \| "silent"` | `"info"` | Nível de detalhamento das mensagens do esbuild. |

---

## 👀 2. Motor Watch (`watch.jsonc`)

O motor `watch` foi projetado para **desenvolvimento contínuo em tempo real**. Ele desacopla a rotina de observação do fluxo de compilação final, utilizando `esbuild.context` para recompilações incrementais instantâneas.

### Estrutura do `watch.jsonc`

```jsonc
{
  "$schema": "./packages/utils/schema/watch.json",
  "version": "0.3.7",
  "targets": {
    "ui": {
      "default": true,
      "srcdir": "packages/ui/src",
      "distdir": "packages/server/build/dist",
      "publicdir": "packages/ui/public",
      "indexHtml": true,
      "entryPoints": ["main.tsx"],
      "platform": "browser",
      "format": "esm",
      "bundle": true,
      "sourcemap": "inline",
      "jsx": "automatic",
      "jsxImportSource": "preact",
      "write": true,
      "outfile": "app.js"
    }
  }
}
```

- **Sem flags redundantes**: Não requer `mode` nem `watch: boolean` (todo alvo watch é intrinsecamente contínuo).
- **Sem poluição de versão**: O modo watch lê a versão atual sem incrementá-la.
- **Alvo Único por Execução**: Embora múltiplos alvos possam ser definidos na configuração, o motor do watch permite a execução de **apenas 1 alvo por vez**. Se mais de um alvo for informado na CLI, o processo rejeitará com uma mensagem de erro clara. Se nenhum alvo for especificado, apenas o primeiro alvo com `default: true` será executado.
- **Lock de Concorrência Exclusivo**: Para prevenir conflitos de portas, compilações duplicadas ou gravação concorrente em disco, a engine adquire automaticamente um lock de processo (`.buildit-watch.lock`). Se outra instância do watch estiver ativa no mesmo projeto, uma nova execução é impedida até o encerramento do processo anterior.

---

## 📦 3. Motor Deno.bundle (`denobuild.jsonc`)

O motor `denobuild` utiliza a API nativa `Deno.bundle` para empacotar aplicações sem dependências de binários externos do esbuild.

### Estrutura do `denobuild.jsonc`

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `srcdir` | `string` | Diretório raiz do código-fonte. |
| `distdir` | `string` | Diretório de destino dos arquivos compilados. |
| `publicdir` | `string` | Diretório estático copiado para `distdir`. |
| `indexHtml` | `boolean` | Copia `index.html` de `srcdir` para `distdir`. |
| `clean` | `string[]` | Diretórios a limpar antes do build. |
| `entryPoints` | `string[]` | Arquivos TypeScript/JavaScript de entrada. |
| `format` | `"esm" \| "cjs" \| "iife"` | Formato do bundle. |
| `platform` | `"browser" \| "deno"` | Plataforma alvo. |
| `minify` | `boolean` | Se deve minificar o bundle gerado. |
| `sourcemap` | `"linked" \| "inline" \| "external"` | Formato de sourcemap emitido. |
| `codeSplitting` | `boolean` | Divisão modular de chunks. |
| `inlineImports` | `boolean` | Se inclui o código de imports externos no arquivo gerado. |
| `packages` | `"bundle" \| "external"` | Se empacota ou externaliza dependências. |
| `define` | `Record<string, string>` | Injeção de constantes globais. |
| `outfile` | `string` | Nome explícito do arquivo gerado. |
| `target` | `"sw" \| string` | Se o nome do alvo (chave) for `"sw"`, o motor injeta `__GENERATED_ASSETS__` (lista de arquivos no `distdir`) para cache do Service Worker. |

---

## 📝 4. Exportador de Contexto para IA (`export.jsonc`)

O `export` gera snapshots consolidados em formato Markdown com cabeçalho semântico e proteções ativas anti-loop para alimentar LLMs e assistentes de código.

### Estrutura do `export.jsonc`

```jsonc
{
  "$schema": "./packages/utils/schema/export.json",
  "version": "0.3.7",
  "modos": {
    "ui": {
      "arquivoSaida": "snapshots/ui.md",
      "includes": [
        "packages/ui/{src,public,tests,docs}/**/*.{tsx,jsx,js,ts,css,html,manifest,json,jsonc,md}",
        "packages/ui/{build.ts,deno.json,deno.jsonc,readme.md}"
      ],
      "excludes": [
        "**/node_modules/**",
        "**/.git/**"
      ],
      "incluiVersao": true,
      "instrucaoCustomizada": "Contexto do frontend Preact + BeerCSS.",
      "default": true
    }
  }
}
```

- **Padrões Glob e Brace Expansion:** O exportador utiliza `expandGlob` sob o capô, permitindo expressar caminhos e extensões de forma declarativa e concisa (ex: `{src,docs}/**/*.{ts,tsx,md}`).
- **Streaming de Escrita O(1):** Gravação progressiva diretamente em disco via `Deno.open` e `WritableStream`, garantindo eficiência máxima de memória mesmo em grandes monorepositórios.
- **Modo Somente-Leitura:** O `exportEngine` lê a versão atual do projeto para enriquecer os cabeçalhos sem jamais incrementar a versão.

---

## 🧼 5. Sanitizador e Publicador de Versão (`sanitize-version` & `tag-version`)

O BuildIt inclui utilitários especializados para manter o arquivo `deno.jsonc` em conformidade com o padrão SemVer e automatizar a criação de tags git.

### 🧼 `sanitize-version`
Normaliza o campo `"version"` para o formato estrito `MAJOR.MINOR.PATCH`.
- **Comportamento:** Remove sufixos como `#hash`, `-alpha`, `+build`.
- **Injeção:** Se o campo `"version"` estiver ausente, ele insere `"version": "0.0.0"` automaticamente.

### 🏷️ `tag-version`
Automatiza o fluxo de release local e remoto:
1.  (Opcional) Sanitiza o arquivo `deno.jsonc` em disco.
2.  Executa `git add -A` e `git commit -m "Versão vX.Y"`.
3.  Executa `git push` do código.
4.  Remove tags locais e remotas antigas com o mesmo prefixo `vMAJOR.MINOR`.
5.  Cria uma nova tag anotada e executa `git push --force origin vX.Y`.

---

## 💡 6. Como Usar os Schemas no Editor ($schema)

Cada utilitário possui um JSON Schema oficial no diretório `packages/utils/schema/`:

1. `esbuild.json` -> Para `esbuild.jsonc` ou `esbuild.json`
2. `watch.json` -> Para `watch.jsonc` ou `watch.json`
3. `denobuild.json` -> Para `denobuild.jsonc` ou `denobuild.json`
4. `export.json` -> Para `export.jsonc` ou `export.json`

### Como Configurar no Arquivo

Basta incluir a chave `$schema` apontando para o arquivo correspondente no topo do seu JSON/JSONC:

```jsonc
{
  "$schema": "./packages/utils/schema/esbuild.json",
  "targets": {
    // Autocomplete automático com Ctrl+Espaço (VSCode / Cursor / Zed / Neovim)
    "ui": {
      "entryPoints": ["main.tsx"]
    }
  }
}
```

### Benefícios:
- **Autocomplete Completo:** Sugestão de todas as opções de compilador, tipos de sourcemap, loaders e formatos.
- **Validação Instantânea:** Avisos em tempo real caso uma propriedade seja escrita incorretamente ou tenha tipo inválido.
- **Documentação Inline (Hover):** Passe o mouse sobre qualquer propriedade para ver sua descrição oficial.

---

## 🛠️ 7. Utilitários de Versão e CLI

### Flags Comuns a Todos os CLIs

Todos os utilitários de linha de comando (`esbuild`, `watch`, `denobuild`, `export`) seguem a mesma convenção unificada de argumentos:

| Flag Curta | Flag Longa | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `-c` | `--app-config <file>` | `<tool>.jsonc` | Caminho explícito para o arquivo de configuração. |
| `-b` | `--base-dir <dir>` | `./` | Diretório base para resolução e join de caminhos. |
| `-d` | `--deno-config <file>` | `deno.jsonc` | Caminho para o `deno.jsonc` raiz que contém a versão. |
| `-n` | `--noversion` | `false` | Desabilita o incremento automático de versão. |

### Ordem de Execução Determinística

O **Engine** é a única fonte da verdade para a ordem de execução dos alvos:
- A ordem declarada no arquivo `.jsonc` é estritamente preservada.
- O CLI repassa os argumentos fornecidos pelo usuário; o engine filtra os alvos selecionados mantendo a ordem correta.

---

## 💻 8. API Programática em TypeScript

A biblioteca `@vanaware/buildit` pode ser importada e executada diretamente em código TypeScript:

```typescript
import { esBuild } from "@vanaware/buildit/esbuild";
import { watchEngine } from "@vanaware/buildit/watch";
import { denoBuild } from "@vanaware/buildit/denobuild";
import { exportEngine } from "@vanaware/buildit/export";

// Compilação com esbuild
await esBuild({
  config: {
    ui: {
      entryPoints: ["packages/ui/src/main.tsx"],
      distdir: "dist",
      format: "esm",
    },
  },
  noversion: true,
});

// Desenvolvimento contínuo com Watch
const handles = await watchEngine({
  config: {
    ui: {
      entryPoints: ["packages/ui/src/main.tsx"],
      distdir: "dist",
      sourcemap: "inline",
    },
  },
});

// Para encerrar o watch programaticamente:
// for (const h of handles) await h.close();
```

````

---

## Arquivo: `docs/impacto-basedir.md`

```md
# Guia Técnico: O Impacto do `baseDir` no BuildIt

Este documento explica detalhadamente como a opção `basedir` (configurável via CLI `-b` ou `--base-dir`) influencia o comportamento de leitura, escrita e resolução de caminhos em todos os utilitários do ecossistema BuildIt.

---

## 1. O que é o `baseDir`?

O `baseDir` é o **Diretório Raiz de Execução** (ou Workspace Root). Ele define o ponto de ancoragem para todos os caminhos relativos declarados nos arquivos de configuração (`.jsonc`).

- **Padrão:** Se não informado, o BuildIt assume `.` (o diretório atual onde o comando foi disparado).
- **Escopo:** O impacto é **global** em cada utilitário, afetando desde a localização do arquivo de configuração até a geração dos arquivos de saída.

---

## 2. Impacto por Utilitário

### ⚡ esbuild & 📦 denobuild (Build de Produção)

Neste contexto, o `baseDir` atua como o prefixo para a estrutura do monorepo ou projeto.

1.  **Resolução de Pastas Centrais**:
    - `srcdir`, `distdir` e `publicdir` são resolvidos usando `join(baseDir, path)`. Se você estiver na raiz do monorepo e rodar `--base-dir packages/ui`, o BuildIt procurará a origem em `packages/ui/src`.
2.  **EntryPoints**:
    - São resolvidos em relação ao `srcdir` já prefixado pelo `baseDir`.
3.  **Cópia de Arquivos (`copyFiles`)**:
    - Atua como o `generalBaseDir`. Cada entrada no array `copyFiles` que possuir um `basedir` próprio será resolvida em relação ao `baseDir` global da execução.
    - Exemplo: Se `baseDir` é `packages/ui` e o item tem `basedir: "public"`, a varredura real ocorre em `packages/ui/public`.
4.  **Limpeza (`clean`)**:
    - O diretório `distdir` (alvo da limpeza) é prefixado pelo `baseDir`. As regras de inclusão/exclusão de limpeza operam estritamente dentro desse caminho resultante.

### 👀 watch (Monitoramento de Desenvolvimento)

O `watch` herda todo o comportamento do `esbuild`, mas adiciona uma camada crítica de segurança:

1.  **Lock File (`.buildit-watch.lock`)**:
    - O arquivo de trava de PID é criado na raiz do `baseDir`.
    - **Por que isso importa?** Isso permite que você execute múltiplos processos `watch` no mesmo servidor, desde que apontem para `baseDir` diferentes, evitando colisões de processos que tentam monitorar o mesmo projeto.

### 📝 export (Snapshot para IA)

O `export` é o utilitário mais sensível ao `baseDir`, pois ele determina o que "entra na foto".

1.  **Raiz do Glob**:
    - O `baseDir` é passado como o parâmetro `root` para a função `expandGlob`. Padrões como `src/**/*.ts` só encontrarão arquivos dentro do `baseDir`.
2.  **Caminhos no Markdown**:
    - O utilitário calcula o caminho relativo de cada arquivo usando `relative(baseDir, arquivo.path)`. Isso garante que o snapshot gerado seja limpo e não exponha a estrutura absoluta de pastas do seu servidor/máquina.
3.  **Destino do Snapshot**:
    - O arquivo gerado (ex: `exports/ui.md`) é criado dentro do `baseDir`. Se você rodar com `--base-dir packages/utils`, o resultado irá para `packages/utils/exports/ui.md`.

### 🧼 sanitize-version & 🏷️ tag-version (Versionamento)

1.  **Localização do `deno.jsonc`**:
    - Se o caminho do arquivo não for absoluto, o utilitário tenta localizá-lo dentro do `baseDir`.

---

## 3. Resumo de Comportamento de Paths

| Tipo de Caminho | Comportamento com `baseDir` |
| :--- | :--- |
| **Caminho Absoluto** (`/etc/config`) | **Ignora** o `baseDir`. O sistema usa o caminho literal. |
| **Caminho Relativo** (`src/main.ts`) | **Prefixa** com `baseDir` → `join(baseDir, "src/main.ts")`. |
| **Padrão Glob** (`**/*.ts`) | **Restringe** a busca ao escopo do `baseDir`. |

---

## 4. Status da Implementação

A implementação do `baseDir` é **Sistêmica e Global**. 

Ela foi refatorada para ser propagada desde a camada de CLI (`packages/utils/src/*/cli.ts`) até o motor (`engine.ts`) e finalmente para as funções de baixo nível em `packages/utils/src/tools/paths.ts`. 

### Pontos de Verificação (Garantia de Integridade):
- [x] **Consistência**: Todos os utilitários usam a mesma função `resolveWithBase` para normalização.
- [x] **Segurança**: Funções de escrita e deleção (`cleanTarget`, `copyStaticFiles`) validam se o caminho final não "escapa" do diretório pretendido através de travas contra path traversal.
- [x] **Transparência**: Os logs de console exibem os caminhos resolvidos para que o usuário saiba exatamente onde o BuildIt está operando.

```

---

## Arquivo: `docs/publish-jsr-rules.md`

`````md
# Diretrizes de Documentação e Publicação no JSR

> **Nota para Agentes de IA:** Este documento define os padrões obrigatórios para documentação (README.md e JSDoc) e as regras de configuração do `deno.json` para publicação no JSR. Siga estas diretrizes rigorosamente ao gerar ou refatorar código neste repositório.

---

## 📌 Sumário

1. [Visão Geral](#-visão-geral)
2. [Padrões para o README.md](#-padrões-para-o-readmemd)
3. [Padrões para Comentários JSDoc](#-padrões-para-comentários-jsdoc)
4. [Recomendações de Uso e Qualidade](#-recomendações-de-uso-e-qualidade)
5. [Configuração de `publish: false` em Workspaces](#-configuração-de-publish-false-em-workspaces)
6. [Configuração de `publish.include` e `publish.exclude`](#-configuração-de-publishinclude-e-publishexclude)
7. [Checklist Antes de Publicar](#-checklist-antes-de-publicar)

---

## 🎯 Visão Geral

Todo pacote publicado no JSR deve ter **duas camadas de documentação**:

| Camada | Arquivo/Local | Propósito | Público-Alvo |
| :--- | :--- | :--- | :--- |
| **Guia Rápido** | `README.md` na raiz | Explicar *por que* usar o pacote e como começar. | Desenvolvedores avaliando adotar o pacote. |
| **Referência da API** | Comentários JSDoc no código | Documentar *como* usar cada símbolo exportado. | Desenvolvedores que já usam o pacote. |

Ambas as camadas impactam diretamente a **pontuação de qualidade do JSR** e a experiência do usuário final (incluindo autocompletar no editor).

---

## 📝 Padrões para o README.md

### Localização e Formato
- **Arquivo:** `README.md` 
- **Localização:** Obrigatório, na raiz do pacote, não é o mesmo README da raiz do worspace, cada pacote a ser publicado precisa de seu próprio README.
- **Sintaxe:** Markdown padrão (GFM - GitHub Flavored Markdown).
- **Idioma:** Inglês (mantenha consistência e use o mesmo idioma em toda a documentação a ser publicada).

### Estrutura Obrigatória

O README **deve** conter, no mínimo, as seguintes seções nesta ordem:

1. **Título** (`# Nome do Pacote`) — usar o nome real do pacote, sem o escopo.
2. **Descrição curta** — uma ou duas frases explicando o que o pacote faz.
3. **Instalação** — bloco de código com o comando `deno add`.
4. **Uso Básico** — **obrigatório** um bloco de código funcional mostrando import + uso real.
5. **Documentação** — link para a página do pacote no JSR (referência da API).

### Estrutura Recomendada (Adicional)

- **Features** — lista de bullets com os principais recursos.
- **API Overview** — tabela ou lista dos principais exports.
- **Exemplos Avançados** — casos de uso além do "hello world".

### Exemplo de Template

````markdown
# nome-do-pacote

Uma breve descrição de uma ou duas frases sobre o que este pacote faz.

## Instalação

```bash
deno add jsr:@seu-escopo/nome-do-pacote
```

## Uso

```ts
import { funcaoPrincipal } from "jsr:@seu-escopo/nome-do-pacote";

const resultado = funcaoPrincipal({ opcao: "valor" });
console.log(resultado);
```

## Features

- ✅ Recurso A
- ✅ Recurso B
- ✅ Recurso C

## Documentação

Para a referência completa da API, visite a
[página do pacote no JSR](https://jsr.io/@vanaware/nome-do-pacote).

````

### ⚠️ Regras Críticas
- **NUNCA** deixe o README vazio ou com apenas o título.
- **SEMPRE** inclua um bloco de código no README — o JSR usa isso para pontuar o pacote.
- **NÃO** duplique toda a documentação JSDoc aqui; o README é visão geral, não referência.

---

## 📚 Padrões para Comentários JSDoc

### Regras Gerais
- **Local:** Imediatamente acima de **cada símbolo exportado** (função, classe, interface, tipo, constante).
- **Sintaxe:** Bloco `/** ... */` com cada linha interna iniciando por `*`.
- **Idioma:** Manter o mesmo do README.
- **Obrigatoriedade:** Todo `export` **deve** ter JSDoc. Sem exceção.

### Estrutura do Bloco

1. **Resumo** (primeira linha) — frase curta e imperativa. Aparece em tooltips do editor.
2. **Descrição detalhada** (opcional) — parágrafo(s) adicional(is) com contexto.
3. **Tags** — na ordem: `@param`, `@returns`, `@throws`, `@example`, `@see`.
4. **Exemplo** — sempre que a função não for trivial.

### Exemplo Completo — Função

````ts
/**
 * Busca registros no banco de dados usando a consulta fornecida.
 *
 * Realiza normalização de entrada e aplica limite padrão quando não
 * especificado, evitando sobrecarga em consultas muito amplas.
 *
 * @param query - Consulta textual. Deve ter entre 1 e 50 caracteres.
 * @param limit - Número máximo de itens a retornar. Padrão: `20`.
 * @returns Array com os registros encontrados. Vazio se nada corresponder.
 * @throws {Error} Se `query` estiver vazia ou exceder 50 caracteres.
 *
 * @example
 * ```ts
 * const resultados = search("Deno");
 * console.log(resultados); // ["Deno", "Deno Deploy"]
 * ```
 *
 * @see {@link normalizeQuery} para detalhes da normalização.
 */
export function search(query: string, limit: number = 20): string[] {
  // ...
}
````

### Exemplo Completo — Interface / Tipo

````ts
/**
 * Opções aceitas pelo cliente HTTP.
 */
export interface ClientOptions {
  /** URL base para todas as requisições. */
  baseUrl: string;

  /** Tempo limite em milissegundos. Padrão: `5000`. */
  timeout?: number;

  /** Cabeçalhos adicionais enviados em cada requisição. */
  headers?: Record<string, string>;
}
````

### Exemplo Completo — Classe

````ts
/**
 * Cliente HTTP leve com suporte a retry automático.
 *
 * @example
 * ```ts
 * const client = new Client({ baseUrl: "https://api.example.com" });
 * const data = await client.get("/users");
 * ```
 */
export class Client {
  /**
   * Cria uma nova instância do cliente.
   *
   * @param options - Configurações do cliente.
   */
  constructor(options: ClientOptions) {
    // ...
  }

  /**
   * Executa uma requisição GET.
   *
   * @param path - Caminho relativo à `baseUrl`.
   * @returns Resposta parseada como JSON.
   */
  async get<T>(path: string): Promise<T> {
    // ...
  }
}
````

### Tags Suportadas e Quando Usar

| Tag | Uso |
| :--- | :--- |
| `@param` | Descrever **cada** parâmetro. Use `-` após o nome. |
| `@returns` | Descrever o valor de retorno (omita apenas se `void`). |
| `@throws` | Tipos e condições de erro lançados. |
| `@example` | Bloco de código executável. Sempre em cercas ` ```ts `. |
| `@see` | Referência cruzada. Combine com `{@link Symbol}`. |
| `@deprecated` | Marcar símbolos obsoletos e indicar substituto. |
| `@since` | Versão em que o símbolo foi introduzido. |

### Links Internos
Use `{@link <Símbolo>}` para criar links clicáveis entre símbolos na documentação gerada:

```ts
/**
 * Atalho para {@link Client.get} com timeout customizado.
 */
export function quickGet(path: string) { /* ... */ }
```

### ⚠️ Regras Críticas
- **NÃO** use JSDoc para comentários internos de linha — use `//`.
- **NÃO** documente símbolos não exportados (a menos que sejam úteis para contexto).
- **SEMPRE** coloque o `@example` **após** `@returns`/`@throws`.
- **NUNCA** escreva "TODO" dentro de JSDoc; use comentários normais.

---

## ✅ Recomendações de Uso e Qualidade

1. **README e JSDoc são complementares** — nunca um substitui o outro.
2. **Escreva exemplos reais** — evite `foo`/`bar`; use nomes que reflitam o domínio.
3. **Mantenha o README curto** — se passar de ~150 linhas, crie uma pasta `docs/` dentro do diretório do pacote.
4. **Valide antes de commitar:**
   ```bash
   deno doc --lint mod.ts
   ```
   Isso aponta exports sem JSDoc e tags malformadas.
5. **Valide antes de publicar:**
   ```bash
   deno publish --dry-run
   ```
   Inspecione o output para confirmar que apenas os arquivos desejados serão enviados.
6. **Atualize o JSDoc ao refatorar** — nunca deixe documentação divergente do código.
7. **Use `@deprecated`** ao invés de remover símbolos abruptamente — quebre consumidores com aviso.

---

## 🏢 Configuração de `publish: false` em Workspaces

Em um **workspace Deno** (definido por `workspace` no `deno.json` raiz), o comando `deno publish` tenta publicar **todos os membros** que possuem `name` e `exports`.

Para **excluir um membro interno** (pacotes utilitários compartilhados, ferramentas de build, etc.), defina `"publish": false` no `deno.json` desse membro.

### Estrutura Real no WorkerDB

No monorepo do WorkerDB, temos múltiplos pacotes publicados e pacotes de aplicação/infraestrutura interna:

```
/
├── deno.jsonc                 # workspace raiz
├── packages/
│   ├── worker-db/             # publicado no JSR como @vanaware/workerdb
│   │   └── deno.jsonc
│   ├── service-worker/        # publicado no JSR como @vanaware/opfs-explorer
│   │   └── deno.jsonc
│   ├── ui/                    # app frontend (publish: false)
│   │   └── deno.jsonc
│   ├── server/                # dev/prod server Deno (publish: false)
│   │   └── deno.jsonc
│   └── utils/                 # scripts de bundling/build (publish: false)
│       └── deno.jsonc
```

O workflow de CI/CD em `.github/workflows/jsr-publish.yml` executa a matriz de publicação automatizada para `packages/worker-db` e `packages/service-worker`.

### Estrutura de Exemplo Genérica

```
/
├── deno.json              # workspace raiz
├── packages/
│   ├── core/
│   │   └── deno.json      # publicado no JSR
│   ├── utils-internal/
│   │   └── deno.json      # NÃO publicado
│   └── cli/
│       └── deno.json      # publicado no JSR
```

### `deno.json` raiz (workspace)

```json
{
  "workspace": [
    "./packages/core",
    "./packages/utils-internal",
    "./packages/cli"
  ]
}
```

### `packages/core/deno.json` (publicado)

```json
{
  "name": "@seu-escopo/core",
  "version": "1.0.0",
  "exports": "./mod.ts",
  "license": "MIT"
}
```
> **Importante:** Caso os campos license e version não estejam configurados no deno.jsonc (ou deno.json) do pacote, configure com o mesmo valor encontrado no deno.jsonc raiz do workspace.

### `packages/utils-internal/deno.json` (NÃO publicado)

```json
{
  "name": "@seu-escopo/utils-internal",
  "version": "0.0.0",
  "exports": "./mod.ts",
  "publish": false
}
```

> **Importante:** Mesmo com `publish: false`, o pacote ainda pode ser importado por outros membros do workspace via `jsr:@seu-escopo/utils-internal` durante o desenvolvimento. Ele apenas não será enviado ao registro.

> **Regra fundamental:** Caso alguma função do pacote que não será publicado esteja em uso por um pacote que será publicado, o desenvolvedor deverá ser alertado e uma documentação de BUG deve ser criada com todas as referidas funções que deverão ser analisadas e devidamente tratadas antes da publicação do pacote.

---

## 🗂️ Configuração de `publish.include` e `publish.exclude`

### Regras Básicas
- Os padrões são avaliados **relativos à raiz do pacote** (onde está o `deno.json` do pacote a ser publicado).
- Use **globs POSIX** com `/` como separador (funciona em Windows também).
- **`publish.include`** — lista branca. Se definido, **somente** o que casar será publicado.
- **`publish.exclude`** — lista negra. Aplicada **após** o `include`.
- Se apenas `exclude` for definido, tudo é incluído por padrão e depois filtrado.
- **NUNCA** inclua `deno.json` no `exclude` — ele é sempre publicado automaticamente.

### Globs Recomendados

#### Incluir apenas o código-fonte publicável

```json
{
  "publish": {
    "include": [
      "src/**/*.ts",
      "mod.ts",
      "README.md",
      "LICENSE"
    ]
  }
}
```

#### Excluir arquivos de desenvolvimento

```json
{
  "publish": {
    "exclude": [
      "**/*_test.ts",
      "**/*.test.ts",
      "**/*_bench.ts",
      "tests/",
      "test/",
      "bench/",
      "examples/",
      "scripts/",
      "docs/",
      "planning/",
      "AGENTS.md",
      "CURRENT.md",
      "TODO.md",
      "CHANGELOG.md",
      ".github/",
      "*.config.ts",
      "build.ts",
      "bundle.ts",
      "deploy.ts",
      "deno.lock",
      ".gitignore"
    ]
  }
}
```

### Combinação Recomendada (Include + Exclude)

A abordagem mais segura é **combinar ambos**: um `include` restritivo que define o que é código, e um `exclude` para varrer resíduos.

```json
{
  "name": "@seu-escopo/seu-pacote",
  "version": "1.0.0",
  "exports": "./mod.ts",
  "license": "MIT",
  "publish": {
    "include": [
      "src/**/*.ts",
      "mod.ts",
      "README.md",
      "LICENSE"
    ],
    "exclude": [
      "**/*_test.ts",
      "**/*.test.ts",
      "**/*_bench.ts",
      "src/**/__mocks__/**",
      "examples/",
      "scripts/",
      "docs/",
      "planning/",
      "AGENTS.md",
      "CURRENT.md",
      "CHANGELOG.md",
      ".github/"
    ]
  }
}
```

### Mapa de Decisão: Incluir ou Excluir?

| Arquivo/Pasta | Ação | Justificativa |
| :--- | :--- | :--- |
| `src/**/*.ts` | ✅ Incluir | Código-fonte principal. |
| `mod.ts` | ✅ Incluir | Ponto de entrada principal. |
| `README.md` | ✅ Incluir | Exibido no JSR. |
| `**/*_test.ts` | ❌ Excluir | Testes não vão para o registro. |
| `tests/`, `test/` | ❌ Excluir | Idem. |
| `examples/` | ❌ Excluir | Exemplos grandes ou não-API. |
| `scripts/` | ❌ Excluir | Scripts de build/deploy. |
| `build.ts`, `bundle.ts`, `deploy.ts` | ❌ Excluir | Ferramentas de dev. |
| `docs/` | ❌ Excluir o docs da raiz pode incluir o subset do pacote | Documentação estendida da raiz do workspace fica no repo, documentação essencial reduzida do pacote pode incluir. |
| `planning/` | ❌ Excluir | Planejamento interno. |
| `AGENTS.md`, `CURRENT.md` | ❌ Excluir | Metadados para agentes de IA. |
| `CHANGELOG.md` | ⚠️ Excluir | Útil para consumidores, mas aumenta o pacote. |
| `deno.lock` | ❌ Excluir | Reconstruído pelo consumidor. |
| `.github/` | ❌ Excluir | CI/CD. |
| `deno.json` | 🚫 Nunca listar | Sempre publicado automaticamente. |

### Padrões Glob de Referência

| Padrão | Casa com |
| :--- | :--- |
| `src/**/*.ts` | Todos os `.ts` em `src/` recursivamente. |
| `**/*_test.ts` | Qualquer arquivo terminando em `_test.ts`. |
| `**/*.test.ts` | Qualquer arquivo terminando em `.test.ts`. |
| `test/` | Todo o diretório `test/`. |
| `**/__mocks__/**` | Qualquer diretório `__mocks__` em qualquer nível. |
| `scripts/**` | Tudo dentro de `scripts/`. |
| `*.config.ts` | Arquivos `.config.ts` na raiz. |

### ⚠️ Erros Comuns a Evitar
- **Não** use `./` no início dos padrões (`"./src/**"` ❌ → `"src/**"` ✅).
- **Não** use `\` como separador — sempre `/`.
- **Não** inclua `deno.json` no `exclude` — quebra a publicação.
- **Não** use `include` e `exclude` contraditórios (ex: incluir `src/**` e excluir `src/`).
- **Sempre** valide com `deno publish --dry-run` antes de publicar de verdade.

---

## ✅ Checklist Antes de Publicar

Execute na ordem:

- [ ] `deno fmt --check` — formatação consistente.
- [ ] `deno lint` — sem avisos.
- [ ] `deno check mod.ts` — sem erros de tipo.
- [ ] `deno test` — todos os testes passando.
- [ ] `deno doc --lint mod.ts` — sem exports sem JSDoc.
- [ ] `README.md` revisado e com bloco de código de exemplo.
- [ ] `deno.jsonc` com `name`, `version`, `exports`, `license` corretos.
- [ ] `publish.include` e `publish.exclude` revisados.
- [ ] `deno publish --dry-run` — inspecionar arquivos listados.
- [ ] Versão incrementada conforme SemVer, temos um script de sanitização a ser executado antes da publicação.
- [ ] `deno publish` — publicar de fato.

---

## 📎 Referências

- [Documentação oficial do JSR](https://jsr.io/docs)
- [Escrevendo documentação para JSR](https://jsr.io/docs/writing-docs)
- [Configuração `deno.jsonc`](https://docs.deno.com/runtime/fundamentals/configuration/)
- [Globs no Deno](https://docs.deno.com/runtime/fundamentals/configuration/#glob-patterns)
`````

---

## Arquivo: `docs/topology-denobuild.md`

````md
# Topologia de Execução: `denobuild` (Orquestrador Deno.bundle)

Este documento descreve a topologia completa de execução de funções do utilitário **`denobuild`**, detalhando a árvore de chamadas, os parâmetros repassados entre cada camada, efeitos colaterais e pontos de extensão.

---

## 1. Diagrama de Chamadas (Call Graph)

```
[CLI / Terminal]
       │
       ▼
denoBuildCli() (packages/utils/src/denobuild/cli.ts)
       │
       ├──► findDenoConfig()
       ├──► carregarConfigDenoBuild(caminhoConfig, baseDir)
       │       │
       │       └──► loadConfig<DenoBundleConfigFile>("denobuild", caminhoConfig, baseDir)
       │               └──► readJsoncFile(caminhoCompleto) / parseJsonc
       ├──► parseArgs(args, configs)
       │
       ▼
denoBuild(opcoes: DenoBuildOptions) (packages/utils/src/denobuild/engine.ts)
       │
       ├──► updateProjectVersion({ denoJsonPath, baseDir, noversion, versionPaths, forcepackagesversion })
       │       │
       │       ├──► readProjectVersion(denoJsonPath, baseDir)
       │       └──► syncVersion(...) / formatVersion(...)
       │
       └──► [Loop para cada Target Selecionado]
               │
               ▼
       processBundleTarget(targetName, config, appVersion, listAssetsFn)
               │
               ├──► validateTargetConfig(targetName, config)
               │
               ├──► cleanTarget(config.distdir, config.clean) [se configurado]
               │       └──► [Itera config.clean.includes/excludes]
               │
               ├──► copyStaticFiles(config, appVersion, baseDir, distDir)
               │       └──► [Loop config.copyFiles: { includes, excludes, basedir }]
               │
               ├──► listAssetsForCache(config.distdir) [se target === "sw"]
               │
               ├──► buildBundleOptions(config) (packages/utils/src/denobuild/bundle.ts)
               │       └──► resolveEntryPoints(config.srcdir, config.entryPoints)
               │
               ├──► Deno.bundle(bundleOptions) [API Nativa do Deno]
               │
               └──► [Loop para cada arquivo em result.outputFiles]
                       │
                       ├──► ensureDirForFile(outputFile.path)
                       ├──► applyDefines(content, defines) (packages/utils/src/denobuild/bundle.ts)
                       └──► Deno.writeTextFile(outputFile.path, content)
```

---

## 2. Mapeamento Passo a Passo de Execução

### Passo 1: Inicialização do CLI
* **Função**: `denoBuildCli()`
* **Arquivo**: `packages/utils/src/denobuild/cli.ts`
* **Entrada**: Argumentos CLI via Cliffy (`-c/--app-config`, `-b/--base-dir`, `-d/--deno-config`, `-n/--no-version`, `-p/--packages-version`, `[targets...:string]`).
* **Ações**:
  1. Localiza configuração do Deno via `findDenoConfig()`.
  2. Executa `carregarConfigDenoBuild(caminhoConfig, baseDir)` para ler `denobuild.jsonc`.
  3. Filtra argumentos com `parseArgs(args, configs)`.
  4. Chama `denoBuild(opcoes)`.

### Passo 2: Orquestração Principal do Engine
* **Função**: `denoBuild(opcoes: DenoBuildOptions)`
* **Arquivo**: `packages/utils/src/denobuild/engine.ts`
* **Parâmetros de Entrada**:
  ```typescript
  opcoes: {
    config: DenoBundleGlobalConfig;
    targets?: string[];
    baseDir?: string;
    denoJsoncPath?: string;
    noversion?: boolean;
    versionPaths?: string[];
    forcepackagesversion?: boolean;
  }
  ```
* **Ações**:
  1. `updateProjectVersion(...)`: Atualiza ou mantém versão semântica e sincroniza pacotes.
  2. Filtra a lista de alvos a serem compilados preservando a ordem declarada na configuração.
  3. Itera sobre cada alvo executando `processBundleTarget(...)`.
  4. Agrega e retorna a lista de `DenoBuildResult[]`.

### Passo 3: Processamento e Pós-processamento do Alvo
* **Função**: `processBundleTarget(targetName, config, appVersion, listAssetsFn)`
* **Arquivo**: `packages/utils/src/denobuild/engine.ts`
* **Parâmetros de Entrada**:
  - `targetName: string`: Nome do alvo (ex: `"ui"`, `"sw"`)
  - `config: DenoBundleTargetConfig`: Configuração específica do alvo
  - `appVersion: string`: Versão semântica injetada
  - `listAssetsFn?: (distDir: string) => Promise<string[]>`: Utilitário para coletar assets do cache
* **Ações e Subfunções**:
  1. `validateTargetConfig(targetName, config)`: Validação estrutural prévia.
  2. `cleanTarget(distdir, clean)`: Limpeza de diretórios de saída baseada em `includes`/`excludes` antes do build.
  3. `copyStaticFiles(config, appVersion, baseDir, distDir)`: Cópia recursiva via `copyFiles` com suporte a globs e injeção de versão no `manifest.json`.
  4. Preparação de constantes `defines` em memória:
     - `__APP_VERSION__ = JSON.stringify("v" + appVersion)`
     - `__GENERATED_ASSETS__ = JSON.stringify(assets)` (se `targetName === "sw"`). Esta injeção permite que o Service Worker gerado tenha conhecimento dinâmico de todos os assets no `distdir` para estratégias de caching offline.
  5. `buildBundleOptions(config)` (`packages/utils/src/denobuild/bundle.ts`):
     - Monta o objeto de opções esperado pela API instável `Deno.bundle`.
     - Mapeia entry points, target de plataforma (`browser`/`deno`), formato (`esm`/`cjs`/`iife`), sourcemap e minify.
  6. `Deno.bundle(bundleOptions)`:
     - Invoca o compilador nativo do Deno para gerar os arquivos empacotados em memória (`result.outputFiles`).
     - Em caso de erros, exibe o traceback com linha/coluna e lança exceção.
  7. Gravação e Injeção de Defines em Disco:
     - Itera sobre cada `outputFile` gerado pelo bundle.
     - `ensureDirForFile(outputFile.path)`: Cria pastas pai no disco.
     - `applyDefines(content, defines)` (`packages/utils/src/denobuild/bundle.ts`): Realiza a substituição global via Regex das chaves literais (ex: `__APP_VERSION__`) pelo valor JSON.
     - `Deno.writeTextFile(outputFile.path, content)`: Grava o arquivo final em disco.

---

## 3. Tabela Resumo de Parâmetros e Retornos

| Função | Chamador | Entrada / Parâmetros | Retorno | Efeito Colateral |
|---|---|---|---|---|
| `denoBuildCli()` | Runtime Deno CLI | `Deno.args` | `Command` instance | Processamento CLI e saída console |
| `carregarConfigDenoBuild()` | `denoBuildCli` | `caminhoConfig?: string`, `baseDir?: string` | `Promise<DenoBundleConfigResult>` | Leitura do sistema de arquivos (`denobuild.jsonc`) |
| `denoBuild()` | `denoBuildCli` / API | `opcoes: DenoBuildOptions` | `Promise<DenoBuildResult[]>` | Atualização de versões e compilação de bundles |
| `processBundleTarget()` | `denoBuild` | `targetName`, `config`, `appVersion`, `listAssetsFn?` | `Promise<DenoBuildResult>` | Limpeza de dist, cópia estática, bundle, escrita no disco |
| `buildBundleOptions()` | `processBundleTarget` | `config: DenoBundleTargetConfig` | `Deno.BundleOptions` | Resolução de caminhos e mapeamento de propriedades |
| `applyDefines()` | `processBundleTarget` | `content: string`, `defines: Record<string, string>` | `string` | Substituição em memória de identificadores literais |

---

## 4. Oportunidades de Melhoria e Refatoração

1. **Substituição de Defines por AST vs Regex**: O `applyDefines` opera via expressão regular textual. Para evitar falsos positivos dentro de strings literais ou comentários de código, pode-se avaliar substituição contextual ou tokenizada.
2. **Dependência de API Unstable**: `Deno.bundle` é uma feature instável do Deno. A estrutura modular do engine isola essa dependência em `packages/utils/src/denobuild/bundle.ts`, facilitando futura migração ou compatibilização com versões Deno 2.x.
3. **Reutilização de Utilitários de Ordenação**: Padronizar `resolverOrdemTargets` (utilizado no `esbuild`) também no `denoBuild` para manter exatamente o mesmo comportamento determinístico de alvos.

````

---

## Arquivo: `docs/topology-esbuild.md`

````md
# Topologia de Execução: `esbuild` (Orquestrador de Build)

Este documento descreve a topologia completa de execução de funções do utilitário **`esbuild`**, detalhando a árvore de chamadas, os parâmetros repassados entre cada camada, efeitos colaterais e pontos de extensão.

---

## 1. Diagrama de Chamadas (Call Graph)

```
[CLI / Terminal]
       │
       ▼
esBuildCli() (packages/utils/src/esbuild/cli.ts)
       │
       ├──► findDenoConfig()
       ├──► carregarConfigEsbuild(caminhoConfig, baseDir)
       │       │
       │       └──► loadConfig<EsbuildConfigFile>("esbuild", caminhoConfig, baseDir)
       │               └──► readJsoncFile(caminhoCompleto) / parseJsonc
       ├──► parseArgs(args, configs)
       │
       ▼
esBuild(opcoes: EsbuildOptions) (packages/utils/src/esbuild/engine.ts)
       │
       ├──► updateProjectVersion({ denoJsonPath, baseDir, noversion, versionPaths, forcepackagesversion })
       │       │
       │       ├──► readProjectVersion(denoJsonPath, baseDir)
       │       │       └──► parseVersion(rawVersion)
       │       ├──► syncVersion(versionStr, versionPaths, baseDir)
       │       └──► formatVersion(parsed) / replaceVersionInContent(...)
       │
       ├──► resolverOrdemTargets(configs, targets)
       │
       └──► [Loop para cada Target Selecionado]
               │
               ▼
       processTarget(targetName, targetConfig, appVersion, esbuildBuildFn, listAssetsFn)
               │
               ├──► validateTargetConfig(targetName, config)
               │
               ├──► cleanTarget(config.distdir, config.clean) [se configurado]
               │       └──► [Itera config.clean.includes/excludes]
               │               └──► Deno.remove(...) / emptyDir(...)
               │
               ├──► copyStaticFiles(config, appVersion, baseDir, distDir)
               │       └──► [Loop config.copyFiles: { includes, excludes, basedir }]
               │               ├──► expandGlob(includes, { root: basedir, exclude: excludes })
               │               ├──► replaceVersionInFile(manifest.json, appVersion)
               │               └──► Log "index.html copiado" [se index.html detectado]
               │
               ├──► buildEsbuildOptions(targetName, config, appVersion, listAssetsFn)
               │       ├──► listAssetsForCache(config.distdir) [se target === "sw"]
               │       ├──► resolveEntryPoints(config.srcdir, config.entryPoints)
               │       └──► resolveOutputPaths(config)
               │
               ├──► esbuildBuildFn(esbuildOptions) -> buildWithDenoPlugin(options, denoJsoncPath)
               │       ├──► denoPlugin({ configPath: denoJsoncPath })
               │       └──► esbuild.build(options)
               │
               └──► Deno.writeTextFile(metafilePath, ...) [se metafile: true]
```

---

## 2. Mapeamento Passo a Passo de Execução

### Passo 1: Inicialização do CLI
* **Função**: `esBuildCli()`
* **Arquivo**: `packages/utils/src/esbuild/cli.ts`
* **Entrada**: Argumentos CLI via Cliffy (`-c/--app-config`, `-b/--base-dir`, `-d/--deno-config`, `-n/--no-version`, `-p/--packages-version`, `[targets...:string]`).
* **Ações**:
  1. `findDenoConfig()`: Procura `deno.jsonc` ou `deno.json` nos diretórios raiz/parentes.
  2. `carregarConfigEsbuild(caminhoConfig, baseDir)`: Carrega e valida o arquivo de configuração (ou devolve `CONFIGURACOES_PADRAO`).
  3. `parseArgs(args, configs)`: Filtra os alvos solicitados pelo usuário contra as chaves declaradas na configuração.
  4. Chama `esBuild(opcoes)`.

### Passo 2: Orquestração Principal do Engine
* **Função**: `esBuild(opcoes: EsbuildOptions)`
* **Arquivo**: `packages/utils/src/esbuild/engine.ts`
* **Parâmetros de Entrada**:
  ```typescript
  opcoes: {
    config: GlobalTargetConfig;
    targets?: string[];
    baseDir?: string;
    denoJsoncPath?: string;
    noversion?: boolean;
    versionPaths?: string[];
    forcepackagesversion?: boolean;
  }
  ```
* **Ações**:
  1. `updateProjectVersion(...)`:
     - Lê a versão de `deno.jsonc`.
     - Incrementa versão de patch (se `noversion === false`).
     - Sincroniza a nova versão em arquivos adicionais (`versionPaths` ou pacotes em `packages/*`).
     - Retorna a `finalVersion` (string semântica, ex: `"0.3.14"`).
  2. `resolverOrdemTargets(configs, targets)`:
     - Garante estritamente que a ordem de execução dos alvos respeite a ordem de declaração no arquivo de configuração, ignorando alvos inexistentes e selecionando os alvos com `default !== false` caso nenhum tenha sido explicitado na CLI.
  3. Itera sobre cada alvo resolvido e invoca `processTarget(...)`.

### Passo 3: Processamento do Alvo Individual
* **Função**: `processTarget(targetName, config, appVersion, esbuildBuildFn, listAssetsFn)`
* **Arquivo**: `packages/utils/src/esbuild/engine.ts`
* **Parâmetros de Entrada**:
  - `targetName: string` (ex: `"ui"`, `"sw"`)
  - `config: TargetConfig` (opções do alvo específico)
  - `appVersion: string` (ex: `"0.3.14"`)
  - `esbuildBuildFn: (options) => Promise<any>` (closure com `buildWithDenoPlugin`)
  - `listAssetsFn: (distDir) => Promise<string[]>` (utilitário `listAssetsForCache`)
* **Ações e Subfunções**:
  1. `validateTargetConfig(targetName, config)` (`packages/utils/src/tools/validate.ts`):
     - Valida campos obrigatórios (`entryPoints`, regras de `outfile`/`outdir`).
     - Lança erro imediato (fail-fast) se a configuração for inválida.
  2. `cleanTarget(config.distdir, config.clean)` (`packages/utils/src/tools/paths.ts`):
     - Esvazia ou remove caminhos especificados em `config.clean.includes` e `config.clean.excludes` dentro de `distdir`.
  3. `copyStaticFiles(config, appVersion, baseDir, distDir)` (`packages/utils/src/tools/paths.ts`):
     - Executa a cópia recursiva de arquivos baseada no array `config.copyFiles`.
     - Utiliza `expandGlob` com suporte a `includes`, `excludes` e `basedir` personalizado.
     - Se o arquivo for `manifest.json`, injeta a versão da aplicação.
     - Detecta `index.html` para log de console.
  4. `buildEsbuildOptions(targetName, config, appVersion, listAssetsFn)`:
     - Monta o dicionário de `define` com `__APP_VERSION__`.
     - Se `targetName === "sw"`, executa `listAssetsFn(distdir)` e injeta `__GENERATED_ASSETS__`. Esta constante contém um array JSON com todos os caminhos de arquivos presentes no diretório de saída, sendo ideal para automatizar a lista de pré-cache em Service Workers.
     - `resolveEntryPoints(srcdir, entryPoints)`: Garante resolução de caminho seguro e existência dos arquivos de entrada.
     - `resolveOutputPaths(config)`: Resolve `outfile` / `outdir` relativos a `distdir`.
     - Formata `banner` e `footer` com substituição de versão.
  5. `buildWithDenoPlugin(esbuildOptions, denoJsoncPath)`:
     - Anexa a instância do `@deno/esbuild-plugin`.
     - Chama `esbuild.build(options)` nativo.
  6. Se `config.metafile === true`, salva o arquivo `${targetName}-metafile.json` no disco.

---

## 3. Tabela Resumo de Parâmetros e Retornos

| Função | Chamador | Entrada / Parâmetros | Retorno | Efeito Colateral |
|---|---|---|---|---|
| `esBuildCli()` | Runtime Deno CLI | `Deno.args` | `Command` instance | Leitura de CLI e saída no stdout |
| `carregarConfigEsbuild()` | `esBuildCli` | `caminhoConfig?: string`, `baseDir?: string` | `Promise<EsbuildConfigResult>` | Leitura do sistema de arquivos (`esbuild.jsonc`) |
| `parseArgs()` | `esBuildCli` | `args: string[]`, `configs: GlobalTargetConfig` | `ParsedArgs` (alvos válidos) | Puro (sem I/O) |
| `esBuild()` | `esBuildCli` / API | `opcoes: EsbuildOptions` | `Promise<EsbuildResult[]>` | Atualiza versões, compila alvos |
| `updateProjectVersion()` | `esBuild` | `VersionUpdateOptions` | `Promise<string>` | Grava novas versões em `deno.jsonc` e pacotes |
| `resolverOrdemTargets()` | `esBuild` | `configs: Record<string, TargetConfig>`, `solicitados?: string[]` | `string[]` | Puro (ordenação e filtragem) |
| `processTarget()` | `esBuild` | `targetName`, `config`, `version`, `buildFn`, `listAssetsFn` | `Promise<void>` | Limpa pastas, copia static, compila bundle |
| `validateTargetConfig()`| `processTarget` | `targetName: string`, `config: TargetConfig` | `void` (lança erro se inválido) | Validação estrita (fail-fast) |
| `buildEsbuildOptions()` | `processTarget` | `targetName`, `config`, `appVersion`, `listAssetsFn` | `Promise<esbuild.BuildOptions>` | Leitura opcional de distdir para SW |
| `buildWithDenoPlugin()` | `processTarget` | `options: any`, `denoJsoncPath: string` | `Promise<esbuild.BuildResult>` | Execução de compilação esbuild em memória/disco |

---

## 4. Oportunidades de Melhoria e Refatoração

1. **Separação de Build do SW**: Como o Service Worker necessita da lista de assets gerados pelo alvo `ui`, a ordenação dos alvos na configuração é crítica (`ui` deve sempre rodar antes de `sw`).
2. **Tipagem Unificada de Plugins**: O array `plugins` no `BuildOptions` atualmente aceita `any[]` para contornar variações de tipo entre `@deno/esbuild-plugin` e o typeset do esbuild.
3. **Paralelização de Alvos Independentes**: Alvos que não compartilham dependência de assets poderiam ser executados em paralelo com `Promise.all` caso não haja conflito de escrita em `distdir`.

````

---

## Arquivo: `docs/topology-export.md`

`````md
# Topologia de Execução: `export` (Exportador de Contexto)

Este documento descreve a topologia completa de execução de funções do utilitário **`export`**, detalhando a árvore de chamadas, os parâmetros repassados entre cada camada, efeitos colaterais e pontos de extensão.

---

## 1. Diagrama de Chamadas (Call Graph)

```
[CLI / Terminal]
       │
       ▼
exportCli() (packages/utils/src/export/cli.ts)
       │
       ├──► findDenoConfig()
       ├──► carregarConfigExport(caminhoConfig, baseDir) (packages/utils/src/export/config.ts)
       │       │
       │       └──► loadConfig<ExportConfigFile>("export", caminhoConfig, baseDir)
       │               └──► readJsoncFile(caminhoCompleto) / parseJsonc
       │
       ▼
exportEngine(opcoes: ExportOptions) (packages/utils/src/export/engine.ts)
       │
       ├──► readProjectVersion(denoJsoncPath, baseDir)
       ├──► resolverOrdemTargets(configs, opcoes.modos)
       │
       └──► [Loop para cada Modo Selecionado]
               │
               ▼
       exportarModo(modo, config, opcoes)
               │
               ├──► coletarArquivosParaExportacao(config, baseDir)
               │       │
               │       └──► expandGlob(padrao, { root, exclude })
               │               ├──► normalizarCaminho(caminhoRelativo)
               │               └──► correspondeGlobs(caminhoRelativo, config.excludes)
               │
               ├──► ensureDirForFile(caminhoSaida)
               │
               ├──► Deno.open(caminhoSaida, { write, create, truncate }) [Streaming O(1)]
               │       │
               │       ├──► writer.write(encoder.encode(gerarCabecalho(config, modo, versaoApp)))
               │       │
               │       └──► [Loop para cada arquivo coletado]
               │               │
               │               ├──► Deno.readTextFile(caminhoCompleto)
               │               ├──► formatarArquivoMarkdown(caminhoRelativo, conteudoArquivo)
               │               │       ├──► mapearExtensao(caminhoRelativo)
               │               │       └──► calcularCraseWrapper(conteudoArquivo)
               │               └──► writer.write(encoder.encode(blocoMarkdown))
               │
               └──► writer.close()
```

---

## 2. Mapeamento Passo a Passo de Execução

### Passo 1: Inicialização do CLI
* **Função**: `exportCli()`
* **Arquivo**: `packages/utils/src/export/cli.ts`
* **Entrada**: Argumentos CLI via Cliffy (`-c/--app-config`, `-b/--base-dir`, `-d/--deno-config`, `[modos...:string]`).
* **Ações**:
  1. Identifica o arquivo de configuração e diretório base.
  2. Executa `carregarConfigExport(caminhoConfig, baseDir)` para ler `export.jsonc` ou carregar o fallback padrão (`ui`, `docs`, `server`, `utils`).
  3. Coleta os modos passados via argumentos posicionais.
  4. Chama `exportEngine(opcoes)`.

### Passo 2: Orquestração Principal do Engine
* **Função**: `exportEngine(opcoes: ExportOptions)`
* **Arquivo**: `packages/utils/src/export/engine.ts`
* **Parâmetros de Entrada**:
  ```typescript
  opcoes: {
    config: Record<string, ExportConfig>;
    modos?: string[];
    baseDir?: string;
    versaoApp?: string;
    silencioso?: boolean;
    denoJsoncPath?: string;
  }
  ```
* **Ações**:
  1. Determina a versão da aplicação via `readProjectVersion(denoJsoncPath, baseDir)`.
  2. Executa `resolverOrdemTargets(configs, opcoes.modos)` para filtrar e ordenar estritamente os modos. Se nenhum foi passado explicitamente, filtra aqueles com `default !== false`.
  3. Itera sequencialmente sobre cada modo executando `exportarModo(...)`.
  4. Retorna a lista de `ExportResult[]` com contagem de arquivos e total de bytes gravados.

### Passo 3: Processamento do Modo com `expandGlob` e Stream de Escrita
* **Função**: `exportarModo(modo, config, opcoes)`
* **Arquivo**: `packages/utils/src/export/engine.ts`
* **Parâmetros de Entrada**:
  - `modo: string`: Nome do modo (ex: `"ui"`, `"docs"`)
  - `config: ExportConfig`: Configuração detalhada do modo contendo `includes: string[]` e opcionalmente `excludes?: string[]`
  - `opcoes?: { versaoApp?, baseDir?, silencioso?, denoJsoncPath? }`
* **Ações e Subfunções**:
  1. `coletarArquivosParaExportacao(config, baseDir)`:
     - Itera sobre cada padrão glob em `config.includes` chamando `expandGlob(padrao, { root: baseDir, exclude: config.excludes, includeDirs: false })`.
     - Aplica proteção anti-looping (`exports/`, `snapshots/`) e deduplica em um `Set<string>`.
     - Retorna array ordenado alfabeticamente para gerar snapshots determinísticos.
  2. Abertura do Stream de Escrita:
     - `ensureDirForFile(caminhoSaida)`: Cria pastas pai no disco.
     - `Deno.open(caminhoSaida, { write: true, create: true, truncate: true })`: Inicializa o arquivo para streaming.
     - `writer.write(encoder.encode(gerarCabecalho(config, modo, versaoApp)))`: Grava o cabeçalho gerado por `gerarCabecalho(...)`.
  3. Processamento Individual de Arquivos:
     - Para cada arquivo coletado, lê via `Deno.readTextFile(caminhoCompleto)`.
     - `formatarArquivoMarkdown(caminhoRelativo, conteudoArquivo)`:
       - `mapearExtensao(ext)`: Mapeia extensões especiais (`.jsonc` -> `json`, `.sh` -> `bash`, `.env*` -> `properties`, `.manifest` -> `json`).
       - `calcularCraseWrapper(conteudo)`: Calcula dinamicamente a quantidade de crases (``` ou mais) para garantir que o code block seja válido.
     - `writer.write(encoder.encode(blocoMarkdown))`: Envia o bloco Markdown diretamente para o stream em disco.
  4. Finalização:
     - `writer.close()`: Garante o fechamento limpo do arquivo.

---

## 3. Tabela Resumo de Parâmetros e Retornos

| Função | Chamador | Entrada / Parâmetros | Retorno | Efeito Colateral |
|---|---|---|---|---|
| `exportCli()` | Runtime Deno CLI | `Deno.args` | `Command` instance | Processamento CLI e saída console |
| `carregarConfigExport()` | `exportCli` | `caminhoConfig?: string`, `baseDir?: string` | `Promise<Record<string, ExportConfig>>` | Leitura do sistema de arquivos (`export.jsonc`) |
| `exportEngine()` | `exportCli` / API | `opcoes: ExportOptions` | `Promise<ExportResult[]>` | Orquestração de exportação |
| `exportarModo()` | `exportEngine` | `modo: string`, `config: ExportConfig`, `opcoes?` | `Promise<ExportResult>` | Varredura otimizada e streaming para disco |
| `coletarArquivosParaExportacao()` | `exportarModo` | `config: ExportConfig`, `baseDir: string` | `Promise<string[]>` | Varredura com `expandGlob` e ordenação alfabética |
| `correspondeGlobs()` | `formatter` / `engine` | `caminho: string`, `padroes: string[]` | `boolean` | Avaliação de regex gerada via `globToRegExp` |
| `gerarCabecalho()` | `exportarModo` | `config: ExportConfig`, `modo: string`, `versaoApp: string` | `string` | Formatação de string Markdown em memória |
| `formatarArquivoMarkdown()` | `exportarModo` | `caminho: string`, `conteudo: string` | `string` | Formatação com code fence e syntax highlight |
| `calcularCraseWrapper()` | `formatarArquivoMarkdown` | `conteudo: string` | `string` (ex: ```` ``` ```` ou ```` ```` ````) | Escape dinâmico de crases Markdown |
| `mapearExtensao()` | `formatarArquivoMarkdown` | `extensao: string` | `string` (linguagem de highlight) | Normalização de highlight de sintaxe |

`````

---

## Arquivo: `docs/topology-sanitize-version.md`

````md
# Topologia de Execução: `sanitize-version`

Este documento descreve a topologia de execução do utilitário **`sanitize-version`**, responsável por normalizar a versão no arquivo `deno.jsonc` para o formato estrito SemVer (`MAJOR.MINOR.PATCH`).

---

## 1. Diagrama de Chamadas (Call Graph)

```
[CLI / Terminal]
       │
       ▼
sanitizeVersionCli() (packages/utils/src/version/sanitize/cli.ts)
       │
       ├──► findDenoConfig()
       │
       ▼
sanitizeVersion(opcoes: SanitizeOptions) (packages/utils/src/version/sanitize/mod.ts)
       │
       ├──► Deno.readTextFile(denoJsonPath)
       ├──► parseJsonc(content)
       │
       ├──► [Se version ausente]
       │       └──► version = "0.0.0"
       │
       ├──► parseVersion(version) (packages/utils/src/tools/version.ts)
       │       └──► [Regex extraction: major, minor, patch]
       │
       ├──► formatVersion(parsed)
       │       └──► `${major}.${minor}.${patch}`
       │
       ├──► replaceVersionInContent(content, newVersion)
       │       └──► [Regex replacement in JSONC string]
       │
       └──► Deno.writeTextFile(denoJsonPath, updatedContent)
```

---

## 2. Mapeamento Passo a Passo de Execução

### Passo 1: Inicialização do CLI
* **Função**: `sanitizeVersionCli()`
* **Arquivo**: `packages/utils/src/version/sanitize/cli.ts`
* **Entrada**: Argumentos CLI via Cliffy (`[path:string]`).
* **Ações**:
  1. Resolve o caminho do `deno.jsonc` (padrão: `./deno.jsonc`).
  2. Chama `sanitizeVersion({ denoJsonPath })`.
  3. Exibe mensagem de sucesso com a versão normalizada.

### Passo 2: Normalização da Versão
* **Função**: `sanitizeVersion(opcoes)`
* **Arquivo**: `packages/utils/src/version/sanitize/mod.ts`
* **Ações**:
  1. Lê o conteúdo do arquivo `deno.jsonc`.
  2. Extrai o campo `version` atual.
  3. Utiliza `parseVersion` para capturar apenas os componentes numéricos (ignorando sufixos git ou pré-release).
  4. Formata a nova string de versão.
  5. Substitui a versão no conteúdo original (preservando comentários e formatação JSONC).
  6. Grava o arquivo de volta no disco.

---

## 3. Tabela Resumo

| Função | Chamador | Entrada | Retorno | Efeito Colateral |
|---|---|---|---|---|
| `sanitizeVersionCli()` | Deno CLI | `Deno.args` | `void` | Log de console |
| `sanitizeVersion()` | CLI / API | `SanitizeOptions` | `Promise<string>` | Gravação no `deno.jsonc` |
| `parseVersion()` | `sanitizeVersion` | `string` | `ParsedVersion` | Puro |
| `formatVersion()` | `sanitizeVersion` | `ParsedVersion` | `string` | Puro |

````

---

## Arquivo: `docs/topology-tag-version.md`

````md
# Topologia de Execução: `tag-version`

Este documento descreve a topologia de execução do utilitário **`tag-version`**, que automatiza o ciclo de release git (commit, limpeza de tags e push).

---

## 1. Diagrama de Chamadas (Call Graph)

```
[CLI / Terminal]
       │
       ▼
tagVersionCli() (packages/utils/src/version/tag/cli.ts)
       │
       ├──► findDenoConfig()
       │
       ▼
tagVersion(opcoes: TagOptions) (packages/utils/src/version/tag/mod.ts)
       │
       ├──► [Se sanitize === true]
       │       └──► sanitizeVersion({ denoJsonPath })
       │
       ├──► readProjectVersion(denoJsonPath)
       │
       ├──► [Git Flow]
       │       ├──► git add -A
       │       ├──► git commit -m "Versão vX.Y.Z"
       │       ├──► git push
       │       │
       │       ├──► git tag -d vX.Y (local)
       │       ├──► git push origin :refs/tags/vX.Y (remote)
       │       │
       │       ├──► git tag -a vX.Y -m "Release vX.Y.Z"
       │       └──► git push origin vX.Y
```

---

## 2. Mapeamento Passo a Passo de Execução

### Passo 1: Inicialização do CLI
* **Função**: `tagVersionCli()`
* **Arquivo**: `packages/utils/src/version/tag/cli.ts`
* **Entrada**: Argumentos CLI (`--no-sanitize`, `[path:string]`).
* **Ações**:
  1. Resolve o caminho do `deno.jsonc`.
  2. Chama `tagVersion({ denoJsonPath, sanitize: true })`.

### Passo 2: Orquestração do Release Git
* **Função**: `tagVersion(opcoes)`
* **Arquivo**: `packages/utils/src/version/tag/mod.ts`
* **Ações**:
  1. Opcionalmente normaliza a versão no disco via `sanitizeVersion`.
  2. Lê a versão atual do `deno.jsonc`.
  3. Executa uma sequência de comandos `git` usando `Deno.Command`:
     - **Commit**: Adiciona todas as mudanças e cria um commit com a versão.
     - **Push**: Envia o branch atual para o remoto.
     - **Cleanup**: Remove tags anteriores do mesmo nível (MAJOR.MINOR) para garantir que a tag de release aponte sempre para o commit mais recente.
     - **Tagging**: Cria uma nova tag anotada e envia para o origin com `--force`.

---

## 3. Tabela Resumo

| Função | Chamador | Entrada | Retorno | Efeito Colateral |
|---|---|---|---|---|
| `tagVersionCli()` | Deno CLI | `Deno.args` | `void` | Execução de comandos Git |
| `tagVersion()` | CLI / API | `TagOptions` | `Promise<void>` | Mutação de estado Git local/remoto |
| `sanitizeVersion()` | `tagVersion` | `SanitizeOptions` | `Promise<string>` | Gravação no `deno.jsonc` |

````

---

## Arquivo: `docs/topology-watch.md`

````md
# Topologia de Execução: `watch` (Desenvolvimento Contínuo)

Este documento descreve a topologia completa de execução de funções do utilitário **`watch`**, detalhando a árvore de chamadas, os parâmetros repassados entre cada camada, efeitos colaterais e pontos de extensão.

---

## 1. Diagrama de Chamadas (Call Graph)

```
[CLI / Terminal]
       │
       ▼
watchCli() (packages/utils/src/watch/cli.ts)
       │
       ├──► findDenoConfig()
       ├──► carregarConfigWatch(configPath, baseDir) (packages/utils/src/watch/config.ts)
       │       │
       │       └──► loadConfig<WatchConfigFile>("watch", configPath, baseDir)
       │               └──► readJsoncFile(caminhoCompleto) / parseJsonc
       │
       ▼
watchEngine(opcoes: WatchOptions) (packages/utils/src/watch/engine.ts)
       │
       ├──► readProjectVersion(denoJsoncPath, baseDir)
       │
       ├──► [Resolução de Alvo Único: opcoes.target ou Primeiro 'default: true']
       │
       ├──► validateTargetConfig(targetName, targetConfig)
       │
       ├──► acquireWatchLock(baseDir, targetName, lockFile) (packages/utils/src/watch/lock.ts)
       │       │
       │       ├──► isProcessRunning(pid)
       │       ├──► [Remoção de Lock Órfão / Rejeição se Processo Ativo]
       │       ├──► Deno.writeTextFile(caminhoLock, JSON.stringify(LockInfo))
       │       └──► [Registro de listeners para SIGINT, SIGTERM, unload]
       │
       ├──► cleanTarget(targetConfig.distdir, targetConfig.clean) [se configurado]
       │       └──► [Itera targetConfig.clean.includes/excludes]
       │
       ├──► copyStaticFiles(targetConfig, version, baseDir, distDir)
       │       └──► [Loop targetConfig.copyFiles: { includes, excludes, basedir }]
       │
       ├──► buildWatchEsbuildOptions(targetName, targetConfig, version, listAssetsForCache)
       │       │
       │       ├──► listAssetsForCache(targetConfig.distdir) [se target === "sw"]
       │       ├──► resolveEntryPoints(config.srcdir, config.entryPoints)
       │       └──► resolveOutputPaths(config)
       │
       ├──► denoPlugin({ configPath: denoJsoncPath })
       │
       ├──► esbuild.context(esbuildOptions) [Criação do Contexto Persistente]
       │
       ├──► ctx.watch() [Início do Monitoramento em Tempo Real]
       │
       └──► Retorna [WatchHandle] com { target, close: async () => { ctx.dispose(); releaseLock(); } }
```

---

## 2. Mapeamento Passo a Passo de Execução

### Passo 1: Inicialização do CLI e Validação do Argumento
* **Função**: `watchCli()`
* **Arquivo**: `packages/utils/src/watch/cli.ts`
* **Entrada**: Argumentos CLI via Cliffy (`-c/--app-config`, `-b/--base-dir`, `-d/--deno-config`, `[target:string]`).
* **Ações**:
  1. Configuração do comando Cliffy com `.arguments("[target:string]")`. O próprio Cliffy rejeita a passagem de múltiplos argumentos posicionais com erro nativo (`Too many arguments: ...`).
  2. `findDenoConfig()`: Localiza o arquivo de configuração do Deno.
  3. `carregarConfigWatch(configPath, baseDir)`: Lê `watch.jsonc` ou devolve `CONFIGURACOES_PADRAO_WATCH`.
  4. Repassa `target: target || undefined` para `watchEngine(opcoes)`.
  5. Configura `Deno.addSignalListener("SIGINT" | "SIGTERM")` para encerramento gracioso via `handle.close()`.
  6. Mantém o processo ativo em espera contínua (`await new Promise(() => {})`).

### Passo 2: Resolução de Alvo e Controle de Concorrência
* **Função**: `watchEngine(opcoes: WatchOptions)`
* **Arquivo**: `packages/utils/src/watch/engine.ts`
* **Parâmetros de Entrada**:
  ```typescript
  opcoes: {
    config: WatchGlobalConfig;
    target?: string;
    baseDir?: string;
    denoJsoncPath?: string;
    lockFile?: string;
    silencioso?: boolean;
  }
  ```
* **Ações e Subfunções**:
  1. `readProjectVersion(denoJsoncPath, baseDir)`: Lê a versão sem modificá-la nem incrementá-la (comportamento estrito do watch).
  2. **Resolução de Alvo**:
     - Se `opcoes.target` foi informado, busca o nome correspondente (case-insensitive). Se não existir, lança erro `Alvo '<target>' não encontrado...`.
     - Se nenhum alvo for informado, seleciona **apenas o primeiro** alvo com `default !== false`.
  3. `validateTargetConfig(targetName, targetConfig)`: Valida a integridade da configuração.
  4. `acquireWatchLock(baseDir, targetName, lockFile)` (`packages/utils/src/watch/lock.ts`):
     - Verifica a existência do arquivo de lock (`.buildit-watch.lock`).
     - Se existir, extrai o PID do lock anterior e chama `isProcessRunning(pid)`.
     - Se o processo anterior estiver ativo, lança erro `Já existe uma instância do watch em execução...` bloqueando concorrência.
     - Se o processo anterior estiver morto (lock órfão), descarta o arquivo e prossegue.
     - Grava o novo lock com PID atual, timestamp, alvo e caminho.
     - Retorna a função de limpeza `releaseLock()`.

### Passo 3: Inicialização do Motor esbuild Context
* **Função**: `buildWatchEsbuildOptions` & `esbuild.context`
* **Arquivo**: `packages/utils/src/watch/engine.ts`
* **Ações e Subfunções**:
  1. `cleanTarget(distdir, clean)`: Limpa a pasta de saída baseada em `includes`/`excludes`.
  2. `copyStaticFiles(targetConfig, version, baseDir, distDir)`: Copia arquivos baseados em `copyFiles` (suporte a globs).
  3. `buildWatchEsbuildOptions(targetName, targetConfig, version, listAssetsForCache)`:
     - Define `__APP_VERSION__`.
     - Coleta assets para cache se `targetName === "sw"`.
     - Resolve entry points e saídas com sourcemap `inline` padrão.
  4. Injeta `denoPlugin({ configPath: denoJsoncPath })`.
  5. `esbuild.context(esbuildOptions)`: Instancia o contexto incremental do esbuild.
  6. `ctx.watch()`: Dispara os observadores do sistema de arquivos e compilação contínua em segundo plano.
  7. Retorna o handle com o método `close()` que fecha o contexto (`ctx.dispose()`) e libera o arquivo de lock (`releaseLock()`).

---

## 3. Tabela Resumo de Parâmetros e Retornos

| Função | Chamador | Entrada / Parâmetros | Retorno | Efeito Colateral |
|---|---|---|---|---|
| `watchCli()` | Runtime Deno CLI | `Deno.args` | `Command` instance | Processamento CLI, captura de sinais, loop de vida |
| `carregarConfigWatch()` | `watchCli` | `caminhoConfig?: string`, `baseDir?: string` | `Promise<WatchConfigResult>` | Leitura de `watch.jsonc` no disco |
| `watchEngine()` | `watchCli` / API | `opcoes: WatchOptions` | `Promise<WatchHandle[]>` | Criação do Lock, inicialização de watcher incremental |
| `acquireWatchLock()` | `watchEngine` | `baseDir: string`, `targetName: string`, `customPath?: string` | `Promise<() => Promise<void>>` | Criação de arquivo `.buildit-watch.lock`, registro de listeners |
| `isProcessRunning()` | `acquireWatchLock` | `pid: number` | `boolean` | Verificação de PID via sinal 0 no SO |
| `buildWatchEsbuildOptions()` | `watchEngine` | `targetName`, `config`, `version`, `listAssetsFn?` | `Promise<esbuild.BuildOptions>` | Mapeamento de entrypoints, sourcemap inline e defines |
| `handle.close()` | `watchCli` / Testes | Nenhuma | `Promise<void>` | `ctx.dispose()` e `releaseLock()` |

---

## 4. Oportunidades de Melhoria e Refatoração

1. **Recarregamento de Static Files (Hot Copy)**: Atualmente `copyStaticFiles` é executado na inicialização. Um watcher complementar para a pasta `publicdir` permitiria recopiar automaticamente imagens ou assets modificados durante a sessão de desenvolvimento.
2. **Notificação de Rebuild / Callback Hook**: Adicionar suporte a callbacks de hook (ex: `onRebuild(result)`) nas opções do `watchEngine` para integração com servidores de desenvolvimento que queiram emitir SSE ou WebSocket de recarga para o navegador.
3. **Suporte a Multi-Target Paralelo com Isolamento de Lock**: Caso no futuro seja desejado monitorar múltiplos alvos simultâneos (ex: `ui` e `server` em paralelo), o mecanismo de lock pode evoluir para locks nomeados por alvo (`.buildit-watch-<target>.lock`).

````

---

