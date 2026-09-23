/**
 * @module @vanaware/buildit/tools/targets
 * @description Resolução determinística e garantia de ordem de execução para alvos e modos configurados.
 */

/**
 * Garante que a lista de alvos a serem executados siga estritamente a ordem de declaração
 * no arquivo de configuração (fonte única da verdade), filtrando pelos alvos solicitados
 * ou selecionando todos os alvos com `default !== false`.
 *
 * @param config Dicionário de alvos ou modos configurados
 * @param solicitados Lista opcional de alvos passados pelo chamador
 * @returns Lista ordenada de chaves a executar
 *
 * @example
 * ```typescript
 * const config = { server: { default: true }, ui: { default: true } };
 * // Mesmo passando ["ui", "server"], o resultado preserva a ordem do config ["server", "ui"]:
 * const targets = resolverOrdemTargets(config, ["ui", "server"]); // ["server", "ui"]
 * ```
 */
export function resolverOrdemTargets<
  T extends { default?: boolean; mode?: string },
>(
  config: Record<string, T>,
  solicitados?: string[],
): string[] {
  const configKeys = Object.keys(config,);

  if (solicitados && solicitados.length > 0) {
    const lowerSolicitados = solicitados.map((s,) => s.toLowerCase());
    return configKeys.filter((k,) => lowerSolicitados.includes(k.toLowerCase(),));
  }

  return configKeys.filter((k,) => config[k]?.default !== false);
}
