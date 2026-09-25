/**
 * @module @vanaware/buildit/version/tag/cli
 * @description Ponto de entrada CLI para publicação de tags git via Cliffy.
 */

import { Command, } from "@cliffy/command";
import { APP_VERSION, } from "../../version.ts";
import { tagVersionEngine, } from "./engine.ts";

/**
 * Cria o comando CLI para bump e publicação de tags git.
 *
 * @returns Instância do comando Cliffy configurado
 */
export function tagVersionCli(): Command {
  return new Command()
    .name("tag-version",)
    .description(
      "Cria e publica uma tag git baseada na versão do deno.json[c] (vMAJOR.MINOR)",
    )
    .version(APP_VERSION,)
    .option("-m, --message <msg:string>", "Mensagem personalizada do commit",)
    .option(
      "-s, --sanitize",
      "Sanitiza o arquivo deno.json[c] em disco antes do commit",
      {
        default: false,
      },
    )
    .option("-f, --file <file:string>", "Caminho específico do deno.json[c]",)
    .option("-b, --base-dir <dir:string>", "Diretório base de busca", {
      default: ".",
    },)
    .option(
      "--dry-run",
      "Simula as operações git sem efetuar commits ou pushes",
      {
        default: false,
      },
    )
    .action(async function (options,): Promise<void> {
      try {
        await tagVersionEngine({
          file: options.file,
          message: options.message,
          sanitize: options.sanitize,
          baseDir: options.baseDir,
          dryRun: options.dryRun,
        },);
      } catch (error) {
        console.error(error instanceof Error ? error.message : error,);
        Deno.exit(1,);
      }
    },);
}

if (import.meta.main) {
  const cli = tagVersionCli();
  await cli.parse(Deno.args,);
}
