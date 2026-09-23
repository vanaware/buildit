# Arquivo `CURRENT.md`

## Status Atual: Fase 1 (Em Andamento)

Este repositório é um fork do workerdb e está sendo refatorado para disponibilizar a biblioteca `@vanaware/buildit`.

Esta biblioteca será basicamente o pacote `packages/utils` que conterá três CLIs/utilitários:
1. **denobuild** => derivado do `build.ts` que usa um arquivo config externo `denobuild.jsonc` *(✅ Concluído)*
2. **esbuild** => derivado do `esbuild.ts` que usa um arquivo config externo `esbuild.jsonc` *(✅ Concluído)*
3. **export** => derivado do `export.ts` que usa o arquivo config externo `export.jsonc` *(✅ Concluído)*

### ✅ Tarefas Realizadas:
- **Refatoração completa do `export` para `packages/utils` (Fase 1)**:
  - `packages/utils/src/export/formatter.ts`: Lógica pura de normalização de caminhos, detecção anti-loop, crases dinâmicas e blocos Markdown com JSDoc 100% compatível com JSR.
  - `packages/utils/src/export/config.ts`: Carregamento do arquivo externo `export.jsonc` com fallback para `CONFIGURACOES_PADRAO`.
  - `packages/utils/src/export/engine.ts`: Varredura de arquivos via `walk`, filtragem declarativa e geração de snapshots.
  - `packages/utils/src/export/cli.ts`: Runner CLI com métricas de tempo e formatação de console.
  - `packages/utils/src/export/mod.ts`: Ponto de entrada exportado em `packages/utils/deno.jsonc` (`@vanaware/buildit/export` e `@vanaware/buildit/export/cli`).
  - `export.jsonc`: Arquivo de configuração externo na raiz com 4 modos (`ui`, `docs`, `server`, `utils`).
  - `export.ts`: CLI enxuto na raiz delegando para a biblioteca.
  - Testes unitários com `@std/testing/bdd` e validação com `deno doc --lint`.
- **Refatoração completa do `denobuild` para `packages/utils`**:
  - `packages/utils/src/denobuild/config.ts`: Carregamento de `denobuild.jsonc`.
  - `packages/utils/src/denobuild/bundle.ts`: Lógica de injeção de `defines` e montagem de `bundle options`.
  - `packages/utils/src/denobuild/engine.ts`: Orquestrador de build utilizando `Deno.bundle` nativo.
  - `packages/utils/src/denobuild/cli.ts`: Runner CLI `denobuild`.
  - `denobuild.jsonc`: Configuração declarativa dos alvos de build.
  - `build.ts`: Delegado CLI na raiz.
  - Testes unitários em `packages/utils/tests/denobuild/`.
- **Aprimoramento Visual e Arquitetural da UI com BeerCSS Puro**:
  - `Header.tsx`: Identidade visual polida com ícones circulares em containers temáticos, badges de versão (`v{APP_VERSION}`), chips contextuais (`Deno 2.x`, `JSR`) e botão responsivo de acesso rápido à documentação.
  - `OverviewCard.tsx`: Dashboard executivo bento-style com 4 cards de recursos em grid (`esbuild Engine`, `Deno.bundle`, `Exportador IA`, `JSR & BDD`), bloco terminal com comando `deno add jsr:@vanaware/buildit`, catálogo de submódulos com badges de status, mapa do workspace e comandos de terminal rápidos.
  - `ToolDetails.tsx`: Seletor de ferramentas em chips responsivos, especificações técnicas em cartões compactos (`specs`), comandos de terminal com sintaxe destacada, esquemas de configuração anotados e botão de transição direta para simulação.
  - `SimulatorCard.tsx`: Controles reativos com switches modernos Material Design 3 (`<label class="switch">`), predefinições de um clique (`Produção`, `Dev Rápido`, `Snapshot IA`), campos de seleção com prefixos semânticos e console de execução com estética de janela de terminal macOS.
  - `SnapshotsCard.tsx`: Apresentação estruturada dos 4 snapshots pré-configurados, cartões de arquivos com chips e métricas, visualização de proteções ativas (anti-loop, extensões permitidas) e comandos CLI diretos.
  - `stores/app.ts` & `tests/store.test.ts`: Implementada ação `applyPreset` com cobertura de testes BDD e reatividade completa via `@preact/signals`.
  - Zero uso de bibliotecas de terceiros ou classes utilitárias fora da especificação BeerCSS.

- **Conformidade com Diretrizes JSR (`docs/publish-jsr-rules.md`)**:
  - `packages/utils/README.md`: Atualizado com exemplos práticos de uso da CLI para os três utilitários (`esbuild/cli`, `denobuild/cli`, `export/cli`), comando de instalação `deno add`, e seção de esquemas de configuração.
  - `packages/utils/schema/`: Criado diretório contendo JSON Schemas oficiais para `esbuild.json`, `denobuild.json`, `export.json` e `watch.json`.
  - Configurações da raiz (`esbuild.jsonc`, `denobuild.jsonc`, `export.jsonc`, `watch.jsonc`) atualizadas para apontar para os esquemas locais.
  - `packages/utils/LICENSE`: Licença MIT incluída no pacote.
  - `packages/utils/deno.jsonc`: Configurado com `name`, `version`, `license`, `publish.include` e `publish.exclude` restritivos.
  - Validação completa com `deno doc --lint` e `deno publish --dry-run`.

- **Documentação da Topologia de Execução (`docs/`)**:
  - `docs/topology-esbuild.md`: Call graph, mapeamento função a função, flags e pontos de extensão do `esbuild`.
  - `docs/topology-denobuild.md`: Call graph e ciclo de vida do `Deno.bundle` nativo com injeção de defines.
  - `docs/topology-export.md`: Call graph, proteção anti-looping e estratégia de geração de snapshots.
  - `docs/topology-watch.md`: Call graph, validação Cliffy de argumento único, controle de concorrência com PID lock e observação contínua com esbuild context.

---

## 🚀 Plano de Refatoração: Modernização do Utilitário `export`

**Objetivo**: Simplificar a configuração dos modos de exportação, substituindo as 5 propriedades legadas (`pastaBase`, `subpastasPermitidas`, `arquivosRaizPermitidos`, `caminhosAdicionaisPermitidos`, `extensoesPermitidas`) pelo padrão declarativo moderno com **`includes`** (suportando globs e brace expansion como `**/*.{ts,tsx}`) e **`excludes`**, utilizando **`expandGlob`** para navegação otimizada no sistema de arquivos e **streaming de escrita em disco**.

### 📋 Tarefas do Plano:

- [ ] **Tarefa 1: Tipagem e JSON Schema**
  - [ ] Atualizar `ExportConfig` em `packages/utils/src/tools/interfaces.ts` para incluir `includes: string[]` e `excludes?: string[]`.
  - [ ] Atualizar o esquema oficial em `packages/utils/schema/export.json`.
- [ ] **Tarefa 2: Configuração Padrão e Arquivo `export.jsonc`**
  - [ ] Atualizar `CONFIGURACOES_PADRAO` em `packages/utils/src/export/config.ts` com a sintaxe de globs.
  - [ ] Atualizar o arquivo `export.jsonc` na raiz com os modos (`ui`, `docs`, `server`, `utils`).
- [ ] **Tarefa 3: Motor de Varredura com `expandGlob` e Streaming de Escrita**
  - [ ] Implementar `expandGlob` com suporte a `root`, `exclude` e brace expansion em `packages/utils/src/export/engine.ts`.
  - [ ] Implementar deduplicação de caminhos (`Set<string>`) e ordenação determinística.
  - [ ] Implementar escrita via stream com `Deno.open` (`file.writable` / `writer.write`) para manter uso de memória $O(1)$.
  - [ ] Preservar regras anti-loop (`exports/`, `snapshots/`), cálculo dinâmico de crases e tags de sintaxe no `formatter.ts`.
- [ ] **Tarefa 4: Atualização da Documentação**
  - [ ] Atualizar `docs/topology-export.md` com o novo fluxo de `expandGlob` e stream.
  - [ ] Atualizar `docs/api.md` e `packages/utils/README.md`.
- [ ] **Tarefa 5: Suíte de Testes BDD e Validações de Publicação**
  - [ ] Atualizar e expandir a suíte `packages/utils/tests/export/` para cobrir globs, brace expansion, excludes, anti-loop e streams.
  - [ ] Executar `deno task test` (100% aprovado).
  - [ ] Executar `deno doc --lint` e `deno publish --dry-run` (sem erros).
  - [ ] Executar `npm run lint` e `npm run build`.
