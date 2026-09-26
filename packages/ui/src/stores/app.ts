import { computed, signal, } from "@preact/signals";

export type TabKey = "overview" | "tools" | "cli" | "configs" | "api";
export type ToolKey = "esbuild" | "denobuild" | "watch" | "export" | "versioning";

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
    summary: "Compilação de alta performance para produção com resolução Deno, JSR e NPM.",
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
    cliCommand: "deno run --unstable-bundle -A jsr:@vanaware/buildit/cli/denobuild ui",
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
    summary: "Recompilação incremental ultrarrápida com esbuild.context e lockfile anti-concorrência.",
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
    summary: "Varredura de repositório e consolidação de código em Markdown para prompts e LLMs.",
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
    summary: "Sincronização de versões em workspaces e criação automatizada de releases Git.",
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
    description: "Executa todos os alvos configurados com default: true no esbuild.jsonc.",
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
    description: "Inicia o monitoramento de alterações com recompilação incremental contínua.",
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
    command: "deno run --unstable-bundle -A jsr:@vanaware/buildit/cli/denobuild ui",
    description: "Gera o bundle usando o comando Deno.bundle nativo.",
    tag: "denobuild",
  },
  {
    id: "cmd-export-all",
    tool: "export",
    title: "Exportar Contextos de IA",
    command: "deno run -A jsr:@vanaware/buildit/cli/export",
    description: "Gera snapshots de código em formato Markdown conforme export.jsonc.",
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
    description: "Normaliza o campo 'version' do deno.jsonc para SemVer padrão.",
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
  esbuild: `import { esBuild } from "jsr:@vanaware/buildit/esbuild";

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
    },
  },
  noversion: true,
});`,

  watch: `import { watchEngine } from "jsr:@vanaware/buildit/watch";

const handles = await watchEngine({
  targets: ["ui"],
  configPath: "watch.jsonc",
});

console.log("Servidor watch em execução. Pressione Ctrl+C para encerrar.");`,

  export: `import { exportEngine } from "jsr:@vanaware/buildit/export";

await exportEngine({
  modos: ["ui", "docs"],
  configPath: "export.jsonc",
});`,
};

export const filteredCliCommands = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return CLI_COMMANDS;
  return CLI_COMMANDS.filter((cmd) =>
    cmd.title.toLowerCase().includes(query) ||
    cmd.command.toLowerCase().includes(query) ||
    cmd.description.toLowerCase().includes(query) ||
    cmd.tag.toLowerCase().includes(query)
  );
});
