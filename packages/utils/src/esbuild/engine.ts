import { copy, emptyDir, ensureDir, walk, } from "@std/fs";
import { dirname, isAbsolute, join, } from "@std/path";
import { parse as parseJsonc, } from "@std/jsonc";

// ============================================================================
// 📦 TIPOS
// ============================================================================
import type {
  DenoBundleGlobalConfig,
  DenoBundleTargetConfig,
  EsbuildOptions,
  EsbuildResult,
  GlobalTargetConfig,
  ParsedArgs,
  ParsedVersion,
  TargetConfig,
} from "../tools/interfaces.ts";

import {
  cleanTarget,
  copyStaticFiles,
  ensureDirForFile,
  listAssetsForCache,
  resolveEntryPoints,
  resolveOutputPaths,
} from "../tools/paths.ts";

import { validateTargetConfig, } from "../tools/validate.ts";

// ============================================================================
// 🔢 FUNÇÕES DE VERSÃO (re-exportadas de config/version.ts)
// ============================================================================
import {
  extractVersionFromContent,
  formatVersion,
  parseVersion,
  replaceVersionInContent,
} from "../tools/version.ts";

/**
 * @module @vanaware/buildit/esbuild/engine
 * @description Mecanismo programático para execução de builds com esbuild e @deno/esbuild-plugin.
 */

import * as esbuild from "esbuild";
import { denoPlugin, } from "@deno/esbuild-plugin";
import { updateProjectVersion, } from "../tools/version.ts";
import { parseArgs, } from "../tools/cli-flags.ts";
import { carregarConfigEsbuild, } from "./config.ts";

/**
 * Injeta o Deno Plugin nas opções do esbuild.
 */
export const buildWithDenoPlugin = (
  // deno-lint-ignore no-explicit-any
  options: any,
  denoJsoncPath: string,
  // deno-lint-ignore no-explicit-any
): Promise<any> => {
  options.plugins = [
    ...(options.plugins || []),
    denoPlugin({ configPath: denoJsoncPath, },),
  ];
  return esbuild.build(options,);
};

/**
 * Inicia o Watch Mode do esbuild.
 */
export async function startWatchMode(
  watchTargetName: string,
  currentVer: string,
  config: GlobalTargetConfig,
  denoJsoncPath: string,
): Promise<void> {
  const targetConfig = config[watchTargetName];
  if (!targetConfig) {
    throw new Error(
      `❌ Alvo watch '${watchTargetName}' não encontrado na configuração`,
    );
  }

  console.log(`\n👀 Iniciando Watch Mode: ${watchTargetName}\n`,);

  await copyStaticFiles(targetConfig, currentVer,);

  const esbuildOptions = await buildEsbuildOptions(
    watchTargetName,
    targetConfig,
    currentVer,
  );

  esbuildOptions.plugins = [
    ...(esbuildOptions.plugins || []),
    denoPlugin({ configPath: denoJsoncPath, },),
  ];

  const ctx = await esbuild.context(esbuildOptions,);
  await ctx.watch();

  console.log("\n✅ Watch mode ativo!",);
  console.log(`📁 Monitorando: ${targetConfig.srcdir}/`,);

  const resolvedOutfile = esbuildOptions.outfile ||
    (targetConfig.distdir ? `${targetConfig.distdir}/` : "N/A");
  console.log(`📦 Output: ${resolvedOutfile}`,);
  console.log(`📌 Versão: v${currentVer}`,);
  console.log("\n💡 Pressione Ctrl+C para parar.\n",);

  await new Promise(() => {},);
}

/**
 * Executa programaticamente a compilação com esbuild para os alvos configurados.
 *
 * @param opcoes Opções completas de execução (incluindo configuração já parseada)
 * @returns Lista de resultados obtidos por alvo
 */
export async function esBuild(
  opcoes: EsbuildOptions,
): Promise<EsbuildResult[]> {
  const configs = opcoes.config;
  const baseDir = opcoes.baseDir ?? ".";
  const targets = opcoes.targets ?? [];
  const activeWatch = opcoes.watchTarget;
  const denoJsoncPath = opcoes.denoJsoncPath ?? join(baseDir, "deno.jsonc",);

  const finalVersion = await updateProjectVersion({
    denoJsonPath: denoJsoncPath,
    baseDir,
    noversion: opcoes.noversion ?? false,
    versionPaths: opcoes.versionPaths,
    forcepackagesversion: opcoes.forcepackagesversion,
  },);

  if (activeWatch) {
    await startWatchMode(activeWatch, finalVersion, configs, denoJsoncPath,);
    return [{ target: activeWatch, success: true, durationMs: 0, },];
  }

  // Garante estritamente que a ordem de execução siga a declaração na configuração
  const configKeys = Object.keys(configs,);
  const targetsParaExecutar = configKeys.filter((t,) => targets.includes(t,));

  if (targetsParaExecutar.length === 0) {
    return [];
  }

  const resultados: EsbuildResult[] = [];

  for (const targetName of targetsParaExecutar) {
    const targetConfig = configs[targetName];
    if (!targetConfig) {
      console.warn(
        `⚠️ Alvo '${targetName}' não encontrado na configuração. Pulando.`,
      );
      continue;
    }

    const startTime = performance.now();
    await processTarget(
      targetName,
      targetConfig,
      finalVersion,
      (opts,) => buildWithDenoPlugin(opts, denoJsoncPath,),
      listAssetsForCache,
    );
    const durationMs = Number((performance.now() - startTime).toFixed(0,),);

    resultados.push({
      target: targetName,
      success: true,
      durationMs,
    },);
  }

  return resultados;
}

/**
 * Processa a compilação de um alvo do esbuild.
 * @param targetName Nome do alvo
 * @param config Configuração do alvo
 * @param appVersion Versão da aplicação
 * @param esbuildBuildFn Função de build do esbuild (com plugins injetados)
 * @param listAssetsFn Função opcional para listar assets
 */
export async function processTarget(
  targetName: string,
  config: TargetConfig,
  appVersion: string,
  // deno-lint-ignore no-explicit-any
  esbuildBuildFn: (options: any,) => Promise<any>,
  listAssetsFn?: (distDir: string,) => Promise<string[]>,
): Promise<void> {
  // 🔥 VALIDAÇÃO FAIL-FAST: Verifica configuração ANTES de qualquer operação
  validateTargetConfig(targetName, config,);

  console.log(`\n${"=".repeat(60,)}`,);
  console.log(`🎯 PROCESSANDO ALVO: ${targetName.toUpperCase()}`,);
  console.log(`${"=".repeat(60,)}`,);

  if (config.clean && config.clean.length > 0) {
    // 🔥 CORREÇÃO: Só limpa se distdir existe
    if (config.distdir) {
      await cleanTarget(config.distdir, config.clean,);
    } else {
      console.warn(
        `⚠️ 'clean' configurado mas 'distdir' ausente. Pulando limpeza.`,
      );
    }
  }

  await copyStaticFiles(config, appVersion,);

  const esbuildOptions = await buildEsbuildOptions(
    targetName,
    config,
    appVersion,
    listAssetsFn,
  );

  console.log(`🔨 Compilando com esbuild...`,);
  const startTime = performance.now();

  try {
    const result = await esbuildBuildFn(esbuildOptions,);
    const duration = (performance.now() - startTime).toFixed(0,);
    console.log(`✅ [${targetName}] Build concluído em ${duration}ms`,);

    // 🔥 CORREÇÃO: Só salva metafile se distdir existe
    if (config.metafile && result.metafile && config.distdir) {
      const metafilePath = join(config.distdir, `${targetName}-metafile.json`,);
      await Deno.writeTextFile(
        metafilePath,
        JSON.stringify(result.metafile, null, 2,),
      );
      console.log(`📊 Metafile gerado: ${metafilePath}`,);
    }
  } catch (error) {
    console.error(`❌ Erro fatal no build [${targetName}]:`, error,);
    throw error;
  }
}

// ============================================================================
// 🛠️ FUNÇÕES DE ESBUILD
// ============================================================================
/**
 * Constrói as opções de build para o esbuild.
 * @param targetName Nome do alvo
 * @param config Configuração do alvo
 * @param appVersion Versão da aplicação
 * @param listAssetsFn Função para listar assets
 * @returns Opções do esbuild
 */
export async function buildEsbuildOptions(
  targetName: string,
  config: TargetConfig,
  appVersion: string,
  listAssetsFn?: (distDir: string,) => Promise<string[]>,
  // deno-lint-ignore no-explicit-any
): Promise<any> {
  const finalDefine: Record<string, string> = {
    ...config.define,
    __APP_VERSION__: JSON.stringify(`v${appVersion}`,),
  };

  // 🔥 CORREÇÃO: Só lista assets se distdir existe
  if (targetName === "sw" && listAssetsFn && config.distdir) {
    const assets = await listAssetsFn(config.distdir,);
    finalDefine["__GENERATED_ASSETS__"] = JSON.stringify(assets,);
    console.log(`📋 ${assets.length} assets listados para cache do SW`,);
  }

  // 🔥 RESOLUÇÃO DE ENTRYPOINTS (srcdir opcional)
  const resolvedEntryPoints = resolveEntryPoints(
    config.srcdir,
    config.entryPoints,
  );

  // 🔥 RESOLUÇÃO DE OUTPUT PATHS (outfile relativo ao distdir)
  const { outfile, outdir, } = resolveOutputPaths(config,);

  // deno-lint-ignore no-explicit-any
  const options: any = {
    entryPoints: resolvedEntryPoints,
  };

  // 🔥 CORREÇÃO: Usa outfile resolvido ou outdir
  if (outfile) {
    options.outfile = outfile;
  } else if (outdir) {
    options.outdir = outdir;
  }

  const optionalProps = [
    "platform",
    "format",
    "bundle",
    "minify",
    "sourcemap",
    "jsx",
    "jsxImportSource",
    "conditions",
    "external",
    "drop",
    "metafile",
    "write",
    "treeShaking",
    "legalComments",
    "keepNames",
    "splitting",
    "loader",
    "alias",
    "inject",
    "target",
    "charset",
    "logLevel",
    "logLimit",
    "logOverride",
    "entryNames",
    "chunkNames",
    "assetNames",
    "publicPath",
    "pure",
    "plugins",
  ];
  for (const prop of optionalProps) {
    // deno-lint-ignore no-explicit-any
    if ((config as any)[prop] !== undefined) {
      // deno-lint-ignore no-explicit-any
      (options as any)[prop] = (config as any)[prop];
    }
  }

  // 🔥 CORREÇÃO: Construção segura de banner
  if (config.banner !== undefined) {
    const banner: { js?: string; css?: string } = {};
    if (config.banner.js !== undefined) {
      banner.js = config.banner.js.replace(/__APP_VERSION__/g, appVersion,);
    }
    if (config.banner.css !== undefined) {
      banner.css = config.banner.css.replace(/__APP_VERSION__/g, appVersion,);
    }
    if (banner.js !== undefined || banner.css !== undefined) {
      options.banner = banner;
    }
  }

  // 🔥 CORREÇÃO: Construção segura de footer
  if (config.footer !== undefined) {
    const footer: { js?: string; css?: string } = {};
    if (config.footer.js !== undefined) {
      footer.js = config.footer.js.replace(/__APP_VERSION__/g, appVersion,);
    }
    if (config.footer.css !== undefined) {
      footer.css = config.footer.css.replace(/__APP_VERSION__/g, appVersion,);
    }
    if (footer.js !== undefined || footer.css !== undefined) {
      options.footer = footer;
    }
  }

  options.define = finalDefine;
  return options;
}
