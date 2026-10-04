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
    console.warn("Failed to copy to clipboard:", err,);
  }
};

export const TOOLS: ToolInfo[] = [
  {
    id: "esbuild",
    name: "esbuild Pipeline",
    badge: "Production",
    icon: "bolt",
    colorClass: "primary-text",
    summary:
      "High-performance production compilation with Deno, JSR, and NPM resolution.",
    description:
      "Bundles Preact/JSX, TypeScript, and JavaScript applications using native esbuild and @deno/esbuild-plugin. Features semantic version injection, flexible asset copying (copyFiles), and robust cleanup with glob patterns.",
    cliCommand: "deno run -A jsr:@vanaware/buildit/cli/esbuild",
    configFile: "esbuild.jsonc",
    features: [
      "Deno plugin for transparent resolution of remote imports (https, jsr, npm)",
      "Automatic JSX transform with jsxImportSource: preact",
      "Automatic injection of __APP_VERSION__ constant in code and manifest.json",
      "Robust directory cleanup with clean (includes and excludes)",
      "Flexible copying with copyFiles preserving basedir directory trees",
    ],
  },
  {
    id: "denobuild",
    name: "Native Deno.bundle",
    badge: "Native Bundler",
    icon: "package_2",
    colorClass: "secondary-text",
    summary: "Self-contained bundle generation using native Deno.bundle API.",
    description:
      "Uses Deno's native compiler runtime (--unstable-bundle) to generate clean outputs without external esbuild binaries. Ideal for constrained environments or pure library packaging.",
    cliCommand:
      "deno run --unstable-bundle -A jsr:@vanaware/buildit/cli/denobuild ui",
    configFile: "denobuild.jsonc",
    features: [
      "100% native integration with Deno 2.x subsystem",
      "Self-contained ESM or IIFE code output",
      "Compatible with the same target schemas and copyFiles",
      "Respects Deno minification and sourcemap options",
    ],
  },
  {
    id: "watch",
    name: "Watch Dev Engine",
    badge: "Development",
    icon: "visibility",
    colorClass: "tertiary-text",
    summary:
      "Sub-millisecond incremental recompilation with esbuild.context and concurrency lock.",
    description:
      "Watches files in srcdir and triggers near-instant rebuilds. Uses a process lockfile (.buildit-watch.lock) with active PID detection to prevent race conditions between servers and concurrent watch processes.",
    cliCommand: "deno run -A jsr:@vanaware/buildit/cli/watch",
    configFile: "watch.jsonc",
    features: [
      "Context-oriented incremental recompilation (esbuild.context)",
      "Lockfile anti-concurrency mechanism based on active PID",
      "Optional banner injection for dev debugging",
      "Immediate static file synchronization on each change",
    ],
  },
  {
    id: "export",
    name: "AI Context Exporter",
    badge: "LLM & Snapshots",
    icon: "smart_toy",
    colorClass: "primary-text",
    summary:
      "Repository scanning and code consolidation into Markdown for AI prompts and LLMs.",
    description:
      "Scans Deno workspaces, filters files by globs and allowed extensions, and formats content into a readable, contextual snapshot optimized for AI agents and code reviews.",
    cliCommand: "deno run -A jsr:@vanaware/buildit/cli/export",
    configFile: "export.jsonc",
    features: [
      "Declarative file filtering via includes and excludes (globs)",
      "Custom contextual instructions per mode (e.g., UI, Docs, Server)",
      "Automatic protection against recursive inclusion of snapshot folders",
      "Structured headers with file tree, version, and metadata",
    ],
  },
  {
    id: "versioning",
    name: "SemVer & Git Tagging",
    badge: "Release & Tags",
    icon: "sell",
    colorClass: "secondary-text",
    summary:
      "Workspace version synchronization and automated Git release creation.",
    description:
      "Standardizes semantic versions in deno.jsonc (including hash and pre-release support), synchronizes multiple workspace packages, and deterministically generates Git release tags (vX.Y).",
    cliCommand: "deno run -A jsr:@vanaware/buildit/cli/sanitize-version",
    configFile: "deno.jsonc",
    features: [
      "Version sanitization to strict semver format (MAJOR.MINOR.PATCH)",
      "Cascading synchronization across all workspace members",
      "tag-version submodule for GitHub tags and releases automation",
      "Short commit hash generation for intermediate builds",
    ],
  },
];

export const CLI_COMMANDS: CliCommandItem[] = [
  {
    id: "cmd-esbuild-all",
    tool: "esbuild",
    title: "General Build (All Targets)",
    command: "deno run -A jsr:@vanaware/buildit/cli/esbuild",
    description:
      "Executes all targets configured with default: true in esbuild.jsonc.",
    tag: "esbuild",
  },
  {
    id: "cmd-esbuild-target",
    tool: "esbuild",
    title: "Specific Target Build",
    command: "deno run -A jsr:@vanaware/buildit/cli/esbuild ui --noversion",
    description:
      "Compiles only the 'ui' target without incrementing the version.",
    tag: "esbuild",
  },
  {
    id: "cmd-watch",
    tool: "watch",
    title: "Start Watch Mode",
    command: "deno run -A jsr:@vanaware/buildit/cli/watch",
    description:
      "Starts continuous file monitoring with incremental recompilation.",
    tag: "watch",
  },
  {
    id: "cmd-watch-target",
    tool: "watch",
    title: "Watch Specific Target",
    command: "deno run -A jsr:@vanaware/buildit/cli/watch ui",
    description: "Monitors exclusively the 'ui' target.",
    tag: "watch",
  },
  {
    id: "cmd-denobuild",
    tool: "denobuild",
    title: "Bundle with Native Deno",
    command:
      "deno run --unstable-bundle -A jsr:@vanaware/buildit/cli/denobuild ui",
    description: "Generates bundle using native Deno.bundle runtime.",
    tag: "denobuild",
  },
  {
    id: "cmd-export-all",
    tool: "export",
    title: "Export AI Contexts",
    command: "deno run -A jsr:@vanaware/buildit/cli/export",
    description:
      "Generates code snapshots in Markdown format as configured in export.jsonc.",
    tag: "export",
  },
  {
    id: "cmd-export-mode",
    tool: "export",
    title: "Export Specific Mode",
    command: "deno run -A jsr:@vanaware/buildit/cli/export ui docs",
    description: "Generates snapshot files only for the specified modes.",
    tag: "export",
  },
  {
    id: "cmd-sanitize",
    tool: "versioning",
    title: "Sanitize SemVer Version",
    command: "deno run -A jsr:@vanaware/buildit/cli/sanitize-version",
    description:
      "Normalizes the 'version' field in deno.jsonc to standard SemVer.",
    tag: "version",
  },
  {
    id: "cmd-tag",
    tool: "versioning",
    title: "Create Semantic Git Tag",
    command: "deno run -A jsr:@vanaware/buildit/cli/tag-version",
    description: "Creates and pushes git tag vX.Y based on project version.",
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
  "project": "MyProject",
  "modes": {
    "ui": {
      "outputFile": "snapshots/ui.md",
      "includes": [
        "packages/ui/src/**/*.{tsx,ts,html,css}",
        "packages/ui/deno.jsonc"
      ],
      "excludes": [
        "**/node_modules/**",
        "**/.git/**"
      ],
      "includeVersion": true,
      "customInstruction": "Frontend Preact application files.",
      "default": true
    },
    "docs": {
      "outputFile": "snapshots/docs.md",
      "includes": ["docs/**/*.md", "README.md"],
      "default": false
    }
  }
}`,

  "denobuild.jsonc": `{
  "$schema": "jsr:@vanaware/buildit/schema/denobuild.json",
  "targets": {
    "app": {
      "default": true,
      "srcdir": "src",
      "distdir": "dist",
      "entryPoints": ["main.ts"],
      "format": "esm",
      "minify": false,
      "sourcemap": "linked"
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

console.log("Watch server running. Press Ctrl+C to stop.");`,

  export: `import { exportEngine } from "jsr:@vanaware/buildit";

await exportEngine({
  config: {
    ui: {
      outputFile: "snapshots/ui.md",
      includes: ["packages/ui/src/**/*"],
    },
  },
  modes: ["ui"],
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
