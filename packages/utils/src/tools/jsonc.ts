import { parse as parseJsonc, } from "@std/jsonc";
import { dirname, fromFileUrl, join, } from "@std/path";

/**
 * Loads and parses a JSON or JSONC file safely.
 * Tries to load the specified file or looks for default alternatives.
 *
 * Search Priority:
 * 1. Explicit path (if provided)
 * 2. Directory of the executing script (Deno.mainModule)
 * 3. Base directory provided (baseDir)
 *
 * @param fileName Base file name (e.g., "denobuild")
 * @param explicitPath Optional explicit path provided by the user
 * @param baseDir Base directory for searching (default: ".")
 * @returns The parsed object or null if not found/invalid
 */
export async function loadConfig<T,>(
  fileName: string,
  explicitPath?: string,
  baseDir: string = ".",
): Promise<T | null> {
  const candidates: string[] = [];

  if (explicitPath) {
    candidates.push(explicitPath,);
    candidates.push(join(baseDir, explicitPath,),);
    candidates.push(join(baseDir, "scripts", explicitPath,),);
  } else {
    // 1. Try main script directory (if it's a local file)
    try {
      if (Deno.mainModule && Deno.mainModule.startsWith("file://",)) {
        const scriptDir = dirname(fromFileUrl(Deno.mainModule,),);
        candidates.push(join(scriptDir, `${fileName}.jsonc`,),);
        candidates.push(join(scriptDir, `${fileName}.json`,),);
      }
    } catch {
      // Ignore URL/Path errors in mainModule
    }

    // 2. Try scripts/ subfolder inside baseDir
    candidates.push(join(baseDir, "scripts", `${fileName}.jsonc`,),);
    candidates.push(join(baseDir, "scripts", `${fileName}.json`,),);

    // 3. Try base directory (usually CWD or project root)
    candidates.push(join(baseDir, `${fileName}.jsonc`,),);
    candidates.push(join(baseDir, `${fileName}.json`,),);
  }

  // Remove duplicates while maintaining order
  const uniqueCandidates = [...new Set(candidates),];

  // console.debug(`🔍 Searching config '${fileName}' in:`, uniqueCandidates);

  for (const path of uniqueCandidates) {
    try {
      const content = await Deno.readTextFile(path,);
      const parsed = parseJsonc(content,);

      if (parsed && typeof parsed === "object") {
        // console.debug(`✅ Config found at: ${path}`);
        return parsed as T;
      }
    } catch (error) {
      if (explicitPath && !(error instanceof Deno.errors.NotFound)) {
        console.warn(
          `⚠️ Error reading configuration file at ${path}:`,
          error,
        );
      }
    }
  }

  return null;
}
