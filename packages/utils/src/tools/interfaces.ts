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

/** Configuração de um conjunto de arquivos estáticos a serem copiados. */
export interface CopyFileConfig {
  basedir?: string;
  includes?: string[];
  excludes?: string[];
}

/** Configuração de limpeza prévia de arquivos e pastas no diretório de saída. */
export interface CleanConfig {
  includes?: string[];
  excludes?: string[];
}

/** Configuração de um alvo de build (esbuild). */
export interface TargetConfig {
  publicdir?: string;
  srcdir?: string;
  distdir?: string;
  indexHtml?: boolean;
  clean?: CleanConfig | string[];
  copyFiles?: CopyFileConfig[];
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
  clean?: CleanConfig | string[];
  copyFiles?: CopyFileConfig[];
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

/** Configuração de um modo de exportação de snapshot. */
export interface ExportConfig {
  /** Caminho do arquivo de saída Markdown gerado. */
  arquivoSaida: string;
  /** Padrões glob de arquivos a serem incluídos. */
  includes?: string[];
  /** Padrões glob de arquivos a serem excluídos. */
  excludes?: string[];
  /** Se deve incluir a versão da aplicação no cabeçalho. */
  incluiVersao?: boolean;
  /** Instrução personalizada para a IA. */
  instrucaoCustomizada?: string;
  /** Texto ou instruções customizadas para o bloco de cabeçalho da IA. */
  cabecalho?: string;
  /** Nome do projeto exibido no cabeçalho (padrão: "BuildIt"). */
  projeto?: string;
  /** Se o modo deve ser executado por padrão quando nenhum modo for especificado. */
  default?: boolean;
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
  clean?: CleanConfig | string[];
  copyFiles?: CopyFileConfig[];
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

/** Arquivo de configuração de exportação (export.jsonc). */
export interface ExportConfigFile {
  /** Schema JSON opcional. */
  $schema?: string;
  /** Versão do arquivo de configuração. */
  version?: string;
  /** Nome global do projeto (padrão: "BuildIt"). */
  projeto?: string;
  /** Bloco global de cabeçalho customizado para IA. */
  cabecalho?: string;
  /** Dicionário de modos de exportação. */
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

/** Opções para execução de sanitização de versão em arquivos deno.json[c]. */
export interface SanitizeVersionOptions {
  /** Caminho do arquivo a ser sanitizado. Se omitido, busca recursivamente pelo mais próximo. */
  filePath?: string;
  /** Diretório base de busca caso filePath não seja especificado. */
  baseDir?: string;
  /** Se true, não emite logs no console durante a execução. */
  silencioso?: boolean;
}

/** Resultado da operação de sanitização de versão. */
export interface SanitizeVersionResult {
  /** Caminho do arquivo processado. */
  filePath: string;
  /** Versão original encontrada no arquivo. */
  rawVersion: string;
  /** Versão sanitizada no formato semver canônico (MAJOR.MINOR.PATCH). */
  sanitizedVersion: string;
  /** Indica se o arquivo em disco foi modificado. */
  updated: boolean;
}

/** Opções para criação e publicação de tags git baseadas na versão. */
export interface TagVersionOptions {
  /** Caminho do arquivo deno.json[c]. Se omitido, busca automaticamente. */
  file?: string;
  /** Mensagem customizada do commit. Padrão: "Versão vMAJOR.MINOR". */
  message?: string;
  /** Se true, executa a sanitização do arquivo deno.json[c] em disco antes de comitar. */
  sanitize?: boolean;
  /** Se true, apenas simula as operações do git sem persistir commits ou tags. */
  dryRun?: boolean;
  /** Diretório base de execução. */
  baseDir?: string;
  /** Se true, não emite logs no console durante a execução. */
  silencioso?: boolean;
}

/** Resultado da operação de tag git. */
export interface TagVersionResult {
  /** Nome da tag gerada (ex: "v0.3"). */
  tagName: string;
  /** Versão original bruta. */
  rawVersion: string;
  /** Versão semver sanitizada. */
  sanitizedVersion: string;
  /** Mensagem utilizada no commit. */
  message: string;
  /** Se o repositório foi alterado e comitado. */
  committed: boolean;
  /** Se a tag foi criada e publicada. */
  tagged: boolean;
}
