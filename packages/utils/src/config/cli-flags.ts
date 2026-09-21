/**
 * @module @vanaware/buildit/config/cli-flags
 * @description Parser padronizado de argumentos CLI para ferramentas de build e exportação.
 */

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
 * Parseia argumentos de linha de comando extraindo flags comuns e posicionais.
 *
 * @param args Array de argumentos recebidos via CLI (ex: `Deno.args`)
 * @returns Objeto com flags parseadas
 */
export function parseCommonCliFlags(args: string[]): CommonCliFlags {
  let configPath: string | undefined;
  let showVersion = false;
  let showHelp = false;
  let noversion = false;
  let forcepackagesversion = false;
  const versionPaths: string[] = [];
  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;

    if (arg === "-h" || arg === "--help") {
      showHelp = true;
    } else if (arg === "-V" || arg === "--version" || arg === "-v") {
      showVersion = true;
    } else if (arg === "-n" || arg === "--noversion" || arg.toLowerCase() === "noversion") {
      noversion = true;
    } else if (arg === "-f" || arg === "--forcepackagesversion" || arg.toLowerCase() === "forcepackagesversion") {
      forcepackagesversion = true;
    } else if (arg === "-c" || arg === "--config") {
      if (i + 1 < args.length) {
        configPath = args[++i];
      }
    } else if (arg.startsWith("--config=")) {
      configPath = arg.substring("--config=".length);
    } else if (arg.startsWith("-c=")) {
      configPath = arg.substring("-c=".length);
    } else if (arg === "--version-path" || arg === "--versionpath") {
      if (i + 1 < args.length) {
        versionPaths.push(args[++i]!);
      }
    } else if (arg.startsWith("--version-path=") || arg.startsWith("--versionpath=")) {
      versionPaths.push(arg.split("=")[1]!);
    } else if (!arg.startsWith("-")) {
      positional.push(arg);
    }
  }

  return {
    configPath,
    showVersion,
    showHelp,
    noversion,
    forcepackagesversion,
    versionPaths: versionPaths.length > 0 ? versionPaths : undefined,
    positional,
  };
}
