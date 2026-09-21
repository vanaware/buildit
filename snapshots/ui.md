> **INSTRUÇÃO PARA A IA:** 
> O texto abaixo contém os arquivos de CÓDIGO FONTE principais da aplicação exemplo (UI).
> O projeto é o **BuildIt [v0.3.10#mual9u7m] ** estruturado em módulos. 
> Cada arquivo começa com um título indicando seu caminho relativo exato (ex: `## Arquivo: src/main.ts`).
> Sempre que sugerir alterações, indique claramente qual arquivo deve ser modificado com base nesses caminhos e forneça o novo código completo do arquivo.

---

# Contexto Exportado do Projeto BuildIt [v0.3.10#mual9u7m] - Modo: UI

Gerado automaticamente em: 2026-09-21T02:17:40.312Z

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

## Arquivo: `packages/ui/src/components/SimulatorCard.tsx`

```tsx
import {
  bundleSimCount,
  cleanDistEnabled,
  clearLogs,
  isSimulating,
  minifyEnabled,
  runSimulator,
  selectedTool,
  simLogs,
  sourcemapEnabled,
  targetName,
  totalLogsCount,
  type ToolKey,
} from "../stores/app.ts";

export const SimulatorCard = () => {
  return (
    <div class="grid">
      <div class="s12 m5">
        <article class="border round surface-container-low padding">
          <div class="row middle">
            <i class="primary-text extra">tune</i>
            <div class="max">
              <h5 class="no-margin">Simulador de Build</h5>
              <div class="small-text secondary-text">
                Parâmetros reativos controlados via Signals
              </div>
            </div>
          </div>

          <div class="space"></div>

          <div class="field label border round">
            <select
              value={selectedTool.value}
              onChange={(e,) =>
                (selectedTool.value = (e.target as HTMLSelectElement).value as ToolKey)
              }
            >
              <option value="esbuild">esbuild (Orquestrador oficial)</option>
              <option value="denobuild">denobuild (Deno.bundle nativo)</option>
              <option value="export">export (Snapshot Markdown)</option>
            </select>
            <label>Ferramenta / CLI</label>
          </div>

          <div class="field label border round">
            <select
              value={targetName.value}
              onChange={(e,) =>
                (targetName.value = (e.target as HTMLSelectElement).value)
              }
            >
              <option value="ui">ui (packages/ui)</option>
              <option value="server">server (packages/server)</option>
              <option value="utils">utils (packages/utils)</option>
            </select>
            <label>Alvo (Target)</label>
          </div>

          <div class="space"></div>

          <nav class="list">
            <label class="checkbox">
              <input
                type="checkbox"
                checked={minifyEnabled.value}
                onChange={(e,) =>
                  (minifyEnabled.value = (e.target as HTMLInputElement).checked)
                }
              />
              <span>Minificar saída (minify)</span>
            </label>

            <label class="checkbox">
              <input
                type="checkbox"
                checked={sourcemapEnabled.value}
                onChange={(e,) =>
                  (sourcemapEnabled.value = (e.target as HTMLInputElement).checked)
                }
              />
              <span>Gerar Sourcemaps (sourcemap)</span>
            </label>

            <label class="checkbox">
              <input
                type="checkbox"
                checked={cleanDistEnabled.value}
                onChange={(e,) =>
                  (cleanDistEnabled.value = (e.target as HTMLInputElement).checked)
                }
              />
              <span>Limpar diretório de saída (clean)</span>
            </label>
          </nav>

          <div class="space"></div>

          <nav class="row">
            <button
              type="button"
              class="primary round"
              disabled={isSimulating.value}
              onClick={runSimulator}
            >
              <i>play_arrow</i>
              <span>{isSimulating.value ? "Executando..." : "Executar Build"}</span>
            </button>
            <button
              type="button"
              class="border round"
              onClick={clearLogs}
            >
              <i>delete_sweep</i>
              <span>Limpar Logs</span>
            </button>
          </nav>

          <div class="space"></div>
          <div class="divider"></div>
          <div class="space"></div>

          <div class="row middle no-space">
            <i class="small-text secondary-text">history</i>
            <span class="small-text secondary-text margin-left">
              Execuções nesta sessão: <strong>{bundleSimCount.value}</strong>
            </span>
          </div>
        </article>
      </div>

      <div class="s12 m7">
        <article class="border round surface-container-low padding">
          <div class="row middle">
            <i class="primary-text">terminal</i>
            <h6 class="max no-margin">Console de Execução</h6>
            <span class="chip small surface-container-highest">
              {totalLogsCount.value} linhas
            </span>
          </div>
          <div class="space"></div>
          <pre class="scroll surface-container-highest round padding"><code>{simLogs.value.join("\n",)}</code></pre>
        </article>
      </div>
    </div>
  );
};


```

---

## Arquivo: `packages/ui/src/components/Navigation.tsx`

```tsx
import { activeTab, type TabKey, } from "../stores/app.ts";

export const Navigation = () => {
  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "overview", label: "Visão Geral", icon: "dashboard", },
    { key: "cli", label: "Ferramentas & CLI", icon: "terminal", },
    { key: "interactive", label: "Simulador Interativo", icon: "play_circle", },
    { key: "snapshots", label: "Exportador de Contexto", icon: "share", },
  ];

  return (
    <nav class="tabs center-align border bottom margin-bottom scroll">
      {tabs.map((tab,) => (
        <a
          key={tab.key}
          class={activeTab.value === tab.key ? "active" : ""}
          onClick={() => (activeTab.value = tab.key)}
        >
          <i>{tab.icon}</i>
          <span>{tab.label}</span>
        </a>
      ))}
    </nav>
  );
};


```

---

## Arquivo: `packages/ui/src/components/SnapshotsCard.tsx`

```tsx
export const SnapshotsCard = () => {
  return (
    <div class="grid">
      <div class="s12">
        <article class="border round surface-container-low padding">
          <div class="row middle">
            <i class="primary-text extra">auto_stories</i>
            <div class="max">
              <h5 class="no-margin">Exportador de Contexto para Inteligência Artificial</h5>
              <div class="small-text secondary-text">
                Gere snapshots consolidados em Markdown para LLMs e revisões de código
              </div>
            </div>
            <span class="chip small primary-container">CLI & Lib</span>
          </div>

          <div class="space"></div>

          <p class="secondary-text">
            Desenvolvedores que utilizam assistentes de código e LLMs precisam constantemente
            fornecer contexto preciso de seus repositórios. O utilitário <code>export</code> varre os
            arquivos selecionados, remove ruídos desnecessários e formata o conteúdo em um snapshot
            único, limpo e estruturado.
          </p>
        </article>
      </div>

      <div class="s12 m6">
        <article class="border round surface-container-low padding">
          <h6 class="no-margin">Snapshots Predefinidos</h6>
          <div class="space"></div>
          <nav class="list">
            <div class="row middle padding border round margin-bottom surface-container">
              <i class="primary-text">code</i>
              <div class="max margin-left">
                <strong>snapshots/ui.md</strong>
                <div class="small-text secondary-text">Todo o código-fonte da interface Preact</div>
              </div>
            </div>
            <div class="row middle padding border round margin-bottom surface-container">
              <i class="primary-text">dns</i>
              <div class="max margin-left">
                <strong>snapshots/server.md</strong>
                <div class="small-text secondary-text">Configurações de servidor e workflows CI/CD</div>
              </div>
            </div>
            <div class="row middle padding border round margin-bottom surface-container">
              <i class="primary-text">handyman</i>
              <div class="max margin-left">
                <strong>snapshots/utils.md</strong>
                <div class="small-text secondary-text">Mecanismos de build, CLIs e testes</div>
              </div>
            </div>
            <div class="row middle padding border round surface-container">
              <i class="primary-text">menu_book</i>
              <div class="max margin-left">
                <strong>snapshots/docs.md</strong>
                <div class="small-text secondary-text">Documentação técnica e diretrizes</div>
              </div>
            </div>
          </nav>
        </article>
      </div>

      <div class="s12 m6">
        <article class="border round surface-container-low padding">
          <h6 class="no-margin">Como Executar no Terminal</h6>
          <div class="space"></div>
          <p class="small-text secondary-text">
            O utilitário aceita argumentos via CLI para rodar snapshots específicos ou todos os padrões.
          </p>
          <pre class="scroll surface-container-highest round padding"><code>{`# Exporta todos os modos marcados como default:
deno task export

# Exporta apenas o contexto da UI:
deno run --allow-read --allow-write ./export.ts ui

# Exporta apenas a documentação:
deno run --allow-read --allow-write ./export.ts docs`}</code></pre>
        </article>
      </div>
    </div>
  );
};


```

---

## Arquivo: `packages/ui/src/components/Header.tsx`

```tsx
import { themeMode, toggleTheme, } from "../stores/app.ts";
import { APP_VERSION, } from "@vanaware/buildit";

export const Header = () => {
  return (
    <header class="surface-container-low border bottom">
      <nav class="responsive">
        <button type="button" class="circle transparent">
          <i class="primary-text">build</i>
        </button>
        <div class="max">
          <div class="row middle no-space">
            <h5 class="no-margin">BuildIt</h5>
            <span class="chip small tertiary-container margin-left">v{APP_VERSION}</span>
          </div>
          <div class="small-text secondary-text">
            Build Orchestration, Bundling & Context Export Toolkit
          </div>
        </div>
        <button
          type="button"
          class="circle transparent"
          onClick={toggleTheme}
          title="Alternar tema claro/escuro"
        >
          <i>{themeMode.value === "dark" ? "light_mode" : "dark_mode"}</i>
        </button>
      </nav>
    </header>
  );
};


```

---

## Arquivo: `packages/ui/src/components/OverviewCard.tsx`

```tsx
export const OverviewCard = () => {
  return (
    <div class="grid">
      <div class="s12 m6">
        <article class="border round surface-container-low padding">
          <div class="row middle">
            <i class="primary-text extra">inventory_2</i>
            <div class="max">
              <h5 class="no-margin">@vanaware/buildit</h5>
              <div class="small-text secondary-text">
                Biblioteca central de orquestração em <code>packages/utils</code>
              </div>
            </div>
            <span class="chip small primary-container">JSR Ready</span>
          </div>

          <div class="space"></div>

          <p class="secondary-text">
            O <strong>BuildIt</strong> padroniza o ciclo de vida de projetos Deno e Web modernos,
            fornecendo automação para empacotamento, controle de versão semântico com hash e
            consolidação estruturada de código para análise por modelos de IA.
          </p>

          <div class="divider"></div>
          <div class="space"></div>

          <h6 class="no-margin">Módulos Exportados</h6>
          <nav class="list">
            <div class="row middle no-space padding">
              <i class="primary-text">check_circle</i>
              <div class="max margin-left">
                <strong>@vanaware/buildit</strong>
                <div class="small-text secondary-text">Entrada principal e interfaces compartilhadas</div>
              </div>
            </div>
            <div class="row middle no-space padding">
              <i class="primary-text">check_circle</i>
              <div class="max margin-left">
                <strong>@vanaware/buildit/build</strong>
                <div class="small-text secondary-text">Pipeline de compilação esbuild & Deno.bundle</div>
              </div>
            </div>
            <div class="row middle no-space padding">
              <i class="primary-text">check_circle</i>
              <div class="max margin-left">
                <strong>@vanaware/buildit/export</strong>
                <div class="small-text secondary-text">Consolidador de contexto em Markdown para IAs</div>
              </div>
            </div>
            <div class="row middle no-space padding">
              <i class="primary-text">check_circle</i>
              <div class="max margin-left">
                <strong>@vanaware/buildit/config</strong>
                <div class="small-text secondary-text">Constantes de extensões e regras padrão</div>
              </div>
            </div>
          </nav>
        </article>
      </div>

      <div class="s12 m6">
        <article class="border round surface-container-low padding">
          <div class="row middle">
            <i class="tertiary-text extra">account_tree</i>
            <div class="max">
              <h5 class="no-margin">Estrutura do Workspace</h5>
              <div class="small-text secondary-text">Monorepo Deno 2.x com gerenciamento nativo</div>
            </div>
            <span class="chip small tertiary-container">Deno 2</span>
          </div>

          <div class="space"></div>

          <nav class="list">
            <div class="row top padding border round margin-bottom surface-container">
              <i class="tertiary-text">folder</i>
              <div class="max margin-left">
                <div class="row middle no-space">
                  <strong>packages/utils</strong>
                  <span class="chip small margin-left">@vanaware/buildit</span>
                </div>
                <div class="small-text secondary-text">
                  Núcleo com as 3 CLIs: denobuild, esbuild e exportador de contexto com testes unitários em BDD.
                </div>
              </div>
            </div>

            <div class="row top padding border round margin-bottom surface-container">
              <i class="tertiary-text">folder</i>
              <div class="max margin-left">
                <div class="row middle no-space">
                  <strong>packages/server</strong>
                  <span class="chip small margin-left">@buildit/server</span>
                </div>
                <div class="small-text secondary-text">
                  Servidor estático de alta performance baseado em <code>Deno.serve</code> servindo em <code>0.0.0.0:3000</code>.
                </div>
              </div>
            </div>

            <div class="row top padding border round surface-container">
              <i class="tertiary-text">folder</i>
              <div class="max margin-left">
                <div class="row middle no-space">
                  <strong>packages/ui</strong>
                  <span class="chip small margin-left">@buildit/ui</span>
                </div>
                <div class="small-text secondary-text">
                  Aplicação de demonstração construída puramente com Preact, BeerCSS e Signals reativos.
                </div>
              </div>
            </div>
          </nav>
        </article>
      </div>
    </div>
  );
};


```

---

## Arquivo: `packages/ui/src/components/ToolDetails.tsx`

```tsx
import { selectedTool, type ToolKey, } from "../stores/app.ts";

export const ToolDetails = () => {
  const tools: {
    key: ToolKey;
    icon: string;
    title: string;
    subtitle: string;
    description: string;
    command: string;
    configFile: string;
    config: string;
  }[] = [
    {
      key: "esbuild",
      icon: "bolt",
      title: "esbuild Pipeline",
      subtitle: "Empacotamento de alta velocidade para navegadores e web apps",
      description:
        "Orquestrador avançado que conecta esbuild ao @deno/esbuild-plugin. Suporta múltiplos alvos, watch mode contínuo, injeção de versão semântica e resolução de dependências remotas do Deno.",
      command: "deno task build\n# ou execução direta:\ndeno run -A ./esbuild.ts [alvo] [noversion] [watch]",
      configFile: "esbuild.jsonc",
      config: `// Configuração declarativa de alvos esbuild
{
  "ui": {
    "srcdir": "packages/ui/src",
    "distdir": "packages/server/build/dist",
    "entryPoints": ["main.tsx"],
    "bundle": true,
    "format": "esm",
    "minify": true,
    "sourcemap": "linked"
  }
}`,
    },
    {
      key: "denobuild",
      icon: "memory",
      title: "denobuild (Deno.bundle nativo)",
      subtitle: "Empacotador autônomo sem dependências externas via Deno 2.x",
      description:
        "Motor de compilação que emprega a API Deno.bundle nativa (--unstable-bundle). Ideal para empacotar bibliotecas e scripts autônomos sem requerer binários nativos ou ferramentas de terceiros.",
      command: "deno task build:deno\n# ou execução direta:\ndeno run --unstable-bundle -A ./build.ts",
      configFile: "denobuild.jsonc",
      config: `// Configuração declarativa denobuild
{
  "ui": {
    "entryPoints": ["main.tsx"],
    "format": "esm",
    "packages": "bundle",
    "inlineImports": true,
    "minify": true
  }
}`,
    },
    {
      key: "export",
      icon: "auto_stories",
      title: "export (Snapshot de Contexto para IA)",
      subtitle: "Consolidação de código-fonte estruturada para LLMs e documentação",
      description:
        "Consolidador inteligente de código-fonte e documentação em arquivos Markdown estruturados. Inclui proteção contra loops, filtros por extensão, caminhos permitidos e cabeçalhos com instruções para agentes de Inteligência Artificial.",
      command: "deno task export\n# ou com seleção de alvos:\ndeno run --allow-read --allow-write ./export.ts [ui|docs|server|utils]",
      configFile: "export.jsonc",
      config: `// Configuração declarativa export.jsonc
{
  "ui": {
    "arquivoSaida": "snapshots/ui.md",
    "pastaBase": "./packages/ui/",
    "subpastasPermitidas": ["src", "public", "tests"],
    "arquivosRaizPermitidos": ["deno.json", "deno.jsonc"],
    "extensoesPermitidas": [".ts", ".tsx", ".html", ".json"],
    "incluiVersao": true,
    "default": true
  }
}`,
    },
  ];

  return (
    <div>
      <nav class="wrap margin-bottom">
        {tools.map((t,) => (
          <button
            key={t.key}
            type="button"
            class={`chip ${selectedTool.value === t.key ? "primary" : "border"}`}
            onClick={() => (selectedTool.value = t.key)}
          >
            <i>{t.icon}</i>
            <span>{t.title}</span>
          </button>
        ))}
      </nav>

      {tools
        .filter((t,) => t.key === selectedTool.value)
        .map((t,) => (
          <article key={t.key} class="border round surface-container-low padding">
            <div class="row middle">
              <i class="primary-text extra">{t.icon}</i>
              <div class="max">
                <h5 class="no-margin">{t.title}</h5>
                <div class="small-text secondary-text">{t.subtitle}</div>
              </div>
              <span class="chip small primary-container">{t.configFile}</span>
            </div>

            <div class="space"></div>

            <p class="secondary-text">{t.description}</p>

            <div class="divider"></div>
            <div class="space"></div>

            <h6 class="no-margin">Comando de Execução</h6>
            <div class="space"></div>
            <pre class="scroll surface-container-highest round padding"><code>{t.command}</code></pre>

            <div class="space"></div>

            <h6 class="no-margin">Estrutura de Configuração ({t.configFile})</h6>
            <div class="space"></div>
            <pre class="scroll surface-container-highest round padding"><code>{t.config}</code></pre>
          </article>
        ))}
    </div>
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
    <meta name="description" content="Build orchestration, bundling and AI context export utilities for Deno & Web projects.">
    <meta property="og:title" content="BuildIt">
    <meta property="og:description" content="Build orchestration, bundling and AI context export utilities for Deno & Web projects.">

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
    <aside id="iframe-warning" class="banner yellow-container none">
      <i>info</i>
      <span class="max">Executando em modo preview iframe</span>
      <a id="iframe-link" class="button border round small" target="_blank" rel="noopener">
        <span>Abrir em nova aba</span>
        <i>open_in_new</i>
      </a>
    </aside>

    <script>
    if (window.self !== window.top) {
      document.addEventListener("DOMContentLoaded", () => {
        const banner = document.getElementById("iframe-warning");
        const link = document.getElementById("iframe-link");
        if (banner && link) {
          link.href = window.location.href;
          banner.classList.remove("none");
        }
      });
    }
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
import { activeTab, } from "./stores/app.ts";
import { Header, } from "./components/Header.tsx";
import { Navigation, } from "./components/Navigation.tsx";
import { OverviewCard, } from "./components/OverviewCard.tsx";
import { ToolDetails, } from "./components/ToolDetails.tsx";
import { SimulatorCard, } from "./components/SimulatorCard.tsx";
import { SnapshotsCard, } from "./components/SnapshotsCard.tsx";

const App = () => {
  return (
    <div>
      <Header />
      <main class="responsive">
        <div class="space"></div>
        <Navigation />

        {activeTab.value === "overview" && <OverviewCard />}
        {activeTab.value === "cli" && <ToolDetails />}
        {activeTab.value === "interactive" && <SimulatorCard />}
        {activeTab.value === "snapshots" && <SnapshotsCard />}

        <div class="large-space"></div>
        <footer class="responsive center-align">
          <div class="divider"></div>
          <div class="space"></div>
          <p class="small-text secondary-text no-margin">
            BuildIt &bull; Deno &amp; Web Toolkit &bull; Construído com Preact, Signals e BeerCSS
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

export const totalLogsCount = computed(() => simLogs.value.length,);

export const addLog = (msg: string,) => {
  const timestamp = new Date().toLocaleTimeString();
  simLogs.value = [...simLogs.value, `[${timestamp}] ${msg}`,];
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
    addLog(`🧹 Limpando diretório de distribuição em packages/server/build/dist...`,);
  }

  await new Promise((r,) => setTimeout(r, 400,));

  if (tool === "esbuild") {
    addLog(
      `🔨 Compilando via esbuild com @deno/esbuild-plugin (minify: ${minifyEnabled.value}, sourcemap: ${sourcemapEnabled.value})...`,
    );
    await new Promise((r,) => setTimeout(r, 350,));
    addLog(`📄 Copiando assets estáticos e injetando versão em manifest.json...`,);
    await new Promise((r,) => setTimeout(r, 300,));
    addLog(`✅ Alvo [${target}] gerado com sucesso: dist/${target === "ui" ? "main.js" : target + ".js"}`,);
  } else if (tool === "denobuild") {
    addLog(`📦 Empacotando com Deno.bundle API nativo (--unstable-bundle)...`,);
    await new Promise((r,) => setTimeout(r, 450,));
    addLog(`✅ Bundle autônomo gerado sem dependências de bundlers externos!`,);
  } else {
    addLog(`🔍 Varrendo workspace e filtrando arquivos por extensões permitidas...`,);
    await new Promise((r,) => setTimeout(r, 350,));
    addLog(`📝 Gerando snapshot em markdown formatado para contexto de IA: snapshots/${target}.md`,);
  }

  addLog(`🎉 Pipeline finalizada com êxito! (Build #${bundleSimCount.value})`,);
  isSimulating.value = false;
};

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
  clearLogs,
  simLogs,
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

