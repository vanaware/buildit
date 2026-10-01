> **INSTRUÇÃO PARA A IA:** 
> O texto abaixo contém os arquivos de CÓDIGO FONTE principais da aplicação exemplo (UI).
> Cada arquivo começa com um título indicando seu caminho relativo exato (ex: `## Arquivo: src/main.ts`).
> Sempre que sugerir alterações, indique claramente qual arquivo deve ser modificado com base nesses caminhos e forneça o novo código completo do arquivo.

---

# Contexto Exportado do Projeto BuildIt [v0.4.8#mupf9ocu] - Modo: UI

Gerado automaticamente em: 2026-10-01T11:16:15.927Z

---

## Arquivo: `packages/ui/deno.jsonc`

```json
{
  "name": "@buildit/ui",
  "publish": false,

  // ----------------------------------------------------------------------
  // 🔧 Compiler Options — AJUSTADO PARA DENO 2.x
  // ----------------------------------------------------------------------
  "compilerOptions": {
    "lib": [
      "dom",
      "dom.iterable",
      "dom.asynciterable",
      "esnext"
    ],
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  },

  // 📦 Gerenciamento de Dependências
  "imports": {
    // Preact Core — versão fixa e canônica
    "preact": "https://esm.sh/preact@10.29.8",
    "preact/": "https://esm.sh/preact@10.29.8/",
    "preact/jsx-runtime": "https://esm.sh/preact@10.29.8/jsx-runtime",

    // Signals — mapeados explicitamente para evitar npm
    "@preact/signals": "https://esm.sh/@preact/signals@2.11.2?deps=preact@10.29.8",
    "@preact/signals-core": "https://esm.sh/@preact/signals-core@1.14.4"
  },

  // 🛠️ Scripts de Automação
  "tasks": {
    "test": "deno test --allow-env --allow-net tests/",
    "check": "deno check src/**/*.{ts,tsx} tests/**/*.ts",
    "tests": "deno task check && deno task test"
  },
  "exclude": ["public/"],
  "exports": "./src/main.tsx"
}

```

---

## Arquivo: `packages/ui/public/manifest.json`

```json
{
  "name": "BuildIt PWA",
  "short_name": "BuildIt",
  "description": "BuildIt Offline PWA Demo",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#1a1c19",
  "theme_color": "#9edeb6",
  "icons": [
    {
      "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%239edeb6'/><text x='50' y='68' font-size='50' font-family='system-ui, sans-serif' font-weight='bold' text-anchor='middle' fill='%231a1c19'>L</text></svg>",
      "sizes": "192x192 512x512",
      "type": "image/svg+xml"
    }
  ]
}

```

---

## Arquivo: `packages/ui/src/components/AppDashboard.tsx`

```tsx
import {
  activeTab,
  API_CODE_SNIPPETS,
  CLI_COMMANDS,
  CONFIG_SNIPPETS,
  copiedId,
  copyToClipboard,
  filteredCliCommands,
  searchQuery,
  selectedConfig,
  selectedTool,
  TOOLS,
} from "../stores/app.ts";
import { APP_VERSION, } from "../version.ts";

export const AppDashboard = () => {
  const currentTool = TOOLS.find((t,) => t.id === selectedTool.value) ??
    TOOLS[0]!;

  return (
    <div class="padding">
      {/* ================================================================== */}
      {/* ABA: VISÃO GERAL (OVERVIEW) */}
      {/* ================================================================== */}
      {activeTab.value === "overview" && (
        <section class="space-y">
          <article class="border padding surface-container-low round">
            <div class="row wrap">
              <div class="circle large primary-container center-align">
                <i class="primary-text extra">
                  construction
                </i>
              </div>
              <div class="max wrap" style="min-width: 0; min-inline-size: 0;">
                <h4 class="no-margin bold">
                  BuildIt
                </h4>
                <p
                  class="secondary-text no-margin wrap"
                  style="overflow-wrap: anywhere; word-break: normal;">
                  Suite de utilitários em TypeScript para orquestração de
                  compilação, bundling de alta performance e exportação de
                  contexto para Inteligência Artificial em ecossistemas Deno.
                </p>
              </div>
              <div class="row wrap">
                <a
                  class="button primary"
                  onClick={() => activeTab.value = "cli"}
                  style="cursor: pointer;">
                  <i>
                    terminal
                  </i>
                  <span>
                    Comandos CLI
                  </span>
                </a>
                <a
                  class="button border"
                  onClick={() => activeTab.value = "configs"}
                  style="cursor: pointer;">
                  <i>
                    tune
                  </i>
                  <span>
                    Configurações
                  </span>
                </a>
              </div>
            </div>
          </article>

          <div class="space">
          </div>

          <h5 class="bold">
            Pilares da Biblioteca
          </h5>
          <div class="grid">
            {TOOLS.map((tool,) => (
              <div key={tool.id} class="s12">
                <article
                  class="border padding fill wave"
                  style="cursor: pointer; height: 100%; display: flex; flex-direction: column;"
                  onClick={() => {
                    selectedTool.value = tool.id;
                    activeTab.value = "tools";
                  }}>
                  <div class="row space">
                    <i class={`${tool.colorClass} circle surface-variant`}>
                      {tool.icon}
                    </i>
                    <span class="chip small outline">
                      {tool.badge}
                    </span>
                  </div>
                  <div class="space">
                  </div>
                  <h6 class="bold no-margin">
                    {tool.name}
                  </h6>
                  <p
                    class="small-text secondary-text max wrap"
                    style="flex: 1; overflow-wrap: anywhere;">
                    {tool.summary}
                  </p>
                  <div class="divider">
                  </div>
                  <div class="row space no-space">
                    <span class="small-text tertiary-text font-monospace">
                      {tool.configFile}
                    </span>
                    <i class="small-text">
                      arrow_forward
                    </i>
                  </div>
                </article>
              </div>
            ))}
          </div>

          <div class="space">
          </div>

          <article class="border padding surface-container-highest">
            <h6 class="bold">
              Filosofia Deno &amp; Zero Bloat
            </h6>
            <div class="grid">
              <div class="s12">
                <div class="row">
                  <i>
                    speed
                  </i>
                  <div>
                    <div class="bold">
                      Sem node_modules
                    </div>
                    <div class="small-text secondary-text wrap">
                      Dependências resolvidas via URLs, specifiers{" "}
                      <code>
                        npm:
                      </code>{" "}
                      e{" "}
                      <code>
                        jsr:
                      </code>.
                    </div>
                  </div>
                </div>
              </div>
              <div class="s12">
                <div class="row">
                  <i>
                    security
                  </i>
                  <div>
                    <div class="bold">
                      Fail-Fast &amp; Explícito
                    </div>
                    <div class="small-text secondary-text wrap">
                      Erros didáticos com exemplos de configuração em vez de
                      fallbacks silenciosos.
                    </div>
                  </div>
                </div>
              </div>
              <div class="s12">
                <div class="row">
                  <i>
                    lock
                  </i>
                  <div>
                    <div class="bold">
                      Anti-Concorrência
                    </div>
                    <div class="small-text secondary-text wrap">
                      Mecanismo de Lock em disco (PID) para evitar rebuilds
                      concorrentes.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>
      )}

      {/* ================================================================== */}
      {/* ABA: FERRAMENTAS (TOOLS) */}
      {/* ================================================================== */}
      {activeTab.value === "tools" && (
        <section>
          <div class="row wrap gap margin-bottom">
            {TOOLS.map((t,) => (
              <button
                key={t.id}
                type="button"
                class={`chip ${
                  selectedTool.value === t.id ? "primary" : "outline"
                }`}
                onClick={() => selectedTool.value = t.id}>
                <i>
                  {t.icon}
                </i>
                <span>
                  {t.name}
                </span>
              </button>
            ))}
          </div>

          <div class="space">
          </div>

          <article class="border padding">
            <div class="row space wrap">
              <div class="row gap">
                <i
                  class={`${currentTool.colorClass} circle large surface-variant`}>
                  {currentTool.icon}
                </i>
                <div>
                  <h5 class="bold no-margin">
                    {currentTool.name}
                  </h5>
                  <span class="chip small secondary-container">
                    {currentTool.badge}
                  </span>
                </div>
              </div>
              <div class="row gap">
                <span class="small-text secondary-text">
                  Configuração:
                </span>
                <button
                  type="button"
                  class="chip small tertiary-container"
                  onClick={() => {
                    selectedConfig.value = currentTool.configFile;
                    activeTab.value = "configs";
                  }}>
                  <i>
                    tune
                  </i>
                  <span>
                    {currentTool.configFile}
                  </span>
                </button>
              </div>
            </div>

            <div class="space">
            </div>
            <p
              class="secondary-text wrap"
              style="font-size: 1.05rem; line-height: 1.5; overflow-wrap: anywhere;">
              {currentTool.description}
            </p>

            <div class="divider margin">
            </div>

            <h6 class="bold">
              Comando CLI Canônico
            </h6>
            <div class="field border padding surface-container-highest round row">
              <i class="primary-text">
                terminal
              </i>
              <code
                class="max font-monospace margin-left"
                style="user-select: all; overflow-wrap: anywhere;">
                {currentTool.cliCommand}
              </code>
              <button
                type="button"
                class="chip small primary wave"
                onClick={() =>
                  copyToClipboard(
                    currentTool.cliCommand,
                    `tool-${currentTool.id}`,
                  )}>
                <i>
                  {copiedId.value === `tool-${currentTool.id}`
                    ? "check"
                    : "content_copy"}
                </i>
                <span>
                  {copiedId.value === `tool-${currentTool.id}`
                    ? "Copiado!"
                    : "Copiar"}
                </span>
              </button>
            </div>

            <div class="space">
            </div>

            <h6 class="bold">
              Recursos e Capacidades
            </h6>
            <div class="grid">
              {currentTool.features.map((feat, idx,) => (
                <div key={idx} class="s12">
                  <div class="row gap no-margin padding-bottom">
                    <i class="green-text">
                      check_circle
                    </i>
                    <span class="small-text">
                      {feat}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}

      {/* ================================================================== */}
      {/* ABA: CLI & SCRIPTS */}
      {/* ================================================================== */}
      {activeTab.value === "cli" && (
        <section>
          <div class="row space wrap gap">
            <div>
              <h5 class="bold no-margin">
                Referência de Comandos CLI
              </h5>
              <div class="small-text secondary-text">
                Todos os utilitários são executáveis diretamente pelo Deno via
                JSR ou arquivos locais.
              </div>
            </div>
            <div
              class="field border prefix round small max"
              style="max-width: 320px;">
              <i>
                search
              </i>
              <input
                type="text"
                placeholder="Filtrar comandos..."
                value={searchQuery.value}
                onInput={(e,) =>
                  searchQuery.value = (e.target as HTMLInputElement).value} />
            </div>
          </div>

          <div class="space">
          </div>

          <div class="space-y">
            {filteredCliCommands.value.map((item,) => (
              <article
                key={item.id}
                class="border padding surface-container-low round">
                <div class="row space wrap">
                  <div class="row gap">
                    <span class="chip small outline">
                      {item.tag}
                    </span>
                    <h6 class="bold no-margin">
                      {item.title}
                    </h6>
                  </div>
                  <button
                    type="button"
                    class="chip small primary wave"
                    onClick={() => copyToClipboard(item.command, item.id,)}>
                    <i>
                      {copiedId.value === item.id ? "check" : "content_copy"}
                    </i>
                    <span>
                      {copiedId.value === item.id
                        ? "Copiado!"
                        : "Copiar Comando"}
                    </span>
                  </button>
                </div>

                <p
                  class="small-text secondary-text margin-top-small no-margin-bottom wrap"
                  style="overflow-wrap: anywhere;">
                  {item.description}
                </p>

                <div class="field border padding surface-container-highest round margin-top-small row">
                  <i class="primary-text">
                    terminal
                  </i>
                  <code
                    class="max font-monospace margin-left small-text"
                    style="user-select: all; overflow-wrap: anywhere;">
                    {item.command}
                  </code>
                </div>
              </article>
            ))}

            {filteredCliCommands.value.length === 0 && (
              <div class="center-align padding">
                <p class="secondary-text">
                  Nenhum comando encontrado para o termo pesquisado.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ================================================================== */}
      {/* ABA: CONFIGURAÇÕES (.JSONC) */}
      {/* ================================================================== */}
      {activeTab.value === "configs" && (
        <section>
          <div class="row space wrap gap">
            <div>
              <h5 class="bold no-margin">
                Arquivos de Configuração (.jsonc)
              </h5>
              <div class="small-text secondary-text">
                O BuildIt utiliza JSON com comentários (JSONC) para uma
                declaração tipada e legível.
              </div>
            </div>
            <div class="row gap wrap">
              {Object.keys(CONFIG_SNIPPETS,).map((name,) => (
                <button
                  key={name}
                  type="button"
                  class={`chip ${
                    selectedConfig.value === name ? "primary" : "outline"
                  }`}
                  onClick={() => selectedConfig.value = name}>
                  <i>
                    tune
                  </i>
                  <span>
                    {name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div class="space">
          </div>

          <article class="border padding surface-container-low round">
            <div class="row space padding-bottom wrap">
              <div class="row gap">
                <i class="primary-text">
                  description
                </i>
                <span class="bold font-monospace">
                  {selectedConfig.value}
                </span>
              </div>
              <button
                type="button"
                class="chip small outline"
                onClick={() =>
                  copyToClipboard(
                    CONFIG_SNIPPETS[selectedConfig.value] ?? "",
                    selectedConfig.value,
                  )}>
                <i>
                  {copiedId.value === selectedConfig.value
                    ? "check"
                    : "content_copy"}
                </i>
                <span>
                  {copiedId.value === selectedConfig.value
                    ? "Copiado!"
                    : "Copiar JSON"}
                </span>
              </button>
            </div>

            <pre
              class="border padding surface-container-highest round scroll font-monospace small-text"
              style="line-height: 1.5; max-height: 480px; overflow: auto; box-sizing: border-box; width: 100%; max-width: 100%;">
              <code style="display: block; overflow-x: auto; max-width: 100%; box-sizing: border-box;">{CONFIG_SNIPPETS[selectedConfig.value]}</code>
            </pre>
          </article>
        </section>
      )}

      {/* ================================================================== */}
      {/* ABA: API DENO (PROGRAMÁTICA) */}
      {/* ================================================================== */}
      {activeTab.value === "api" && (
        <section>
          <div>
            <h5 class="bold no-margin">
              API Programática em TypeScript
            </h5>
            <div class="small-text secondary-text">
              Como importar e orquestrar as ferramentas diretamente em código
              TypeScript/Deno.
            </div>
          </div>

          <div class="space">
          </div>

          <div class="grid">
            <div class="s12">
              <article class="border padding surface-container-low round fill">
                <div class="row space padding-bottom wrap">
                  <div class="row gap">
                    <i class="primary-text">
                      bolt
                    </i>
                    <span class="bold">
                      Motor esbuild (esBuild)
                    </span>
                  </div>
                  <button
                    type="button"
                    class="chip small outline"
                    onClick={() =>
                      copyToClipboard(
                        API_CODE_SNIPPETS.esbuild,
                        "api-esbuild",
                      )}>
                    <i>
                      {copiedId.value === "api-esbuild"
                        ? "check"
                        : "content_copy"}
                    </i>
                    <span>
                      {copiedId.value === "api-esbuild" ? "Copiado!" : "Copiar"}
                    </span>
                  </button>
                </div>
                <pre
                  class="border padding surface-container-highest round scroll font-monospace small-text"
                  style="line-height: 1.4; max-height: 380px; overflow: auto; box-sizing: border-box; width: 100%; max-width: 100%;">
                  <code style="display: block; overflow-x: auto; max-width: 100%; box-sizing: border-box;">{API_CODE_SNIPPETS.esbuild}</code>
                </pre>
              </article>
            </div>

            <div class="s12">
              <article class="border padding surface-container-low round fill">
                <div class="row space padding-bottom wrap">
                  <div class="row gap">
                    <i class="tertiary-text">
                      visibility
                    </i>
                    <span class="bold">
                      Motor Watch (watchEngine)
                    </span>
                  </div>
                  <button
                    type="button"
                    class="chip small outline"
                    onClick={() =>
                      copyToClipboard(API_CODE_SNIPPETS.watch, "api-watch",)}>
                    <i>
                      {copiedId.value === "api-watch"
                        ? "check"
                        : "content_copy"}
                    </i>
                    <span>
                      {copiedId.value === "api-watch" ? "Copiado!" : "Copiar"}
                    </span>
                  </button>
                </div>
                <pre
                  class="border padding surface-container-highest round scroll font-monospace small-text"
                  style="line-height: 1.4; max-height: 380px; overflow: auto; box-sizing: border-box; width: 100%; max-width: 100%;">
                  <code style="display: block; overflow-x: auto; max-width: 100%; box-sizing: border-box;">{API_CODE_SNIPPETS.watch}</code>
                </pre>
              </article>
            </div>

            <div class="s12">
              <article class="border padding surface-container-low round">
                <div class="row space padding-bottom wrap">
                  <div class="row gap">
                    <i class="primary-text">
                      smart_toy
                    </i>
                    <span class="bold">
                      Motor de Exportação IA (exportEngine)
                    </span>
                  </div>
                  <button
                    type="button"
                    class="chip small outline"
                    onClick={() =>
                      copyToClipboard(API_CODE_SNIPPETS.export, "api-export",)}>
                    <i>
                      {copiedId.value === "api-export"
                        ? "check"
                        : "content_copy"}
                    </i>
                    <span>
                      {copiedId.value === "api-export" ? "Copiado!" : "Copiar"}
                    </span>
                  </button>
                </div>
                <pre
                  class="border padding surface-container-highest round scroll font-monospace small-text"
                  style="line-height: 1.4; max-height: 380px; overflow: auto; box-sizing: border-box; width: 100%; max-width: 100%;">
                  <code style="display: block; overflow-x: auto; max-width: 100%; box-sizing: border-box;">{API_CODE_SNIPPETS.export}</code>
                </pre>
              </article>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

```

---

## Arquivo: `packages/ui/src/components/Header.tsx`

```tsx
import { activeTab, TabKey, themeMode, toggleTheme, } from "../stores/app.ts";
import { APP_VERSION, } from "../version.ts";

export const Header = () => {
  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "overview", label: "Visão Geral", icon: "dashboard", },
    { key: "tools", label: "Ferramentas", icon: "construction", },
    { key: "cli", label: "CLI & Scripts", icon: "terminal", },
    { key: "configs", label: "Configurações", icon: "tune", },
    { key: "api", label: "API Deno", icon: "code", },
  ];

  return (
    <header
      class="surface-container-low border bottom responsive max"
      style="max-width: 100vw; width: 100%; box-sizing: border-box; overflow-x: hidden;">
      <nav
        class="responsive wrap"
        style="max-width: 100%; width: 100%; min-width: 0; box-sizing: border-box;">
        <div class="circle primary-container center-align">
          <i class="primary-text">
            build
          </i>
        </div>
        <div class="max wrap" style="min-width: 0; min-inline-size: 0;">
          <div class="row wrap" style="align-items: center; gap: 0.5rem;">
            <h5 class="no-margin bold">
              BuildIt
            </h5>
            <span
              class="chip small primary-container no-margin"
              style="max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
              title={`v${APP_VERSION}`}>
              v{APP_VERSION}
            </span>
            <span class="chip small tertiary-container m l no-margin">
              Deno 2.x
            </span>
            <span class="chip small secondary-container l no-margin">
              JSR
            </span>
          </div>
          <div
            class="small-text secondary-text wrap"
            style="overflow-wrap: anywhere; word-break: normal;">
            Orquestrador de Compilação &amp; Exportador de Contexto IA
          </div>
        </div>

        <button
          type="button"
          class="circle transparent wave no-margin"
          onClick={toggleTheme}
          title={themeMode.value === "dark"
            ? "Mudar para tema claro"
            : "Mudar para tema escuro"}>
          <i>
            {themeMode.value === "dark" ? "light_mode" : "dark_mode"}
          </i>
        </button>
      </nav>

      {/* Abas de navegação responsivas */}
      <nav
        class="tabs left-align responsive scroll"
        style="max-width: 100%; width: 100%; min-width: 0; box-sizing: border-box;">
        {tabs.map((tab,) => (
          <a
            key={tab.key}
            class={activeTab.value === tab.key ? "active" : ""}
            onClick={() => activeTab.value = tab.key}
            style="cursor: pointer; white-space: nowrap; flex-shrink: 0;">
            <i>
              {tab.icon}
            </i>
            <span>
              {tab.label}
            </span>
          </a>
        ))}
      </nav>
    </header>
  );
};

```

---

## Arquivo: `packages/ui/src/index.html`

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>BuildIt</title>
    <meta name="description"
      content="Build orchestration, bundling and AI context export utilities for Deno & Web projects.">
    <meta property="og:title" content="BuildIt">
    <meta property="og:description"
      content="Build orchestration, bundling and AI context export utilities for Deno & Web projects.">

    <!-- Web App Manifest -->
    <link rel="manifest" href="./manifest.json">

    <!-- Favicon gerado nativamente via SVG in-line -->
    <link rel="icon" type="image/svg+xml"
      href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%239edeb6'/><text x='50' y='68' font-size='50' font-family='system-ui, sans-serif' font-weight='bold' text-anchor='middle' fill='%231a1c19'>L</text></svg>">

    <!-- BeerCSS e Material Symbols -->
    <link
      href="https://cdn.jsdelivr.net/npm/beercss@3.7.12/dist/cdn/beer.min.css"
      rel="stylesheet" />
    <script type="module"
      src="https://cdn.jsdelivr.net/npm/beercss@3.7.12/dist/cdn/beer.min.js"></script>
    <script type="module"
      src="https://cdn.jsdelivr.net/npm/material-dynamic-colors@1.1.2/dist/cdn/material-dynamic-colors.min.js"></script>
  </head>
  <body class="dark">
    <a id="iframe-warning"
      class="banner yellow-container row center-align padding"
      target="_blank" rel="noopener"
      style="display: none; position: relative; z-index: 1000; border-radius: 8px; margin: 24px 8px 8px 8px; padding-top: 12px; padding-bottom: 12px; min-height: 56px; box-sizing: border-box; overflow: visible;">
      <i style="vertical-align: middle;">info</i>
      <div class="max center-align"
        style="padding: 0 8px; line-height: 1.4; white-space: nowrap;">
        <span>Clique para nova aba.</span>
      </div>
      <i style="vertical-align: middle;">open_in_new</i>
    </a>

    <script>
    (function () {
      try {
        if (window.self !== window.top) {
          document.addEventListener("DOMContentLoaded", () => {
            const banner = document.getElementById("iframe-warning",);
            if (banner) {
              banner.href = window.location.href;
              banner.style.display = "flex";
            }
          },);
        }
      } catch (e) {
        // Fallback for cross-origin errors if top is blocked
        console.warn("Iframe detection error:", e,);
      }
    })();
    </script>

    <div id="app">
      <main class="responsive center-align" style="margin-top: 25vh;">
        <progress class="circle"></progress>
        <p class="secondary-text margin-top-small">Carregando interface...</p>
      </main>
    </div>

    <!-- Arquivo gerado pelo esbuild -->
    <script type="module" src="./main.js"></script>
    <script>
    // Fallback para caso o script falhe ao carregar
    window.addEventListener("error", (e,) => {
      const app = document.getElementById("app",);
      if (app && app.querySelector("progress",)) {
        app.innerHTML = `
          <main class="responsive center-align padding" style="margin-top: 20vh;">
            <i class="error-text extra">error</i>
            <h5 class="bold error-text">Falha ao carregar o script principal</h5>
            <p class="small-text secondary-text font-monospace">${
          e.message || "Erro de rede ao baixar main.js"
        }</p>
            <button class="button primary margin-top" onclick="window.location.reload(true)">Recarregar</button>
          </main>
        `;
      }
    },);
    </script>
  </body>
</html>

```

---

## Arquivo: `packages/ui/src/main.tsx`

```tsx
import { render, } from "preact";
import { Header, } from "./components/Header.tsx";
import { AppDashboard, } from "./components/AppDashboard.tsx";

const App = () => {
  return (
    <div>
      <Header />
      <main class="responsive">
        <div class="space">
        </div>
        <AppDashboard />

        <div class="large-space">
        </div>
        <footer class="responsive center-align">
          <div class="divider">
          </div>
          <div class="space">
          </div>
          <p class="small-text secondary-text no-margin">
            BuildIt &bull; Deno &amp; Web Toolkit &bull; Construído com Preact,
            Signals e BeerCSS
          </p>
        </footer>
      </main>
    </div>
  );
};

const container = document.getElementById("app",);
if (container) {
  container.innerHTML = "";
  try {
    render(<App />, container,);
  } catch (err) {
    console.error("Erro ao renderizar App:", err,);
    container.innerHTML = `
      <div class="padding center-align surface-error-container round margin">
        <h5 class="bold error-text">Erro ao inicializar a interface</h5>
        <p class="small-text font-monospace">${
      err instanceof Error ? err.message : String(err,)
    }</p>
      </div>
    `;
  }
}

```

---

## Arquivo: `packages/ui/src/stores/app.ts`

```ts
import { computed, signal, } from "@preact/signals";

export type TabKey = "overview" | "tools" | "cli" | "configs" | "api";
export type ToolKey =
  | "esbuild"
  | "denobuild"
  | "watch"
  | "export"
  | "versioning";

export interface ToolInfo {
  id: ToolKey;
  name: string;
  badge: string;
  icon: string;
  colorClass: string;
  summary: string;
  description: string;
  cliCommand: string;
  configFile: string;
  features: string[];
}

export interface CliCommandItem {
  id: string;
  tool: ToolKey;
  title: string;
  command: string;
  description: string;
  tag: string;
}

export const activeTab = signal<TabKey>("overview",);
export const selectedTool = signal<ToolKey>("esbuild",);
export const selectedConfig = signal<string>("esbuild.jsonc",);
export const searchQuery = signal<string>("",);
export const copiedId = signal<string | null>(null,);
export const themeMode = signal<"dark" | "light">("dark",);

export const toggleTheme = () => {
  const next = themeMode.value === "dark" ? "light" : "dark";
  themeMode.value = next;
  if (typeof document !== "undefined") {
    document.body.className = next;
  }
};

export const copyToClipboard = async (text: string, id: string,) => {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text,);
    }
    copiedId.value = id;
    setTimeout(() => {
      if (copiedId.value === id) {
        copiedId.value = null;
      }
    }, 2000,);
  } catch (err) {
    console.warn("Falha ao copiar para clipboard:", err,);
  }
};

export const TOOLS: ToolInfo[] = [
  {
    id: "esbuild",
    name: "esbuild Pipeline",
    badge: "Produção",
    icon: "bolt",
    colorClass: "primary-text",
    summary:
      "Compilação de alta performance para produção com resolução Deno, JSR e NPM.",
    description:
      "Empacota aplicações Preact/JSX, TypeScript e JavaScript com esbuild nativo e @deno/esbuild-plugin. Oferece injeção de versão semântica, cópia seletiva de assets (copyFiles) e limpeza com suporte a globs e excludes.",
    cliCommand: "deno run -A jsr:@vanaware/buildit/cli/esbuild",
    configFile: "esbuild.jsonc",
    features: [
      "Plugin Deno para resolução transparente de imports remotos (https, jsr, npm)",
      "Transformação JSX automática com jsxImportSource: preact",
      "Injeção automática da constante __APP_VERSION__ em código e manifest.json",
      "Limpeza robusta com clean (includes e excludes)",
      "Cópia flexível com copyFiles mantendo estruturas baseadas em basedir",
    ],
  },
  {
    id: "denobuild",
    name: "Deno.bundle Nativo",
    badge: "Empacotador Nativo",
    icon: "package_2",
    colorClass: "secondary-text",
    summary: "Geração de bundles autocontidos usando a API nativa Deno.bundle.",
    description:
      "Utiliza o compilador nativo do runtime Deno (--unstable-bundle) para gerar saídas limpas sem depender de binários esbuild externos. Ideal para ambientes restritos ou empacotamento puro de bibliotecas.",
    cliCommand:
      "deno run --unstable-bundle -A jsr:@vanaware/buildit/cli/denobuild ui",
    configFile: "denobuild.jsonc",
    features: [
      "Integração 100% nativa com o subsistema Deno 2.x",
      "Geração de código ESM ou IIFE autocontido",
      "Compatível com o mesmo esquema de alvos (targets) e copyFiles",
      "Respeita opções de minificação e sourcemap do Deno",
    ],
  },
  {
    id: "watch",
    name: "Watch Dev Engine",
    badge: "Desenvolvimento",
    icon: "visibility",
    colorClass: "tertiary-text",
    summary:
      "Recompilação incremental ultrarrápida com esbuild.context e lockfile anti-concorrência.",
    description:
      "Monitora arquivos em srcdir e dispara rebuilds quase instantâneos. Possui trava de processo (buildit.lock) com verificação de PID ativo para evitar corridas entre servidores e watch concorrentes.",
    cliCommand: "deno run -A jsr:@vanaware/buildit/cli/watch",
    configFile: "watch.jsonc",
    features: [
      "Recompilação incremental orientada a contexto (esbuild.context)",
      "Mecanismo de Lockfile anti-concorrência baseado em PID ativo",
      "Injeção de banners [DEV WATCH] para depuração em desenvolvimento",
      "Sincronização imediata de arquivos estáticos em cada modificação",
    ],
  },
  {
    id: "export",
    name: "AI Context Exporter",
    badge: "LLM & Snapshots",
    icon: "smart_toy",
    colorClass: "primary-text",
    summary:
      "Varredura de repositório e consolidação de código em Markdown para prompts e LLMs.",
    description:
      "Varre workspaces Deno, filtra arquivos por globs e extensões permitidas, e formata o conteúdo em um snapshot legível e contextualizado para ser usado por agentes de IA e revisões de código.",
    cliCommand: "deno run -A jsr:@vanaware/buildit/cli/export",
    configFile: "export.jsonc",
    features: [
      "Filtro declarativo de arquivos via includes e excludes",
      "Instruções contextuais customizadas por modo (ex: UI, Docs, Servidor)",
      "Proteção automática contra inclusão acidental de snapshots recursivos",
      "Cabeçalho estruturado com árvore de arquivos, versão e metadados",
    ],
  },
  {
    id: "versioning",
    name: "SemVer & Git Tagging",
    badge: "Release & Tags",
    icon: "sell",
    colorClass: "secondary-text",
    summary:
      "Sincronização de versões em workspaces e criação automatizada de releases Git.",
    description:
      "Padroniza a versão semântica de deno.jsonc (incluindo suporte a hashes e pré-releases), sincroniza múltiplos pacotes do workspace e gera tags de versão Git (vX.Y.Z) de forma determinística.",
    cliCommand: "deno run -A jsr:@vanaware/buildit/cli/sanitize-version",
    configFile: "deno.jsonc",
    features: [
      "Sanitização de versões para formato semver rigoroso (MAJOR.MINOR.PATCH)",
      "Sincronização em cascata para todos os membros do workspace",
      "Submódulo tag-version para automação de tags e releases no GitHub",
      "Geração de hash de commit curto para builds intermediários",
    ],
  },
];

export const CLI_COMMANDS: CliCommandItem[] = [
  {
    id: "cmd-esbuild-all",
    tool: "esbuild",
    title: "Build Geral (Todos os Alvos)",
    command: "deno run -A jsr:@vanaware/buildit/cli/esbuild",
    description:
      "Executa todos os alvos configurados com default: true no esbuild.jsonc.",
    tag: "esbuild",
  },
  {
    id: "cmd-esbuild-target",
    tool: "esbuild",
    title: "Build de Alvo Específico",
    command: "deno run -A jsr:@vanaware/buildit/cli/esbuild ui --noversion",
    description: "Compila somente o alvo 'ui' ignorando incremento de versão.",
    tag: "esbuild",
  },
  {
    id: "cmd-watch",
    tool: "watch",
    title: "Iniciar Modo Watch",
    command: "deno run -A jsr:@vanaware/buildit/cli/watch",
    description:
      "Inicia o monitoramento de alterações com recompilação incremental contínua.",
    tag: "watch",
  },
  {
    id: "cmd-watch-target",
    tool: "watch",
    title: "Watch em Alvo Específico",
    command: "deno run -A jsr:@vanaware/buildit/cli/watch ui",
    description: "Monitora exclusivamente o alvo 'ui'.",
    tag: "watch",
  },
  {
    id: "cmd-denobuild",
    tool: "denobuild",
    title: "Empacotar com Deno Nativo",
    command:
      "deno run --unstable-bundle -A jsr:@vanaware/buildit/cli/denobuild ui",
    description: "Gera o bundle usando o comando Deno.bundle nativo.",
    tag: "denobuild",
  },
  {
    id: "cmd-export-all",
    tool: "export",
    title: "Exportar Contextos de IA",
    command: "deno run -A jsr:@vanaware/buildit/cli/export",
    description:
      "Gera snapshots de código em formato Markdown conforme export.jsonc.",
    tag: "export",
  },
  {
    id: "cmd-export-mode",
    tool: "export",
    title: "Exportar Modo Específico",
    command: "deno run -A jsr:@vanaware/buildit/cli/export ui docs",
    description: "Gera apenas os arquivos de snapshot dos modos informados.",
    tag: "export",
  },
  {
    id: "cmd-sanitize",
    tool: "versioning",
    title: "Sanitizar Versão SemVer",
    command: "deno run -A jsr:@vanaware/buildit/cli/sanitize-version",
    description:
      "Normaliza o campo 'version' do deno.jsonc para SemVer padrão.",
    tag: "version",
  },
  {
    id: "cmd-tag",
    tool: "versioning",
    title: "Criar Tag Git Semântica",
    command: "deno run -A jsr:@vanaware/buildit/cli/tag-version",
    description: "Cria e prepara a tag vX.Y baseada na versão do projeto.",
    tag: "version",
  },
];

export const CONFIG_SNIPPETS: Record<string, string> = {
  "esbuild.jsonc": `{
  "$schema": "jsr:@vanaware/buildit/schema/esbuild.json",
  "versionPaths": [
    "src/version.ts"
  ],
  "targets": {
    "ui": {
      "default": true,
      "srcdir": "packages/ui/src",
      "distdir": "packages/server/build/dist",
      "clean": {
        "includes": ["*"],
        "excludes": ["assets/keep/**"]
      },
      "copyFiles": [
        { "basedir": "packages/ui/public" },
        { "basedir": "packages/ui/src", "includes": ["index.html"] }
      ],
      "entryPoints": ["main.tsx"],
      "platform": "browser",
      "format": "esm",
      "bundle": true,
      "minify": true,
      "sourcemap": "linked",
      "jsx": "automatic",
      "jsxImportSource": "preact"
    }
  }
}`,

  "watch.jsonc": `{
  "$schema": "jsr:@vanaware/buildit/schema/watch.json",
  "targets": {
    "ui": {
      "default": true,
      "srcdir": "packages/ui/src",
      "distdir": "packages/server/build/dist",
      "copyFiles": [
        { "basedir": "packages/ui/public" },
        { "basedir": "packages/ui/src", "includes": ["index.html"] }
      ],
      "entryPoints": ["main.tsx"],
      "platform": "browser",
      "format": "esm",
      "bundle": true,
      "minify": false,
      "sourcemap": "inline",
      "jsx": "automatic",
      "jsxImportSource": "preact",
      "outfile": "main.js"
    }
  }
}`,

  "export.jsonc": `{
  "$schema": "jsr:@vanaware/buildit/schema/export.json",
  "projeto": "MeuProjeto",
  "modos": {
    "ui": {
      "arquivoSaida": "snapshots/ui.md",
      "includes": [
        "packages/ui/src/**/*.{tsx,ts,html,css}",
        "packages/ui/deno.jsonc"
      ],
      "excludes": [
        "**/node_modules/**",
        "**/.git/**"
      ],
      "incluiVersao": true,
      "instrucaoCustomizada": "Arquivos do frontend Preact da aplicação.",
      "default": true
    },
    "docs": {
      "arquivoSaida": "snapshots/docs.md",
      "includes": ["docs/**/*.md", "README.md"],
      "default": false
    }
  }
}`,

  "denobuild.jsonc": `{
  "$schema": "jsr:@vanaware/buildit/schema/denobuild.json",
  "targets": {
    "app": {
      "mode": "build",
      "default": true,
      "srcdir": "src",
      "distdir": "dist",
      "entryPoints": ["main.ts"],
      "format": "esm",
      "minify": false,
      "sourcemap": "linked",
      "packages": "bundle"
    }
  }
}`,
};

export const API_CODE_SNIPPETS = {
  esbuild: `import { esBuild } from "jsr:@vanaware/buildit";

await esBuild({
  config: {
    app: {
      srcdir: "src",
      distdir: "dist",
      entryPoints: ["main.tsx"],
      bundle: true,
      minify: true,
      clean: ["*"],
      copyFiles: [{ basedir: "public" }],
      defineAssetsString: "__GENERATED_ASSETS__",
      defineVersionString: "__APP_VERSION__",
    },
  },
  noversion: true,
});`,

  watch: `import { watchEngine } from "jsr:@vanaware/buildit";

const handles = await watchEngine({
  config: {
    ui: {
      entryPoints: ["packages/ui/src/main.tsx"],
      distdir: "packages/server/build/dist",
      sourcemap: "inline",
      copyFiles: [
        { basedir: "packages/ui/public" }
      ],
    },
  },
  target: "ui",
});

console.log("Servidor watch em execução. Pressione Ctrl+C para encerrar.");`,

  export: `import { exportEngine } from "jsr:@vanaware/buildit";

await exportEngine({
  config: {
    ui: {
      arquivoSaida: "snapshots/ui.md",
      includes: ["packages/ui/src/**/*"],
    },
  },
  modos: ["ui"],
});`,
};

export const filteredCliCommands = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return CLI_COMMANDS;
  return CLI_COMMANDS.filter((cmd,) =>
    cmd.title.toLowerCase().includes(query,) ||
    cmd.command.toLowerCase().includes(query,) ||
    cmd.description.toLowerCase().includes(query,) ||
    cmd.tag.toLowerCase().includes(query,)
  );
},);

```

---

## Arquivo: `packages/ui/src/version.ts`

```ts
// Automatically generated file during build
declare const __APP_VERSION__: string;

/** Current library/application version. */
export const APP_VERSION: string = typeof __APP_VERSION__ !== "undefined"
  ? __APP_VERSION__
  : "";

```

---

## Arquivo: `packages/ui/tests/store.test.ts`

```ts
/**
 * @file store.test.ts
 * @description Testes unitários para os signals e ações do store da UI.
 */

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import {
  activeTab,
  CLI_COMMANDS,
  copiedId,
  copyToClipboard,
  filteredCliCommands,
  searchQuery,
  selectedConfig,
  selectedTool,
  themeMode,
  toggleTheme,
  TOOLS,
} from "../src/stores/app.ts";

describe("UI Store - Signals & Actions", () => {
  it("deve alternar abas ativas reativamente", () => {
    activeTab.value = "overview";
    assertEquals(activeTab.value, "overview",);

    activeTab.value = "tools";
    assertEquals(activeTab.value, "tools",);

    activeTab.value = "cli";
    assertEquals(activeTab.value, "cli",);

    activeTab.value = "configs";
    assertEquals(activeTab.value, "configs",);

    activeTab.value = "api";
    assertEquals(activeTab.value, "api",);
  });

  it("deve alternar ferramentas selecionadas reativamente", () => {
    selectedTool.value = "esbuild";
    assertEquals(selectedTool.value, "esbuild",);

    selectedTool.value = "watch";
    assertEquals(selectedTool.value, "watch",);

    selectedTool.value = "export";
    assertEquals(selectedTool.value, "export",);

    selectedTool.value = "denobuild";
    assertEquals(selectedTool.value, "denobuild",);

    selectedTool.value = "versioning";
    assertEquals(selectedTool.value, "versioning",);
  });

  it("deve alternar modo de tema claro/escuro", () => {
    themeMode.value = "dark";
    toggleTheme();
    assertEquals(themeMode.value, "light",);
    toggleTheme();
    assertEquals(themeMode.value, "dark",);
  });

  it("deve filtrar comandos CLI com base no searchQuery computado", () => {
    searchQuery.value = "";
    assertEquals(filteredCliCommands.value.length, CLI_COMMANDS.length,);

    searchQuery.value = "watch";
    const watchCmds = filteredCliCommands.value;
    assertEquals(watchCmds.length > 0, true,);
    assertEquals(
      watchCmds.every((c,) =>
        c.title.toLowerCase().includes("watch",) ||
        c.command.toLowerCase().includes("watch",) ||
        c.description.toLowerCase().includes("watch",) ||
        c.tag.toLowerCase().includes("watch",)
      ),
      true,
    );

    searchQuery.value = "termo_completamente_inexistente_12345";
    assertEquals(filteredCliCommands.value.length, 0,);

    searchQuery.value = "";
  });

  it("deve alternar arquivos de configuração selecionados", () => {
    selectedConfig.value = "esbuild.jsonc";
    assertEquals(selectedConfig.value, "esbuild.jsonc",);

    selectedConfig.value = "export.jsonc";
    assertEquals(selectedConfig.value, "export.jsonc",);
  });

  it("deve atualizar copiedId via copyToClipboard", async () => {
    copiedId.value = null;
    await copyToClipboard(
      "deno run -A jsr:@vanaware/buildit/cli/esbuild",
      "test-cmd",
    );
    assertEquals(copiedId.value, "test-cmd",);
  });

  it("deve conter metadados consistentes de ferramentas", () => {
    assertEquals(TOOLS.length, 5,);
    const ids = TOOLS.map((t,) => t.id);
    assertEquals(ids.includes("esbuild",), true,);
    assertEquals(ids.includes("denobuild",), true,);
    assertEquals(ids.includes("watch",), true,);
    assertEquals(ids.includes("export",), true,);
    assertEquals(ids.includes("versioning",), true,);
  });
});

```

---

