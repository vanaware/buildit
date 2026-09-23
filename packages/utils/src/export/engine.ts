/**
 * @module @vanaware/buildit/export/engine
 * @description Mecanismo de varredura otimizada de diretórios (expandGlob), filtragem e streaming de snapshots Markdown.
 */

import { expandGlob, walk, } from "@std/fs";
import { join, relative, } from "@std/path";
import { readProjectVersion, } from "../tools/version.ts";
import {
  correspondeGlobs,
  deveIncluirArquivo,
  formatarArquivoMarkdown,
  gerarCabecalho,
  normalizarCaminho,
} from "./formatter.ts";
import { ensureDirForFile, } from "../tools/paths.ts";
import { resolverOrdemTargets, } from "../tools/targets.ts";
import type {
  ExportConfig,
  ExportOptions,
  ExportResult,
} from "../tools/interfaces.ts";

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
 * Coleta a lista ordenada e deduplicada de arquivos que devem ser incluídos no snapshot.
 * Utiliza `expandGlob` para varredura otimizada direta quando `includes` está configurado,
 * ou recorre ao `walk` legado quando propriedades antigas são fornecidas.
 *
 * @param config Configuração do modo de exportação
 * @param baseDir Diretório base do projeto
 * @returns Array de caminhos relativos ordenados alfabeticamente
 */
export async function coletarArquivosParaExportacao(
  config: ExportConfig,
  baseDir: string = ".",
): Promise<string[]> {
  const arquivosEncontrados = new Set<string>();

  // 🌟 MODO MODERNO: Uso direto de expandGlob com suporte nativo a brace expansion
  if (config.includes && config.includes.length > 0) {
    for (const padrao of config.includes) {
      try {
        for await (
          const entry of expandGlob(padrao, {
            root: baseDir,
            exclude: config.excludes,
            includeDirs: false,
          },)
        ) {
          const caminhoRelativo = relative(baseDir, entry.path,).replace(
            /\\/g,
            "/",
          );
          const caminhoNormalizado = normalizarCaminho(caminhoRelativo,);

          // Proteção anti-loop
          if (
            caminhoNormalizado.startsWith("exports/",) ||
            caminhoNormalizado.startsWith("snapshots/",)
          ) {
            continue;
          }

          // Verificação extra de excludes
          if (config.excludes && config.excludes.length > 0) {
            if (correspondeGlobs(caminhoRelativo, config.excludes,)) {
              continue;
            }
          }

          arquivosEncontrados.add(caminhoRelativo,);
        }
      } catch {
        // Ignora padrões que não encontram caminhos ou com sintaxe inválida
      }
    }
  } else {
    // 🔍 MODO LEGADO: Varredura com walk global e filtro deveIncluirArquivo
    for await (const entry of walk(baseDir, { includeDirs: false, },)) {
      const caminhoRelativo = relative(baseDir, entry.path,).replace(
        /\\/g,
        "/",
      );
      if (deveIncluirArquivo(caminhoRelativo, config,)) {
        arquivosEncontrados.add(caminhoRelativo,);
      }
    }
  }

  return Array.from(arquivosEncontrados,).sort();
}

/**
 * Executa o processo de exportação para um único modo configurado utilizando streaming de escrita em disco.
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
    denoJsoncPath?: string;
  },
): Promise<ExportResult> {
  const baseDir = opcoes?.baseDir ?? ".";
  const versaoApp = opcoes?.versaoApp ??
    await readProjectVersion(opcoes?.denoJsoncPath, baseDir,);
  const silencioso = opcoes?.silencioso ?? false;
  const versaoDisplay = config.incluiVersao ? `[v${versaoApp}] ` : "";

  if (!silencioso) {
    console.log(`\n${"=".repeat(60,)}`,);
    console.log(`📦 EXPORTANDO MODO: ${modo.toUpperCase()} ${versaoDisplay}`,);
    console.log(`${"=".repeat(60,)}`,);
    console.log(`📄 Arquivo de saída: ${config.arquivoSaida}`,);
    if (config.includes) {
      console.log(`🎯 Padrões de inclusão: ${config.includes.join(", ",)}`,);
    }
  }

  // 1. Coleta os arquivos de forma otimizada via expandGlob
  const arquivosParaProcessar = await coletarArquivosParaExportacao(
    config,
    baseDir,
  );

  // 2. Garante que o diretório de destino existe antes da gravação
  const caminhoSaida = join(baseDir, config.arquivoSaida,);
  await ensureDirForFile(caminhoSaida,);

  // 3. Inicializa o stream de escrita em disco (Uso de memória O(1))
  const file = await Deno.open(caminhoSaida, {
    write: true,
    create: true,
    truncate: true,
  },);
  const writer = file.writable.getWriter();
  const encoder = new TextEncoder();

  let bytesGravados = 0;
  let arquivosIncluidos = 0;

  try {
    // Escreve o cabeçalho
    const cabecalho = gerarCabecalho(config, modo, versaoApp,);
    const cabecalhoChunk = encoder.encode(cabecalho,);
    await writer.write(cabecalhoChunk,);
    bytesGravados += cabecalhoChunk.byteLength;

    // Processa e escreve cada arquivo individualmente no stream
    for (const caminhoRelativo of arquivosParaProcessar) {
      try {
        const caminhoCompleto = join(baseDir, caminhoRelativo,);
        const conteudoArquivo = await Deno.readTextFile(caminhoCompleto,);
        const blocoMarkdown = formatarArquivoMarkdown(
          caminhoRelativo,
          conteudoArquivo,
        );
        const blocoChunk = encoder.encode(blocoMarkdown,);

        await writer.write(blocoChunk,);
        bytesGravados += blocoChunk.byteLength;
        arquivosIncluidos++;

        if (!silencioso) {
          console.log(`   ✅ Incluído: ${caminhoRelativo}`,);
        }
      } catch (erro) {
        if (!silencioso && erro instanceof Error) {
          console.error(`   ❌ Erro ao ler ${caminhoRelativo}:`, erro.message,);
        }
      }
    }
  } finally {
    await writer.close();
  }

  if (!silencioso) {
    console.log(
      `\n✨ Modo ${modo.toUpperCase()} concluído: ${arquivosIncluidos} arquivos exportados para ${config.arquivoSaida} (${bytesGravados} bytes)`,
    );
  }

  return {
    modo,
    arquivos: arquivosIncluidos,
    arquivoSaida: config.arquivoSaida,
    bytes: bytesGravados,
  };
}

/**
 * Executa programaticamente o fluxo completo de exportação com suporte a múltiplos modos.
 * Aceita diretamente um objeto de configurações de modos em memória ou um objeto ExportOptions.
 *
 * @param opcoes Opções completas de execução
 * @returns Lista de resultados obtidos para cada modo processado
 *
 * @example
 * ```typescript
 * // Passando configuração diretamente em memória:
 * const resultados = await exportEngine({
 *   config: {
 *     ui: { arquivoSaida: "snapshots/ui.md", includes: ["packages/ui/src/*.ts"] }
 *   }
 * });
 * ```
 */
export async function exportEngine(
  opcoes: ExportOptions,
): Promise<ExportResult[]> {
  const configs = opcoes.config;
  const baseDir = opcoes.baseDir ?? ".";
  const modosParaExecutar = resolverOrdemTargets(configs, opcoes.modos,);

  const versaoApp = opcoes.versaoApp ??
    await readProjectVersion(opcoes.denoJsoncPath, baseDir,);

  const resultados: ExportResult[] = [];

  for (const modo of modosParaExecutar) {
    const config = configs[modo];
    if (config) {
      const res = await exportarModo(modo, config, {
        baseDir,
        versaoApp,
        silencioso: opcoes.silencioso,
        denoJsoncPath: opcoes.denoJsoncPath,
      },);
      resultados.push(res,);
    }
  }

  return resultados;
}
