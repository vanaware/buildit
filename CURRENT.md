# Arquivo `CURRENT.md`

## Status Atual: Fase 1 (Em Andamento)

Este repositório é um fork do workerdb e está sendo refatorado para disponibilizar a biblioteca `@vanaware/buildit`.

Esta biblioteca será basicamente o pacote `packages/utils` que conterá três CLIs/utilitários:
1. **denobuild** => derivado do `build.ts` que usa um arquivo config externo `denobuild.jsonc` *(✅ Concluído)*
2. **esbuild** => derivado do `esbuild.ts` que usa um arquivo config externo `esbuild.jsonc` *(✅ Concluído)*
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
- **Refatoração completa do `denobuild` para `packages/utils`**:
  - `packages/utils/src/denobuild/types.ts`: Interfaces para `Deno.bundle`.
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
  - `packages/utils/schema/`: Criado diretório contendo JSON Schemas oficiais para `esbuild.json`, `denobuild.json` e `export.json`, proporcionando validação e autocomplete.
  - Configurações da raiz (`esbuild.jsonc`, `denobuild.jsonc`, `export.jsonc`) atualizadas para apontar para os esquemas locais.
  - `packages/utils/LICENSE`: Adicionado arquivo de licença MIT no pacote para empacotamento autônomo.
  - `packages/utils/deno.jsonc`: Configurado com `name`, `version`, `license`, `publish.include` e `publish.exclude` restritivos.
  - Resolução de colisões de tipos e remoção de triple slash directives (`/// <reference lib="..." />`) banidas pelo JSR.
  - Validação completa com `deno doc --lint src/**/*.ts` (22 arquivos verificados, 0 erros) e `deno publish --dry-run` (simulação de publicação bem-sucedida).
  - Sincronização do workflow `.github/workflows/jsr-publish.yml` para publicação do `@vanaware/buildit` a partir de `packages/utils`.

- **Documentação da API e Configurações (`docs/api.md`)**:
  - `docs/api.md`: Documentação técnica completa e exaustiva contendo todas as opções e propriedades aceitas em arquivos JSONC/JSON para cada utilitário (`esbuild.jsonc`, `denobuild.jsonc` e `export.jsonc`), exemplos comentados, flags CLI e referência da API programática em TypeScript (`runEsbuild`, `runDenoBuild`, `runExport`, `syncVersion`, etc.).
  - Integração e links em `README.md`.

- **Limpeza e Padronização de Comentários Legados**:
  - `packages/utils/src/interfaces/mod.ts`: Excluído comentário obsoleto de TODO sobre `worker-db` e método de banco `ls()`.
  - Atualizados os cabeçalhos de comentários de seção de `PIPELINE WORKERDB` e `EXTENSÕES WORKERDB` para `PIPELINE BUILDIT` e `EXTENSÕES BUILDIT`.
  - Verificação completa do código-fonte em `packages/utils`, `packages/server` e `packages/ui` confirmando zero referências residuais a comentários legados.

- **Simplificação do Servidor de Desenvolvimento (`packages/server/src/main.ts`)**:
  - Removido o fallback em HTML para OPFS Explorer e Service Worker que pertencia ao fork anterior.
  - Servidor mantido enxuto e direto com `serveDir`, controle estrito de cache no-store, suporte a Service Worker (`Service-Worker-Allowed: /`) e tratamento resiliente de erros.
  - Snapshot `snapshots/server.md` devidamente sincronizado.

### 🎯 Próximos Passos:
- Implementar o utilitário `bump.ts` para automatizar o versionamento semântico.
