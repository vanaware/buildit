/**
 * @module @vanaware/buildit/version/sanitize/cli
 * @description Ponto de entrada CLI para sanitização de versão via Cliffy.
 */

import { Command, } from "@cliffy/command";
import { APP_VERSION, } from "../../version.ts";
import { sanitizeVersionFile, } from "./engine.ts";

/**
 * Cria o comando CLI para sanitização de versão do deno.json[c].
 *
 * @returns Instância do comando Cliffy configurado
 */
export function sanitizeVersionCli() {
  return new Command()
    .name("sanitize-version",)
    .description(
      "Normaliza a versão do deno.json[c] para formato semver estrito (MAJOR.MINOR.PATCH)",
    )
    .version(APP_VERSION,)
    .arguments("[file:string]",)
    .option("-b, --base-dir [dir:string]", "Diretório base de busca", {
      default: ".",
      env: { prefix: "BUILDIT_", },
    },)
    .action(async function (options, file,): Promise<void> {
      try {
        await sanitizeVersionFile({
          filePath: file as string | undefined,
          baseDir: options.baseDir as string,
        },);
      } catch (error) {
        console.error(error instanceof Error ? error.message : error,);
        Deno.exit(1,);
      }
    },);
}

if (import.meta.main) {
  const cli = sanitizeVersionCli();
  await cli.parse(Deno.args,);
}
