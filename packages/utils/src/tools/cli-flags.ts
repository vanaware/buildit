import {
  DenoBundleGlobalConfig,
  GlobalTargetConfig,
  ParsedArgs,
} from "./interfaces.ts";

// ============================================================================
// 🎯 PARSING DE ARGUMENTOS CLI (pura, testável)
// ============================================================================
/**
 * Parseia os argumentos de linha de comando extraindo os alvos solicitados e detectando a flag 'noversion'.
 * A detecção de noversion ocorre no CLI (seja via flag ou argumento posicional).
 * A ordenação correta e resolução dos alvos padrão é delegada ao engine (via resolverOrdemTargets).
 *
 * @param args Lista de argumentos recebidos via linha de comando
 * @param optionsOrConfig Opções do CLI (ex: { noversion?: boolean }) ou configuração de alvos (retrocompatibilidade)
 * @returns Argumentos parseados contendo alvos informados e flag globalNoVersion
 */
export function parseArgs(
  args: string[],
  optionsOrConfig?: { noversion?: boolean } | GlobalTargetConfig | DenoBundleGlobalConfig,
): ParsedArgs {
  const lowerArgs = args.map((a,) => a.toLowerCase());
  const hasNoVersionInArgs = lowerArgs.includes("noversion",);
  const hasNoVersionInOptions = Boolean(
    optionsOrConfig && "noversion" in optionsOrConfig && (optionsOrConfig as { noversion?: boolean }).noversion,
  );
  const globalNoVersion = hasNoVersionInArgs || hasNoVersionInOptions;
  const rawTargets = args.filter((arg,) => arg.toLowerCase() !== "noversion",);

  // Se optionsOrConfig for uma configuração de alvos (retrocompatibilidade com testes existentes):
  if (
    optionsOrConfig &&
    !("noversion" in optionsOrConfig) &&
    typeof optionsOrConfig === "object"
  ) {
    const configKeys = Object.keys(optionsOrConfig,);
    if (rawTargets.length === 0) {
      const defaultTargets = configKeys.filter((t,) => {
        const cfg = (optionsOrConfig as Record<string, { default?: boolean }>)[t];
        return cfg?.default !== false;
      },);
      return { targets: defaultTargets, globalNoVersion, };
    }
    const finalTargets = configKeys.filter((t,) =>
      rawTargets.some((rt,) => rt.toLowerCase() === t.toLowerCase())
    );
    return { targets: finalTargets, globalNoVersion, };
  }

  return { targets: rawTargets, globalNoVersion, };
}
