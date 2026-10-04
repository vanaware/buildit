/**
 * Example file extensions that can be included in snapshots.
 */
export const EXTENSIONS_EXAMPLE: string[] = [
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

/** Parsed semantic version. */
export interface ParsedVersion {
  /** Major version component. */
  major: number;
  /** Minor version component. */
  minor: number;
  /** Patch version component. */
  patch: number;
}

/** Parsed command line arguments. */
export interface ParsedArgs {
  /** Target identifiers specified on the command line. */
  targets: string[];
  /** Whether the --noversion or noversion positional flag was set. */
  globalNoVersion: boolean;
}

/** Target platform for esbuild compilation. */
export type EsbuildPlatform = "browser" | "node" | "neutral";
/** Output format for esbuild bundle. */
export type EsbuildFormat = "esm" | "iife" | "cjs";
/** Sourcemap generation strategy for esbuild. */
export type EsbuildSourcemap = boolean | "linked" | "inline" | "external";
/** JSX transformation mode for esbuild. */
export type EsbuildJsx = "automatic" | "transform" | "preserve";
/** Legal comments handling strategy for esbuild. */
export type EsbuildLegalComments =
  | "none"
  | "inline"
  | "eof"
  | "linked"
  | "external";
/** Drop directives for eliminating debug statements in esbuild. */
export type EsbuildDrop = "console" | "debugger";
/** Output character set encoding for esbuild. */
export type EsbuildCharset = "ascii" | "utf8";
/** Log level severity for esbuild console output. */
export type EsbuildLogLevel =
  | "verbose"
  | "debug"
  | "info"
  | "warning"
  | "error"
  | "silent";
/** File loader types supported by esbuild. */
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

/** Configuration for a set of static files to be copied. */
export interface CopyFileConfig {
  /**
   * Optional base directory. If provided, paths in includes and excludes
   * are relative to this directory and the folder structure is preserved in the destination.
   * If not provided, files are copied directly to the root distdir.
   */
  basedir?: string;
  /** Glob patterns for inclusion (e.g., ["**\/*.html", "assets\/**\/*"]). */
  includes?: string[];
  /** Glob patterns for exclusion. */
  excludes?: string[];
}

/** Configuration for pre-build cleanup of files and folders in the output directory. */
export interface CleanConfig {
  /** Glob patterns of files/folders to remove. Use ["*"] to clean everything. */
  includes?: string[];
  /** Glob patterns to preserve during cleanup. */
  excludes?: string[];
}

/** Configuration for a build target (esbuild). */
export interface TargetConfig {
  /** Base directory for sources (default: "."). */
  srcdir?: string;
  /** Final output directory (default: "."). */
  distdir?: string;
  /**
   * Pre-build cleanup rules.
   * Can be a { includes, excludes } object or a simple array of globs.
   */
  clean?: CleanConfig | string[];
  /** List of rule sets for copying static files. */
  copyFiles?: CopyFileConfig[];
  /** Whether it should be executed automatically when no target is passed via CLI. */
  default?: boolean;
  /** Entry point files relative to srcdir. */
  entryPoints: string[];
  /** Target platform (browser, node or neutral). */
  platform?: EsbuildPlatform;
  /** Output format (esm, iife or cjs). */
  format?: EsbuildFormat;
  /** Whether to bundle dependencies into a single file. */
  bundle?: boolean;
  /** Whether to minify the code. */
  minify?: boolean;
  /** Sourcemap strategy. */
  sourcemap?: EsbuildSourcemap;
  /** JSX transformation (automatic, transform or preserve). */
  jsx?: EsbuildJsx;
  /** Runtime package for automatic JSX (e.g., "preact"). */
  jsxImportSource?: string;
  /** Export resolution conditions. */
  conditions?: string[];
  /** Global constants injection (e.g., { "DEBUG": "true" }). */
  define?: Record<string, string>;
  /** Identifier of the constant for injecting the list of generated assets (e.g., "__GENERATED_ASSETS__"). If omitted or empty, does not inject. */
  defineAssetsString?: string;
  /** Directives for removing calls to console or debugger. */
  drop?: EsbuildDrop[];
  /** Modules or packages to be treated as external during bundling. */
  external?: string[];
  /** Whether to generate a JSON metadata file with bundle analysis. */
  metafile?: boolean;
  /** Whether esbuild writes the bundle output directly to the filesystem. */
  write?: boolean;
  /** Whether dead code elimination is enabled. Accepts 'ignore' to explicitly disable. */
  treeShaking?: boolean | "ignore";
  /** Custom JSX factory (e.g., "h", "React.createElement"). */
  jsxFactory?: string;
  /** Custom JSX fragment (e.g., "Fragment", "React.Fragment"). */
  jsxFragment?: string;
  /** Generates an analytical bundle report in the console after build. */
  analyze?: boolean | "verbose";
  /** Regular expression for properties to be preserved during mangling (e.g., "/^_.+/"). */
  reserveProps?: string;
  /** Informs esbuild if the code should be treated as having side effects for tree-shaking purposes. */
  sideEffects?: boolean;
  /** Preservation and positioning of license and copyright comments. */
  legalComments?: EsbuildLegalComments;
  /** Preserves original function and class names even when minified. */
  keepNames?: boolean;
  /** Path of the consolidated output file (relative to distdir when provided). */
  outfile?: string;
  /** Enables code splitting for dynamic loading in ESM. */
  splitting?: boolean;
  /** Mapping of loaders by file extension. */
  loader?: Record<string, EsbuildLoader>;
  /** Module aliases or import paths. */
  alias?: Record<string, string>;
  /** Files to inject at the top of the bundle before entry points. */
  inject?: string[];
  /** Comments or code snippets added at the beginning of the generated file. Supports __APP_VERSION__. */
  banner?: { js?: string; css?: string };
  /** Comments or code snippets added at the end of the generated file. Supports __APP_VERSION__. */
  footer?: { js?: string; css?: string };
  /** Target JavaScript/ECMAScript environment (e.g., 'es2022', 'chrome100', 'esnext'). */
  target?: string | string[];
  /** Character set of the generated files. */
  charset?: EsbuildCharset;
  /** Detail level of logs generated by esbuild. */
  logLevel?: EsbuildLogLevel;
  /** Maximum limit of log messages. */
  logLimit?: number;
  /** Log level override by message identifier. */
  logOverride?: Record<string, EsbuildLogLevel>;
  /** Name pattern for input files. */
  entryNames?: string;
  /** Name pattern for generated chunks. */
  chunkNames?: string;
  /** Name pattern for generated assets. */
  assetNames?: string;
  /** Base public path for loading chunks and assets. */
  publicPath?: string;
  /** Identifiers treated as pure for removal if not used (e.g., ['console.log']). */
  pure?: string[];
  /** Global variable name for exposing the bundle in IIFE format. */
  globalName?: string;
  /** Path to a custom TypeScript configuration file (tsconfig.json). */
  tsconfig?: string;
  /** Raw TypeScript configuration content (JSON string or object). */
  tsconfigRaw?: string | Record<string, unknown>;
  /** Mapping of output extensions (e.g., { ".js": ".mjs" }). */
  outExtension?: Record<string, string>;
  /** Defines explicit support for language features (e.g., { "dynamic-import": false }). */
  supported?: Record<string, boolean>;
  /** Whether to include original source file content within sourcemaps. */
  sourcesContent?: boolean;
  /** Whether to ignore purity annotations like "@__PURE__" during minification. */
  ignoreAnnotations?: boolean;
  /** Granular minification: removes extra whitespace. */
  minifyWhitespace?: boolean;
  /** Granular minification: renames identifiers to short names. */
  minifyIdentifiers?: boolean;
  /** Granular minification: rewrites syntax into more compact forms. */
  minifySyntax?: boolean;
  /** Regular expression for mangling of object properties (e.g., "/^_.+/"). */
  mangleProps?: string;
  /** Whether to apply mangling to object properties that are quoted. */
  mangleQuoted?: boolean;
  /** Cache for persistence of mangling names between builds. */
  mangleCache?: Record<string, string | false>;
  /** List of custom esbuild plugins. */
  plugins?: unknown[];
}

/** Dictionary mapping target names to their build configuration. */
export interface GlobalTargetConfig {
  /** Build configuration indexed by target name. */
  [targetName: string]: TargetConfig;
}

/** Alias for TargetConfig for esbuild builds. */
export type EsbuildTargetConfig = TargetConfig;
/** Alias for GlobalTargetConfig for esbuild builds. */
export type EsbuildGlobalConfig = GlobalTargetConfig;

/** Programmatic options for executing esbuild builds. */
export interface EsbuildOptions {
  /** Target configurations dictionary. */
  config: GlobalTargetConfig;
  /** Subset of targets to build. If omitted, builds default targets. */
  targets?: string[];
  /** If true, skips reading or updating project versions. */
  noversion?: boolean;
  /** Paths to version files to ensure before build. */
  versionPaths?: string[];
  /** Whether to enforce package versions in workspace packages. */
  forcepackagesversion?: boolean;
  /** Global define variable name for application version (e.g., "__APP_VERSION__"). */
  defineVersionString?: string;
  /** Project base directory. */
  baseDir?: string;
  /** Path to root deno.jsonc file. */
  denoJsoncPath?: string;
  /** If true, suppresses console output. */
  silent?: boolean;
}

/** Target configuration extended with watch-specific settings. */
export interface WatchTargetConfig extends TargetConfig {
  /** If enabled, watch also monitors the configuration file for automatic reloading (not implemented). */
  watchConfig?: boolean;
}

/** Dictionary mapping target names to their watch target configuration. */
export interface WatchGlobalConfig {
  /** Watch target configuration indexed by target name. */
  [targetName: string]: WatchTargetConfig;
}

/** Raw watch configuration file (watch.jsonc). */
export interface WatchConfigFile {
  /** Optional JSON schema URI. */
  $schema?: string;
  /** Dictionary of watch targets. */
  targets?: WatchGlobalConfig;
  /** Custom global define string for version injection. */
  defineVersionString?: string;
  /** Version file paths to ensure. */
  versionPaths?: string[];
  /** Enforce workspace packages version sync. */
  forcepackagesversion?: boolean;
  /** Additional custom options. */
  [key: string]: unknown;
}

/** Result of loading watch configuration file. */
export interface WatchConfigResult {
  /** Dictionary of loaded watch targets. */
  targets: WatchGlobalConfig;
  /** Custom global define string for version injection. */
  defineVersionString?: string;
  /** Version file paths to ensure. */
  versionPaths?: string[];
  /** Enforce workspace packages version sync. */
  forcepackagesversion?: boolean;
}

/** Programmatic options for running continuous watch. */
export interface WatchOptions {
  /** Watch target configurations dictionary. */
  config: WatchGlobalConfig;
  /** Specific target to watch. */
  target?: string;
  /** Version file paths to ensure. */
  versionPaths?: string[];
  /** Custom global define string for version injection. */
  defineVersionString?: string;
  /** Project base directory. */
  baseDir?: string;
  /** Custom path to the concurrency lock file. */
  lockFile?: string;
  /** Path to root deno.jsonc file. */
  denoJsoncPath?: string;
  /** If true, suppresses console output. */
  silent?: boolean;
}

/** Handle to an active watch process for clean termination. */
export interface WatchHandle {
  /** Name of the watched target. */
  target: string;
  /** Closes and cleans up the active watch watcher and concurrency lock. */
  close: () => Promise<void>;
}

/** Configuration for a snapshot export mode. */
export interface ExportConfig {
  /** Path of the generated Markdown output file. */
  outputFile: string;
  /** Glob patterns of files to be included. */
  includes?: string[];
  /** Glob patterns of files to be excluded. */
  excludes?: string[];
  /** Whether to include the application version in the header. */
  includeVersion?: boolean;
  /** Custom instruction for the AI. */
  customInstruction?: string;
  /** Custom text or instructions for the AI header block. */
  header?: string;
  /** Project name displayed in the header (default: "BuildIt"). */
  project?: string;
  /** Whether the mode should be executed by default when no mode is specified. */
  default?: boolean;
}

/** Target execution platform for Deno native bundle. */
export type DenoBundlePlatform = "browser" | "deno";
/** Output format for Deno native bundle. */
export type DenoBundleFormat = "esm" | "cjs" | "iife";
/** Sourcemap generation strategy for Deno native bundle. */
export type DenoBundleSourceMap = "linked" | "inline" | "external";
/** External package handling mode for Deno native bundle. */
export type DenoBundlePackageHandling = "bundle" | "external";

/** Configuration options for a Deno native bundle target. */
export interface DenoBundleTargetConfig {
  /** Base directory for sources (default: "."). */
  srcdir?: string;
  /** Final output directory (default: "."). */
  distdir?: string;
  /** Pre-build cleanup rules. */
  clean?: CleanConfig | string[];
  /** List of rule sets for copying static files. */
  copyFiles?: CopyFileConfig[];
  /** Whether it should be executed automatically when no target is passed via CLI. */
  default?: boolean;
  /** TypeScript, JavaScript, or HTML entry points to be bundled. */
  entryPoints: string[];
  /** Bundle output format (default: "esm"). */
  format?: DenoBundleFormat;
  /** Target execution platform (default: "browser"). */
  platform?: DenoBundlePlatform;
  /** Whether to minify the generated code. */
  minify?: boolean;
  /** Whether to preserve original function and class names. */
  keepNames?: boolean;
  /** Sourcemap generation strategy. */
  sourcemap?: DenoBundleSourceMap;
  /** Enables code splitting into multiple files. */
  codeSplitting?: boolean;
  /** Whether to inline dynamic imports directly into the bundle. */
  inlineImports?: boolean;
  /** How to handle external packages (default: "bundle"). */
  packages?: DenoBundlePackageHandling;
  /** List of modules to be treated as external. */
  external?: string[];
  /** Mapping of constants replaced in memory after build. */
  define?: Record<string, string>;
  /** Identifier of the constant for injecting the list of generated assets (e.g., "__GENERATED_ASSETS__"). */
  defineAssetsString?: string;
  /** Path of the consolidated output file (relative to distdir). */
  outfile?: string;
  /** If true, Deno.bundle will write directly to disk (default: false in BuildIt to allow post-processing). */
  write?: boolean;
  /** Global variable name for exposing the bundle in IIFE format (implemented via post-processing). */
  globalName?: string;
  /** Code snippets injected at the beginning of the generated file (implemented via post-processing). Supports __APP_VERSION__. */
  banner?: { js?: string; css?: string };
  /** Code snippets injected at the end of the generated file (implemented via post-processing). Supports __APP_VERSION__. */
  footer?: { js?: string; css?: string };
  /** JSX transformation mode (automatic, transform or preserve). Read from deno.json by Deno.bundle. */
  jsx?: string;
  /** Custom JSX factory (e.g., "h"). Read from deno.json by Deno.bundle. */
  jsxFactory?: string;
  /** Custom JSX fragment (e.g., "Fragment"). Read from deno.json by Deno.bundle. */
  jsxFragment?: string;
  /** Package for automatic JSX runtime. Read from deno.json by Deno.bundle. */
  jsxImportSource?: string;
}

/** Raw configuration file for Deno native bundler (denobuild.jsonc). */
export interface DenoBuildConfigFile {
  /** Optional JSON schema URI. */
  $schema?: string;
  /** Dictionary of build targets. */
  targets?: DenoBundleGlobalConfig;
  /** Custom global define string for version injection. */
  defineVersionString?: string;
  /** Version file paths to ensure. */
  versionPaths?: string[];
  /** Enforce workspace packages version sync. */
  forcepackagesversion?: boolean;
  /** Additional custom options. */
  [key: string]: unknown;
}

/** Result of a target build execution in Deno native bundler. */
export interface DenoBuildResult {
  /** Name of the built target. */
  target: string;
  /** Whether the build succeeded. */
  success: boolean;
  /** Execution duration in milliseconds. */
  durationMs: number;
  /** List of generated output file paths. */
  outputFiles: string[];
}

/** Result of loading Deno native bundler configuration file. */
export interface DenoBuildConfigResult {
  /** Dictionary of loaded build targets. */
  targets: DenoBundleGlobalConfig;
  /** Custom global define string for version injection. */
  defineVersionString?: string;
  /** Version file paths to ensure. */
  versionPaths?: string[];
  /** Enforce workspace packages version sync. */
  forcepackagesversion?: boolean;
}

/** Dictionary mapping target names to Deno native bundle configurations. */
export interface DenoBundleGlobalConfig {
  /** Target configuration indexed by target name. */
  [targetName: string]: DenoBundleTargetConfig;
}

/** Programmatic options for running Deno native bundler. */
export interface DenoBuildOptions {
  /** Target configurations dictionary. */
  config: DenoBundleGlobalConfig;
  /** Subset of targets to build. If omitted, builds default targets. */
  targets?: string[];
  /** If true, skips reading or updating project versions. */
  noversion?: boolean;
  /** Version file paths to ensure. */
  versionPaths?: string[];
  /** Whether to enforce package versions in workspace packages. */
  forcepackagesversion?: boolean;
  /** Global define variable name for application version. */
  defineVersionString?: string;
  /** Project base directory. */
  baseDir?: string;
  /** Path to root deno.jsonc file. */
  denoJsoncPath?: string;
  /** If true, suppresses console output. */
  silent?: boolean;
}

/** Export configuration file (export.jsonc). */
export interface ExportConfigFile {
  /** Optional JSON schema. */
  $schema?: string;
  /** Global project name (default: "BuildIt"). */
  project?: string;
  /** Global custom header block for AI. */
  header?: string;
  /** Custom identifier for global version (default: "__APP_VERSION__"). */
  defineVersionString?: string;
  /** Dictionary of export modes. */
  modes: Record<string, ExportConfig>;
}

/** Result of loading export configuration file. */
export interface ExportConfigResult {
  /** Dictionary of configured export modes. */
  modes: Record<string, ExportConfig>;
  /** Global project name. */
  project?: string;
  /** Global custom header block for AI. */
  header?: string;
  /** Custom identifier for global version define. */
  defineVersionString?: string;
}

/** Result of a single mode execution in AI context exporter. */
export interface ExportResult {
  /** Name of the exported mode. */
  mode: string;
  /** Number of files included in the export. */
  files: number;
  /** Path of the generated Markdown file. */
  outputFile: string;
  /** Size of generated output in bytes. */
  bytes: number;
}

/** Programmatic options for running the AI context exporter. */
export interface ExportOptions {
  /** Dictionary of export mode configurations. */
  config: Record<string, ExportConfig>;
  /** Specific export modes to run. If omitted, runs default modes. */
  modes?: string[];
  /** Base directory for scanning files. */
  baseDir?: string;
  /** Application version to inject into the header. */
  appVersion?: string;
  /** Path to root deno.jsonc file. */
  denoJsoncPath?: string;
  /** Custom identifier for version define. */
  defineVersionString?: string;
  /** If true, suppresses console output. */
  silent?: boolean;
}

/** Common CLI flags parsed across build tools. */
export interface CommonCliFlags {
  /** Path to custom config file. */
  configPath?: string;
  /** Whether version flag was passed. */
  showVersion: boolean;
  /** Whether help flag was passed. */
  showHelp: boolean;
  /** Whether noversion flag was passed. */
  noversion: boolean;
  /** Whether to enforce workspace package versions. */
  forcepackagesversion: boolean;
  /** Custom version file paths. */
  versionPaths?: string[];
  /** Positional arguments passed to CLI. */
  positional: string[];
}

/** Options for workspace synchronization. */
export interface SyncWorkspacesOptions {
  /** Base directory for resolution (default: "."). */
  baseDir?: string;
  /** Path of the root configuration file (deno.jsonc or deno.json). */
  denoJsonPath?: string;
  /** Current version to be propagated. If omitted, reads from the root deno.jsonc. */
  currentVersion?: string;
  /** Alias for currentVersion. */
  version?: string;
}

/** Options for project version increment. */
export interface IncrementVersionOptions {
  /** Base directory for resolution (default: "."). */
  baseDir?: string;
  /** Path of the root configuration file (deno.jsonc or deno.json). */
  denoJsonPath?: string;
  /** Base current version. If omitted, reads directly from the deno.json[c] file. */
  currentVersion?: string;
  /** Custom build hash to be appended (e.g., "abc1234"). */
  buildHash?: string;
}

/** Options for updating project versions. */
export interface VersionUpdateOptions {
  /** Current version string. */
  currentVersion?: string;
  /** Path to root deno.jsonc file. */
  denoJsonPath?: string;
  /** Project base directory. */
  baseDir?: string;
  /** If true, skips version operations. */
  noversion?: boolean;
  /** Paths to version files to update. */
  versionPaths?: string[];
  /** Enforce versions on workspace packages. */
  forcepackagesversion?: boolean;
  /** Global define variable name for version. */
  defineVersionString?: string;
  /** Custom build hash to append. */
  buildHash?: string;
}

/** Raw esbuild configuration file (esbuild.jsonc). */
export interface EsbuildConfigFile {
  /** Optional JSON schema URI. */
  $schema?: string;
  /** Dictionary of build targets. */
  targets?: GlobalTargetConfig;
  /** Custom global define string for version injection. */
  defineVersionString?: string;
  /** Version file paths to ensure. */
  versionPaths?: string[];
  /** Enforce workspace packages version sync. */
  forcepackagesversion?: boolean;
  /** Additional custom options. */
  [key: string]: unknown;
}

/** Result of loading esbuild configuration file. */
export interface EsbuildConfigResult {
  /** Dictionary of loaded build targets. */
  targets: GlobalTargetConfig;
  /** Custom global define string for version injection. */
  defineVersionString?: string;
  /** Version file paths to ensure. */
  versionPaths?: string[];
  /** Enforce workspace packages version sync. */
  forcepackagesversion?: boolean;
}

/** Result of a target build execution in esbuild. */
export interface EsbuildResult {
  /** Name of the built target. */
  target: string;
  /** Whether the build succeeded. */
  success: boolean;
  /** Execution duration in milliseconds. */
  durationMs: number;
}

/** Options for executing version sanitization in deno.json[c] files. */
export interface SanitizeVersionOptions {
  /** Path of the file to be sanitized. If omitted, searches recursively for the nearest one. */
  filePath?: string;
  /** Base directory for searching if filePath is not specified. */
  baseDir?: string;
  /** If true, does not emit logs to the console during execution. */
  silent?: boolean;
}

/** Result of the version sanitization operation. */
export interface SanitizeVersionResult {
  /** Path of the processed file. */
  filePath: string;
  /** Original version found in the file. */
  rawVersion: string;
  /** Sanitized version in canonical semver format (MAJOR.MINOR.PATCH). */
  sanitizedVersion: string;
  /** Indicates if the file on disk was modified. */
  updated: boolean;
}

/** Options for creating and publishing git tags based on version. */
export interface TagVersionOptions {
  /** Path of the deno.json[c] file. If omitted, searches automatically. */
  file?: string;
  /** Custom commit message. Default: "Version vMAJOR.MINOR". */
  message?: string;
  /** If true, performs sanitization of the deno.json[c] file on disk before committing. */
  sanitize?: boolean;
  /** If true, only simulates git operations without persisting commits or tags. */
  dryRun?: boolean;
  /** If true, generates or updates the CHANGELOG.md file with changes since the last tag. */
  changelog?: boolean;
  /** If true, updates the latest updates section in README.md. (Requires changelog: true) */
  updateReadme?: boolean;
  /** Execution base directory. */
  baseDir?: string;
  /** If true, does not emit logs to the console during execution. */
  silent?: boolean;
}

/** Result of the git tag operation. */
export interface TagVersionResult {
  /** Name of the generated tag (e.g., "v0.3"). */
  tagName: string;
  /** Original raw version. */
  rawVersion: string;
  /** Sanitized semver version. */
  sanitizedVersion: string;
  /** Message used in the commit. */
  message: string;
  /** Whether the repository was modified and committed. */
  committed: boolean;
  /** Whether the tag was created and published. */
  tagged: boolean;
}

/** Data stored in the concurrency lock file during active watch sessions. */
export interface WatchLockData {
  /** PID of the active Deno process */
  pid: number;
  /** Name of the target under monitoring */
  target: string;
  /** ISO timestamp of process start */
  startedAt: string;
  /** Execution base directory */
  baseDir?: string;
}
