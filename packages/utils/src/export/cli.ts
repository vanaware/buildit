/**
 * @module @vanaware/buildit/export/cli
 * @description Ponto de entrada para execução do exportador de contexto via linha de comando (CLI).
 */

import { parseCommonCliFlags, } from "../tools/cli-flags.ts";
import { readProjectVersion, } from "../tools/version.ts";
import { carregarConfigExport, } from "./config.ts";
import { exportEngine, } from "./engine.ts";

/**
 * Exibe a mensagem de ajuda para o comando export.
 */
function showExportHelp(): void {
  console.log(`
BuildIt Context Exporter CLI

Uso:
  deno task export [modos...] [opções]
  deno run -A jsr:@vanaware/buildit/export/cli [modos...] [opções]

Opções:
  -c, --config <path>    Especifica o arquivo de configuração (ex: export.jsonc)
  -V, --version, -v      Exibe a versão do projeto
  -h, --help             Exibe esta mensagem de ajuda

Exemplos:
  deno task export                      # Executa todos os modos marcados como default
  deno task export ui docs              # Executa apenas os modos 'ui' e 'docs'
  deno task export -c custom.jsonc      # Usa configuração customizada
  deno task export -V                   # Exibe a versão do projeto
`,);
}

/**
 * Executa o CLI do exportador de contexto a partir dos argumentos da linha de comando.
 *
 * @param args Argumentos passados via CLI (ex: `Deno.args`)
 * @param caminhoConfig Caminho alternativo opcional para o arquivo de configuração
 *
 * @example
 * ```typescript
 * await exportCli(Deno.args);
 * ```
 */
export async function exportCli(
  args: string[] = Deno.args,
  caminhoConfig?: string,
): Promise<void> {
  const flags = parseCommonCliFlags(args,);

  if (flags.showHelp) {
    showExportHelp();
    return;
  }

  const projectVersion = await readProjectVersion();

  if (flags.showVersion) {
    console.log(`v${projectVersion}`,);
    return;
  }

  const startTime = performance.now();
  const configPath = flags.configPath ?? caminhoConfig;

  console.log("\n🚀 Iniciando Exportação de Contexto BuildIt",);

  try {
    await exportEngine({
      baseDir: ".",
      modos: flags.positional,
      caminhoConfig: configPath,
      versaoApp: projectVersion,
    },);

    const elapsed = (performance.now() - startTime).toFixed(0,);
    console.log(`\n${"=".repeat(60,)}`,);
    console.log(`🎉 EXPORTAÇÃO CONCLUÍDA COM SUCESSO!`,);
    console.log(`⏱️ Tempo total: ${elapsed}ms`,);
    console.log(`${"=".repeat(60,)}\n`,);
  } catch (error) {
    console.error("\n🛑 Pipeline de exportação falhou:", error,);
    Deno.exit(1,);
  }
}

if (import.meta.main) {
  await exportCli(Deno.args,);
}
