/**
 * @module @vanaware/buildit/denobuild/engine
 * @description Mecanismo central de compilação, injeção de defines e processamento de alvos com Deno.bundle.
 */

import { ensureDir, } from "@std/fs";
import { join, } from "@std/path";
import { updateProjectVersion, } from "../tools/version.ts";
import {
  cleanTarget,
  copyStaticFiles,
  ensureDirForFile,
  listAssetsForCache,
  resolveWithBase,
} from "../tools/paths.ts";

import { validateTargetConfig, } from "../tools/validate.ts";
import { resolverOrdemTargets, } from "../tools/targets.ts";

import { applyDefines, buildBundleOptions, } from "./bundle.ts";
import { carregarConfigDenoBuild, } from "./config.ts";
import type {
  DenoBuildOptions,
  DenoBuildResult,
  DenoBundleGlobalConfig,
  DenoBundleTargetConfig,
} from "../tools/interfaces.ts";

/**
 * Processa a compilação de um alvo específico utilizando o motor Deno.bundle.
 *
 * Etapas executadas:
 * 1. Validação de consistência da configuração
 * 2. Limpeza prévia de diretórios de saída (clean)
 * 3. Cópia de arquivos estáticos e templates HTML
 * 4. Preparação de definições em tempo de compilação (defines)
 * 5. Invocação da API nativa `Deno.bundle`
 * 6. Injeção de variáveis em memória e gravação no disco
 *
 * @param targetName Nome identificador do alvo (ex: "ui")
 * @param config Objeto de configuração do alvo
 * @param appVersion Versão semântica atual da aplicação
 * @param listAssetsFn Função opcional para listar assets gerados para cache do Service Worker
 * @returns Resultado detalhado da compilação do alvo
 *
 * @example
 * ```typescript
 * const result = await processBundleTarget("ui", config, "0.3.5");
 * ```
 */
export async function processBundleTarget(
  targetName: string,
  config: DenoBundleTargetConfig,
  appVersion: string,
  listAssetsFn?: (distDir: string,) => Promise<string[]>,
  baseDir: string = ".",
): Promise<DenoBuildResult> {
  const resolvedConfig: DenoBundleTargetConfig = {
    ...config,
    srcdir: resolveWithBase(config.srcdir, baseDir,),
    distdir: resolveWithBase(config.distdir, baseDir,),
    publicdir: resolveWithBase(config.publicdir, baseDir,),
  };

  validateTargetConfig(targetName, resolvedConfig,);

  console.log(`\n${"=".repeat(60,)}`,);
  console.log(`🎯 PROCESSANDO ALVO: ${targetName.toUpperCase()}`,);
  console.log(`${"=".repeat(60,)}`,);

  // 1. Limpar diretório de saída
  if (resolvedConfig.clean) {
    if (resolvedConfig.distdir) {
      await cleanTarget(resolvedConfig.distdir, resolvedConfig.clean,);
    } else {
      console.warn(
        `⚠️ 'clean' configurado mas 'distdir' ausente. Pulando limpeza.`,
      );
    }
  }

  // 2. Copiar arquivos estáticos
  await copyStaticFiles(resolvedConfig, appVersion, baseDir, resolvedConfig.distdir,);

  // 3. Preparar defines
  const defines: Record<string, string> = {
    ...resolvedConfig.define,
    __APP_VERSION__: JSON.stringify(`v${appVersion}`,),
  };

  if (targetName === "sw" && listAssetsFn && resolvedConfig.distdir) {
    const assets = await listAssetsFn(resolvedConfig.distdir,);
    defines["__GENERATED_ASSETS__"] = JSON.stringify(assets,);
    console.log(`📋 ${assets.length} assets listados para cache do SW`,);
  }

  // 4. Executar bundle
  console.log(`🔨 Compilando com Deno.bundle...`,);
  const startTime = performance.now();
  const bundleOptions = buildBundleOptions(resolvedConfig,);
  const result = await Deno.bundle(bundleOptions,);

  // 5. Verificar erros
  if (!result.success) {
    console.error("❌ Erros de compilação:",);
    for (const error of result.errors) {
      const loc = error.location
        ? ` (${error.location.file}:${error.location.line}:${error.location.column})`
        : "";
      console.error(`   ${error.text}${loc}`,);
      for (const note of error.notes ?? []) {
        console.error(`      💡 ${note.text}`,);
      }
    }
    throw new Error(`Bundle falhou para o alvo [${targetName}]`,);
  }

  // 6. Exibir avisos (se houver)
  for (const warning of result.warnings) {
    const loc = warning.location
      ? ` (${warning.location.file}:${warning.location.line}:${warning.location.column})`
      : "";
    console.warn(`   ⚠️ ${warning.text}${loc}`,);
  }

  // 7. Processar arquivos gerados
  const outputFiles = result.outputFiles ?? [];
  const writtenPaths: string[] = [];

  if (outputFiles.length === 0) {
    console.warn(`   ⚠️ Nenhum arquivo gerado pelo bundle [${targetName}]`,);
    return {
      target: targetName,
      success: true,
      durationMs: Number((performance.now() - startTime).toFixed(0,),),
      outputFiles: [],
    };
  }

  const defineKeys = Object.keys(defines,);
  const hasDefines = defineKeys.length > 0;
  if (hasDefines) {
    console.log(
      `🔧 Injetando ${defineKeys.length} define(s): ${defineKeys.join(", ",)}`,
    );
  }

  for (const outputFile of outputFiles) {
    await ensureDirForFile(outputFile.path);

    let content = outputFile.text();
    if (hasDefines) {
      content = applyDefines(content, defines,);
    }

    await Deno.writeTextFile(outputFile.path, content,);
    writtenPaths.push(outputFile.path,);
    console.log(
      `   📄 ${outputFile.path} (${(content.length / 1024).toFixed(1,)}KB)`,
    );
  }

  const durationMs = Number((performance.now() - startTime).toFixed(0,),);
  console.log(
    `✅ [${targetName}] Build concluído em ${durationMs}ms (${outputFiles.length} arquivo(s))`,
  );

  return {
    target: targetName,
    success: true,
    durationMs,
    outputFiles: writtenPaths,
  };
}

/**
 * Executa programaticamente a compilação via Deno.bundle para os alvos configurados.
 * Aceita diretamente um objeto DenoBundleGlobalConfig em memória ou DenoBuildOptions.
 *
 * @param configOuOpcoes Objeto DenoBundleGlobalConfig em memória ou opções completas de execução
 * @returns Lista de resultados obtidos por alvo
 *
 * @example
 * ```typescript
 * // Passando configuração diretamente em memória:
 * const resultados = await denoBuild({
 *   ui: { entryPoints: ["main.tsx"], distdir: "dist", srcdir: "src", ... }
 * });
 *
 * // Ou usando opções completas:
 * const resultados = await denoBuild({ targets: ["ui"], noversion: true });
 * ```
 */
export async function denoBuild(
  opcoes: DenoBuildOptions,
): Promise<DenoBuildResult[]> {
  const configs = opcoes.config;
  const baseDir = opcoes.baseDir ?? ".";
  const denoJsoncPath = opcoes.denoJsoncPath ?? join(baseDir, "deno.jsonc",);

  // Garante estritamente que a ordem de execução siga a declaração na configuração
  const targetsParaExecutar = resolverOrdemTargets(configs, opcoes.targets,);

  console.log(
    `📋 Alvos de build (ordem segura do CONFIG): ${
      targetsParaExecutar.join(", ",) || "(nenhum)"
    }`,
  );

  if (targetsParaExecutar.length === 0) {
    return [];
  }

  const finalVersion = await updateProjectVersion({
    denoJsonPath: denoJsoncPath,
    baseDir,
    noversion: opcoes.noversion ?? false,
    versionPaths: opcoes.versionPaths,
    forcepackagesversion: opcoes.forcepackagesversion,
  },);

  const resultados: DenoBuildResult[] = [];

  for (const targetName of targetsParaExecutar) {
    const targetConfig = configs[targetName];
    if (!targetConfig) {
      console.warn(
        `⚠️ Alvo '${targetName}' não encontrado na configuração. Pulando.`,
      );
      continue;
    }

    const listFn = targetName === "sw" ? listAssetsForCache : undefined;
    const res = await processBundleTarget(
      targetName,
      targetConfig,
      finalVersion,
      listFn,
      baseDir,
    );
    resultados.push(res,);
  }

  return resultados;
}
