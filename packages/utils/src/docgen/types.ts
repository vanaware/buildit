/**
 * @module @vanaware/buildit/docgen/types
 * @description Type definitions for the Documentation Engine.
 */

import type { DocNode, DocNodeKind, } from "jsr:@deno/doc@0.165.0";

/**
 * Options for the documentation generation process.
 */
export interface DocgenOptions {
  /** Path to the root deno.jsonc/json file (default: "deno.jsonc" in cwd). */
  configPath?: string;
  /** Output directory for the generated .md files (required). */
  outDir: string;
  /** Format of the content files. */
  format?: "markdown" | "mdx";
  /** Whether to include symbols marked with @internal or @ignore. */
  includePrivate?: boolean;
  /** Whether to emit @example blocks. */
  includeExamples?: boolean;
  /** Whether to generate a Mermaid diagram of internal dependencies. */
  includeArchitecture?: boolean;
  /** Whether to generate a global sidebar/TOC. */
  includeSidebar?: boolean;
  /** Log level. */
  verbosity?: "silent" | "info" | "verbose";
  /** Injected logger (default: no-op). */
  logger?: Logger;
  /** Base directory for the project (default: "."). */
  baseDir?: string;

  /** ---- Source Links (P1.1) ---- */
  sourceLinks?: {
    provider: "github" | "gitlab" | "bitbucket" | "custom";
    baseUrl: string;
    branch?: string;
    lineTemplate?: string;
  };

  /** ---- Reports (P0.2, P0.3, P2.2) ---- */
  reports?: {
    /** Generate _api-surface.md (default: true). */
    apiSurface?: boolean;
    /** Generate _coverage.md (default: true). */
    coverage?: boolean;
    /** Generate _changelog.md (default: false). */
    changelog?: boolean;
  };

  /** Path to the previous _api-surface.md for comparison (P2.2). */
  previousApiSurface?: string;

  /** Minimum coverage threshold in % (P0.3). 0 = no threshold. */
  checkThreshold?: number;

  /** Enable "Run in Deno Playground" button in examples (P1.5). */
  denoPlayground?: boolean;

  /** ---- Docsify site configurations (optional) ---- */
  docsify?: DocsifyOptions;
}

/**
 * Options for generating a Docsify static site.
 */
export interface DocsifyOptions {
  /** Enables static site generation. */
  enabled: boolean;
  /** Title displayed in the navbar and <title>. */
  title: string;
  /** Site name (used in header). */
  name?: string;
  /** Description (meta description). */
  description?: string;
  /** Main content file name (default: "README.md"). */
  homepage?: string;
  /** Sidebar file (default: "_sidebar.md"). */
  sidebar?: string;
  /** Navbar file (optional, default: "_navbar.md"). */
  navbar?: string;
  /** Coverpage file (optional, default: "_coverpage.md"). */
  coverpage?: string;
  /** Visual theme. */
  theme?: "vue" | "dark" | "buble" | "pure";
  /** Enables text search (default: true). */
  search?: boolean;
  /** Enables pagination (prev/next) (default: true). */
  pagination?: boolean;
  /** Enables "copy code" button (default: true). */
  copyCode?: boolean;
  /** Enables Mermaid support in .md files (default: false). */
  mermaid?: boolean;
  /** Enables dark mode toggle (default: true). */
  darkModeToggle?: boolean;
  /** Google Analytics ID (optional). */
  ga?: string;
  /** "Edit on GitHub" plugin (optional). */
  repo?: { url: string; branch?: string; path?: string };
  /** Subdirectory where extra assets will be saved (relative to outDir, default: "_assets"). */
  assetsDir?: string;
}

/**
 * Result of the documentation generation process.
 */
export interface DocgenResult {
  /** Generated files with metadata. */
  generated: Array<{
    path: string;
    kind:
      | "readme"
      | "api"
      | "sidebar"
      | "navbar"
      | "coverpage"
      | "architecture"
      | "docsify-html"
      | "docsify-asset"
      | "api-surface"
      | "coverage"
      | "changelog"
      | "search-index";
    bytes: number;
  }>;
  /** Filtering stats. */
  stats: {
    filesScanned: number;
    filesInternal: number;
    nodesTotal: number;
    nodesKept: number;
    nodesDroppedExternal: number;
    nodesDroppedInternal: number;
    nodesDroppedNoDoc: number;
    coverage: {
      symbolsTotal: number;
      symbolsDocumented: number;
      percentage: number;
    };
    crossLinks: {
      linksResolved: number;
      linksFailed: number;
    };
  };
  /** Non-fatal warnings. */
  warnings: string[];
}

/**
 * Injected logger interface.
 */
export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  verbose(message: string): void;
}

/**
 * Entry for the symbol index used for cross-linking.
 */
export interface SymbolIndexEntry {
  name: string;
  url: string;
  anchor: string;
  kind: DocNodeKind;
  fileName: string;
}

/**
 * Global symbol index for cross-references.
 */
export interface SymbolIndex {
  byName: Map<string, SymbolIndexEntry>;
  byFile: Map<string, SymbolIndexEntry[]>;
}
