/**
 * @module @vanaware/buildit/tools/targets
 * @description Resolução determinística e garantia da ordem de execução de alvos baseada na configuração.
 */

/**
 * Resolve e preserva estritamente a ordem de execução dos alvos conforme declarados
 * no arquivo de configuração do projeto (única fonte da verdade).
 *
 * @param config Objeto de configuração contendo as chaves na ordem desejada
 * @param requestedTargets Lista opcional de alvos solicitados pelo usuário (ex: via CLI)
 * @returns Lista de alvos filtrados respeitando a ordem original da configuração
 */
export function resolverOrdemTargets<T extends object>(
  config: T,
  requestedTargets?: string[],
): string[] {
  const configKeys = Object.keys(config);

  if (!requestedTargets || requestedTargets.length === 0) {
    // Retorna todos os alvos que não possuem default: false
    return configKeys.filter((key) => {
      const targetConfig = (config as Record<string, unknown>)[key];
      if (targetConfig && typeof targetConfig === "object") {
        return (targetConfig as { default?: boolean }).default !== false;
      }
      return true;
    });
  }

  // Normaliza os alvos solicitados para comparação case-insensitive
  const normalizedRequested = requestedTargets.map((t) => t.toLowerCase());

  // Preserva estritamente a ordem das chaves do objeto de configuração
  return configKeys.filter((key) =>
    normalizedRequested.includes(key.toLowerCase())
  );
}
