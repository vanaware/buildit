# Arquivo `CURRENT.md`

## Status Atual: Fase 1 (Concluída) ➔ Fase 2 (Preparação para Publicação & Estabilização)

Este repositório é um fork do workerdb e foi refatorado para criar e disponibilizar a biblioteca **`@vanaware/buildit`**.

A biblioteca está consolidada no pacote `packages/utils` contendo **quatro** ferramentas/utilitários centrais, todos controlados por arquivos de configuração externos declarativos (`.jsonc`), suportados por JSON Schemas formais e exportados via JSR:
1. **esbuild** => Orquestrador de build de produção ultrarrápido derivado de `esbuild.ts` via `esbuild.jsonc` *(✅ Concluído)*
2. **watch** => Monitor de desenvolvimento contínuo derivado de `watch.ts` via `watch.jsonc` com controle de PID lock *(✅ Concluído)*
3. **denobuild** => Bundler nativo Deno derivado de `denobuild.ts` via `denobuild.jsonc` utilizando `Deno.bundle` *(✅ Concluído)*
4. **export** => Consolidar e exportar contexto de código para IAs derivado de `export.ts` via `export.jsonc` *(✅ Concluído & Modernizado com `includes`/`excludes` + `expandGlob` + Streaming O(1))*

---

### ✅ O Que Foi Feito (Registro de Conclusão Detalhado):

#### 1. Motores e Utilitários do `@vanaware/buildit` (`packages/utils`)
- **`esbuild` (`packages/utils/src/esbuild/`)**:
  - `config.ts`: Carregamento do `esbuild.jsonc` com suporte a alvos declarativos, mesclagem de opções e caminhos customizados.
  - `bundle.ts`: Integração com `esbuild` e `@deno/esbuild-plugin`, resolução de imports remotos/NPM/JSR, injeção de `__APP_VERSION__`, flags de `define`, `drop`, `minify`, `sourcemap` e `metafile`.
  - `engine.ts`: Orquestrador com limpeza pré-build de diretórios (`clean`), cópia recursiva de estáticos (`publicdir`), injeção dinâmica de versão no `manifest.json` e cópia de `index.html`.
  - `cli.ts` & `esbuild.ts`: Runner CLI com Cliffy e relatório de telemetria visual.
  - Testes BDD dedicados em `packages/utils/tests/esbuild/`.
  - Documentação topológica em `docs/topology-esbuild.md`.

- **`watch` (`packages/utils/src/watch/`)**:
  - `config.ts`: Leitura e validação de `watch.jsonc` com fallback para `CONFIGURACOES_PADRAO_WATCH` e alias `CONFIGURACOES_WATCH_PADRAO`.
  - `lock.ts`: Prevenção de concorrência com arquivo de trava PID (`.watch.lock`) e limpeza graciosa em encerramentos.
  - `engine.ts`: Observação contínua de alta performance baseada em `esbuild.context` com rebuilds incrementais sub-milissegundo.
  - `cli.ts` & `watch.ts`: Interface de linha de comando estrita (validação de argumento de alvo único).
  - Testes BDD dedicados em `packages/utils/tests/watch/`.
  - Documentação topológica em `docs/topology-watch.md`.

- **`denobuild` (`packages/utils/src/denobuild/`)**:
  - `config.ts`: Leitura de `denobuild.jsonc` com suporte a múltiplos alvos (`DenoBundleTargetConfig`).
  - `bundle.ts`: Injeção de compile-time defines em memória e configuração do `Deno.bundle` (`--unstable-bundle`).
  - `engine.ts`: Orquestrador de compilação pura sem binários externos, integrando limpeza e cópia de ativos.
  - `cli.ts` & `denobuild.ts`: CLI delegada na raiz.
  - Testes BDD em `packages/utils/tests/denobuild/`.
  - Documentação topológica em `docs/topology-denobuild.md`.

- **`export` (`packages/utils/src/export/`) - Modernização Completa**:
  - `formatter.ts`: Lógica pura de correspondência com suporte a globs via `globToRegExp` (`correspondeGlobs`), sanitização, cálculo dinâmico de crases (`calcularCraseWrapper`), proteção anti-loop categoricamente blindando `exports/` e `snapshots/`, e geração de cabeçalho de IA com fallback de instrução (`instrucaoCustomizada ?? "Contexto do projeto."`).
  - `engine.ts`: Varredura otimizada com `expandGlob`, suporte a `root` e `exclude`, deduplicação por `Set<string>` e ordenação alfabética determinística.
  - Escrita em disco via streaming nativo (`Deno.open` com `file.writable`) reduzindo o footprint de memória para $O(1)$.
  - Retrocompatibilidade total preservada para configurações com chaves legadas (`pastaBase`, `subpastasPermitidas`, etc.).
  - `config.ts` & `export.jsonc`: 4 modos declarativos modernos (`ui`, `docs`, `server`, `utils`) com brace expansion (ex: `packages/ui/{src,public}/**/*.{ts,tsx,html,json}`).
  - Testes BDD abrangentes em `packages/utils/tests/export/` (`export-api.test.ts`, `export.test.ts`, `utils.test.ts`).
  - Documentação topológica atualizada em `docs/topology-export.md`.

#### 2. Tipagens Unificadas e JSON Schemas (`packages/utils`)
- `packages/utils/src/tools/interfaces.ts`: Centralização e simplificação de todas as interfaces (`TargetConfig`, `WatchTargetConfig`, `ExportConfig`, `DenoBundleTargetConfig`, `VersionUpdateOptions`, etc.) com tipagens concisas e sem duplicações.
- `packages/utils/schema/`: Schemas oficiais JSON Schema para autocomplete e validação no editor:
  - `esbuild.json`
  - `watch.json`
  - `denobuild.json`
  - `export.json`
- Configurações da raiz (`esbuild.jsonc`, `watch.jsonc`, `denobuild.jsonc`, `export.jsonc`) atualizadas com `$schema`.

#### 3. Frontend & Dashboard PWA (Preact + BeerCSS + Signals)
- Dashboard executivo em `packages/ui/src/`:
  - `Header.tsx`: Identidade visual polida com chips contextuais (`Deno 2.x`, `JSR`) e versão dinâmica injetada.
  - `OverviewCard.tsx`: Visão geral dos 4 motores, catálogo de submódulos com badges de status e comandos de instalação JSR.
  - `ToolDetails.tsx`: Documentação interativa das 4 ferramentas, especificações técnicas, esquemas e comandos CLI.
  - `SimulatorCard.tsx`: Simulador reativo com switches Material Design 3 e predefinições de build (`Produção`, `Dev Rápido`, `Snapshot IA`).
  - `SnapshotsCard.tsx`: Visualização dos 4 modos de exportação pré-configurados com métricas e proteções ativas.
  - `stores/app.ts` & testes BDD: Reatividade pura via `@preact/signals` sem hooks e sem Tailwind.

#### 4. Conformidade JSR e Documentação
- `packages/utils/deno.jsonc`: Configurado para publicação com name `@vanaware/buildit`, versionamento semântico, `publish.include`/`publish.exclude` restritivos e exportação modular (`.`, `./esbuild`, `./esbuild/cli`, `./watch`, `./watch/cli`, `./export`, `./export/cli`, `./denobuild`, `./denobuild/cli`).
- `packages/utils/README.md`: Documentação completa de uso com exemplos CLI e programáticos.
- `docs/api.md`: Referência técnica de configurações JSONC e APIs TypeScript dos 4 motores.
- `docs/publish-jsr-rules.md`: Guia de conformidade com regras JSR (JSDoc, ausência de referências a nódulos locais, licença MIT).
- CI/CD em `.github/workflows/jsr-publish.yml` configurado para publicação automatizada com sanitização de versão.

---

### ⏳ O Que Falta Fazer (Próximos Passos):

#### Prioridade Alta (Imediato / Fase 2: Publicação JSR):
- [ ] **1. Geração de Snapshots Atualizados**:
  - Executar `deno task export` para regerar os arquivos em `snapshots/` (`ui.md`, `server.md`, `docs.md`, `utils.md`) utilizando o novo motor de streaming e filtros glob modernos.
- [ ] **2. Validação Estrita de Publicação JSR (`@vanaware/buildit`)**:
  - Validar `deno doc --lint` em todos os módulos exportados em `packages/utils/src/**/*.ts`.
  - Executar `deno publish --dry-run` dentro de `packages/utils` e garantir ausência de diagnósticos ou arquivos indesejados no pacote.
- [ ] **3. Validação do Pipeline de Versionamento e Release**:
  - Testar o script `sanitize-version.sh` em `packages/utils/deno.jsonc` para assegurar que versões com sufixos git hash (ex: `0.3.32#hash`) sejam limpas para formato semver puro (ex: `0.3.32`) antes da publicação.
  - Validar a esteira do GitHub Actions `.github/workflows/jsr-publish.yml` para disparos via tags `v*.*`.

#### Prioridade Média (Fase 3: Consolidação do Monorepo):
- [ ] **4. Integração do `@vanaware/buildit` como Dependência dos Demais Pacotes**:
  - Configurar `packages/server` e `packages/ui` para referenciar utilitários compartilhados de build e versionamento caso necessário, mantendo isolamento de dependências.
- [ ] **5. Limpeza de Legados do WorkerDB**:
  - Avaliar e remover resquícios ou dependências antigas do fork original de banco de dados que não se aplicam ao propósito da ferramenta de build e exportação, mantendo o repositório focado e leve.

antes de executar os próximos passos, faremos os seguintes ajustes:    
**TODO LIST**    
- [x] utilitário export não precisa ter falback para o legado, pode manter apenas o novo sistema por glob e brace expansion
- [x] utilitário denobuild e esbuild o parseArgs deverá ser reformulado, a parte que detecta noversion fica dentro do cli e é enviada para o engine já resolvido , mas a parte que determina a correta ordem de execução fica dentro de engine para garantir que a ordem seja sempre executada independente de a lista de alvos vier via cli ou direto pelo engine. o resolverOrdemTargets já faz isso ? *(Sim, delegado para `resolverOrdemTargets` dentro de `engine.ts` em `esbuild` e `denobuild`)*
- [x] baseDir deveria ser passado para processTarget ou processBundleTarget para fazer parte do caminho dos arquivos e pastas listados em srcdir, distdir, publicdir, clean *(Implementado via `resolveWithBase` e propagação do `baseDir`)*
- [x] alteração em como esbuild, denobuild e watch realizam a cópia de arquivos estaticos, index.html e a limpeza de arquivos usando glob e brace expansion em instruções include e exclude, da seguinte forma abaixo:
copyFiles : [{
  basedir? : string
  includes? : string[] => aceita globs e brace expansion
  excludes? : string[] => aceita globs e brace expansion
},]
Explicação: 
0. será feito join deste basedir com o "basedir geral"
1. se basedir informado, includes e excludes são relativos ao base dir e é preservada árvore de diretórios na cópia relativas ao basedir
2. se basedir informado e includes inexistente, vazio ou "*", copia tudo do diretório basedir, mas respeitar excludes
3. se basedir inexistente, includes e excludes são relativos ao "basedir geral" e árvore de diretórios não é preservada na cópia e arquivos são copiados diretamente no distdir
4. o copyfiles é um array, assim podemos ter vários conjuntos de configurações de cópia definidas
5. o indexhtml é copiado usando uma das configurações acima (não tem mais o indexHtml: boolean)
6. se o arquivo copiado for um manifest.json continua injetando a versão e se for index.html informe no console.log (no futuro vamos criar uma forma de injetar tags de versão e cache busting no HTML)

clean : {
  includes? : string[] => aceita globs e brace expansion
  excludes? : string[] => aceita globs e brace expansion
}
Explicação: 
0. os includes e excludes são sempre relativos ao distdir. não permitir que nenhum arquivo nivel acima ao distdir seja deletado
1. para excluir tudo do distdir não mais seria ["."], seria includes: ["*"] (glob)