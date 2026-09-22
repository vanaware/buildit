import {
  CommonCliFlags,
  DenoBundleGlobalConfig,
  GlobalTargetConfig,
  ParsedArgs,
} from "./interfaces.ts";

/**
 * @module @vanaware/buildit/config/cli-flags
 * @description Parser padronizado de argumentos CLI para ferramentas de build e exportação.
 */

/**
 * Parseia argumentos de linha de comando extraindo flags comuns e posicionais.
 *
 * @param args Array de argumentos recebidos via CLI (ex: `Deno.args`)
 * @returns Objeto com flags parseadas
 */
export function parseCommonCliFlags(args: string[],): CommonCliFlags {
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
    } else if (
      arg === "-n" || arg === "--noversion" || arg.toLowerCase() === "noversion"
    ) {
      noversion = true;
    } else if (
      arg === "-f" || arg === "--forcepackagesversion" ||
      arg.toLowerCase() === "forcepackagesversion"
    ) {
      forcepackagesversion = true;
    } else if (arg === "-c" || arg === "--config") {
      if (i + 1 < args.length) {
        configPath = args[++i];
      }
    } else if (arg.startsWith("--config=",)) {
      configPath = arg.substring("--config=".length,);
    } else if (arg.startsWith("-c=",)) {
      configPath = arg.substring("-c=".length,);
    } else if (arg === "--version-path" || arg === "--versionpath") {
      if (i + 1 < args.length) {
        versionPaths.push(args[++i]!,);
      }
    } else if (
      arg.startsWith("--version-path=",) || arg.startsWith("--versionpath=",)
    ) {
      versionPaths.push(arg.split("=",)[1]!,);
    } else if (!arg.startsWith("-",)) {
      positional.push(arg,);
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

// ============================================================================
// 🎯 PARSING DE ARGUMENTOS CLI (pura, testável)
// ============================================================================
/**
 * Parseia os argumentos de linha de comando para determinar alvos e flags.
 * @param args Lista de argumentos
 * @param config Configuração global de alvos
 * @returns Argumentos parseados
 */
export function parseArgs(
  args: string[],
  config: GlobalTargetConfig | DenoBundleGlobalConfig,
): ParsedArgs {
  const lowerArgs = args.map((a,) => a.toLowerCase());
  const globalNoVersion = lowerArgs.includes("noversion",);
  const isWatchFlag = lowerArgs.includes("watch",);
  const configKeys = Object.keys(config,);
  const defaultTargets = configKeys.filter((t,) => {
    const cfg = config[t]!;
    return cfg.mode !== "watch" && cfg.default !== false;
  },);
  const requestedTargets = lowerArgs.filter(
    (arg,) =>
      !["noversion", "watch",].includes(arg,) && configKeys.includes(arg,),
  );
  let watchTarget: string | null = null;
  if (isWatchFlag) {
    watchTarget = configKeys.find((t,) => config[t]!.mode === "watch") ?? null;
  } else if (requestedTargets.length > 0) {
    const requestedWatches = requestedTargets.filter((t,) =>
      config[t]!.mode === "watch"
    );
    if (requestedWatches.length > 0) {
      watchTarget = configKeys.find((t,) => requestedWatches.includes(t,)) ??
        null;
    }
  }
  let finalTargets: string[];
  if (watchTarget !== null) {
    finalTargets = [];
  } else if (requestedTargets.length > 0) {
    finalTargets = configKeys.filter((t,) => requestedTargets.includes(t,));
  } else {
    finalTargets = defaultTargets;
  }
  return { targets: finalTargets, globalNoVersion, watchTarget, };
}
