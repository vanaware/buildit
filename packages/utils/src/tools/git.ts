/**
 * @module @vanaware/buildit/tools/git
 * @description Utilities for executing git commands.
 */

/**
 * Interface for the result of a git command execution.
 */
export interface GitResult {
  success: boolean;
  code: number;
  stdout: string;
  stderr: string;
}

/**
 * Executes a git command capturing stdout, stderr and exit code.
 *
 * @param args Git command arguments
 * @param cwd Working directory (optional)
 * @returns Promise with the execution result
 *
 * @example
 * ```typescript
 * const res = await runGit(["status"]);
 * if (res.success) console.log(res.stdout);
 * ```
 */
export async function runGit(
  args: string[],
  cwd?: string,
): Promise<GitResult> {
  try {
    const cmd = new Deno.Command("git", {
      args,
      cwd,
      stdout: "piped",
      stderr: "piped",
    },);
    const output = await cmd.output();
    const decoder = new TextDecoder();
    return {
      success: output.success,
      code: output.code,
      stdout: decoder.decode(output.stdout,).trim(),
      stderr: decoder.decode(output.stderr,).trim(),
    };
  } catch (error) {
    return {
      success: false,
      code: 1,
      stdout: "",
      stderr: error instanceof Error ? error.message : String(error,),
    };
  }
}
