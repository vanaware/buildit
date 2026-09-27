import type { ParsedArgs, } from "./interfaces.ts";

// ============================================================================
// 🎯 PARSING DE ARGUMENTOS CLI (pura, testável)
// ============================================================================
/**
 * Parseia os argumentos de linha de comando extraindo os alvos solicitados e detectando a flag 'noversion'.
 * A resolução final dos alvos e padrão (default) é realizada pelo engine via `resolverOrdemTargets`.
 *
 * @param args Lista de argumentos recebidos via linha de comando
 * @param options Opções do CLI (ex: { noversion?: boolean })
 * @returns Argumentos parseados contendo alvos informados e flag globalNoVersion
 */
export function parseArgs(
  args: string[],
  options?: { noversion?: boolean },
): ParsedArgs {
  const lowerArgs = args.map((a,) => a.toLowerCase());
  const hasNoVersionInArgs = lowerArgs.includes("noversion",);
  const hasNoVersionInOptions = Boolean(options?.noversion,);
  const globalNoVersion = hasNoVersionInArgs || hasNoVersionInOptions;
  const rawTargets = args.filter((arg,) => arg.toLowerCase() !== "noversion");

  return { targets: rawTargets, globalNoVersion, };
}
