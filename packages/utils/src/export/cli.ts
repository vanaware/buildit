/**
 * @module @vanaware/buildit/export/cli
 * @description Ponto de entrada para execução do exportador de contexto via linha de comando (CLI).
 */

import { APP_VERSION, } from "../version.ts";
import { carregarConfigExport, } from "./config.ts";
import { exportarModo, parseArgs, } from "./engine.ts";

/**
 * Executa o CLI do exportador de contexto a partir dos argumentos da linha de comando.
 *
 * @param args Argumentos passados via CLI (ex: `Deno.args`)
 * @param caminhoConfig Caminho alternativo opcional para o arquivo de configuração
 *
 * @example
 * ```typescript
 * await runExportCli(Deno.args, "export.jsonc");
 * ```
 */
export async function runExportCli(
  args: string[] = Deno.args,
  caminhoConfig?: string,
): Promise<void> {
  const startTime = performance.now();
  const configs = await carregarConfigExport(caminhoConfig,);
  const modosParaExecutar = parseArgs(args, configs,);

  console.log("\n🚀 Iniciando Exportação de Contexto BuildIt",);
  console.log(`📋 Modos a exportar: ${modosParaExecutar.join(", ",)}`,);
  console.log(`📌 Versão: v${APP_VERSION}\n`,);

  if (modosParaExecutar.length === 0) {
    console.log(
      "⚠️ Nenhum modo selecionado para execução. Verifique a chave 'default' no export.jsonc ou especifique os modos via CLI.",
    );
    return;
  }

  for (const modo of modosParaExecutar) {
    const config = configs[modo];
    if (config) {
      try {
        await exportarModo(modo, config, { versaoApp: APP_VERSION, },);
      } catch (erro) {
        console.error(`\n🛑 Erro ao exportar modo ${modo}:`, erro,);
        Deno.exit(1,);
      }
    }
  }

  const elapsed = (performance.now() - startTime).toFixed(0,);
  console.log(`\n${"=".repeat(60,)}`,);
  console.log(`🎉 EXPORTAÇÃO CONCLUÍDA COM SUCESSO!`,);
  console.log(`⏱️ Tempo total: ${elapsed}ms`,);
  console.log(`${"=".repeat(60,)}\n`,);
}

if (import.meta.main) {
  await runExportCli(Deno.args,);
}
