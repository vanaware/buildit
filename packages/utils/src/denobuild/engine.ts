/**
 * @module @vanaware/buildit/denobuild/engine
 * @description Mecanismo central de compilação, injeção de defines e processamento de alvos com Deno.bundle.
 */

import { ensureDir, } from "@std/fs";
import { join, } from "@std/path";
import { updateProjectVersion, } from "../config/version.ts";
import {
  cleanTarget,
  copyStaticFiles,
  listAssetsForCache,
  parseArgs,
  validateTargetConfig,
} from "../esbuild/mod.ts";
import {
  applyDefines,
  buildBundleOptions,
} from "./bundle.ts";
import { carregarConfigDenoBuild, } from "./config.ts";
import type {
  DenoBuildOptions,
  DenoBuildResult,
  DenoBundleGlobalConfig,
  DenoBundleTargetConfig,
} from "./types.ts";

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
): Promise<DenoBuildResult> {
  validateTargetConfig(targetName, config,);

  console.log(`\n${"=".repeat(60,)}`,);
  console.log(`🎯 PROCESSANDO ALVO: ${targetName.toUpperCase()}`,);
  console.log(`${"=".repeat(60,)}`,);

  // 1. Limpar diretório de saída
  if (config.clean && config.clean.length > 0) {
    if (config.distdir) {
      await cleanTarget(config.distdir, config.clean,);
    } else {
      console.warn(
        `⚠️ 'clean' configurado mas 'distdir' ausente. Pulando limpeza.`,
      );
    }
  }

  // 2. Copiar arquivos estáticos
  await copyStaticFiles(config, appVersion,);

  // 3. Preparar defines
  const defines: Record<string, string> = {
    ...config.define,
    __APP_VERSION__: JSON.stringify(`v${appVersion}`,),
  };

  if (targetName === "sw" && listAssetsFn && config.distdir) {
    const assets = await listAssetsFn(config.distdir,);
    defines["__GENERATED_ASSETS__"] = JSON.stringify(assets,);
    console.log(`📋 ${assets.length} assets listados para cache do SW`,);
  }

  // 4. Executar bundle
  console.log(`🔨 Compilando com Deno.bundle...`,);
  const startTime = performance.now();
  const bundleOptions = buildBundleOptions(config,);
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
      durationMs: Number((performance.now() - startTime).toFixed(0,)),
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
    const dir = outputFile.path.substring(
      0,
      outputFile.path.lastIndexOf("/",),
    );
    if (dir) {
      await ensureDir(dir,);
    }

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

  const durationMs = Number((performance.now() - startTime).toFixed(0,));
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
 * const resultados = await executarDenoBuild({
 *   ui: { entryPoints: ["main.tsx"], distdir: "dist", srcdir: "src", ... }
 * });
 *
 * // Ou usando opções completas:
 * const resultados = await executarDenoBuild({ targets: ["ui"], noversion: true });
 * ```
 */
export async function executarDenoBuild(
  configOuOpcoes?: DenoBuildOptions | DenoBundleGlobalConfig,
): Promise<DenoBuildResult[]> {
  let configs: DenoBundleGlobalConfig;
  let opcoes: DenoBuildOptions | undefined;

  if (
    configOuOpcoes &&
    typeof configOuOpcoes === "object" &&
    !("caminhoConfig" in configOuOpcoes) &&
    !("targets" in configOuOpcoes) &&
    !("baseDir" in configOuOpcoes) &&
    !("config" in configOuOpcoes) &&
    !("silencioso" in configOuOpcoes) &&
    !("noversion" in configOuOpcoes) &&
    !("versionPaths" in configOuOpcoes) &&
    !("forcepackagesversion" in configOuOpcoes) &&
    !("denoJsoncPath" in configOuOpcoes)
  ) {
    configs = configOuOpcoes as DenoBundleGlobalConfig;
  } else {
    opcoes = configOuOpcoes as DenoBuildOptions | undefined;
    if (opcoes?.config) {
      configs = opcoes.config;
    } else {
      const baseDir = opcoes?.baseDir ?? ".";
      configs = await carregarConfigDenoBuild(opcoes?.caminhoConfig, baseDir);
    }
  }

  const baseDir = opcoes?.baseDir ?? ".";
  const rawArgs = [
    ...(opcoes?.targets ?? []),
    ...(opcoes?.noversion ? ["noversion"] : []),
  ];

  const { targets, globalNoVersion, watchTarget } = parseArgs(rawArgs, configs);

  if (watchTarget) {
    console.warn("⚠️ Modo Watch não é suportado pela API Deno.bundle nativa.");
    return [];
  }

  if (targets.length === 0) {
    return [];
  }

  const denoJsoncPath = opcoes?.denoJsoncPath ?? join(baseDir, "deno.jsonc");
  const finalVersion = await updateProjectVersion({
    denoJsonPath: denoJsoncPath,
    baseDir,
    noversion: globalNoVersion || (opcoes?.noversion ?? false),
    versionPaths: opcoes?.versionPaths,
    forcepackagesversion: opcoes?.forcepackagesversion,
  });

  const resultados: DenoBuildResult[] = [];

  for (const targetName of targets) {
    const targetConfig = configs[targetName];
    if (!targetConfig) {
      console.warn(`⚠️ Alvo '${targetName}' não encontrado na configuração. Pulando.`);
      continue;
    }

    const listFn = targetName === "sw" ? listAssetsForCache : undefined;
    const res = await processBundleTarget(
      targetName,
      targetConfig,
      finalVersion,
      listFn,
    );
    resultados.push(res);
  }

  return resultados;
}
