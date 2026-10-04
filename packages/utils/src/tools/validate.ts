import { dirname, isAbsolute, join, } from "@std/path";

import type { DenoBundleTargetConfig, TargetConfig, } from "./interfaces.ts";

// ============================================================================
// 🎯 TARGET CONFIGURATION VALIDATION (fail-fast with clear messages)
// ============================================================================
/**
 * Validates if the target configuration has the required fields for the requested operations.
 * Throws an error with an educational message indicating exactly which condition failed.
 *
 * Requirements rules:
 * - 'distdir' is required when 'copyFiles' is configured or 'outfile' is not configured
 * - 'srcdir' is required when 'entryPoints' contains relative paths
 */
export function validateTargetConfig(
  targetName: string,
  config: TargetConfig | DenoBundleTargetConfig,
): void {
  const reasons: string[] = [];

  // distdir validation
  if (config.copyFiles && config.copyFiles.length > 0 && !config.distdir) {
    reasons.push(
      "'copyFiles' is configured (requires 'distdir' to copy static files)",
    );
  }
  if (!config.outfile && !config.distdir) {
    reasons.push(
      "'outfile' is not configured (requires 'distdir' to use as 'outdir')",
    );
  }

  // Check if any entrypoint is relative and srcdir does not exist
  if (!config.srcdir && config.entryPoints && config.entryPoints.length > 0) {
    const hasRelativeEntry = config.entryPoints.some((entry,) =>
      !isAbsolute(entry,)
    );
    if (hasRelativeEntry) {
      reasons.push(
        "'entryPoints' contains relative paths (requires 'srcdir' to resolve)",
      );
    }
  }

  if (reasons.length > 0) {
    const missingFields: string[] = [];
    if (!config.distdir && reasons.some((r,) => r.includes("'distdir'",))) {
      missingFields.push("'distdir'",);
    }
    if (!config.srcdir && reasons.some((r,) => r.includes("'srcdir'",))) {
      missingFields.push("'srcdir'",);
    }

    throw new Error(
      `❌ [${targetName}] Incomplete configuration.\n` +
        `   Missing required fields: ${missingFields.join(", ",)}\n` +
        `   Reasons:\n` +
        reasons.map((r,) => `   - ${r}`).join("\n",) +
        `\n   Please configure the required fields in the target '${targetName}'.`,
    );
  }
}
