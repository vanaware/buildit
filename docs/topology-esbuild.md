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
               │       └──► Deno.remove(...) / emptyDir(...)
               │
               ├──► copyStaticFiles(config, appVersion)
               │       ├──► ensureDir(...) / copy(...)
               │       └──► replaceVersionInFile(indexHtml, appVersion) [se indexHtml: true]
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
     - Esvazia ou remove caminhos especificados em `config.clean` dentro de `distdir`.
  3. `copyStaticFiles(config, appVersion)` (`packages/utils/src/tools/paths.ts`):
     - Copia assets de `publicdir` para `distdir`.
     - Se `indexHtml: true`, substitui tags de versão e cache busting no HTML.
  4. `buildEsbuildOptions(targetName, config, appVersion, listAssetsFn)`:
     - Monta o dicionário de `define` com `__APP_VERSION__`.
     - Se `targetName === "sw"`, executa `listAssetsFn(distdir)` e injeta `__GENERATED_ASSETS__`.
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
