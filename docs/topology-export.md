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
