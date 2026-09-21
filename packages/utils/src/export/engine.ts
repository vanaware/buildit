/**
 * @module @vanaware/buildit/export/engine
 * @description Mecanismo de varredura de diretórios, filtragem e geração de snapshots consolidados.
 */

/// <reference lib="deno.ns" />

import { walk, } from "@std/fs/walk";
import { dirname, join, relative, } from "@std/path";
import { APP_VERSION, } from "../version.ts";
import { carregarConfigExport, } from "./config.ts";
import {
  deveIncluirArquivo,
  formatarArquivoMarkdown,
  gerarCabecalho,
} from "./formatter.ts";
import type {
  ExportConfig,
  ExportOptions,
  ExportResult,
} from "./types.ts";

/**
 * Analisa os argumentos fornecidos via linha de comando ou array de strings
 * e determina quais modos devem ser executados.
 *
 * Regras:
 * - Sem argumentos: seleciona todos os modos configurados com `default !== false`
 * - Com argumentos: seleciona apenas os modos correspondentes às chaves conhecidas
 * - Argumentos desconhecidos são ignorados
 *
 * @param args Lista de argumentos recebidos
 * @param configs Dicionário de configurações de modos disponíveis
 * @returns Array de chaves de modos a serem executados
 *
 * @example
 * ```typescript
 * const modos = parseArgs(["ui"], configs); // ["ui"]
 * ```
 */
export function parseArgs(
  args: string[],
  configs: Record<string, ExportConfig>,
): string[] {
  const configKeys = Object.keys(configs,);
  const lowerArgs = args.map((a,) => a.toLowerCase());
  const requestedModos = lowerArgs.filter((arg,) => configKeys.includes(arg,));

  if (requestedModos.length === 0) {
    return configKeys.filter((modo,) => configs[modo]?.default !== false);
  }

  return configKeys.filter((modo,) => requestedModos.includes(modo,));
}

/**
 * Executa o processo de exportação para um único modo configurado.
 *
 * @param modo Nome identificador do modo (ex: "ui")
 * @param config Objeto de configuração do modo
 * @param opcoes Opções adicionais de execução (versão, diretório base, logs)
 * @returns Resultado detalhado contendo contagem de arquivos e bytes gravados
 *
 * @example
 * ```typescript
 * const result = await exportarModo("ui", config, { versaoApp: "0.3.1" });
 * console.log(`Exportados ${result.arquivos} arquivos para ${result.arquivoSaida}`);
 * ```
 */
export async function exportarModo(
  modo: string,
  config: ExportConfig,
  opcoes?: {
    versaoApp?: string;
    baseDir?: string;
    silencioso?: boolean;
  },
): Promise<ExportResult> {
  const baseDir = opcoes?.baseDir ?? ".";
  const versaoApp = opcoes?.versaoApp ?? APP_VERSION;
  const silencioso = opcoes?.silencioso ?? false;
  const versaoDisplay = config.incluiVersao ? `[v${versaoApp}] ` : "";

  if (!silencioso) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📦 EXPORTANDO MODO: ${modo.toUpperCase()} ${versaoDisplay}`);
    console.log(`${"=".repeat(60)}`);
    console.log(`📄 Arquivo de saída: ${config.arquivoSaida}`);
    console.log(`📁 Pasta base: ${config.pastaBase}`);
  }

  let conteudoFinal = gerarCabecalho(config, modo, versaoApp);
  let arquivosIncluidos = 0;

  for await (const entry of walk(baseDir, { includeDirs: false })) {
    const caminhoRelativo = relative(baseDir, entry.path);

    if (deveIncluirArquivo(caminhoRelativo, config)) {
      try {
        if (!silencioso) {
          console.log(`   ✅ Incluindo: ${caminhoRelativo}`);
        }
        const conteudoArquivo = await Deno.readTextFile(entry.path);
        conteudoFinal += formatarArquivoMarkdown(caminhoRelativo, conteudoArquivo);
        arquivosIncluidos++;
      } catch (erro) {
        if (!silencioso && erro instanceof Error) {
          console.error(`   ❌ Erro ao ler ${caminhoRelativo}:`, erro.message);
        }
      }
    }
  }

  // Garante que o diretório de destino existe antes da gravação
  const caminhoSaida = join(baseDir, config.arquivoSaida);
  const dirSaida = dirname(caminhoSaida);
  if (dirSaida && dirSaida !== ".") {
    await Deno.mkdir(dirSaida, { recursive: true });
  }

  const encodedBytes = new TextEncoder().encode(conteudoFinal);
  await Deno.writeTextFile(caminhoSaida, conteudoFinal);

  if (!silencioso) {
    console.log(
      `\n✨ Modo ${modo.toUpperCase()} concluído: ${arquivosIncluidos} arquivos exportados para ${config.arquivoSaida} (${encodedBytes.length} bytes)`,
    );
  }

  return {
    modo,
    arquivos: arquivosIncluidos,
    arquivoSaida: config.arquivoSaida,
    bytes: encodedBytes.length,
  };
}

/**
 * Executa programaticamente o fluxo completo de exportação com suporte a múltiplos modos.
 *
 * @param opcoes Opções de execução incluindo caminhos, modos específicos e parâmetros de exibição
 * @returns Lista de resultados obtidos para cada modo processado
 *
 * @example
 * ```typescript
 * const resultados = await executarExport({ modos: ["ui", "docs"] });
 * ```
 */
export async function executarExport(
  opcoes?: ExportOptions,
): Promise<ExportResult[]> {
  const baseDir = opcoes?.baseDir ?? ".";
  const configs = await carregarConfigExport(opcoes?.caminhoConfig, baseDir);
  const modosParaExecutar = opcoes?.modos && opcoes.modos.length > 0
    ? parseArgs(opcoes.modos, configs)
    : parseArgs([], configs);

  const resultados: ExportResult[] = [];

  for (const modo of modosParaExecutar) {
    const config = configs[modo];
    if (config) {
      const res = await exportarModo(modo, config, {
        baseDir,
        versaoApp: opcoes?.versaoApp,
        silencioso: opcoes?.silencioso,
      });
      resultados.push(res);
    }
  }

  return resultados;
}
