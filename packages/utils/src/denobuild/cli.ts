/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

/**
 * @module @vanaware/buildit/denobuild/cli
 * @description Ponto de entrada CLI para o orquestrador denobuild baseado em Deno.bundle API.
 */

import { parseCommonCliFlags } from "../config/cli-flags.ts";
import { readProjectVersion, updateProjectVersion } from "../config/version.ts";
import {
  listAssetsForCache,
  parseArgs,
} from "../esbuild/mod.ts";
import { carregarConfigDenoBuild } from "./config.ts";
import { processBundleTarget } from "./engine.ts";

/**
 * Exibe a mensagem de ajuda para o comando denobuild.
 */
export function showDenoBuildHelp(): void {
  console.log(`
BuildIt Deno.bundle Orquestrador CLI

Uso:
  deno task denobuild [alvos...] [opções]
  deno run -A --unstable-bundle jsr:@vanaware/buildit/denobuild/cli [alvos...] [opções]

Opções:
  -c, --config <path>               Especifica o arquivo de configuração (ex: denobuild.jsonc)
  -V, --version, -v                 Exibe a versão do projeto
  -h, --help                        Exibe esta mensagem de ajuda
  -n, --noversion, noversion        Desabilita o incremento automático de versão
  -f, --forcepackagesversion        Propaga a versão para os subpacotes do workspace
  --version-path <path>             Diretório ou arquivo adicional onde salvar o version.ts

Exemplos:
  deno task denobuild               # Compila alvos padrão
  deno task denobuild ui            # Compila apenas o alvo 'ui'
  deno task denobuild noversion     # Compila sem incrementar a versão
  deno task denobuild -c custom.jsonc
  deno task denobuild -V            # Exibe a versão do projeto
`);
}

/**
 * Executa o CLI do orquestrador de build baseado em Deno.bundle.
 *
 * @param args Argumentos da linha de comando (ex: `Deno.args`)
 * @param caminhoConfig Caminho opcional do arquivo de configuração (ex: "denobuild.jsonc")
 *
 * @example
 * ```typescript
 * await runDenoBuildCli(Deno.args);
 * ```
 */
export async function runDenoBuildCli(
  args: string[] = Deno.args,
  caminhoConfig?: string,
): Promise<void> {
  const flags = parseCommonCliFlags(args);

  if (flags.showHelp) {
    showDenoBuildHelp();
    return;
  }

  const projectVersion = await readProjectVersion();

  if (flags.showVersion) {
    console.log(`v${projectVersion}`);
    return;
  }

  const start = performance.now();
  const configPath = flags.configPath ?? caminhoConfig;
  const configs = await carregarConfigDenoBuild(configPath);
  const rawArgs = [
    ...flags.positional,
    ...(flags.noversion ? ["noversion"] : []),
  ];
  const { targets, globalNoVersion, watchTarget } = parseArgs(rawArgs, configs);

  console.log("\n🚀 Iniciando Orquestrador de Build BuildIt (denobuild / Deno.bundle API)");
  console.log(`   📦 Motor: Deno.bundle (nativo, --unstable-bundle)`);

  if (watchTarget) {
    console.log(`\n⚠️ AVISO: Modo Watch não suportado pelo Deno.bundle API.`);
    console.log(`   O alvo '${watchTarget}' foi ignorado.`);
    console.log(`   Para watch mode, use o build esbuild: deno task esbuild watch\n`);
    return;
  }

  console.log(`   📋 Alvos: ${targets.join(", ") || "(nenhum)"}`);
  console.log(`   🔒 Noversion: ${globalNoVersion}\n`);

  if (targets.length === 0) {
    console.log("⚠️ Nenhum alvo selecionado para compilação.");
    return;
  }

  const DENO_JSONC_PATH = "deno.jsonc";

  try {
    const finalVersion = await updateProjectVersion({
      denoJsonPath: DENO_JSONC_PATH,
      noversion: globalNoVersion,
      versionPaths: flags.versionPaths,
      forcepackagesversion: flags.forcepackagesversion,
    });

    for (const targetName of targets) {
      const targetConfig = configs[targetName];
      if (!targetConfig) {
        console.warn(`⚠️ Alvo '${targetName}' não encontrado na configuração. Pulando.`);
        continue;
      }

      const listFn = targetName === "sw" ? listAssetsForCache : undefined;
      await processBundleTarget(
        targetName,
        targetConfig,
        finalVersion,
        listFn,
      );
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`🎉 ORQUESTRAÇÃO DENOBUILD CONCLUÍDA COM SUCESSO!`);
    console.log(`${"=".repeat(60)}`);
  } catch (error) {
    console.error("\n🛑 Pipeline de build falhou:", error);
    Deno.exit(1);
  } finally {
    const elapsed = (performance.now() - start).toFixed(0);
    console.log(`\n⏱️ Tempo total: ${elapsed}ms\n`);
  }
}

if (import.meta.main) {
  await runDenoBuildCli(Deno.args);
}
