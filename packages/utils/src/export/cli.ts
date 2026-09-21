/**
 * @module @vanaware/buildit/export/cli
 * @description Ponto de entrada para execução do exportador de contexto via linha de comando (CLI).
 */

/// <reference lib="deno.ns" />

import { parseCommonCliFlags } from "../config/cli-flags.ts";
import { readProjectVersion } from "../config/version.ts";
import { carregarConfigExport } from "./config.ts";
import { exportarModo, parseArgs } from "./engine.ts";

/**
 * Exibe a mensagem de ajuda para o comando export.
 */
export function showExportHelp(): void {
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
`);
}

/**
 * Executa o CLI do exportador de contexto a partir dos argumentos da linha de comando.
 *
 * @param args Argumentos passados via CLI (ex: `Deno.args`)
 * @param caminhoConfig Caminho alternativo opcional para o arquivo de configuração
 *
 * @example
 * ```typescript
 * await runExportCli(Deno.args);
 * ```
 */
export async function runExportCli(
  args: string[] = Deno.args,
  caminhoConfig?: string,
): Promise<void> {
  const flags = parseCommonCliFlags(args);

  if (flags.showHelp) {
    showExportHelp();
    return;
  }

  const projectVersion = await readProjectVersion();

  if (flags.showVersion) {
    console.log(`v${projectVersion}`);
    return;
  }

  const startTime = performance.now();
  const configPath = flags.configPath ?? caminhoConfig;
  const configs = await carregarConfigExport(configPath);
  const modosParaExecutar = parseArgs(flags.positional, configs);

  console.log("\n🚀 Iniciando Exportação de Contexto BuildIt");
  console.log(`📋 Modos a exportar: ${modosParaExecutar.join(", ")}`);
  console.log(`📌 Versão: v${projectVersion}\n`);

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
        await exportarModo(modo, config, { versaoApp: projectVersion });
      } catch (erro) {
        console.error(`\n🛑 Erro ao exportar modo ${modo}:`, erro);
        Deno.exit(1);
      }
    }
  }

  const elapsed = (performance.now() - startTime).toFixed(0);
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🎉 EXPORTAÇÃO CONCLUÍDA COM SUCESSO!`);
  console.log(`⏱️ Tempo total: ${elapsed}ms`);
  console.log(`${"=".repeat(60)}\n`);
}

if (import.meta.main) {
  await runExportCli(Deno.args);
}
