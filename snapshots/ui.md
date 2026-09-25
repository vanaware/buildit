> **INSTRUÇÃO PARA A IA:** 
> O texto abaixo contém os arquivos de CÓDIGO FONTE principais da aplicação exemplo (UI).
> Cada arquivo começa com um título indicando seu caminho relativo exato (ex: `## Arquivo: src/main.ts`).
> Sempre que sugerir alterações, indique claramente qual arquivo deve ser modificado com base nesses caminhos e forneça o novo código completo do arquivo.

---

# Contexto Exportado do Projeto BuildIt [v0.3.19#mugtcmlj] - Modo: UI

Gerado automaticamente em: 2026-09-25T17:27:51.101Z

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
    "@preact/signals-core": "https://esm.sh/@preact/signals-core@1.14.4",

    // Bibliotecas Internas — integrando utilitários de build e contexto
    "@vanaware/buildit": "../utils/src/mod.ts"
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
import { version as APP_VERSION, } from "@vanaware/buildit";
import {
  applyPreset,
  cleanDistEnabled,
  isSimulating,
  minifyEnabled,
  runSimulator,
  selectedTool,
  simLogs,
  sourcemapEnabled,
  targetName,
} from "../stores/app.ts";

export const AppDashboard = () => {
  return (
    <div class="grid padding">
      {/* Coluna de Controle */}
      <div class="s12 m4 l3">
        <article class="border no-padding">
          <div class="padding primary-container">
            <h6 class="no-margin">
              Build Config
            </h6>
            <div class="small-text">
              Orquestrador @vanaware/buildit
            </div>
          </div>
          <div class="padding">
            <p class="bold">
              Alvo do Build
            </p>
            <div class="field border label max">
              <select
                value={targetName.value}
                onInput={(e,) =>
                  targetName.value = (e.target as HTMLSelectElement).value}>
                <option value="ui">
                  Frontend (packages/ui)
                </option>
                <option value="server">
                  Servidor (packages/server)
                </option>
                <option value="utils">
                  Utilitários (packages/utils)
                </option>
              </select>
              <label>
                Target
              </label>
            </div>

            <p class="bold space">
              Predefinições Rápidas
            </p>
            <div class="row wrap gap">
              <button
                type="button"
                class="chip primary"
                onClick={() => applyPreset("prod",)}>
                <i>
                  rocket_launch
                </i>
                <span>
                  Produção
                </span>
              </button>
              <button
                type="button"
                class="chip secondary"
                onClick={() => applyPreset("dev",)}>
                <i>
                  handyman
                </i>
                <span>
                  Dev Rápido
                </span>
              </button>
              <button
                type="button"
                class="chip tertiary"
                onClick={() => applyPreset("export",)}>
                <i>
                  description
                </i>
                <span>
                  Snapshot IA
                </span>
              </button>
            </div>

            <div class="divider margin">
            </div>

            <div class="row middle space">
              <div class="max">
                <div class="bold">
                  Minificar
                </div>
                <div class="small-text">
                  Otimizar bundle final
                </div>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  checked={minifyEnabled.value}
                  onInput={(e,) =>
                    minifyEnabled.value =
                      (e.target as HTMLInputElement).checked} />
                <span>
                </span>
              </label>
            </div>

            <div class="row middle space margin">
              <div class="max">
                <div class="bold">
                  Source Maps
                </div>
                <div class="small-text">
                  Habilitar depuração
                </div>
              </div>
              <label class="switch">
                <input
                  type="checkbox"
                  checked={sourcemapEnabled.value}
                  onInput={(e,) =>
                    sourcemapEnabled.value =
                      (e.target as HTMLInputElement).checked} />
                <span>
                </span>
              </label>
            </div>

            <div class="space">
            </div>
            <button
              type="button"
              class="extend extra primary large"
              onClick={runSimulator}
              disabled={isSimulating.value}>
              {isSimulating.value ?
                (
                  <progress class="circle small white-text">
                  </progress>
                ) :
                (
                  <i>
                    play_arrow
                  </i>
                )}
              <span>
                Executar Build
              </span>
            </button>
          </div>
        </article>
      </div>

      {/* Coluna do Console / Demo */}
      <div class="s12 m8 l9">
        <article class="border no-padding fill height-max">
          <div class="padding surface-container-highest row middle">
            <i class="primary-text">
              terminal
            </i>
            <h6 class="max no-margin margin-left">
              Build Console
            </h6>
            <div class="chip outline">
              v{APP_VERSION}
            </div>
          </div>

          <div
            class="padding black white-text font-monospace small-text scroll overflow-auto"
            style="height: 400px; line-height: 1.6;">
            {simLogs.value.map((log, i,) => (
              <div
                key={i}
                class={log.includes("✅",)
                  ? "green-text"
                  : log.includes("❌",)
                  ? "red-text"
                  : ""}>
                {log}
              </div>
            ))}
            {isSimulating.value && (
              <div class="blink row middle gap">
                <progress class="circle small">
                </progress>
                <span>
                  Processando pipeline...
                </span>
              </div>
            )}
          </div>

          <div class="padding row gap scroll overflow-auto">
            <div class="chip outline">
              <i>
                bolt
              </i>
              <span>
                esbuild (Native)
              </span>
            </div>
            <div class="chip outline">
              <i>
                package
              </i>
              <span>
                Deno.bundle
              </span>
            </div>
            <div class="chip outline">
              <i>
                visibility
              </i>
              <span>
                Watch Engine
              </span>
            </div>
            <div class="chip outline">
              <i>
                smart_toy
              </i>
              <span>
                AI Export
              </span>
            </div>
            <div class="chip outline">
              <i>
                shield_check
              </i>
              <span>
                SemVer Sanitizer
              </span>
            </div>
          </div>
        </article>

        <div class="space">
        </div>

        <div class="row gap">
          <article class="s12 m6 l4 border padding">
            <div class="row middle gap">
              <i class="primary-text circle surface-variant">
                javascript
              </i>
              <div>
                <div class="bold">
                  JS/TS Bundling
                </div>
                <div class="small-text">
                  Suporte nativo a JSX/Preact
                </div>
              </div>
            </div>
          </article>
          <article class="s12 m6 l4 border padding">
            <div class="row middle gap">
              <i class="secondary-text circle surface-variant">
                sync
              </i>
              <div>
                <div class="bold">
                  Version Sync
                </div>
                <div class="small-text">
                  Sincronização entre pacotes
                </div>
              </div>
            </div>
          </article>
          <article class="s12 m12 l4 border padding">
            <div class="row middle gap">
              <i class="tertiary-text circle surface-variant">
                folder_zip
              </i>
              <div>
                <div class="bold">
                  Zero External Dep
                </div>
                <div class="small-text">
                  Executa puro no Deno 2.x
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

```

---

## Arquivo: `packages/ui/src/components/Header.tsx`

```tsx
import { activeTab, themeMode, toggleTheme, } from "../stores/app.ts";
import { version as APP_VERSION, } from "@vanaware/buildit";

export const Header = () => {
  return (
    <header class="surface-container-low border bottom">
      <nav class="responsive">
        <div class="circle primary-container middle center-align">
          <i class="primary-text">
            construction
          </i>
        </div>
        <div class="max">
          <div class="row middle no-space">
            <h5 class="no-margin bold">
              BuildIt
            </h5>
            <span class="chip small primary-container margin-left">
              v{APP_VERSION}
            </span>
            <span class="chip small tertiary-container margin-left none s-inline-block">
              Deno 2.x
            </span>
            <span class="chip small secondary-container margin-left none m-inline-block">
              JSR
            </span>
          </div>
          <div class="small-text secondary-text">
            Orquestrador de Compilação &amp; Exportador de Contexto IA para Deno
          </div>
        </div>
        <button
          type="button"
          class="circle transparent wave"
          onClick={toggleTheme}
          title={themeMode.value === "dark"
            ? "Ativar tema claro"
            : "Ativar tema escuro"}>
          <i>
            {themeMode.value === "dark" ? "light_mode" : "dark_mode"}
          </i>
        </button>
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
      class="banner yellow-container row middle center-align padding"
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
      <main class="responsive center-align">
        <div class="space"></div>
        <h5>Carregando aplicação...</h5>
        <progress class="circle"></progress>
      </main>
    </div>

    <!-- Arquivo gerado pelo esbuild -->
    <script type="module" src="./main.js?v=3"></script>
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

render(<App />, document.getElementById("app",)!,);

```

---

## Arquivo: `packages/ui/src/stores/app.ts`

```ts
import { computed, signal, } from "@preact/signals";

export type TabKey = "overview" | "cli" | "interactive" | "snapshots";
export type ToolKey = "esbuild" | "denobuild" | "export";

export const activeTab = signal<TabKey>("overview",);
export const themeMode = signal<"dark" | "light">("dark",);
export const selectedTool = signal<ToolKey>("esbuild",);

export const targetName = signal<string>("ui",);
export const minifyEnabled = signal<boolean>(false,);
export const sourcemapEnabled = signal<boolean>(true,);
export const cleanDistEnabled = signal<boolean>(true,);

export const bundleSimCount = signal<number>(0,);
export const isSimulating = signal<boolean>(false,);
export const simLogs = signal<string[]>([
  "🚀 BuildIt Workspace Initialized.",
  "📦 Packages active: server, ui, utils (@vanaware/buildit)",
  "💡 Ready to orchestrate builds and context exports.",
],);

export const totalLogsCount = computed(() => simLogs.value.length);

export const addLog = (msg: string,) => {
  const timestamp = new Date().toLocaleTimeString();
  simLogs.value = [...simLogs.value, `[${timestamp}] ${msg}`,];
};

export const applyPreset = (preset: "prod" | "dev" | "export",) => {
  if (preset === "prod") {
    selectedTool.value = "esbuild";
    targetName.value = "ui";
    minifyEnabled.value = true;
    sourcemapEnabled.value = true;
    cleanDistEnabled.value = true;
    addLog(
      "⚡ Predefinição 'Produção' aplicada (esbuild, minify, sourcemap, clean).",
    );
  } else if (preset === "dev") {
    selectedTool.value = "esbuild";
    targetName.value = "ui";
    minifyEnabled.value = false;
    sourcemapEnabled.value = true;
    cleanDistEnabled.value = false;
    addLog(
      "🛠️ Predefinição 'Dev Rápido' aplicada (esbuild, unminified, sourcemap).",
    );
  } else {
    selectedTool.value = "export";
    targetName.value = "ui";
    minifyEnabled.value = false;
    sourcemapEnabled.value = false;
    cleanDistEnabled.value = false;
    addLog("📝 Predefinição 'Snapshot IA' aplicada (exportador de contexto).",);
  }
};

export const clearLogs = () => {
  simLogs.value = [];
};

export const toggleTheme = () => {
  const next = themeMode.value === "dark" ? "light" : "dark";
  themeMode.value = next;
  if (typeof document !== "undefined") {
    document.body.className = next;
  }
};

export const runSimulator = async () => {
  if (isSimulating.value) return;
  isSimulating.value = true;
  bundleSimCount.value += 1;

  const target = targetName.value;
  const tool = selectedTool.value;

  addLog(`--- Iniciando execução de ${tool} para o alvo: ${target} ---`,);

  if (cleanDistEnabled.value) {
    addLog(
      `🧹 Limpando diretório de distribuição em packages/server/build/dist...`,
    );
  }

  await new Promise((r,) => setTimeout(r, 400,));

  if (tool === "esbuild") {
    addLog(
      `🔨 Compilando via esbuild com @deno/esbuild-plugin (minify: ${minifyEnabled.value}, sourcemap: ${sourcemapEnabled.value})...`,
    );
    await new Promise((r,) => setTimeout(r, 350,));
    addLog(
      `📄 Copiando assets estáticos e injetando versão em manifest.json...`,
    );
    await new Promise((r,) => setTimeout(r, 300,));
    addLog(
      `✅ Alvo [${target}] gerado com sucesso: dist/${
        target === "ui" ? "main.js" : target + ".js"
      }`,
    );
  } else if (tool === "denobuild") {
    addLog(`📦 Empacotando com Deno.bundle API nativo (--unstable-bundle)...`,);
    await new Promise((r,) => setTimeout(r, 450,));
    addLog(`✅ Bundle autônomo gerado sem dependências de bundlers externos!`,);
  } else {
    addLog(
      `🔍 Varrendo workspace e filtrando arquivos por extensões permitidas...`,
    );
    await new Promise((r,) => setTimeout(r, 350,));
    addLog(
      `📝 Gerando snapshot em markdown formatado para contexto de IA: snapshots/${target}.md`,
    );
  }

  addLog(`🎉 Pipeline finalizada com êxito! (Build #${bundleSimCount.value})`,);
  isSimulating.value = false;
};

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
  addLog,
  applyPreset,
  cleanDistEnabled,
  clearLogs,
  minifyEnabled,
  selectedTool,
  simLogs,
  sourcemapEnabled,
  themeMode,
  toggleTheme,
  totalLogsCount,
} from "../src/stores/app.ts";

describe("UI Store - Signals & Actions", () => {
  it("deve alternar abas ativas reativamente", () => {
    activeTab.value = "overview";
    assertEquals(activeTab.value, "overview",);

    activeTab.value = "cli";
    assertEquals(activeTab.value, "cli",);

    activeTab.value = "snapshots";
    assertEquals(activeTab.value, "snapshots",);
  });

  it("deve alternar modo de tema claro/escuro", () => {
    themeMode.value = "dark";
    toggleTheme();
    assertEquals(themeMode.value, "light",);
    toggleTheme();
    assertEquals(themeMode.value, "dark",);
  });

  it("deve aplicar predefinições de build corretamente", () => {
    applyPreset("prod",);
    assertEquals(selectedTool.value, "esbuild",);
    assertEquals(minifyEnabled.value, true,);
    assertEquals(sourcemapEnabled.value, true,);
    assertEquals(cleanDistEnabled.value, true,);

    applyPreset("dev",);
    assertEquals(selectedTool.value, "esbuild",);
    assertEquals(minifyEnabled.value, false,);
    assertEquals(sourcemapEnabled.value, true,);
    assertEquals(cleanDistEnabled.value, false,);

    applyPreset("export",);
    assertEquals(selectedTool.value, "export",);
    assertEquals(minifyEnabled.value, false,);
    assertEquals(sourcemapEnabled.value, false,);
    assertEquals(cleanDistEnabled.value, false,);
  });

  it("deve adicionar e limpar logs no console de simulação", () => {
    clearLogs();
    assertEquals(simLogs.value.length, 0,);
    assertEquals(totalLogsCount.value, 0,);

    addLog("Evento de teste",);
    assertEquals(totalLogsCount.value, 1,);
    assertEquals(simLogs.value[0]?.includes("Evento de teste",), true,);

    clearLogs();
    assertEquals(totalLogsCount.value, 0,);
  });
});

```

---

