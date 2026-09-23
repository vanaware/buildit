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
       │
       └──► [Loop para cada Modo Selecionado]
               │
               ▼
       exportarModo(modo, config, opcoes)
               │
               ├──► gerarCabecalho(config, modo, versaoApp) (packages/utils/src/export/formatter.ts)
               │
               ├──► walk(baseDir, { includeDirs: false }) [@std/fs/walk]
               │       │
               │       ▼ [Para cada arquivo encontrado]
               │       deveIncluirArquivo(caminhoRelativo, config) (packages/utils/src/export/formatter.ts)
               │               │
               │               ├──► normalizarCaminho(caminho)
               │               ├──► [Verificação de Proteção Anti-loop (exports/, snapshots/)]
               │               ├──► [Verificação de caminhosAdicionaisPermitidos]
               │               ├──► [Verificação de pastaBase + subpastasPermitidas]
               │               ├──► [Verificação de arquivosRaizPermitidos]
               │               └──► [Validação de extensoesPermitidas]
               │
               ├──► Deno.readTextFile(entry.path)
               │
               ├──► formatarArquivoMarkdown(caminhoRelativo, conteudoArquivo) (packages/utils/src/export/formatter.ts)
               │       │
               │       ├──► mapearExtensao(ext)
               │       └──► calcularCraseWrapper(conteudo)
               │
               ├──► ensureDirForFile(caminhoSaida)
               │
               └──► Deno.writeTextFile(caminhoSaida, conteudoFinal)
```

---

## 2. Mapeamento Passo a Passo de Execução

### Passo 1: Inicialização do CLI
* **Função**: `exportCli()`
* **Arquivo**: `packages/utils/src/export/cli.ts`
* **Entrada**: Argumentos CLI via Cliffy (`-c/--app-config`, `-b/--base-dir`, `-d/--deno-config`, `[modos...:string]`).
* **Ações**:
  1. Identifica o arquivo de configuração e diretório base.
  2. Executa `carregarConfigExport(caminhoConfig, baseDir)` para ler `export.jsonc` ou carregar o fallback padrão (`ui`, `docs`, `server`).
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
  2. Filtra os modos selecionados contra a configuração. Se nenhum foi passado explicitamente, filtra aqueles com `default !== false`.
  3. Itera sequencialmente sobre cada modo executando `exportarModo(...)`.
  4. Retorna a lista de `ExportResult[]` com total de arquivos e bytes gerados.

### Passo 3: Processamento do Modo Individual
* **Função**: `exportarModo(modo, config, opcoes)`
* **Arquivo**: `packages/utils/src/export/engine.ts`
* **Parâmetros de Entrada**:
  - `modo: string`: Nome do modo (ex: `"ui"`, `"docs"`)
  - `config: ExportConfig`: Configuração detalhada do modo (filtros, caminhos e regras)
  - `opcoes?: { versaoApp?, baseDir?, silencioso?, denoJsoncPath? }`
* **Ações e Subfunções**:
  1. `gerarCabecalho(config, modo, versaoApp)` (`packages/utils/src/export/formatter.ts`):
     - Cria o banner inicial em Markdown com título do modo, versão (se `incluiVersao: true`), timestamp ISO e `instrucaoCustomizada`.
  2. `walk(baseDir, { includeDirs: false })`:
     - Varre recursivamente a árvore de arquivos do diretório base.
  3. `deveIncluirArquivo(caminhoRelativo, config)` (`packages/utils/src/export/formatter.ts`):
     - `normalizarCaminho(caminho)`: Converte barras invertidas e normaliza para minúsculas.
     - **Regra Anti-Loop**: Bloqueia categoricamente arquivos dentro de `exports/` ou `snapshots/` para impedir que arquivos de saída sejam consumidos como entrada recursiva.
     - Valida se o arquivo pertence a `caminhosAdicionaisPermitidos`.
     - Valida se o arquivo está na raiz de `pastaBase` e em `arquivosRaizPermitidos`.
     - Valida se o arquivo pertence a uma das `subpastasPermitidas`.
     - Valida se a extensão do arquivo está contida em `extensoesPermitidas`.
  4. Leitura e Formatação:
     - `Deno.readTextFile(entry.path)`: Lê o conteúdo textual do arquivo.
     - `formatarArquivoMarkdown(caminhoRelativo, conteudoArquivo)`:
       - `mapearExtensao(ext)`: Mapeia extensões especiais (`.jsonc` -> `json`, `.sh` -> `bash`, `.env*` -> `properties`, `.manifest` -> `json`).
       - `calcularCraseWrapper(conteudo)`: Calcula dinamicamente o número de crases necessárias para o code fence (se o arquivo contiver \`\`\`, usa \`\`\`\` ou mais para garantir Markdown válido).
       - Anexa o cabeçalho do arquivo com link relativo, tag de linguagem e bloco fechado.
  5. Gravação em Disco:
     - `ensureDirForFile(caminhoSaida)`: Cria o diretório de destino do snapshot.
     - `Deno.writeTextFile(caminhoSaida, conteudoFinal)`: Grava o documento Markdown consolidado.

---

## 3. Tabela Resumo de Parâmetros e Retornos

| Função | Chamador | Entrada / Parâmetros | Retorno | Efeito Colateral |
|---|---|---|---|---|
| `exportCli()` | Runtime Deno CLI | `Deno.args` | `Command` instance | Processamento CLI e saída console |
| `carregarConfigExport()` | `exportCli` | `caminhoConfig?: string`, `baseDir?: string` | `Promise<Record<string, ExportConfig>>` | Leitura do sistema de arquivos (`export.jsonc`) |
| `exportEngine()` | `exportCli` / API | `opcoes: ExportOptions` | `Promise<ExportResult[]>` | Orquestração de exportação |
| `exportarModo()` | `exportEngine` | `modo: string`, `config: ExportConfig`, `opcoes?` | `Promise<ExportResult>` | Varredura do disco e escrita do snapshot Markdown |
| `gerarCabecalho()` | `exportarModo` | `config: ExportConfig`, `modo: string`, `versaoApp: string` | `string` | Formatação de string Markdown em memória |
| `deveIncluirArquivo()` | `exportarModo` | `caminho: string`, `config: ExportConfig` | `boolean` | Avaliação de filtros de caminho e extensão |
| `formatarArquivoMarkdown()` | `exportarModo` | `caminho: string`, `conteudo: string` | `string` | Formatação com code fence e syntax highlight |
| `calcularCraseWrapper()` | `formatarArquivoMarkdown` | `conteudo: string` | `string` (ex: ```` ``` ```` ou ```` ```` ````) | Cálculo de escape de Markdown |
| `mapearExtensao()` | `formatarArquivoMarkdown` | `extensao: string` | `string` (linguagem de highlight) | Normalização de linguagem |

---

## 4. Oportunidades de Melhoria e Refatoração

1. **Varredura Otimizada (Evitar Walk Global)**: Atualmente o `walk` percorre a partir de `baseDir` (".") e filtra cada entrada. Poderia iniciar o `walk` diretamente a partir de `config.pastaBase` e `caminhosAdicionaisPermitidos`, reduzindo I/O em repositórios grandes.
2. **Streaming / Buffer de Escrita**: Para repositórios muito volumosos, concatenar strings em memória pode gerar consumo elevado de RAM. Uma abordagem usando streams de escrita para o arquivo Markdown de destino aumentaria a eficiência.
3. **Respeito a `.gitignore`**: Integrar um parser opcional de `.gitignore` para ignorar automaticamente arquivos temporários gerados durante o desenvolvimento local.
