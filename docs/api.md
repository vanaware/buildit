# 📖 Referência da API e Configurações do BuildIt

Documentação técnica oficial dos utilitários da biblioteca `@vanaware/buildit`. Este guia abrange a **API programática em TypeScript**, **arquitetura de CLI** e **todas as configurações possíveis via arquivos JSONC/JSON** para os 4 utilitários:

1. [⚡ Motor esbuild (`esbuild.jsonc`)](#-1-motor-esbuild-esbuildjsonc)
2. [👀 Motor Watch (`watch.jsonc`)](#-2-motor-watch-watchjsonc)
3. [📦 Motor Deno.bundle (`denobuild.jsonc`)](#-3-motor-denobundle-denobuildjsonc)
4. [📝 Exportador de Contexto para IA (`export.jsonc`)](#-4-exportador-de-contexto-para-ia-exportjsonc)
5. [💡 Como Usar os Schemas no Editor ($schema)](#-5-como-usar-os-schemas-no-editor-schema)
6. [🛠️ Utilitários de Versão e CLI](#-6-utilitários-de-versão-e-cli)
7. [💻 API Programática em TypeScript](#-7-api-programática-em-typescript)

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
| `target` | `string \| string[]` | `"esnext"` | Ambientes alvos de compatibilidade (ex: `"esnext"`, `"chrome110"`). |
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

## 💡 5. Como Usar os Schemas no Editor ($schema)

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

## 🛠️ 6. Utilitários de Versão e CLI

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

## 💻 7. API Programática em TypeScript

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
