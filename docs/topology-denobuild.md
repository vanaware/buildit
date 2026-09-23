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
               │
               ├──► copyStaticFiles(config, appVersion)
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
  2. `cleanTarget(distdir, clean)`: Limpeza de diretórios de saída antes do build.
  3. `copyStaticFiles(config, appVersion)`: Cópia de diretório público e substituição no HTML.
  4. Preparação de constantes `defines` em memória:
     - `__APP_VERSION__ = JSON.stringify("v" + appVersion)`
     - `__GENERATED_ASSETS__ = JSON.stringify(assets)` (se `targetName === "sw"`).
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
