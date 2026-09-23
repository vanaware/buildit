import {
  DenoBundleGlobalConfig,
  GlobalTargetConfig,
  ParsedArgs,
} from "./interfaces.ts";

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
  const configKeys = Object.keys(config,);
  const defaultTargets = configKeys.filter((t,) => {
    const cfg = config[t]!;
    return cfg.default !== false;
  },);
  const requestedTargets = lowerArgs.filter(
    (arg,) => !["noversion",].includes(arg,) && configKeys.includes(arg,),
  );

  let finalTargets: string[];
  if (requestedTargets.length > 0) {
    finalTargets = configKeys.filter((t,) => requestedTargets.includes(t,));
  } else {
    finalTargets = defaultTargets;
  }
  return { targets: finalTargets, globalNoVersion, };
}
