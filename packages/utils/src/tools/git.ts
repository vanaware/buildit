/**
 * @module @vanaware/buildit/tools/git
 * @description Utilitários para execução de comandos git.
 */

/**
 * Interface para o resultado da execução de um comando git.
 */
export interface GitResult {
  success: boolean;
  code: number;
  stdout: string;
  stderr: string;
}

/**
 * Executa um comando git capturando stdout, stderr e código de saída.
 *
 * @param args Argumentos do comando git
 * @param cwd Diretório de trabalho (opcional)
 * @returns Promessa com o resultado da execução
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
