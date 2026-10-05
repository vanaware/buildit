import type { DocNode, DocNodeKind, } from "@deno/doc";

export interface DocgenOptions {
  /** Path to root deno.jsonc. */
  configPath?: string;
  /** Output directory. */
  outDir: string;
  /** Content format. */
  format?: "markdown" | "mdx";
  /** Include @internal symbols. */
  includePrivate?: boolean;
  /** Include @example blocks. */
  includeExamples?: boolean;
  /** Generate Mermaid diagram. */
  includeArchitecture?: boolean;
  /** Generate sidebar. */
  includeSidebar?: boolean;
  /** Log level. */
  verbosity?: "silent" | "info" | "verbose";
  /** Injected logger. */
  logger?: any;
  /** Base directory. */
  baseDir?: string;
  /** Inclusion glob patterns. */
  includes?: string[];
  /** Exclusion glob patterns. */
  excludes?: string[];
  /** Static files to copy. */
  staticFiles?: string[];
  /** Source code links settings. */
  sourceLinks?: {
    provider: "github" | "gitlab" | "bitbucket" | "custom";
    baseUrl: string;
    branch?: string;
    lineTemplate?: string;
  };
  /** Reports generation settings. */
  reports?: {
    apiSurface?: boolean;
    coverage?: boolean;
    changelog?: boolean;
  };
  /** Previous API surface path. */
  previousApiSurface?: string;
  /** Coverage check threshold. */
  checkThreshold?: number;
  /** Deno Playground integration. */
  denoPlayground?: boolean;
  /** Docsify site options. */
  docsify?: DocsifyOptions;
}

/**
 * Options for generating a Docsify static site.
 */
export interface DocsifyOptions {
  /** Enables static site generation. */
  enabled: boolean;
  /** Site title. */
  title: string;
  /** Site name. */
  name?: string;
  /** Meta description. */
  description?: string;
  /** Homepage file. */
  homepage?: string;
  /** Sidebar file. */
  sidebar?: string;
  /** Navbar file. */
  navbar?: string;
  /** Coverpage file. */
  coverpage?: string;
  /** Visual theme. */
  theme?: "vue" | "dark" | "buble" | "pure";
  /** Enable search. */
  search?: boolean;
  /** Enable pagination. */
  pagination?: boolean;
  /** Enable copy code button. */
  copyCode?: boolean;
  /** Enable Mermaid. */
  mermaid?: boolean;
  /** Enable dark mode toggle. */
  darkModeToggle?: boolean;
  /** Google Analytics ID. */
  ga?: string;
  /** Repository info. */
  repo?: { url: string; branch?: string; path?: string };
  /** Assets subdirectory. */
  assetsDir?: string;
}

/**
 * Result of the documentation generation process.
 */
export interface DocgenResult {
  /** Generated files. */
  generated: Array<{
    path: string;
    kind: string;
    bytes: number;
  }>;
  /** Generation statistics. */
  stats: any;
  /** Non-fatal warnings. */
  warnings: string[];
}

/**
 * Entry for the symbol index used for cross-linking.
 */
export interface SymbolIndexEntry {
  /** Symbol name. */
  name: string;
  /** URL to the documentation file. */
  url: string;
  /** Anchor ID within the file. */
  anchor: string;
  /** Type of symbol. */
  kind: DocNodeKind;
  /** Source file name. */
  fileName: string;
}

/**
 * Global symbol index for cross-references.
 */
export interface SymbolIndex {
  /** Index by symbol name. */
  byName: Map<string, SymbolIndexEntry>;
  /** Index by file URL. */
  byFile: Map<string, SymbolIndexEntry[]>;
}
