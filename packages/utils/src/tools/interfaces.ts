/**
 * Extensões de arquivo padrão que são comumente incluídas em snapshots.
 */
export const EXTENSOES_PADRAO: string[] = [
  ".tsx",
  ".jsx",
  ".js",
  ".ts",
  ".css",
  ".html",
  ".manifest",
  ".map",
  ".sh",
  ".py",
  ".json",
  ".jsonc",
  ".yaml",
  ".yml",
  ".toml",
  ".env.example",
  ".md",
];

/** Versão semântica parseada. */
export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
}

/** Argumentos de linha de comando parseados. */
export interface ParsedArgs {
  targets: string[];
  globalNoVersion: boolean;
}

export type EsbuildPlatform = "browser" | "node" | "neutral";
export type EsbuildFormat = "esm" | "iife" | "cjs";
export type EsbuildSourcemap = boolean | "linked" | "inline" | "external";
export type EsbuildJsx = "automatic" | "transform" | "preserve";
export type EsbuildLegalComments =
  | "none"
  | "inline"
  | "eof"
  | "linked"
  | "external";
export type EsbuildDrop = "console" | "debugger";
export type EsbuildCharset = "ascii" | "utf8";
export type EsbuildLogLevel =
  | "verbose"
  | "debug"
  | "info"
  | "warning"
  | "error"
  | "silent";
export type EsbuildLoader =
  | "js"
  | "jsx"
  | "ts"
  | "tsx"
  | "css"
  | "json"
  | "text"
  | "base64"
  | "dataurl"
  | "file"
  | "binary"
  | "empty"
  | "copy";

/** Configuração de um alvo de build (esbuild). */
export interface TargetConfig {
  publicdir?: string;
  srcdir?: string;
  distdir?: string;
  indexHtml?: boolean;
  clean?: string[];
  default?: boolean;
  entryPoints: string[];
  platform?: EsbuildPlatform;
  format?: EsbuildFormat;
  bundle?: boolean;
  minify?: boolean;
  sourcemap?: EsbuildSourcemap;
  jsx?: EsbuildJsx;
  jsxImportSource?: string;
  conditions?: string[];
  define?: Record<string, string>;
  drop?: EsbuildDrop[];
  external?: string[];
  metafile?: boolean;
  write?: boolean;
  treeShaking?: boolean;
  legalComments?: EsbuildLegalComments;
  keepNames?: boolean;
  outfile?: string;
  splitting?: boolean;
  loader?: Record<string, EsbuildLoader>;
  alias?: Record<string, string>;
  inject?: string[];
  banner?: { js?: string; css?: string };
  footer?: { js?: string; css?: string };
  target?: string | string[];
  charset?: EsbuildCharset;
  logLevel?: EsbuildLogLevel;
  logLimit?: number;
  logOverride?: Record<string, EsbuildLogLevel>;
  entryNames?: string;
  chunkNames?: string;
  assetNames?: string;
  publicPath?: string;
  pure?: string[];
  plugins?: unknown[];
}

export interface GlobalTargetConfig {
  [targetName: string]: TargetConfig;
}

export type EsbuildTargetConfig = TargetConfig;
export type EsbuildGlobalConfig = GlobalTargetConfig;

export interface EsbuildOptions {
  config: GlobalTargetConfig;
  targets?: string[];
  noversion?: boolean;
  versionPaths?: string[];
  forcepackagesversion?: boolean;
  baseDir?: string;
  denoJsoncPath?: string;
  silencioso?: boolean;
}

export interface WatchTargetConfig {
  publicdir?: string;
  srcdir?: string;
  distdir?: string;
  indexHtml?: boolean;
  clean?: string[];
  default?: boolean;
  entryPoints: string[];
  platform?: EsbuildPlatform;
  format?: EsbuildFormat;
  bundle?: boolean;
  minify?: boolean;
  sourcemap?: EsbuildSourcemap;
  jsx?: EsbuildJsx;
  jsxImportSource?: string;
  conditions?: string[];
  define?: Record<string, string>;
  drop?: EsbuildDrop[];
  external?: string[];
  write?: boolean;
  legalComments?: EsbuildLegalComments;
  keepNames?: boolean;
  outfile?: string;
  loader?: Record<string, EsbuildLoader>;
  alias?: Record<string, string>;
  inject?: string[];
  banner?: { js?: string; css?: string };
  footer?: { js?: string; css?: string };
  target?: string | string[];
  charset?: EsbuildCharset;
  logLevel?: EsbuildLogLevel;
  plugins?: unknown[];
}

export interface WatchGlobalConfig {
  [targetName: string]: WatchTargetConfig;
}

export interface WatchConfigFile {
  $schema?: string;
  version?: string;
  targets?: WatchGlobalConfig;
  alvos?: WatchGlobalConfig;
  [key: string]: unknown;
}

export interface WatchConfigResult {
  targets: WatchGlobalConfig;
}

export interface WatchOptions {
  config: WatchGlobalConfig;
  target?: string;
  baseDir?: string;
  lockFile?: string;
  denoJsoncPath?: string;
  silencioso?: boolean;
}

export interface WatchHandle {
  target: string;
  close: () => Promise<void>;
}

export interface ExportConfig {
  arquivoSaida: string;
  includes?: string[];
  excludes?: string[];
  incluiVersao?: boolean;
  instrucaoCustomizada?: string;
  default?: boolean;
  extensoesPermitidas?: string[];
  pastaBase?: string;
  subpastasPermitidas?: string[];
  caminhosAdicionaisPermitidos?: string[];
  arquivosRaizPermitidos?: string[];
}

export type DenoBundlePlatform = "browser" | "deno";
export type DenoBundleFormat = "esm" | "cjs" | "iife";
export type DenoBundleSourceMap = "linked" | "inline" | "external";
export type DenoBundlePackageHandling = "bundle" | "external";

export interface DenoBundleTargetConfig {
  srcdir?: string;
  distdir?: string;
  publicdir?: string;
  indexHtml?: boolean;
  clean?: string[];
  default?: boolean;
  mode?: "build" | "watch";
  entryPoints: string[];
  format?: DenoBundleFormat;
  platform?: DenoBundlePlatform;
  minify?: boolean;
  keepNames?: boolean;
  sourcemap?: DenoBundleSourceMap;
  codeSplitting?: boolean;
  inlineImports?: boolean;
  packages?: DenoBundlePackageHandling;
  external?: string[];
  define?: Record<string, string>;
  outfile?: string;
}

export interface DenoBuildConfigFile {
  $schema?: string;
  version?: string;
  targets?: DenoBundleGlobalConfig;
  alvos?: DenoBundleGlobalConfig;
  versionPaths?: string[];
  forcepackagesversion?: boolean;
  [key: string]: unknown;
}

export interface DenoBuildResult {
  target: string;
  success: boolean;
  durationMs: number;
  outputFiles: string[];
}

export interface DenoBuildConfigResult {
  targets: DenoBundleGlobalConfig;
  versionPaths?: string[];
  forcepackagesversion?: boolean;
}

export interface DenoBundleGlobalConfig {
  [targetName: string]: DenoBundleTargetConfig;
}

export interface DenoBuildOptions {
  config: DenoBundleGlobalConfig;
  targets?: string[];
  noversion?: boolean;
  versionPaths?: string[];
  forcepackagesversion?: boolean;
  baseDir?: string;
  denoJsoncPath?: string;
  silencioso?: boolean;
}

export interface ExportConfigFile {
  $schema?: string;
  version?: string;
  modos: Record<string, ExportConfig>;
}

export interface ExportResult {
  modo: string;
  arquivos: number;
  arquivoSaida: string;
  bytes: number;
}

export interface ExportOptions {
  config: Record<string, ExportConfig>;
  modos?: string[];
  baseDir?: string;
  versaoApp?: string;
  denoJsoncPath?: string;
  silencioso?: boolean;
}

export interface CommonCliFlags {
  configPath?: string;
  showVersion: boolean;
  showHelp: boolean;
  noversion: boolean;
  forcepackagesversion: boolean;
  versionPaths?: string[];
  positional: string[];
}

export interface VersionUpdateOptions {
  currentVersion?: string;
  denoJsonPath?: string;
  baseDir?: string;
  noversion?: boolean;
  versionPaths?: string[];
  forcepackagesversion?: boolean;
  buildHash?: string;
}

export interface EsbuildConfigFile {
  $schema?: string;
  version?: string;
  targets?: GlobalTargetConfig;
  alvos?: GlobalTargetConfig;
  versionPaths?: string[];
  forcepackagesversion?: boolean;
  [key: string]: unknown;
}

export interface EsbuildConfigResult {
  targets: GlobalTargetConfig;
  versionPaths?: string[];
  forcepackagesversion?: boolean;
}

export interface EsbuildResult {
  target: string;
  success: boolean;
  durationMs: number;
}
