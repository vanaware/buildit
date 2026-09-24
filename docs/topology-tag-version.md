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
