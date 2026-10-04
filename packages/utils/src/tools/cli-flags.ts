import type { ParsedArgs, } from "./interfaces.ts";

// ============================================================================
// 🎯 CLI ARGUMENTS PARSING (pure, testable)
// ============================================================================
/**
 * Parses command line arguments by extracting the requested targets and detecting the 'noversion' flag.
 * Final target resolution and default handling is performed by the engine via `resolveTargetOrder`.
 *
 * @param args List of arguments received via command line
 * @param options CLI options (e.g., { noversion?: boolean })
 * @returns Parsed arguments containing informed targets and globalNoVersion flag
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
