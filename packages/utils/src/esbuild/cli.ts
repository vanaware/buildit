/**
 * @module @vanaware/buildit/esbuild/cli
 * @description Ponto de entrada CLI para o orquestrador de compilação baseado em esbuild.
 */

import { parseArgs, parseCommonCliFlags, } from "../tools/cli-flags.ts";
import { readProjectVersion, updateProjectVersion, } from "../tools/version.ts";
import { listAssetsForCache, } from "../tools/paths.ts";
import { carregarConfigEsbuild, } from "./config.ts";
import {
  buildWithDenoPlugin,
  processTarget,
  startWatchMode,
} from "./engine.ts";

/**
 * Exibe a mensagem de ajuda para o comando esbuild.
 */
function showEsbuildHelp(): void {
  console.log(`
BuildIt esbuild Orquestrador CLI

Uso:
  deno task esbuild [alvos...] [opções]
  deno run -A jsr:@vanaware/buildit/esbuild/cli [alvos...] [opções]

Opções:
  -c, --config <path>               Especifica o arquivo de configuração (ex: esbuild.jsonc)
  -V, --version, -v                 Exibe a versão do projeto
  -h, --help                        Exibe esta mensagem de ajuda
  -n, --noversion, noversion        Desabilita o incremento automático de versão
  -f, --forcepackagesversion        Propaga a versão para os subpacotes do workspace
  --version-path <path>             Diretório ou arquivo adicional onde salvar o version.ts

Exemplos:
  deno task esbuild                 # Compila alvos padrão
  deno task esbuild ui              # Compila apenas o alvo 'ui'
  deno task esbuild watch           # Inicia o modo watch para o alvo configurado
  deno task esbuild noversion       # Compila sem incrementar a versão
  deno task esbuild -c custom.jsonc
  deno task esbuild -V              # Exibe a versão do projeto
`,);
}

/**
 * Executa o CLI do orquestrador de build baseado em esbuild.
 *
 * @param args Argumentos da linha de comando (ex: `Deno.args`)
 * @param caminhoConfig Caminho opcional do arquivo de configuração
 *
 * @example
 * ```typescript
 * await esBuildCli(Deno.args);
 * ```
 */
export async function esBuildCli(
  args: string[] = Deno.args,
  caminhoConfig?: string,
): Promise<void> {
  const flags = parseCommonCliFlags(args,);

  if (flags.showHelp) {
    showEsbuildHelp();
    return;
  }

  const projectVersion = await readProjectVersion();

  if (flags.showVersion) {
    console.log(`v${projectVersion}`,);
    return;
  }

  const start = performance.now();
  const baseDir = ".";
  const configPath = flags.configPath ?? caminhoConfig;
  const loaded = await carregarConfigEsbuild(configPath, baseDir,);
  const configs = loaded.targets;

  const rawArgs = [
    ...flags.positional,
    ...(flags.noversion ? ["noversion",] : []),
  ];
  const { targets, globalNoVersion, watchTarget, } = parseArgs(
    rawArgs,
    configs,
  );

  const DENO_JSONC_PATH = "deno.jsonc";

  console.log(
    "\n🚀 Iniciando Orquestrador de Build BuildIt (esbuild nativo + @deno/esbuild-plugin)",
  );

  if (watchTarget) {
    console.log(`👀 Modo Watch ativo: ${watchTarget}`,);
  } else {
    console.log(
      `📋 Alvos de build (ordem segura do CONFIG): ${
        targets.join(", ",) || "(nenhum)"
      }`,
    );
  }
  console.log(`🔒 Noversion: ${globalNoVersion}\n`,);

  try {
    const finalVersion = await updateProjectVersion({
      denoJsonPath: DENO_JSONC_PATH,
      noversion: globalNoVersion || (watchTarget !== null),
      versionPaths: flags.versionPaths ?? loaded.versionPaths,
      forcepackagesversion: flags.forcepackagesversion ??
        loaded.forcepackagesversion,
    },);

    if (watchTarget) {
      await startWatchMode(
        watchTarget,
        finalVersion,
        configs,
        DENO_JSONC_PATH,
      );
      return;
    }

    for (const targetName of targets) {
      const targetConfig = configs[targetName];
      if (!targetConfig) {
        console.warn(
          `⚠️ Alvo '${targetName}' não encontrado na configuração. Pulando.`,
        );
        continue;
      }

      await processTarget(
        targetName,
        targetConfig,
        finalVersion,
        (opts,) => buildWithDenoPlugin(opts, DENO_JSONC_PATH,),
        listAssetsForCache,
      );
    }

    console.log(`\n${"=".repeat(60,)}`,);
    console.log(`🎉 ORQUESTRAÇÃO ESBUILD CONCLUÍDA COM SUCESSO!`,);
    console.log(`${"=".repeat(60,)}`,);
  } catch (error) {
    console.error("\n🛑 Pipeline de build falhou:", error,);
    Deno.exit(1,);
  } finally {
    const elapsed = (performance.now() - start).toFixed(0,);
    console.log(`\n⏱️ Tempo total: ${elapsed}ms\n`,);
  }
}

if (import.meta.main) {
  await esBuildCli(Deno.args,);
}
