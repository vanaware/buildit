# 📖 Referência da API e Configurações do BuildIt

Documentação técnica oficial dos utilitários da biblioteca `@vanaware/buildit`. Este guia abrange a **API programática em TypeScript** e **todas as configurações possíveis via arquivos JSONC/JSON** para os três motores:

1. [⚡ Motor esbuild (`esbuild.jsonc`)](#-1-motor-esbuild-esbuildjsonc)
2. [📦 Motor Deno.bundle (`denobuild.jsonc`)](#-2-motor-denobundle-denobuildjsonc)
3. [📝 Exportador de Contexto para IA (`export.jsonc`)](#-3-exportador-de-contexto-para-ia-exportjsonc)
4. [🛠️ Utilitários de Versão e CLI](#-4-utilitários-de-versão-e-cli)
5. [💻 API Programática em TypeScript](#-5-api-programática-em-typescript)

---

## ⚡ 1. Motor esbuild (`esbuild.jsonc`)

O motor `esbuild` orquestra empacotamento ultrarrápido utilizando o esbuild e o plugin oficial `@deno/esbuild-plugin`, incluindo cópia de ativos estáticos, injeção de versão, substituição de variáveis e geração de manifestos de cache.

### Estrutura Raiz do Arquivo

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `$schema` | `string` | Não | URL do JSON Schema para autocomplete e validação no editor. |
| `version` | `string` | Não | Versão semântica da configuração do projeto. |
| `targets` / `alvos` | `Record<string, TargetConfig>` | Sim* | Dicionário de alvos de compilação (*ou alvos declarados na raiz). |

---

### Opções de Cada Alvo (`TargetConfig`)

#### 🔄 Pipeline e Gestão de Arquivos (Pré/Pós Build)

| Propriedade | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `mode` | `"build" \| "watch"` | `"build"` | Modo de execução. `"build"` compila e finaliza. `"watch"` inicia o observador de arquivos e recompila automaticamente. |
| `default` | `boolean` | `true` | Se `true`, é executado automaticamente quando nenhum alvo específico é passado na CLI. *(Ignorado para alvos `watch`)*. |
| `srcdir` | `string` | `"."` | Diretório base dos fontes do alvo (relativo à raiz de execução). |
| `distdir` | `string` | `"."` | Diretório de destino final onde os artefatos compilados são gravados. |
| `publicdir` | `string` | `undefined` | Diretório de ativos estáticos copiados recursivamente para `distdir`. |
| `indexHtml` | `boolean` | `false` | Se `true`, busca o `index.html` em `srcdir` ou `publicdir` e copia para `distdir`. |
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
| `conditions` | `string[]` | `[]` | Condições personalizadas de resolução de export do `package.json` (ex: `["browser"]`). |
| `define` | `Record<string, string>` | `{}` | Mapa de substituição de constantes globais em tempo de compilação. *(Obs: `__APP_VERSION__` é sempre injetado automaticamente)*. |
| `drop` | `("console" \| "debugger")[]` | `[]` | Instruções a serem eliminadas do código compilado (ex: `["debugger"]`). |
| `external` | `string[]` | `[]` | Módulos a não empacotar, mantendo como imports externos em runtime. |
| `metafile` | `boolean` | `false` | Se gera arquivo de metadados em formato JSON para análise visual de dependências. |
| `write` | `boolean` | `true` | Se grava os arquivos compilados no disco. Se `false`, mantém apenas em memória. |
| `treeShaking` | `boolean` | `true` (em bundle) | Habilita eliminação de código inativo (dead-code elimination). |
| `legalComments` | `"none" \| "inline" \| "eof" \| "linked" \| "external"` | `"eof"` | Estratégia de preservação e posicionamento de comentários de licença. |
| `keepNames` | `boolean` | `true` | Preserva os nomes originais de funções e classes em builds minificados. |
| `outfile` | `string` | `undefined` | Nome ou caminho explícito do arquivo de saída (válido para 1 entryPoint). |
| `splitting` | `boolean` | `false` | Habilita divisão de código em chunks sob demanda (requer `format: "esm"`). |
| `loader` | `Record<string, EsbuildLoader>` | `{}` | Mapeamento de extensões para loaders esbuild (`js`, `jsx`, `ts`, `tsx`, `css`, `json`, `text`, `base64`, `dataurl`, `file`, `binary`, `empty`, `copy`). |
| `alias` | `Record<string, string>` | `{}` | Mapeamento de aliases de importação de módulos. |
| `inject` | `string[]` | `[]` | Arquivos cujos módulos são executados antes de cada ponto de entrada (ex: polyfills). |
| `banner` | `{ js?: string; css?: string }` | `undefined` | Bloco de texto ou comentário inserido no início dos arquivos gerados. |
| `footer` | `{ js?: string; css?: string }` | `undefined` | Bloco de texto ou comentário inserido no final dos arquivos gerados. |
| `target` | `string \| string[]` | `"esnext"` | Ambientes alvos de compatibilidade (ex: `"esnext"`, `"chrome110"`). |
| `charset` | `"ascii" \| "utf8"` | `"utf8"` | Codificação de caracteres do arquivo emitido. |
| `logLevel` | `"verbose" \| "debug" \| "info" \| "warning" \| "error" \| "silent"` | `"info"` | Nível de detalhamento das mensagens do esbuild. |
| `logLimit` | `number` | `undefined` | Limite máximo de avisos e erros exibidos antes de truncar. |
| `logOverride` | `Record<string, EsbuildLogLevel>` | `{}` | Sobrescrita de nível de severidade por código de mensagem de erro. |
| `entryNames` | `string` | `undefined` | Padrão de nomenclatura para pontos de entrada (ex: `"[name]-[hash]"`). |
| `chunkNames` | `string` | `undefined` | Padrão de nomenclatura para chunks compartilhados. |
| `assetNames` | `string` | `undefined` | Padrão de nomenclatura para ativos estáticos carregados via loader `file`. |
| `publicPath` | `string` | `undefined` | Prefixo público de URL para assets referenciados nos arquivos gerados. |
| `pure` | `string[]` | `[]` | Funções marcadas como puras para descarte seguro se o resultado não for utilizado. |
| `plugins` | `unknown[]` | `[]` | Lista de plugins customizados adicionados ao pipeline do esbuild. |

---

### Exemplo Completo de Referência: `esbuild.jsonc`

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/vanaware/buildit/main/schemas/esbuild.json",
  "version": "0.3.14",
  "targets": {
    "ui": {
      "mode": "build",
      "default": true,
      "srcdir": "packages/ui/src",
      "distdir": "packages/server/build/dist",
      "publicdir": "packages/ui/public",
      "indexHtml": true,
      "clean": ["."],
      "entryPoints": ["main.tsx"],
      "platform": "browser",
      "format": "esm",
      "bundle": true,
      "minify": false,
      "sourcemap": "linked",
      "conditions": ["browser"],
      "drop": ["debugger"],
      "jsx": "automatic",
      "jsxImportSource": "preact",
      "metafile": true,
      "write": true,
      "legalComments": "eof",
      "keepNames": true,
      "splitting": false,
      "define": {
        "__API_URL__": "\"https://api.buildit.local\""
      },
      "banner": {
        "js": "/*! BuildIt v__APP_VERSION__ | (c) 2026 Vanaware | MIT */\n"
      }
    },
    "watch": {
      "mode": "watch",
      "default": false,
      "srcdir": "packages/ui/src",
      "distdir": "packages/server/build/dist",
      "publicdir": "packages/ui/public",
      "indexHtml": true,
      "entryPoints": ["main.ts"],
      "platform": "browser",
      "format": "esm",
      "bundle": true,
      "sourcemap": "inline",
      "jsx": "automatic",
      "jsxImportSource": "preact",
      "outfile": "app.js"
    }
  }
}
```

---

## 📦 2. Motor Deno.bundle (`denobuild.jsonc`)

O motor `denobuild` utiliza a API nativa `Deno.bundle` (`--unstable-bundle`), eliminando qualquer dependência de binários externos do Go/esbuild para empacotamento em ambientes puros Deno.

### Estrutura Raiz do Arquivo

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `$schema` | `string` | Não | URL do JSON Schema para o compilador Deno. |
| `version` | `string` | Não | Versão semântica do projeto. |
| `targets` / `alvos` | `Record<string, DenoBundleTargetConfig>` | Sim* | Dicionário de alvos de build. |

---

### Opções de Cada Alvo (`DenoBundleTargetConfig`)

#### 🔄 Pipeline BuildIt (Pré/Pós Build)

| Propriedade | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `srcdir` | `string` | `"."` | Diretório fonte onde residem os pontos de entrada. |
| `distdir` | `string` | `"."` | Diretório de saída final dos arquivos empacotados. |
| `publicdir` | `string` | `undefined` | Diretório de ativos estáticos a copiar para `distdir`. |
| `indexHtml` | `boolean` | `false` | Se `true`, copia o `index.html` para `distdir`. |
| `clean` | `string[]` | `[]` | Pastas ou arquivos a limpar antes do build (use `["."]` para todo o distdir). |
| `default` | `boolean` | `true` | Se roda automaticamente quando nenhum alvo é indicado na chamada CLI. |
| `mode` | `"build" \| "watch"` | `"build"` | Modo de execução. *(Obs: `watch` não é suportado pelo runtime do Deno.bundle e emite aviso)*. |

#### ⚙️ Opções Nativas `Deno.bundle`

| Propriedade | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `entryPoints` | `string[]` | **Obrigatório** | Pontos de entrada TypeScript ou JavaScript a serem empacotados. |
| `format` | `"esm" \| "cjs" \| "iife"` | `"esm"` | Formato de saída do bundle. |
| `platform` | `"browser" \| "deno"` | `"browser"` | Plataforma alvo de otimização de runtime. |
| `minify` | `boolean` | `false` | Se aplica minificação no arquivo emitido. |
| `keepNames` | `boolean` | `true` | Se preserva os nomes originais de funções e classes. |
| `sourcemap` | `"linked" \| "inline" \| "external"` | `"linked"` | Estratégia de mapa de fontes. |
| `codeSplitting` | `boolean` | `false` | Se divide o bundle em múltiplos arquivos modulares sob demanda. |
| `inlineImports` | `boolean` | `false` | Se inclui o código de imports externos diretamente no bundle final. |
| `packages` | `"bundle" \| "external"` | `"bundle"` | Se empacota dependências de terceiros (`"bundle"`) ou as mantém externas (`"external"`). |
| `external` | `string[]` | `[]` | Specifiers ou pacotes explicitamente excluídos do bundle. |

#### 🔧 Extensões BuildIt

| Propriedade | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `define` | `Record<string, string>` | `{}` | Mapeamento de constantes substituídas em memória nos `OutputFiles` antes da gravação em disco. *(Obs: `__APP_VERSION__` é sempre injetado automaticamente)*. |
| `outfile` | `string` | `undefined` | Nome explícito do arquivo compilado gerado (quando houver apenas 1 entrypoint). |

---

### Exemplo Completo de Referência: `denobuild.jsonc`

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/vanaware/buildit/main/schemas/denobuild.json",
  "version": "0.3.14",
  "targets": {
    "ui": {
      "mode": "build",
      "default": true,
      "srcdir": "packages/ui/src",
      "distdir": "packages/server/build/dist",
      "publicdir": "packages/ui/public",
      "indexHtml": true,
      "clean": ["."],
      "entryPoints": ["main.tsx"],
      "platform": "browser",
      "format": "esm",
      "minify": false,
      "sourcemap": "linked",
      "keepNames": true,
      "codeSplitting": false,
      "packages": "bundle",
      "inlineImports": true,
      "define": {
        "__BUILD_ENV__": "\"production\""
      }
    }
  }
}
```

---

## 📝 3. Exportador de Contexto para IA (`export.jsonc`)

O motor `export` varre seletivamente a árvore de arquivos de um projeto, aplicando filtros de extensão, diretórios permitidos e cabeçalhos explicativos para gerar snapshots em Markdown prontos para inclusão em prompts ou sessões de LLM.

### Estrutura Raiz do Arquivo

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `$schema` | `string` | Não | URL do JSON Schema do exportador. |
| `version` | `string` | Não | Versão semântica da configuração. |
| `modos` | `Record<string, ExportConfig>` | Sim | Dicionário contendo as configurações de cada modo de exportação. |

---

### Opções de Cada Modo (`ExportConfig`)

| Propriedade | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `arquivoSaida` | `string` | Sim | Caminho do arquivo Markdown gerado (relativo à raiz de execução). Ex: `"snapshots/ui.md"`. |
| `extensoesPermitidas` | `string[]` | Sim | Lista de extensões de arquivos a serem capturadas na varredura. Ex: `[".ts", ".tsx", ".md"]`. |
| `pastaBase` | `string` | Sim | Pasta base onde a busca e a árvore de caminhos relativos se iniciam. |
| `subpastasPermitidas` | `string[]` | Sim | Lista de subdiretórios dentro de `pastaBase` que podem ser varridos recursivamente. |
| `arquivosRaizPermitidos` | `string[]` | Sim | Nomes exatos de arquivos localizados diretamente na raiz de `pastaBase` a serem incluídos. |
| `caminhosAdicionaisPermitidos` | `string[]` | Não | Arquivos ou diretórios localizados fora de `pastaBase` que devem ser incorporados ao snapshot. |
| `incluiVersao` | `boolean` | Sim | Se `true`, injeta a versão atual do projeto e data de geração no topo do snapshot. |
| `instrucaoCustomizada` | `string` | Sim | Mensagem de orientação para o modelo de IA explicando o escopo e contexto do arquivo. |
| `default` | `boolean` | Não | Se o modo deve ser executado quando o exportador for chamado sem modos posicionais (padrão: `true`). |

---

### Exemplo Completo de Referência: `export.jsonc`

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/vanaware/buildit/main/schemas/export.json",
  "version": "0.3.14",
  "modos": {
    "ui": {
      "arquivoSaida": "snapshots/ui.md",
      "extensoesPermitidas": [
        ".tsx", ".jsx", ".js", ".ts", ".css", ".html", ".json", ".jsonc", ".md"
      ],
      "pastaBase": "./packages/ui/",
      "subpastasPermitidas": ["src", "public", "tests", "docs"],
      "arquivosRaizPermitidos": ["deno.json", "deno.jsonc", "readme.md"],
      "incluiVersao": true,
      "instrucaoCustomizada": "O texto abaixo contém os arquivos de CÓDIGO FONTE principais da aplicação exemplo (UI).",
      "default": true
    },
    "docs": {
      "arquivoSaida": "snapshots/docs.md",
      "extensoesPermitidas": [".md", ".txt"],
      "pastaBase": "./",
      "subpastasPermitidas": ["docs"],
      "arquivosRaizPermitidos": [
        "readme.md", "license", "license.md", ".tool-versions"
      ],
      "incluiVersao": false,
      "instrucaoCustomizada": "O texto abaixo contém a DOCUMENTAÇÃO e diretrizes arquiteturais do projeto.",
      "default": false
    },
    "utils": {
      "arquivoSaida": "snapshots/utils.md",
      "extensoesPermitidas": [".ts", ".json", ".jsonc", ".md"],
      "pastaBase": "packages/utils",
      "subpastasPermitidas": ["src", "tests", "docs"],
      "caminhosAdicionaisPermitidos": ["esbuild.ts", "build.ts", "export.ts"],
      "arquivosRaizPermitidos": ["deno.json", "deno.jsonc", "readme.md"],
      "incluiVersao": true,
      "instrucaoCustomizada": "O texto abaixo contém o código e testes da biblioteca @vanaware/buildit",
      "default": true
    }
  }
}
```

---

## 🛠️ 4. Utilitários de Versão e CLI

A biblioteca conta com um analisador de argumentos padronizado e um sincronizador de versionamento semântico.

### Flags Padronizadas de CLI

| Flag Longa | Flag Curta | Descrição |
| :--- | :--- | :--- |
| `--config <caminho>` | `-c <caminho>` | Especifica um arquivo de configuração alternativo (ex: `-c build.custom.jsonc`). |
| `--noversion` | `-n` | Impede o incremento automático do patch da versão durante a compilação. |
| `--forcepackagesversion` | `-f` | Propaga a versão do `deno.jsonc` raiz para todos os manifestos de subpacotes do workspace. |
| `--version-path <caminho>` | — | Define um caminho de arquivo onde gerar o módulo de constante `version.ts`. |
| `--version` | `-V`, `-v` | Exibe a versão atual do utilitário e encerra a execução. |
| `--help` | `-h` | Exibe a tela de ajuda da CLI. |
| *(argumentos posicionais)* | — | Nomes de alvos ou modos específicos a serem executados (ex: `deno task build ui`). |

---

## 💻 5. API Programática em TypeScript

Todos os utilitários podem ser consumidos diretamente via código através do pacote JSR `jsr:@vanaware/buildit`.

### 5.1 Compilação com esbuild

```ts
import { runEsbuild, carregarConfigEsbuild } from "jsr:@vanaware/buildit/esbuild";

// Executa alvos a partir de esbuild.jsonc
const resultados = await runEsbuild({
  targets: ["ui"],
  caminhoConfig: "esbuild.jsonc",
  noversion: true,
  silencioso: false,
});

for (const res of resultados) {
  console.log(`Alvo ${res.target}: ${res.success ? "Sucesso" : "Falha"} (${res.durationMs}ms)`);
}
```

#### Assinatura: `runEsbuild(opcoes?: EsbuildOptions): Promise<EsbuildResult[]>`

- **`EsbuildOptions`**:
  - `targets?: string[]`: Alvos selecionados.
  - `config?: GlobalTargetConfig`: Configuração injetada em memória.
  - `caminhoConfig?: string`: Caminho do arquivo JSONC.
  - `noversion?: boolean`: Impede incremento de versão.
  - `versionPaths?: string[]`: Locais adicionais para `version.ts`.
  - `forcepackagesversion?: boolean`: Sincroniza versão nos pacotes do workspace.
  - `baseDir?: string`: Diretório base (padrão: `"."`).
  - `watchTarget?: string`: Alvo para modo contínuo de observação.
  - `silencioso?: boolean`: Suprime mensagens informativas no terminal.

---

### 5.2 Compilação com Deno.bundle

```ts
import { runDenoBuild, carregarConfigDenoBuild } from "jsr:@vanaware/buildit/denobuild";

const resultados = await runDenoBuild({
  targets: ["ui"],
  caminhoConfig: "denobuild.jsonc",
  noversion: true,
});

for (const res of resultados) {
  console.log(`Alvo ${res.target}: compilado em ${res.durationMs}ms`);
}
```

#### Assinatura: `runDenoBuild(opcoes?: DenoBuildOptions): Promise<DenoBuildResult[]>`

---

### 5.3 Exportação de Contexto para IA

```ts
import { runExport, carregarConfigExport } from "jsr:@vanaware/buildit/export";

const resultados = await runExport({
  caminhoConfig: "export.jsonc",
  modos: ["ui", "docs"],
  silencioso: false,
});

for (const res of resultados) {
  console.log(`Modo ${res.modo}: ${res.arquivosProcessados} arquivos exportados para ${res.arquivoSaida}`);
}
```

#### Assinatura: `runExport(configOuOpcoes?: Record<string, ExportConfig> | ExportOptions): Promise<ExportResult[]>`

- **`ExportResult`**:
  - `modo: string`: Identificador do modo exportado.
  - `arquivoSaida: string`: Destino do arquivo Markdown gravado.
  - `arquivosProcessados: number`: Total de arquivos incorporados.
  - `bytesGravados: number`: Tamanho do arquivo gerado em bytes.
  - `duracaoMs: number`: Tempo de processamento.

---

### 5.4 Gerenciamento de Versão Semântica

```ts
import { syncVersion, parseVersion } from "jsr:@vanaware/buildit/config";

// Incrementa o patch no deno.jsonc raiz e gera version.ts
const novaVersao = await syncVersion({
  baseDir: ".",
  noversion: false,
  forcepackagesversion: true,
  versionPaths: ["packages/utils/src/version.ts"],
});

console.log(`Versão atualizada para: ${novaVersao}`);

// Parseia detalhes numéricos da versão
const parsed = parseVersion(novaVersao);
console.log(`Major: ${parsed.major}, Minor: ${parsed.minor}, Patch: ${parsed.patch}`);
```
