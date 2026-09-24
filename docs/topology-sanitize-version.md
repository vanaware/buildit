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
