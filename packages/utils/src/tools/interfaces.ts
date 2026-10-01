/**
 * Exemplo de extensões de arquivo que podem ser incluídas em snapshots.
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
  /**
   * Diretório base opcional. Se informado, os caminhos em includes e excludes
   * são relativos a este diretório e a estrutura de pastas é preservada no destino.
   * Se não informado, os arquivos são copiados diretamente para o distdir raiz.
   */
  basedir?: string;
  /** Padrões glob de inclusão (ex: ["**\/*.html", "assets\/**\/*"]). */
  includes?: string[];
  /** Padrões glob de exclusão. */
  excludes?: string[];
}

/** Configuração de limpeza prévia de arquivos e pastas no diretório de saída. */
export interface CleanConfig {
  /** Padrões glob de arquivos/pastas para remover. Use ["*"] para limpar tudo. */
  includes?: string[];
  /** Padrões glob para preservar durante a limpeza. */
  excludes?: string[];
}

/** Configuração de um alvo de build (esbuild). */
export interface TargetConfig {
  /** Diretório base dos fontes (padrão: "."). */
  srcdir?: string;
  /** Diretório de saída final (padrão: "."). */
  distdir?: string;
  /**
   * Regras de limpeza pré-build.
   * Pode ser um objeto { includes, excludes } ou um array simples de globs.
   */
  clean?: CleanConfig | string[];
  /** Lista de conjuntos de regras para cópia de arquivos estáticos. */
  copyFiles?: CopyFileConfig[];
  /** Se deve ser executado automaticamente quando nenhum alvo é passado via CLI. */
  default?: boolean;
  /** Arquivos de entrada relativos ao srcdir. */
  entryPoints: string[];
  /** Plataforma alvo (browser, node ou neutral). */
  platform?: EsbuildPlatform;
  /** Formato de saída (esm, iife ou cjs). */
  format?: EsbuildFormat;
  /** Se deve agrupar dependências em um único arquivo. */
  bundle?: boolean;
  /** Se deve minificar o código. */
  minify?: boolean;
  /** Estratégia de sourcemap. */
  sourcemap?: EsbuildSourcemap;
  /** Transformação JSX (automatic, transform ou preserve). */
  jsx?: EsbuildJsx;
  /** Pacote runtime para JSX automático (ex: "preact"). */
  jsxImportSource?: string;
  /** Condições de resolução de exports. */
  conditions?: string[];
  /** Injeção de constantes globais (ex: { "DEBUG": "true" }). */
  define?: Record<string, string>;
  /** Identificador da constante para injeção da lista de assets gerados (ex: "__GENERATED_ASSETS__"). Se omitido ou vazio, não injeta. */
  defineAssetsString?: string;
  drop?: EsbuildDrop[];
  external?: string[];
  metafile?: boolean;
  write?: boolean;
  /** Se habilita a eliminação de código morto (dead code elimination). Aceita 'ignore' para desativar explicitamente. */
  treeShaking?: boolean | "ignore";
  /** Fábrica JSX customizada (ex: "h", "React.createElement"). */
  jsxFactory?: string;
  /** Fragmento JSX customizado (ex: "Fragment", "React.Fragment"). */
  jsxFragment?: string;
  /** Gera um relatório analítico do bundle no console após o build. */
  analyze?: boolean | "verbose";
  /** Expressão regular para propriedades a serem preservadas durante o mangling (ex: "/^_.+/"). */
  reserveProps?: string;
  /** Informa ao esbuild se o código deve ser tratado como tendo efeitos colaterais para fins de tree-shaking. */
  sideEffects?: boolean;
  /** Preservação e posicionamento de comentários de licença e copyright. */
  legalComments?: EsbuildLegalComments;
  /** Preserva os nomes originais de funções e classes mesmo quando minificado. */
  keepNames?: boolean;
  /** Caminho do arquivo de saída consolidado (relativo ao distdir quando este for fornecido). */
  outfile?: string;
  /** Habilita a divisão de código (code splitting) para carregamento dinâmico em ESM. */
  splitting?: boolean;
  /** Mapeamento de loaders por extensão de arquivo. */
  loader?: Record<string, EsbuildLoader>;
  /** Aliases de módulos ou caminhos de importação. */
  alias?: Record<string, string>;
  /** Arquivos para injetar no topo do bundle antes dos entrypoints. */
  inject?: string[];
  /** Comentários ou trechos de código adicionados no início do arquivo gerado. Suporta __APP_VERSION__. */
  banner?: { js?: string; css?: string };
  /** Comentários ou trechos de código adicionados no final do arquivo gerado. Suporta __APP_VERSION__. */
  footer?: { js?: string; css?: string };
  /** Ambiente alvo JavaScript/ECMAScript (ex: 'es2022', 'chrome100', 'esnext'). */
  target?: string | string[];
  /** Conjunto de caracteres dos arquivos gerados. */
  charset?: EsbuildCharset;
  /** Nível de detalhamento dos logs gerados pelo esbuild. */
  logLevel?: EsbuildLogLevel;
  /** Limite máximo de mensagens de log. */
  logLimit?: number;
  /** Sobrescrita de nível de log por identificador de mensagem. */
  logOverride?: Record<string, EsbuildLogLevel>;
  /** Padrão de nome para arquivos de entrada. */
  entryNames?: string;
  /** Padrão de nome para chunks gerados. */
  chunkNames?: string;
  /** Padrão de nome para assets gerados. */
  assetNames?: string;
  /** Caminho público base para carregar chunks e assets. */
  publicPath?: string;
  /** Identificadores tratados como puros para remoção se não utilizados (ex: ['console.log']). */
  pure?: string[];
  /** Nome da variável global para exposição do bundle no formato IIFE. */
  globalName?: string;
  /** Caminho para um arquivo de configuração TypeScript (tsconfig.json) customizado. */
  tsconfig?: string;
  /** Conteúdo bruto de configuração TypeScript (string JSON ou objeto). */
  tsconfigRaw?: string | Record<string, unknown>;
  /** Mapeamento de extensões de saída (ex: { ".js": ".mjs" }). */
  outExtension?: Record<string, string>;
  /** Define suporte explícito para recursos de linguagem (ex: { "dynamic-import": false }). */
  supported?: Record<string, boolean>;
  /** Se deve incluir o conteúdo original dos arquivos fonte dentro dos sourcemaps. */
  sourcesContent?: boolean;
  /** Se deve ignorar anotações de pureza como "@__PURE__" durante a minificação. */
  ignoreAnnotations?: boolean;
  /** Minificação granular: remove espaços em branco extras. */
  minifyWhitespace?: boolean;
  /** Minificação granular: renomeia identificadores para nomes curtos. */
  minifyIdentifiers?: boolean;
  /** Minificação granular: reescreve sintaxe para formas mais compactas. */
  minifySyntax?: boolean;
  /** Expressão regular para mangling de propriedades de objetos (ex: "/^_.+/"). */
  mangleProps?: string;
  /** Se deve aplicar mangling em propriedades de objetos que estão entre aspas. */
  mangleQuoted?: boolean;
  /** Cache para persistência de nomes de mangling entre builds. */
  mangleCache?: Record<string, string | false>;
  /** Lista de plugins customizados do esbuild. */
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
  defineVersionString?: string;
  baseDir?: string;
  denoJsoncPath?: string;
  silencioso?: boolean;
}

export interface WatchTargetConfig extends TargetConfig {
  /** Se habilitado, o watch também monitora o arquivo de configuração para recarregamento automático (não implementado). */
  watchConfig?: boolean;
}

export interface WatchGlobalConfig {
  [targetName: string]: WatchTargetConfig;
}

export interface WatchConfigFile {
  $schema?: string;
  targets?: WatchGlobalConfig;
  defineVersionString?: string;
  versionPaths?: string[];
  forcepackagesversion?: boolean;
  [key: string]: unknown;
}

export interface WatchConfigResult {
  targets: WatchGlobalConfig;
  defineVersionString?: string;
  versionPaths?: string[];
  forcepackagesversion?: boolean;
}

export interface WatchOptions {
  config: WatchGlobalConfig;
  target?: string;
  versionPaths?: string[];
  defineVersionString?: string;
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
  /** Diretório base dos fontes (padrão: "."). */
  srcdir?: string;
  /** Diretório de saída final (padrão: "."). */
  distdir?: string;
  /** Regras de limpeza pré-build. */
  clean?: CleanConfig | string[];
  /** Lista de conjuntos de regras para cópia de arquivos estáticos. */
  copyFiles?: CopyFileConfig[];
  /** Se deve ser executado automaticamente quando nenhum alvo é passado via CLI. */
  default?: boolean;
  /** Arquivos de entrada TypeScript, JavaScript ou HTML a serem empacotados. */
  entryPoints: string[];
  /** Formato de saída do bundle (padrão: "esm"). */
  format?: DenoBundleFormat;
  /** Plataforma alvo de execução (padrão: "browser"). */
  platform?: DenoBundlePlatform;
  /** Se deve minificar o código gerado. */
  minify?: boolean;
  /** Se deve preservar nomes originais de funções e classes. */
  keepNames?: boolean;
  /** Estratégia de geração de mapa de fontes. */
  sourcemap?: DenoBundleSourceMap;
  /** Habilita a divisão de código em múltiplos arquivos. */
  codeSplitting?: boolean;
  /** Se deve embutir imports dinâmicos diretamente no bundle. */
  inlineImports?: boolean;
  /** Como lidar com pacotes externos (padrão: "bundle"). */
  packages?: DenoBundlePackageHandling;
  /** Lista de módulos a serem tratados como externos. */
  external?: string[];
  /** Mapeamento de constantes substituídas em memória após o build. */
  define?: Record<string, string>;
  /** Identificador da constante para injeção da lista de assets gerados (ex: "__GENERATED_ASSETS__"). */
  defineAssetsString?: string;
  /** Nome do arquivo de saída consolidado (relativo ao distdir). */
  outfile?: string;
  /** Se true, o Deno.bundle gravará diretamente no disco (padrão: false no BuildIt para permitir pós-processamento). */
  write?: boolean;
  /** Nome da variável global para exposição do bundle no formato IIFE (implementado via pós-processamento). */
  globalName?: string;
  /** Trechos de código injetados no início do arquivo gerado (implementado via pós-processamento). Suporta __APP_VERSION__. */
  banner?: { js?: string; css?: string };
  /** Trechos de código injetados no final do arquivo gerado (implementado via pós-processamento). Suporta __APP_VERSION__. */
  footer?: { js?: string; css?: string };
  /** Modo de transformação JSX (automatic, transform ou preserve). Lido do deno.json pelo Deno.bundle. */
  jsx?: string;
  /** Fábrica JSX customizada (ex: "h"). Lido do deno.json pelo Deno.bundle. */
  jsxFactory?: string;
  /** Fragmento JSX customizado (ex: "Fragment"). Lido do deno.json pelo Deno.bundle. */
  jsxFragment?: string;
  /** Pacote para runtime automático do JSX. Lido do deno.json pelo Deno.bundle. */
  jsxImportSource?: string;
}

export interface DenoBuildConfigFile {
  $schema?: string;
  targets?: DenoBundleGlobalConfig;
  defineVersionString?: string;
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
  defineVersionString?: string;
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
  defineVersionString?: string;
  baseDir?: string;
  denoJsoncPath?: string;
  silencioso?: boolean;
}

/** Arquivo de configuração de exportação (export.jsonc). */
export interface ExportConfigFile {
  /** Schema JSON opcional. */
  $schema?: string;
  /** Nome global do projeto (padrão: "BuildIt"). */
  projeto?: string;
  /** Bloco global de cabeçalho customizado para IA. */
  cabecalho?: string;
  /** Identificador customizado da versão global (padrão: "__APP_VERSION__"). */
  defineVersionString?: string;
  /** Dicionário de modos de exportação. */
  modos: Record<string, ExportConfig>;
}

export interface ExportConfigResult {
  modos: Record<string, ExportConfig>;
  projeto?: string;
  cabecalho?: string;
  defineVersionString?: string;
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
  defineVersionString?: string;
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

/** Opções para sincronização de workspaces. */
export interface SyncWorkspacesOptions {
  /** Diretório base de resolução (padrão: "."). */
  baseDir?: string;
  /** Caminho do arquivo de configuração raiz (deno.jsonc ou deno.json). */
  denoJsonPath?: string;
  /** Versão atual a ser propagada. Se omitida, lê do deno.jsonc raiz. */
  currentVersion?: string;
  /** Alias para currentVersion. */
  version?: string;
}

/** Opções para incremento de versão do projeto. */
export interface IncrementVersionOptions {
  /** Diretório base de resolução (padrão: "."). */
  baseDir?: string;
  /** Caminho do arquivo de configuração raiz (deno.jsonc ou deno.json). */
  denoJsonPath?: string;
  /** Versão atual base. Se omitida, lê diretamente do arquivo deno.json[c]. */
  currentVersion?: string;
  /** Hash de build customizado a ser anexado (ex: "abc1234"). */
  buildHash?: string;
}

export interface VersionUpdateOptions {
  currentVersion?: string;
  denoJsonPath?: string;
  baseDir?: string;
  noversion?: boolean;
  versionPaths?: string[];
  forcepackagesversion?: boolean;
  defineVersionString?: string;
  buildHash?: string;
}

export interface EsbuildConfigFile {
  $schema?: string;
  targets?: GlobalTargetConfig;
  defineVersionString?: string;
  versionPaths?: string[];
  forcepackagesversion?: boolean;
  [key: string]: unknown;
}

export interface EsbuildConfigResult {
  targets: GlobalTargetConfig;
  defineVersionString?: string;
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
  /** Se true, gera ou atualiza o arquivo CHANGELOG.md com as mudanças desde a última tag. */
  changelog?: boolean;
  /** Se true, atualiza a seção de últimas atualizações no README.md. (Requer changelog: true) */
  updateReadme?: boolean;
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

export interface WatchLockData {
  /** PID do processo Deno ativo */
  pid: number;
  /** Nome do alvo em monitoramento */
  target: string;
  /** Timestamp ISO do início do processo */
  startedAt: string;
  /** Diretório base de execução */
  baseDir?: string;
}
