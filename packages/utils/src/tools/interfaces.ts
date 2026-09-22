// ============================================================================
// 📦 TIPOS ESBUILD
// ============================================================================
// 🔥 ESTRATÉGIA DE TIPAGEM: Usamos string literals explícitos em vez de
// `esbuild.LegalComments`, `esbuild.Platform`, etc. porque o esm.sh não
// re-exporta esses tipos internos do esbuild como membros do namespace.
// String literals mantêm autocomplete + type-safety e são independentes
// de como o esm.sh expõe a tipagem.

/**
 * Extensões de arquivo padrão que são comumente incluídas em snapshots.
 * Reutilizável em qualquer projeto de software.
 */
export const EXTENSOES_PADRAO = [
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

/**
 * Versão semântica parseada.
 */
export interface ParsedVersion {
  /** Versão major */
  major: number;
  /** Versão minor */
  minor: number;
  /** Versão patch */
  patch: number;
}

/**
 * Argumentos de linha de comando parseados.
 */
export interface ParsedArgs {
  /** Alvos de build a processar (exclui alvos watch) */
  targets: string[];
  /** Flag global para não incrementar versão */
  globalNoVersion: boolean;
  /** Nome do alvo watch a executar, ou null se não estiver em modo watch */
  watchTarget: string | null;
}

/** Modo de operação do alvo */
export type TargetMode = "build" | "watch";

/** Plataformas suportadas pelo esbuild */
export type EsbuildPlatform = "browser" | "node" | "neutral";

/** Formatos de saída suportados pelo esbuild */
export type EsbuildFormat = "esm" | "iife" | "cjs";

/** Estratégias de source map */
export type EsbuildSourcemap = boolean | "linked" | "inline" | "external";

/** Modos JSX */
export type EsbuildJsx = "automatic" | "transform" | "preserve";

/** O que fazer com comentários legais */
export type EsbuildLegalComments =
  | "none"
  | "inline"
  | "eof"
  | "linked"
  | "external";

/** O que remover do bundle (console, debugger) */
export type EsbuildDrop = "console" | "debugger";

/** Charset de saída */
export type EsbuildCharset = "ascii" | "utf8";

/** Níveis de log do esbuild */
export type EsbuildLogLevel =
  | "verbose"
  | "debug"
  | "info"
  | "warning"
  | "error"
  | "silent";

/** Loaders disponíveis para diferentes tipos de arquivo */
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

/**
 * Configuração de um alvo de build (esbuild).
 */
export interface TargetConfig {
  // --- Configurações de Pipeline (Pré/Post Build) ---
  /** Diretório de arquivos estáticos/públicos */
  publicdir?: string;
  /** Diretório de código-fonte */
  srcdir?: string;
  /** Diretório de saída do build */
  distdir?: string;
  /** Se deve processar/copiar o arquivo index.html */
  indexHtml?: boolean;
  /** Lista de caminhos para limpar antes do build */
  clean?: string[];
  /**
   * Determina se o alvo é incluído automaticamente quando nenhum alvo
   * é especificado via CLI.
   *
   * - `true` ou `undefined`: Incluído por padrão (comportamento padrão)
   * - `false`: Só roda quando explicitamente solicitado via CLI
   *
   * ⚠️ Esta propriedade é IGNORADA para alvos com `mode: 'watch'`.
   * Alvos watch nunca são incluídos na lista de targets padrão.
   */
  default?: boolean;
  /**
   * Modo de operação do alvo.
   *
   * - `'build'`: Alvo normal de build (padrão). Compila e termina.
   * - `'watch'`: Modo de desenvolvimento contínuo. Monitora mudanças
   *   e rebuilda automaticamente. O processo fica vivo até Ctrl+C.
   *
   * ⚠️ Se múltiplos alvos tiverem `mode: 'watch'`, apenas o PRIMEIRO
   * (na ordem do CONFIG) é executado quando a flag `watch` é usada.
   */
  mode?: TargetMode;
  // --- Configurações do Esbuild (TODAS configuráveis) ---
  /** Arquivos de entrada do bundle */
  entryPoints: string[];
  /** Plataforma alvo (browser, node, neutral) */
  platform?: EsbuildPlatform;
  /** Formato de saída (esm, cjs, iife) */
  format?: EsbuildFormat;
  /** Se deve agrupar dependências no bundle */
  bundle?: boolean;
  /** Se deve minificar o código */
  minify?: boolean;
  /** Tipo de sourcemap a ser gerado */
  sourcemap?: EsbuildSourcemap;
  /** Configuração de JSX */
  jsx?: EsbuildJsx;
  /** Origem de importação do JSX (ex: preact) */
  jsxImportSource?: string;
  /** Condições personalizadas de exportação */
  conditions?: string[];
  /** Mapa de substituições globais */
  define?: Record<string, string>;
  /** Coisas para remover do código (ex: console, debugger) */
  drop?: EsbuildDrop[];
  /** Módulos a serem tratados como externos */
  external?: string[];
  /** Se deve gerar um arquivo de metadados JSON */
  metafile?: boolean;
  /** Se deve gravar o resultado no disco */
  write?: boolean;
  /** Se deve habilitar tree shaking */
  treeShaking?: boolean;
  /** Como tratar comentários legais (ex: linked, inline) */
  legalComments?: EsbuildLegalComments;
  /** Se deve preservar nomes originais de funções/classes */
  keepNames?: boolean;
  /** Caminho explícito do arquivo de saída */
  outfile?: string;
  /** Se deve habilitar splitting de código */
  splitting?: boolean;
  /** Mapeamento de loaders por extensão */
  loader?: Record<string, EsbuildLoader>;
  /** Mapa de aliases de módulos */
  alias?: Record<string, string>;
  /** Arquivos para injetar no bundle */
  inject?: string[];
  /** Texto a ser adicionado no topo dos arquivos gerados */
  banner?: { js?: string; css?: string };
  /** Texto a ser adicionado no final dos arquivos gerados */
  footer?: { js?: string; css?: string };
  /** Ambiente alvo (ex: chrome58, node12, esnext) */
  target?: string | string[];
  /** Conjunto de caracteres (utf8 ou ascii) */
  charset?: EsbuildCharset;
  /** Nível de detalhamento do log */
  logLevel?: EsbuildLogLevel;
  /** Limite de mensagens de log */
  logLimit?: number;
  /** Sobrescrita de nível de log por código de erro */
  logOverride?: Record<string, EsbuildLogLevel>;
  /** Padrão de nome para arquivos de entrada */
  entryNames?: string;
  /** Padrão de nome para arquivos de chunk */
  chunkNames?: string;
  /** Padrão de nome para ativos estáticos */
  assetNames?: string;
  /** Caminho público base para ativos */
  publicPath?: string;
  /** Lista de funções que podem ser removidas se o resultado não for usado */
  pure?: string[];
  /**
   * Plugins do esbuild.
   * Permite injetar plugins customizados (ex: @deno/esbuild-plugin).
   * Os plugins definidos aqui são mesclados com quaisquer plugins
   * injetados externamente pelo orquestrador de build.
   */
  plugins?: unknown[];
}

/**
 * Configuração global de alvos de build do esbuild.
 * Mapeia o nome do alvo para sua configuração.
 */
export interface GlobalTargetConfig {
  /** Nome do alvo e sua configuração correspondente */
  [targetName: string]: TargetConfig;
}

/** Alias semântico para a configuração de alvo do esbuild */
export type EsbuildTargetConfig = TargetConfig;
/** Alias semântico para a configuração global de alvos do esbuild */
export type EsbuildGlobalConfig = GlobalTargetConfig;

/**
 * Opções para execução programática do esbuild.
 */
export interface EsbuildOptions {
  /** Configuração direta de alvos em memória (substitui leitura de arquivo) */
  config?: GlobalTargetConfig;
  /** Caminho do arquivo de configuração (ex: "esbuild.jsonc") */
  caminhoConfig?: string;
  /** Alvos específicos a compilar */
  targets?: string[];
  /** Se true, não incrementa a versão */
  noversion?: boolean;
  /** Lista de caminhos de arquivos ou diretórios onde salvar o version.ts */
  versionPaths?: string[];
  /** Se true, sincroniza versão para os subpacotes do workspace */
  forcepackagesversion?: boolean;
  /** Diretório base de resolução */
  baseDir?: string;
  /** Caminho para o deno.jsonc raiz */
  denoJsoncPath?: string;
  /** Alvo watch específico a executar */
  watchTarget?: string;
  /** Se true, suprime logs não críticos */
  silencioso?: boolean;
}

// ============================================================================
// 📦 TIPOS E INTERFACES EXPORT
// ============================================================================
/**
 * Configuração de um modo de exportação.
 * Genérica o suficiente para ser usada em qualquer projeto.
 */
export interface ExportConfig {
  /** Caminho do arquivo de saída (relativo à raiz do projeto) */
  arquivoSaida: string;
  /** Extensões de arquivo que devem ser incluídas */
  extensoesPermitidas: string[];
  /** Pasta base onde a varredura começa */
  pastaBase: string;
  /** Subpastas dentro de pastaBase que devem ser varridas */
  subpastasPermitidas: string[];
  /** Caminhos adicionais fora de pastaBase que devem ser incluídos */
  caminhosAdicionaisPermitidos?: string[];
  /** Arquivos específicos na raiz de pastaBase que devem ser incluídos */
  arquivosRaizPermitidos: string[];
  /** Se deve incluir a versão do app no cabeçalho */
  incluiVersao: boolean;
  /** Texto de instrução para a IA no cabeçalho */
  instrucaoCustomizada: string;
  /**
   * Determina se o modo é incluído automaticamente quando nenhum modo
   * é especificado via CLI.
   *
   * - `true` ou `undefined`: Incluído por padrão (comportamento padrão)
   * - `false`: Só roda quando explicitamente solicitado via CLI
   *
   * @example
   * ```typescript
   * ui: { default: true, ... }       // Roda por padrão
   * tests: { default: false, ... }   // Só roda com: deno task export tests
   * ```
   */
  default?: boolean;
}

// ============================================================================
// 📦 TIPOS DENO.BUNDLE (API nativa do Deno 2.x --unstable-bundle)
// ============================================================================

/** Plataformas suportadas pelo Deno.bundle */
export type DenoBundlePlatform = "browser" | "deno";

/** Formatos de saída suportados pelo Deno.bundle */
export type DenoBundleFormat = "esm" | "cjs" | "iife";

/** Estratégias de source map do Deno.bundle */
export type DenoBundleSourceMap = "linked" | "inline" | "external";

/** Como tratar pacotes/dependências externas */
export type DenoBundlePackageHandling = "bundle" | "external";

/**
 * Configuração de um alvo de build usando a API nativa Deno.bundle.
 *
 * Interface declarativa e explícita: cada propriedade é listada
 * diretamente, sem uso de Omit ou herança de outras interfaces.
 *
 * Seções:
 * 1. Pipeline BuildIt: Pré/pós processamento (cleanup, cópia de estáticos)
 * 2. Deno.bundle Options: Propriedades passadas para Deno.bundle()
 * 3. Extensões BuildIt: Define customizado e opções extras
 */
export interface DenoBundleTargetConfig {
  // ==========================================================================
  // 🔄 PIPELINE BUILDIT (Pré/Pós Build)
  // ==========================================================================

  /** Diretório fonte (onde estão os arquivos de entrada) */
  srcdir?: string;

  /** Diretório de destino (onde o bundle será escrito) */
  distdir?: string;

  /** Diretório de arquivos estáticos públicos (copiados para distdir) */
  publicdir?: string;

  /** Se deve copiar index.html do srcdir para distdir */
  indexHtml?: boolean;

  /**
   * Lista de paths para limpar antes do build (relativos ao distdir).
   * Use ["."] para esvaziar completamente o diretório.
   */
  clean?: string[];

  /**
   * Incluído automaticamente quando nenhum alvo é especificado via CLI.
   * - `true` ou `undefined`: Incluído por padrão
   * - `false`: Só roda quando explicitamente solicitado
   */
  default?: boolean;

  /**
   * Modo de operação do alvo.
   * - `'build'`: Compila e termina (padrão)
   * - `'watch'`: ⚠️ NÃO SUPORTADO pelo Deno.bundle — emite aviso e ignora
   */
  mode?: "build" | "watch";

  // ==========================================================================
  // ⚙️ DENO.BUNDLE OPTIONS (API nativa)
  // Ref: https://docs.deno.com/api/deno/bundler/#Deno.bundle.Options
  // ==========================================================================

  /** Pontos de entrada do bundle (arquivos TypeScript/JavaScript) */
  entryPoints: string[];

  /**
   * Formato de saída do bundle.
   * - `"esm"`: ES Modules (padrão)
   * - `"cjs"`: CommonJS
   * - `"iife"`: Immediately Invoked Function Expression
   */
  format?: DenoBundleFormat;

  /**
   * Plataforma alvo.
   * - `"browser"`: Otimizado para navegadores (padrão para UI/SW)
   * - `"deno"`: Otimizado para runtime Deno
   */
  platform?: DenoBundlePlatform;

  /** Se deve minificar o output */
  minify?: boolean;

  /** Preserva nomes originais de funções e classes */
  keepNames?: boolean;

  /**
   * Estratégia de source map.
   * - `"linked"`: Arquivo .map separado com link no bundle
   * - `"inline"`: Source map embutido no bundle (base64)
   * - `"external"`: Arquivo .map separado sem link
   */
  sourcemap?: DenoBundleSourceMap;

  /** Habilita code splitting (divide o bundle em chunks) */
  codeSplitting?: boolean;

  /** Se deve inlinar imports externos no bundle */
  inlineImports?: boolean;

  /**
   * Como tratar pacotes/dependências externas.
   * - `"bundle"`: Pacotes são incluídos no bundle (padrão)
   * - `"external"`: Pacotes são excluídos
   */
  packages?: DenoBundlePackageHandling;

  /** Módulos externos a excluir do bundle */
  external?: string[];

  // ==========================================================================
  // 🔧 EXTENSÕES BUILDIT (pré-processamento customizado)
  // ==========================================================================

  /**
   * Define customizado para substituição de variáveis em tempo de build.
   * Aplicado em memória nos OutputFiles ANTES de salvar no disco.
   *
   * __APP_VERSION__ é injetado automaticamente — não precisa declarar.
   *
   * @example
   * ```typescript
   * define: {
   *   "__DEBUG__": "false",
   *   "__API_URL__": '"https://api.buildit.app"'
   * }
   * ```
   */
  define?: Record<string, string>;

  /**
   * Caminho explícito do arquivo de saída (quando há 1 entry point).
   * Se não especificado, usa outputDir do Deno.bundle.
   */
  outfile?: string;
}

/**
 * Estrutura do arquivo de configuração externo `denobuild.jsonc`.
 */
export interface DenoBuildConfigFile {
  /** URL do JSON Schema para validação e autocomplete no editor */
  $schema?: string;
  /** Versão semântica da configuração */
  version?: string;
  /** Alvos de build configurados no projeto */
  targets?: DenoBundleGlobalConfig;
  /** Alias em português para alvos de build configurados */
  alvos?: DenoBundleGlobalConfig;
  /** Lista de caminhos de arquivos ou diretórios onde salvar o version.ts */
  versionPaths?: string[];
  /** Se true, sincroniza versão para os subpacotes do workspace */
  forcepackagesversion?: boolean;
  /** Suporte a alvos definidos diretamente no nível raiz do JSON */
  [key: string]: unknown;
}

/**
 * Resultado detalhado da execução de compilação de um alvo via Deno.bundle.
 */
export interface DenoBuildResult {
  /** Nome identificador do alvo compilado (ex: "ui") */
  target: string;
  /** Indica se a compilação foi concluída com êxito */
  success: boolean;
  /** Duração da compilação em milissegundos */
  durationMs: number;
  /** Lista de caminhos dos arquivos gerados no disco */
  outputFiles: string[];
}

/**
 * Resultado do carregamento da configuração, incluindo alvos e opções globais.
 */
export interface DenoBuildConfigResult {
  targets: DenoBundleGlobalConfig;
  versionPaths?: string[];
  forcepackagesversion?: boolean;
}

/**
 * Configuração global de múltiplos alvos de build para Deno.bundle.
 */
export interface DenoBundleGlobalConfig {
  /** Nome do alvo e sua configuração correspondente */
  [targetName: string]: DenoBundleTargetConfig;
}

/**
 * Opções para execução programática do denobuild.
 */
export interface DenoBuildOptions {
  /** Configuração direta de alvos em memória (substitui leitura de arquivo) */
  config?: DenoBundleGlobalConfig;
  /** Caminho do arquivo de configuração (ex: "denobuild.jsonc") */
  caminhoConfig?: string;
  /** Alvos específicos a compilar */
  targets?: string[];
  /** Se true, não incrementa a versão */
  noversion?: boolean;
  /** Lista de caminhos de arquivos ou diretórios onde salvar o version.ts */
  versionPaths?: string[];
  /** Se true, sincroniza versão para os subpacotes do workspace */
  forcepackagesversion?: boolean;
  /** Diretório base de resolução */
  baseDir?: string;
  /** Caminho para o deno.jsonc raiz */
  denoJsoncPath?: string;
  /** Se true, suprime logs não críticos */
  silencioso?: boolean;
}

/**
 * Estrutura do arquivo de configuração externo `export.jsonc`.
 */
export interface ExportConfigFile {
  /** URL do JSON Schema para validação e autocomplete no editor */
  $schema?: string;
  /** Versão opcional do schema de configuração */
  version?: string;
  /** Modos de exportação configurados para o projeto */
  modos: Record<string, ExportConfig>;
}

/**
 * Resultado detalhado da execução de exportação de um modo.
 */
export interface ExportResult {
  /** Nome identificador do modo executado (ex: "ui", "docs", "server", "utils") */
  modo: string;
  /** Quantidade de arquivos incluídos no snapshot gerado */
  arquivos: number;
  /** Caminho relativo do arquivo de saída gravado */
  arquivoSaida: string;
  /** Tamanho total do arquivo de saída em bytes */
  bytes: number;
}

/**
 * Opções de configuração para o método programático `executarExport`.
 */
export interface ExportOptions {
  /** Configuração direta de modos em memória (substitui leitura de arquivo) */
  config?: Record<string, ExportConfig>;
  /** Caminho do arquivo de configuração (padrão: "export.jsonc" ou "export.json") */
  caminhoConfig?: string;
  /** Lista explícita de modos a serem executados. Se omitido, executa os marcados como default */
  modos?: string[];
  /** Diretório base de varredura (padrão: ".") */
  baseDir?: string;
  /** Versão da aplicação a ser injetada no cabeçalho (se omitido, lê do deno.jsonc raiz) */
  versaoApp?: string;
  /** Caminho alternativo para o deno.jsonc para extração da versão */
  denoJsoncPath?: string;
  /** Se true, suprime logs informativos no console */
  silencioso?: boolean;
}

/**
 * Opções comuns parseadas da linha de comando.
 */
export interface CommonCliFlags {
  /** Caminho explícito para o arquivo de configuração (--config / -c) */
  configPath?: string;
  /** Se a flag de versão foi solicitada (--version / -V) */
  showVersion: boolean;
  /** Se a flag de ajuda foi solicitada (--help / -h) */
  showHelp: boolean;
  /** Se o incremento de versão deve ser desabilitado (noversion / --noversion / -n) */
  noversion: boolean;
  /** Se a versão deve ser propagada para os pacotes do workspace (--forcepackagesversion / -f) */
  forcepackagesversion: boolean;
  /** Caminhos adicionais onde salvar o version.ts (--version-path) */
  versionPaths?: string[];
  /** Argumentos posicionais restantes (alvos ou modos) */
  positional: string[];
}

/**
 * Opções para atualização e sincronização de versão.
 */
export interface VersionUpdateOptions {
  /** Versão base a ser utilizada. Se não fornecida, será lida do arquivo deno.jsonc */
  currentVersion?: string;
  /** Caminho do arquivo deno.jsonc raiz */
  denoJsonPath?: string;
  /** Diretório base do projeto (padrão: ".") */
  baseDir?: string;
  /** Se true, não incrementa o patch da versão */
  noversion?: boolean;
  /** Lista de caminhos de arquivos ou diretórios onde salvar o arquivo version.ts */
  versionPaths?: string[];
  /** Se true, sincroniza a versão para os subpacotes do workspace */
  forcepackagesversion?: boolean;
  /** Hash customizado para compor a versão (opcional) */
  buildHash?: string;
}

/**
 * Estrutura do arquivo de configuração externo `esbuild.jsonc`.
 */
export interface EsbuildConfigFile {
  /** URL do JSON Schema para validação e autocomplete no editor */
  $schema?: string;
  /** Versão semântica da configuração */
  version?: string;
  /** Alvos de build configurados no projeto */
  targets?: GlobalTargetConfig;
  /** Alias em português para alvos de build configurados */
  alvos?: GlobalTargetConfig;
  /** Lista de caminhos de arquivos ou diretórios onde salvar o version.ts */
  versionPaths?: string[];
  /** Se true, sincroniza versão para os subpacotes do workspace */
  forcepackagesversion?: boolean;
  /** Suporte a alvos definidos diretamente no nível raiz do JSON */
  [key: string]: unknown;
}

/**
 * Resultado do carregamento da configuração, incluindo alvos e opções globais.
 */
export interface EsbuildConfigResult {
  targets: GlobalTargetConfig;
  versionPaths?: string[];
  forcepackagesversion?: boolean;
}

/**
 * Detailed esbuild compilation result.
 */
export interface EsbuildResult {
  /** The build target identifier. */
  target: string;
  /** Whether the build operation succeeded. */
  success: boolean;
  /** Total duration of the build operation in milliseconds. */
  durationMs: number;
}
