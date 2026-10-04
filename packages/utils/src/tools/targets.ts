/**
 * @module @vanaware/buildit/tools/targets
 * @description Deterministic resolution and execution order guarantee for targets based on configuration.
 */

/**
 * Resolves and strictly preserves the execution order of targets as declared
 * in the project configuration file (single source of truth).
 *
 * @param config Configuration object containing keys in the desired order
 * @param requestedTargets Optional list of targets requested by the user (e.g., via CLI)
 * @returns List of filtered targets respecting the original configuration order
 */
export function resolveTargetOrder<T extends object,>(
  config: T,
  requestedTargets?: string[],
): string[] {
  const configKeys = Object.keys(config,);

  if (!requestedTargets || requestedTargets.length === 0) {
    // Returns all targets that do not have default: false
    return configKeys.filter((key,) => {
      const targetConfig = (config as Record<string, unknown>)[key];
      if (targetConfig && typeof targetConfig === "object") {
        return (targetConfig as { default?: boolean }).default !== false;
      }
      return true;
    },);
  }

  // Normalize requested targets for case-insensitive comparison
  const normalizedRequested = requestedTargets.map((t,) => t.toLowerCase());

  // Strictly preserves the order of keys from the configuration object
  return configKeys.filter((key,) =>
    normalizedRequested.includes(key.toLowerCase(),)
  );
}
