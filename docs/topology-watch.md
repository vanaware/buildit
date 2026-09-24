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
