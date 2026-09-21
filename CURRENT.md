# Arquivo `CURRENT.md`

## Status Atual: Fase 1 (Em Andamento)

Este repositório é um fork do workerdb e está sendo refatorado para disponibilizar a biblioteca `@vanaware/buildit`.

Esta biblioteca será basicamente o pacote `packages/utils` que conterá três CLIs/utilitários:
1. **denobuild** => derivado do `build.ts` que usará um arquivo config externo `denobuild.jsonc` *(Pendente)*
2. **esbuild** => derivado do `esbuild.ts` que usará um arquivo config externo `esbuild.jsonc` *(Pendente)*
3. **export** => derivado do `export.ts` que usa o arquivo config externo `export.jsonc` *(✅ Concluído)*

### ✅ Tarefas Realizadas:
- **Refatoração completa do `export` para `packages/utils`**:
  - `packages/utils/src/export/types.ts`: Interfaces de configuração (`ExportConfigFile`), opções (`ExportOptions`) e resultados (`ExportResult`).
  - `packages/utils/src/export/formatter.ts`: Lógica pura de normalização de caminhos, detecção anti-loop, crases dinâmicas e blocos Markdown com JSDoc 100% compatível com JSR.
  - `packages/utils/src/export/config.ts`: Carregamento do arquivo externo `export.jsonc` com fallback para `CONFIGURACOES_PADRAO`.
  - `packages/utils/src/export/engine.ts`: Varredura de arquivos via `walk`, filtragem declarativa e geração de snapshots.
  - `packages/utils/src/export/cli.ts`: Runner CLI com métricas de tempo e formatação de console.
  - `packages/utils/src/export/mod.ts`: Ponto de entrada exportado em `packages/utils/deno.jsonc` (`@vanaware/buildit/export` e `@vanaware/buildit/export/cli`).
  - `export.jsonc`: Arquivo de configuração externo na raiz com 4 modos (`ui`, `docs`, `server`, `utils`).
  - `export.ts`: CLI enxuto na raiz delegando para a biblioteca.
  - Testes unitários com `@std/testing/bdd` e validação com `deno doc --lint`.
- **Melhoria visual da UI com BeerCSS puro**:
  - Removidos todos os atributos `style="..."` e tags `<style>`.
  - Layout limpo e responsivo estruturado com componentes BeerCSS (`nav class="tab"`, `article class="border round surface-container-low"`, chips, grid).

### 🎯 Próximos Passos:
- Refatorar o utilitário `esbuild.ts` para dentro de `packages/utils/src/esbuild/` utilizando arquivo de configuração externo `esbuild.jsonc`.
- Refatorar o utilitário `build.ts` (denobuild) para dentro de `packages/utils/src/denobuild/` utilizando `denobuild.jsonc`.
- Atualizar documentação (`README.md`, `packages/utils/README.md`).
