> **INSTRUÇÃO PARA A IA:** 
> O texto abaixo contém o código e testes da biblioteca @vanaware/buildit
> Cada arquivo começa com um título indicando seu caminho relativo exato (ex: `## Arquivo: src/main.ts`).
> Sempre que sugerir alterações, indique claramente qual arquivo deve ser modificado com base nesses caminhos e forneça o novo código completo do arquivo.

---

# Contexto Exportado do Projeto BuildIt - Modo: UTILS

Gerado automaticamente em: 2026-09-25T17:27:51.139Z

---

## Arquivo: `esbuild.ts`

```ts
/// <reference lib="deno.ns" />

/**
 * @file esbuild.ts
 * @description CLI do orquestrador de build baseado em esbuild nativo.
 * Delega a execução para a biblioteca @vanaware/buildit/build
 * e carrega as configurações declarativas de esbuild.jsonc.
 */

import { esBuildCli, } from "./packages/utils/src/esbuild/cli.ts";

if (import.meta.main) {
  const cli = esBuildCli();
  await cli.parse(Deno.args,);
}

```

---

## Arquivo: `export.ts`

```ts
/// <reference lib="deno.ns" />

/**
 * @file export.ts
 * @description CLI de consolidação de contexto para IAs no projeto BuildIt.
 * Delega a execução e regras para a biblioteca @vanaware/buildit/export
 * e carrega as configurações declarativas de export.jsonc.
 */

import { exportCli, } from "./packages/utils/src/export/cli.ts";

if (import.meta.main) {
  const cli = exportCli();
  await cli.parse(Deno.args,);
}

```

---

## Arquivo: `packages/utils/deno.jsonc`

```json
{
  "name": "@vanaware/buildit",
  "version": "0.3.14",
  "license": "MIT",
  "publish": {
    "include": [
      "src/**/*.ts",
      "schema/**/*.json",
      "README.md",
      "LICENSE"
    ],
    "exclude": [
      "**/*_test.ts",
      "**/*.test.ts",
      "tests/"
    ]
  },
  "compilerOptions": {
    "lib": [
      "deno.window",
      "deno.unstable"
    ]
  },
  "imports": {
    "@cliffy/command": "jsr:@cliffy/command@^1.3.1",
    "esbuild": "npm:esbuild@^0.28.2",
    "@deno/esbuild-plugin": "jsr:@deno/esbuild-plugin@^1.2.1"
  },
  "tasks": {
    "test": "deno test --allow-env --allow-net --allow-read --allow-write tests/",
    "check": "deno check src/**/*.{ts,tsx} tests/**/*.ts",
    "lint:doc": "deno doc --lint src/**/*.ts",
    "tests": "deno task check && deno task test"
  },
  "exports": {
    ".": "./src/mod.ts",
    "./esbuild": "./src/esbuild/mod.ts",
    "./esbuild/cli": "./src/esbuild/cli.ts",
    "./watch": "./src/watch/mod.ts",
    "./watch/cli": "./src/watch/cli.ts",
    "./export": "./src/export/mod.ts",
    "./export/cli": "./src/export/cli.ts",
    "./denobuild": "./src/denobuild/mod.ts",
    "./denobuild/cli": "./src/denobuild/cli.ts",
    "./sanitize-version": "./src/version/sanitize/mod.ts",
    "./sanitize-version/cli": "./src/version/sanitize/cli.ts",
    "./tag-version": "./src/version/tag/mod.ts",
    "./tag-version/cli": "./src/version/tag/cli.ts"
  }
}

```

---

## Arquivo: `packages/utils/src/denobuild/bundle.ts`

````ts
/**
 * @module @vanaware/buildit/denobuild/bundle
 * @description Funções utilitárias e geradores de opções para a API nativa Deno.bundle.
 */

import { resolveEntryPoints, resolveOutputPaths, } from "../tools/paths.ts";
import type { DenoBundleTargetConfig, } from "../tools/interfaces.ts";

/**
 * Aplica substituição de definições (defines) em uma string de código em memória.
 *
 * @param text Conteúdo original do código-fonte
 * @param defines Mapa de identificadores e valores substitutos
 * @returns Código com as substituições aplicadas
 *
 * @example
 * ```typescript
 * applyDefines("console.log(__APP_VERSION__)", { "__APP_VERSION__": '"1.0.0"' });
 * ```
 */
export function applyDefines(
  text: string,
  defines: Record<string, string>,
): string {
  let result = text;
  for (const [key, value,] of Object.entries(defines,)) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&",);
    const regex = new RegExp(escapedKey, "g",);
    result = result.replace(regex, value,);
  }
  return result;
}

/**
 * Constrói o objeto de opções aceito pela API `Deno.bundle`.
 *
 * @param config Configuração do alvo de compilação
 * @returns Objeto `Deno.bundle.Options` pronto para execução
 *
 * @example
 * ```typescript
 * const options = buildBundleOptions(config);
 * ```
 */
export function buildBundleOptions(
  config: DenoBundleTargetConfig,
): Deno.bundle.Options {
  const resolvedEntryPoints = resolveEntryPoints(
    config.srcdir,
    config.entryPoints,
  );

  const { outfile, outdir, } = resolveOutputPaths(config,);

  const options: Deno.bundle.Options = {
    entrypoints: resolvedEntryPoints,
    write: false,
  };

  if (outfile) {
    options.outputPath = outfile;
  } else if (outdir) {
    options.outputDir = outdir;
  }

  if (config.platform !== undefined) options.platform = config.platform;
  if (config.format !== undefined) options.format = config.format;
  if (config.minify !== undefined) options.minify = config.minify;
  if (config.keepNames !== undefined) options.keepNames = config.keepNames;
  if (config.sourcemap !== undefined) options.sourcemap = config.sourcemap;
  if (config.codeSplitting !== undefined) {
    options.codeSplitting = config.codeSplitting;
  }
  if (config.inlineImports !== undefined) {
    options.inlineImports = config.inlineImports;
  }
  if (config.packages !== undefined) options.packages = config.packages;
  if (config.external !== undefined) options.external = config.external;

  return options;
}

````

---

## Arquivo: `packages/utils/src/denobuild/cli.ts`

```ts
/**
 * @module @vanaware/buildit/denobuild/cli
 * @description Ponto de entrada CLI para o orquestrador denobuild baseado em Deno.bundle API.
 */

import { Command, } from "@cliffy/command";
import { readProjectVersion, } from "../tools/version.ts";
import { carregarConfigDenoBuild, } from "./config.ts";
import { denoBuild, } from "./engine.ts";
import { APP_VERSION, } from "../version.ts";
import { findDenoConfig, } from "../tools/paths.ts";
import { parseArgs, } from "../tools/cli-flags.ts";

/**
 * Executa o CLI do orquestrador de build baseado em Deno.bundle.
 */
export function denoBuildCli() {
  return new Command()
    .name("denobuild",)
    .description("BuildIt Deno.bundle Orchestrator",)
    .version(APP_VERSION,)
    .option("-c, --app-config [file:string]", "Arquivo de configuração", {
      default: "denobuild.jsonc",
      env: { prefix: "DENOBUILD_", },
    },)
    .option("-b, --base-dir [dir:string]", "Diretório Base", {
      default: "./",
      env: true,
    },)
    .option("-d, --deno-config [file:string]", "Configuração do Deno", {
      default: findDenoConfig() ?? "deno.jsonc",
      env: true,
    },)
    .option(
      "-n, --noversion",
      "Desabilita o incremento automático de versão",
      {
        default: false,
      },
    )
    .arguments("[targets...:string]", ["Alvos de build",],)
    .action(async function (options, ...args): Promise<void> {
      const startTime = performance.now();
      const baseDir = options.baseDir as string || ".";
      const configPath = options.appConfig as string;
      const loaded = await carregarConfigDenoBuild(configPath, baseDir,);
      const configs = loaded.targets;

      const { targets, globalNoVersion, } = parseArgs(
        args,
        { noversion: Boolean(options.noversion,), },
      );

      console.log(
        "\n🚀 Iniciando Orquestrador de Build BuildIt (denobuild / Deno.bundle API)",
      );
      console.log(`   📦 Motor: Deno.bundle (nativo, --unstable-bundle)`,);
      console.log(`🔒 Noversion: ${globalNoVersion}\n`,);

      try {
        await denoBuild({
          config: configs,
          targets: targets.length > 0 ? targets : undefined,
          baseDir,
          noversion: globalNoVersion,
          versionPaths: loaded.versionPaths,
          forcepackagesversion: loaded.forcepackagesversion,
          denoJsoncPath: options.denoConfig as string,
        },);

        console.log(`\n${"=".repeat(60,)}`,);
        console.log(`🎉 ORQUESTRAÇÃO DENOBUILD CONCLUÍDA COM SUCESSO!`,);
        console.log(`${"=".repeat(60,)}`,);
      } catch (error) {
        console.error("\n🛑 Pipeline de build falhou:", error,);
        Deno.exit(1,);
      } finally {
        const elapsed = (performance.now() - startTime).toFixed(0,);
        console.log(`\n⏱️ Tempo total: ${elapsed}ms\n`,);
      }
    },);
}

if (import.meta.main) {
  const cli = denoBuildCli();
  await cli.parse(Deno.args,);
}

```

---

## Arquivo: `packages/utils/src/denobuild/config.ts`

````ts
/**
 * @module @vanaware/buildit/denobuild/config
 * @description Carregamento de configurações externas a partir de `denobuild.jsonc`
 * e fallback para configurações padrão do projeto BuildIt.
 */

import { loadConfig, } from "../tools/jsonc.ts";
import type {
  DenoBuildConfigFile,
  DenoBuildConfigResult,
  DenoBundleGlobalConfig,
} from "../tools/interfaces.ts";

/**
 * Configuração padrão para o motor Deno.bundle no projeto BuildIt.
 */
export const CONFIGURACOES_PADRAO: DenoBundleGlobalConfig = {
  ui: {
    mode: "build",
    default: true,
    srcdir: "packages/ui/src",
    distdir: "packages/server/build/dist",
    copyFiles: [
      { basedir: "packages/ui/public", },
      { basedir: "packages/ui/src", includes: ["index.html",], },
    ],
    clean: {
      includes: ["*",],
    },
    entryPoints: ["main.tsx",],
    platform: "browser",
    format: "esm",
    minify: false,
    sourcemap: "linked",
    keepNames: true,
    codeSplitting: false,
    packages: "bundle",
    inlineImports: true,
  },
};

/**
 * Carrega as configurações de alvos para o motor Deno.bundle a partir de um arquivo JSONC externo
 * (ex: `denobuild.jsonc` ou `denobuild.json`).
 *
 * Se o arquivo não for encontrado ou não contiver alvos válidos, retorna o objeto padrão `CONFIGURACOES_PADRAO`.
 *
 * @param caminhoConfig Caminho opcional do arquivo de configuração
 * @param baseDir Diretório base para resolução de arquivos relativos
 * @returns Configuração carregada com alvos e opções globais
 *
 * @example
 * ```typescript
 * const config = await carregarConfigDenoBuild("denobuild.jsonc");
 * console.log(Object.keys(config.targets)); // ["ui"]
 * ```
 */
export async function carregarConfigDenoBuild(
  caminhoConfig?: string,
  baseDir: string = ".",
): Promise<DenoBuildConfigResult> {
  const parsed = await loadConfig<DenoBuildConfigFile>(
    "denobuild",
    caminhoConfig,
    baseDir,
  );

  const result: DenoBuildConfigResult = {
    targets: { ...CONFIGURACOES_PADRAO, },
  };

  if (parsed) {
    result.versionPaths = parsed.versionPaths;
    result.forcepackagesversion = parsed.forcepackagesversion;

    // Caso Único: Objeto possui a chave "targets"
    if (parsed.targets && typeof parsed.targets === "object") {
      result.targets = parsed.targets;
      return result;
    }
  }

  return result;
}

````

---

## Arquivo: `packages/utils/src/denobuild/engine.ts`

````ts
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
  await copyStaticFiles(
    resolvedConfig,
    appVersion,
    baseDir,
    resolvedConfig.distdir,
  );

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
    await ensureDirForFile(outputFile.path,);

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

````

---

## Arquivo: `packages/utils/src/denobuild/mod.ts`

````ts
/**
 * @module @vanaware/buildit/denobuild
 * @description Orquestrador e biblioteca de compilação utilizando a API nativa `Deno.bundle` (--unstable-bundle).
 *
 * Suporta configuração declarativa externa via `denobuild.jsonc`, pré e pós-processamento,
 * injeção de defines em memória, cópia de ativos e geração de bundles ESM de alta performance.
 *
 * @example
 * ```typescript
 * import { denoBuild } from "@vanaware/buildit/denobuild";
 *
 * const resultados = await denoBuild({
 *   caminhoConfig: "denobuild.jsonc",
 *   targets: ["ui"],
 *   noversion: true,
 * });
 * ```
 */

export { denoBuild, } from "./engine.ts";
export { CONFIGURACOES_PADRAO, } from "./config.ts";

export type {
  DenoBuildOptions,
  DenoBuildResult,
  DenoBundleGlobalConfig,
  DenoBundleTargetConfig,
} from "../tools/interfaces.ts";

````

---

## Arquivo: `packages/utils/src/esbuild/cli.ts`

```ts
/**
 * @module @vanaware/buildit/esbuild/cli
 * @description Ponto de entrada CLI para o orquestrador de compilação baseado em esbuild.
 */

import { Command, } from "@cliffy/command";
import { carregarConfigEsbuild, } from "./config.ts";
import { esBuild, } from "./engine.ts";
import { APP_VERSION, } from "../version.ts";
import { findDenoConfig, } from "../tools/paths.ts";
import { parseArgs, } from "../tools/cli-flags.ts";

/**
 * Executa o CLI do orquestrador de build baseado em esbuild.
 */
export function esBuildCli() {
  return new Command()
    .name("esbuild",)
    .description("BuildIt esbuild Orchestrator",)
    .version(APP_VERSION,)
    .option("-c, --app-config [file:string]", "Arquivo de configuração", {
      default: "esbuild.jsonc",
      env: { prefix: "ESBUILD_", },
    },)
    .option("-b, --base-dir [dir:string]", "Diretório Base", {
      default: "./",
      env: true,
    },)
    .option("-d, --deno-config [file:string]", "Configuração do Deno", {
      default: findDenoConfig() ?? "deno.jsonc",
      env: true,
    },)
    .option(
      "-n, --noversion",
      "Desabilita o incremento automático de versão",
      {
        default: false,
      },
    )
    .arguments("[targets...:string]", ["Alvos de build",],)
    .action(async function (options, ...args): Promise<void> {
      const startTime = performance.now();
      const baseDir = options.baseDir as string || ".";
      const configPath = options.appConfig as string;
      const loaded = await carregarConfigEsbuild(configPath, baseDir,);
      const configs = loaded.targets;

      const { targets, globalNoVersion, } = parseArgs(
        args,
        { noversion: Boolean(options.noversion,), },
      );

      const DENO_JSONC_PATH = options.denoConfig as string || "deno.jsonc";

      console.log(
        "\n🚀 Iniciando Orquestrador de Build BuildIt (esbuild nativo + @deno/esbuild-plugin)",
      );
      console.log(`🔒 Noversion: ${globalNoVersion}\n`,);

      try {
        await esBuild({
          config: configs,
          targets: targets.length > 0 ? targets : undefined,
          noversion: globalNoVersion,
          versionPaths: loaded.versionPaths,
          forcepackagesversion: loaded.forcepackagesversion,
          denoJsoncPath: DENO_JSONC_PATH,
          baseDir,
          silencioso: false,
        },);

        console.log(`\n${"=".repeat(60,)}`,);
        console.log(`🎉 ORQUESTRAÇÃO ESBUILD CONCLUÍDA COM SUCESSO!`,);
        console.log(`${"=".repeat(60,)}`,);
      } catch (error) {
        console.error("\n🛑 Pipeline de build falhou:", error,);
        Deno.exit(1,);
      } finally {
        const elapsed = (performance.now() - startTime).toFixed(0,);
        console.log(`\n⏱️ Tempo total: ${elapsed}ms\n`,);
      }
    },);
}

if (import.meta.main) {
  const cli = esBuildCli();
  await cli.parse(Deno.args,);
}

```

---

## Arquivo: `packages/utils/src/esbuild/config.ts`

```ts
/**
 * @module @vanaware/buildit/esbuild/config
 * @description Carregamento de configurações externas a partir de `esbuild.jsonc`
 * e fallback para configurações padrão do projeto BuildIt.
 */

import { loadConfig, } from "../tools/jsonc.ts";
import type {
  EsbuildConfigFile,
  EsbuildConfigResult,
  GlobalTargetConfig,
} from "../tools/interfaces.ts";

/**
 * Configuração padrão para o motor esbuild no projeto BuildIt.
 */
export const CONFIGURACOES_PADRAO: GlobalTargetConfig = {
  ui: {
    default: true,
    srcdir: "packages/ui/src",
    distdir: "packages/server/build/dist",
    copyFiles: [
      { basedir: "packages/ui/public", },
      { basedir: "packages/ui/src", includes: ["index.html",], },
    ],
    clean: {
      includes: ["*",],
    },
    entryPoints: ["main.tsx",],
    platform: "browser",
    format: "esm",
    bundle: true,
    minify: false,
    sourcemap: "linked",
    conditions: ["browser",],
    jsx: "automatic",
    jsxImportSource: "preact",
    metafile: true,
    write: true,
    legalComments: "eof",
    keepNames: true,
    splitting: false,
  },
};

/**
 * Carrega as configurações de alvos para o motor esbuild a partir de um arquivo JSONC externo
 * (ex: `esbuild.jsonc` ou `esbuild.json`).
 *
 * Se o arquivo não for encontrado ou não contiver alvos válidos, retorna o objeto padrão `CONFIGURACOES_PADRAO`.
 *
 * @param caminhoConfig Caminho opcional do arquivo de configuração
 * @param baseDir Diretório base para resolução de arquivos relativos
 * @returns Configuração carregada com alvos e opções globais
 */
export async function carregarConfigEsbuild(
  caminhoConfig?: string,
  baseDir: string = ".",
): Promise<EsbuildConfigResult> {
  const parsed = await loadConfig<EsbuildConfigFile>(
    "esbuild",
    caminhoConfig,
    baseDir,
  );

  const result: EsbuildConfigResult = {
    targets: { ...CONFIGURACOES_PADRAO, },
  };

  if (parsed) {
    result.versionPaths = parsed.versionPaths;
    result.forcepackagesversion = parsed.forcepackagesversion;

    // Caso Único: Objeto possui a chave "targets"
    if (parsed.targets && typeof parsed.targets === "object") {
      result.targets = parsed.targets;
      return result;
    }
  }

  return result;
}

```

---

## Arquivo: `packages/utils/src/esbuild/engine.ts`

```ts
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
  resolveWithBase,
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
import { resolverOrdemTargets, } from "../tools/targets.ts";

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
  const targets = opcoes.targets;
  const denoJsoncPath = opcoes.denoJsoncPath ?? join(baseDir, "deno.jsonc",);

  const finalVersion = await updateProjectVersion({
    denoJsonPath: denoJsoncPath,
    baseDir,
    noversion: opcoes.noversion ?? false,
    versionPaths: opcoes.versionPaths,
    forcepackagesversion: opcoes.forcepackagesversion,
  },);

  // Garante estritamente que a ordem de execução siga a declaração na configuração
  const targetsParaExecutar = resolverOrdemTargets(configs, targets,);

  if (targetsParaExecutar.length === 0) {
    return [];
  }

  const resultados: EsbuildResult[] = [];

  try {
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
        baseDir,
      );
      const durationMs = Number((performance.now() - startTime).toFixed(0,),);

      resultados.push({
        target: targetName,
        success: true,
        durationMs,
      },);
    }
  } finally {
    // ✨ GARANTIA DE ENCERRAMENTO: No Deno, o processo do esbuild (npm) precisa ser parado explicitamente
    try {
      await esbuild.stop();
    } catch {
      // Ignora erros no stop()
    }
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
 * @param baseDir Diretório base do projeto para resolução de caminhos
 */
export async function processTarget(
  targetName: string,
  config: TargetConfig,
  appVersion: string,
  // deno-lint-ignore no-explicit-any
  esbuildBuildFn: (options: any,) => Promise<any>,
  listAssetsFn?: (distDir: string,) => Promise<string[]>,
  baseDir: string = ".",
): Promise<void> {
  const resolvedConfig: TargetConfig = {
    ...config,
    srcdir: resolveWithBase(config.srcdir, baseDir,),
    distdir: resolveWithBase(config.distdir, baseDir,),
    publicdir: resolveWithBase(config.publicdir, baseDir,),
  };

  // 🔥 VALIDAÇÃO FAIL-FAST: Verifica configuração ANTES de qualquer operação
  validateTargetConfig(targetName, resolvedConfig,);

  console.log(`\n${"=".repeat(60,)}`,);
  console.log(`🎯 PROCESSANDO ALVO: ${targetName.toUpperCase()}`,);
  console.log(`${"=".repeat(60,)}`,);

  if (resolvedConfig.clean) {
    // 🔥 CORREÇÃO: Só limpa se distdir existe
    if (resolvedConfig.distdir) {
      await cleanTarget(resolvedConfig.distdir, resolvedConfig.clean,);
    } else {
      console.warn(
        `⚠️ 'clean' configurado mas 'distdir' ausente. Pulando limpeza.`,
      );
    }
  }

  await copyStaticFiles(
    resolvedConfig,
    appVersion,
    baseDir,
    resolvedConfig.distdir,
  );

  const esbuildOptions = await buildEsbuildOptions(
    targetName,
    resolvedConfig,
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
    if (resolvedConfig.metafile && result.metafile && resolvedConfig.distdir) {
      const metafilePath = join(
        resolvedConfig.distdir,
        `${targetName}-metafile.json`,
      );
      await Deno.writeTextFile(
        metafilePath,
        JSON.stringify(result.metafile, null, 2,),
      );
      console.log(`📊 Metafile gerado: ${metafilePath}`,);
    }
  } catch (error) {
    if (
      error instanceof TypeError &&
      (error as unknown as { message?: string }).message?.includes("unref",)
    ) {
      console.error(
        `❌ Erro fatal no build [${targetName}]: Falha ao iniciar processo do esbuild.`,
      );
      console.error(
        `💡 DICA: O esbuild (npm) no Deno requer a permissão '--allow-run'.`,
      );
      console.error(
        `👉 Tente executar 'deno task build' ou adicione '--allow-run' ao seu comando.`,
      );
    } else {
      console.error(`❌ Erro fatal no build [${targetName}]:`, error,);
    }
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

```

---

## Arquivo: `packages/utils/src/esbuild/mod.ts`

```ts
// ============================================================================
// 📦 RE-EXPORTS DE MÓDULOS ESPECÍFICOS
// ============================================================================
export { esBuild, } from "./engine.ts";
export { CONFIGURACOES_PADRAO, } from "./config.ts";

export type {
  EsbuildGlobalConfig,
  EsbuildOptions,
  EsbuildResult,
  EsbuildTargetConfig,
} from "../tools/interfaces.ts";

```

---

## Arquivo: `packages/utils/src/export/cli.ts`

```ts
/**
 * @module @vanaware/buildit/export/cli
 * @description Ponto de entrada para execução do exportador de contexto via linha de comando (CLI).
 */
import { readProjectVersion, } from "../tools/version.ts";
import { exportEngine, } from "./engine.ts";
import { APP_VERSION, } from "../version.ts";
import { findDenoConfig, } from "../tools/paths.ts";
import { carregarConfigExport, } from "./config.ts";

import { Command, } from "@cliffy/command";

/**
 * Executa o CLI do exportador de contexto a partir dos argumentos da linha de comando.
 */
export function exportCli() {
  return new Command()
    .name("export",)
    .description("BuildIt Context Exporter",)
    .version(APP_VERSION,)
    .option("-c, --app-config [file:string]", "Arquivo de configuração", {
      default: "export.jsonc",
      env: { prefix: "EXPORT_", },
    },)
    .option("-b, --base-dir [dir:string]", "Diretório Base", {
      default: "./",
      env: true,
    },)
    .option("-d, --deno-config [file:string]", "Configuração do Deno", {
      default: findDenoConfig() ?? "deno.jsonc",
      env: true,
    },)
    .arguments("[modos...:string]", ["Modos de exportação",],)
    .action(async function (options, ...args): Promise<void> {
      const startTime = performance.now();
      const baseDir = (options.baseDir as string) || ".";
      const configs = await carregarConfigExport(
        options.appConfig as string,
        baseDir,
      );
      const modos = args.length > 0 ? (args as string[]) : undefined;

      console.log("\n🚀 Iniciando Exportação de Contexto BuildIt",);
      try {
        await exportEngine({
          config: configs,
          modos,
          baseDir,
          versaoApp: await readProjectVersion(
            options.denoConfig as string,
            baseDir,
          ),
          denoJsoncPath: options.denoConfig as string,
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
    },);
}

if (import.meta.main) {
  const cli = exportCli();
  await cli.parse(Deno.args,);
}

```

---

## Arquivo: `packages/utils/src/export/config.ts`

````ts
/**
 * @module @vanaware/buildit/export/config
 * @description Carregamento de configurações externas a partir de `export.jsonc`
 * e fallback para configurações padrão do projeto BuildIt.
 */

import { loadConfig, } from "../tools/jsonc.ts";
import type { ExportConfig, ExportConfigFile, } from "../tools/interfaces.ts";

/**
 * Dicionário com as configurações padrão dos modos de exportação do BuildIt.
 * Utilizado quando não há arquivo de configuração externo ou como referência.
 */
export const CONFIGURACOES_PADRAO: Record<string, ExportConfig> = {
  ui: {
    arquivoSaida: "snapshots/ui.md",
    includes: [
      "packages/ui/{src,public,tests,docs}/**/*.{tsx,jsx,js,ts,css,html,manifest,json,jsonc,md}",
      "packages/ui/{build.ts,deno.json,deno.jsonc,readme.md}",
    ],
    excludes: [
      "**/node_modules/**",
      "**/.git/**",
    ],
    incluiVersao: true,
    instrucaoCustomizada:
      "O texto abaixo contém os arquivos de CÓDIGO FONTE principais da aplicação exemplo (UI).",
    default: true,
  },
  docs: {
    arquivoSaida: "snapshots/docs.md",
    includes: [
      "docs/**/*.{md,txt}",
      "{readme.md,readme,license,license.md,license.txt,.tool-versions}",
    ],
    excludes: [],
    incluiVersao: false,
    instrucaoCustomizada:
      "O texto abaixo contém a DOCUMENTAÇÃO e diretrizes arquiteturais do projeto.",
    default: false,
  },
  server: {
    arquivoSaida: "snapshots/server.md",
    includes: [
      "packages/server/{src,tests,docs}/**/*.{tsx,jsx,js,ts,css,html,json,jsonc,yaml,yml,md}",
      "packages/server/{deno.json,deno.jsonc,readme.md}",
      ".github/workflows/**/*.{yaml,yml}",
    ],
    excludes: [
      "**/node_modules/**",
      "**/.git/**",
    ],
    incluiVersao: false,
    instrucaoCustomizada:
      "O texto abaixo contém os arquivos de configuração e execução do SERVIDOR @vanaware/server e CI/CD.",
    default: true,
  },
  utils: {
    arquivoSaida: "snapshots/utils.md",
    includes: [
      "packages/utils/{src,tests,docs}/**/*.{tsx,jsx,js,ts,json,jsonc,md}",
      "packages/utils/{deno.json,deno.jsonc,readme.md}",
      "{export.ts,esbuild.ts,build.ts}",
    ],
    excludes: [
      "**/node_modules/**",
      "**/.git/**",
    ],
    incluiVersao: false,
    instrucaoCustomizada:
      "O texto abaixo contém o código e testes da biblioteca @vanaware/buildit",
    default: true,
  },
};

/**
 * Carrega a configuração de exportação a partir de um arquivo JSONC externo
 * (ex: `export.jsonc` ou `export.json`). Se o arquivo não existir, retorna
 * as configurações padrão embutidas.
 *
 * @param caminhoConfig Caminho opcional para o arquivo de configuração
 * @param baseDir Diretório base para resolução do arquivo relativo
 * @returns Dicionário mapeando o nome de cada modo para sua respectiva `ExportConfig`
 *
 * @example
 * ```typescript
 * const configs = await carregarConfigExport("export.jsonc");
 * console.log(Object.keys(configs)); // ["ui", "docs", "server", "utils"]
 * ```
 */
export async function carregarConfigExport(
  caminhoConfig?: string,
  baseDir: string = ".",
): Promise<Record<string, ExportConfig>> {
  const parsed = await loadConfig<ExportConfigFile>(
    "export",
    caminhoConfig,
    baseDir,
  );

  if (parsed) {
    if (
      "modos" in parsed &&
      typeof (parsed as ExportConfigFile).modos === "object"
    ) {
      const rootProjeto = (parsed as ExportConfigFile).projeto;
      const rootCabecalho = (parsed as ExportConfigFile).cabecalho;
      const modos = (parsed as ExportConfigFile).modos;

      if (rootProjeto !== undefined || rootCabecalho !== undefined) {
        for (const [modoKey, modoConfig,] of Object.entries(modos,)) {
          modos[modoKey] = {
            ...(rootProjeto !== undefined && modoConfig.projeto === undefined
              ? { projeto: rootProjeto, }
              : {}),
            ...(rootCabecalho !== undefined &&
                modoConfig.cabecalho === undefined
              ? { cabecalho: rootCabecalho, }
              : {}),
            ...modoConfig,
          };
        }
      }

      return modos;
    }
    console.warn(
      "⚠️ Arquivo de configuração de exportação inválido: chave 'modos' não encontrada.",
    );
    return {};
  }

  return { ...CONFIGURACOES_PADRAO, };
}

````

---

## Arquivo: `packages/utils/src/export/engine.ts`

````ts
/**
 * @module @vanaware/buildit/export/engine
 * @description Mecanismo de varredura otimizada de diretórios (expandGlob), filtragem e streaming de snapshots Markdown.
 */

import { expandGlob, } from "@std/fs";
import { join, relative, } from "@std/path";
import { readProjectVersion, } from "../tools/version.ts";
import {
  correspondeGlobs,
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
 * Utiliza `expandGlob` para varredura otimizada direta.
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

````

---

## Arquivo: `packages/utils/src/export/formatter.ts`

`````ts
/**
 * @module @vanaware/buildit/export/formatter
 * @description Funções utilitárias puras para normalização de caminhos,
 * mapeamento de extensões, avaliação de padrões glob e formatação Markdown com proteção contra crases.
 */

import { globToRegExp, } from "@std/path";
import type { ExportConfig, } from "../tools/interfaces.ts";

/**
 * Normaliza um caminho de arquivo para comparação consistente entre sistemas operacionais.
 * - Converte barras invertidas Windows (\) em barras normais (/)
 * - Converte todos os caracteres para minúsculas
 *
 * @param caminho Caminho relativo ou absoluto a ser normalizado
 * @returns Caminho normalizado em minúsculas com barras normais
 *
 * @example
 * ```typescript
 * normalizarCaminho("src\\components\\App.tsx"); // "src/components/app.tsx"
 * ```
 */
export function normalizarCaminho(caminho: string,): string {
  return caminho.replace(/\\/g, "/",).toLowerCase();
}

/**
 * Calcula a quantidade mínima de crases necessárias para envolver um texto
 * em um bloco de código markdown, evitando conflitos quando o próprio conteúdo
 * possui crases consecutivas.
 *
 * @param texto Conteúdo textual do arquivo
 * @returns String contendo 3 ou mais crases (ex: "```", "````")
 *
 * @example
 * ```typescript
 * calcularCraseWrapper("console.log('oi');"); // "```"
 * calcularCraseWrapper("```markdown```"); // "````"
 * ```
 */
export function calcularCraseWrapper(texto: string,): string {
  const matches = texto.match(/`+/g,);
  if (!matches) return "```";
  const maiorSequencia = Math.max(...matches.map((m,) => m.length),);
  const tamanhoNecessario = Math.max(3, maiorSequencia + 1,);
  return "`".repeat(tamanhoNecessario,);
}

/**
 * Mapeia extensões de arquivo para a sintaxe de highlight correspondente do Markdown.
 *
 * @param caminhoRelativo Caminho relativo do arquivo
 * @returns Nome da linguagem para bloco de código Markdown (ex: "json", "bash")
 *
 * @example
 * ```typescript
 * mapearExtensao("deno.jsonc"); // "json"
 * mapearExtensao("script.sh"); // "bash"
 * ```
 */
export function mapearExtensao(caminhoRelativo: string,): string {
  const ext = caminhoRelativo.split(".",).pop()?.toLowerCase() || "";
  const mapa: Record<string, string> = {
    manifest: "json",
    jsonc: "json",
    yml: "yaml",
    sh: "bash",
    env: "properties",
  };

  if (caminhoRelativo.includes(".env",)) return "properties";

  return mapa[ext] || ext;
}

/**
 * Testa se um caminho corresponde a algum dos padrões glob fornecidos.
 *
 * @param caminho Caminho relativo normalizado a ser testado
 * @param padroes Lista de padrões glob (suporta brace expansion e globstar)
 * @returns True se o caminho casar com ao menos um padrão
 */
export function correspondeGlobs(caminho: string, padroes: string[],): boolean {
  const caminhoNormalizado = caminho.replace(/\\/g, "/",);
  for (const padrao of padroes) {
    try {
      const reg = globToRegExp(padrao, {
        globstar: true,
        caseInsensitive: true,
      },);
      if (reg.test(caminhoNormalizado,) || reg.test(caminho,)) {
        return true;
      }
    } catch {
      // Ignora padrão inválido
    }
  }
  return false;
}

/**
 * Determina se um determinado arquivo deve ser incluído no snapshot baseado na configuração do modo.
 * Utiliza a sintaxe baseada em `includes` / `excludes` (globs).
 *
 * Regras aplicadas:
 * 1. Proteção anti-loop: sempre exclui arquivos dentro de pastas `exports/` ou `snapshots/`.
 * 2. Se casar com qualquer padrão de `excludes`, retorna `false`.
 * 3. Se casar com qualquer padrão de `includes`, retorna `true`.
 *
 * @param caminhoRelativo Caminho relativo do arquivo no repositório
 * @param config Configuração do modo de exportação
 * @returns True se o arquivo deve ser adicionado ao snapshot, false caso contrário
 *
 * @example
 * ```typescript
 * deveIncluirArquivo("packages/ui/src/main.tsx", config); // true
 * ```
 */
export function deveIncluirArquivo(
  caminhoRelativo: string,
  config: ExportConfig,
): boolean {
  const caminhoNormalizado = normalizarCaminho(caminhoRelativo,);

  // 🔒 Proteção anti-loop: nunca inclui arquivos gerados de exportação
  if (
    caminhoNormalizado.startsWith("exports/",) ||
    caminhoNormalizado.startsWith("snapshots/",)
  ) {
    return false;
  }

  // 🌟 MODO MODERNO: Padrões `includes` e `excludes` (globs com brace expansion)
  if (config.excludes && config.excludes.length > 0) {
    if (correspondeGlobs(caminhoRelativo, config.excludes,)) {
      return false;
    }
  }

  if (config.includes && config.includes.length > 0) {
    return correspondeGlobs(caminhoRelativo, config.includes,);
  }

  return false;
}

/**
 * Gera o cabeçalho estruturado do snapshot Markdown contendo metadados e diretrizes para a IA.
 *
 * @param config Configuração do modo
 * @param modo Nome identificador do modo
 * @param versaoApp Versão semântica atual do projeto
 * @returns Cabeçalho formatado em Markdown
 *
 * @example
 * ```typescript
 * const header = gerarCabecalho(config, "ui", "0.3.1");
 * ```
 */
export function gerarCabecalho(
  config: ExportConfig,
  modo: string,
  versaoApp: string,
): string {
  const versaoDisplay = config.incluiVersao ? `[v${versaoApp}] ` : "";
  const instrucao = config.instrucaoCustomizada ?? "Contexto do projeto.";
  const projeto = config.projeto ?? "BuildIt";

  const padraoCabecalho =
    `> Cada arquivo começa com um título indicando seu caminho relativo exato (ex: \`## Arquivo: src/main.ts\`).\n> Sempre que sugerir alterações, indique claramente qual arquivo deve ser modificado com base nesses caminhos e forneça o novo código completo do arquivo.`;

  const cabecalho = (config.cabecalho ?? padraoCabecalho).trim();

  return `> **INSTRUÇÃO PARA A IA:** 
> ${instrucao}
${cabecalho}

---

# Contexto Exportado do Projeto ${projeto} ${versaoDisplay}- Modo: ${modo.toUpperCase()}

Gerado automaticamente em: ${new Date().toISOString()}

---

`;
}

/**
 * Formata um arquivo individual com caminho relativo e bloco de código Markdown seguro.
 *
 * @param caminhoRelativo Caminho relativo do arquivo a ser exibido
 * @param conteudo Conteúdo de texto original do arquivo
 * @returns Bloco de código Markdown formatado com separador
 *
 * @example
 * ```typescript
 * formatarArquivoMarkdown("src/index.ts", "console.log('oi');");
 * ```
 */
export function formatarArquivoMarkdown(
  caminhoRelativo: string,
  conteudo: string,
): string {
  const extensaoMarkdown = mapearExtensao(caminhoRelativo,);
  const wrapperCrasis = calcularCraseWrapper(conteudo,);

  let resultado = `## Arquivo: \`${caminhoRelativo}\`\n\n`;
  resultado += `${wrapperCrasis}${extensaoMarkdown}\n`;
  resultado += conteudo;
  resultado += `\n${wrapperCrasis}\n\n---\n\n`;

  return resultado;
}

`````

---

## Arquivo: `packages/utils/src/export/mod.ts`

````ts
/**
 * @module @vanaware/buildit/export
 * @description Ferramenta e biblioteca para consolidação estruturada de código-fonte
 * e documentação de projetos em snapshots Markdown otimizados para consumo por IAs.
 *
 * Suporta configuração declarativa externa via `export.jsonc`, filtros por extensão,
 * proteção contra loops e execução via CLI ou programática.
 *
 * @example
 * ```typescript
 * import { exportEngine } from "@vanaware/buildit/export";
 *
 * const resultados = await exportEngine({
 *   caminhoConfig: "export.jsonc",
 *   modos: ["ui", "docs"],
 * });
 * ```
 */

export { exportEngine, } from "./engine.ts";
export { CONFIGURACOES_PADRAO, } from "./config.ts";

export type {
  ExportConfig,
  ExportOptions,
  ExportResult,
} from "../tools/interfaces.ts";

````

---

## Arquivo: `packages/utils/src/mod.ts`

```ts
/**
 * @vanaware/buildit
 * Entry point for shared utilities.
 */

export * from "./tools/mod.ts";

export { APP_VERSION as version, } from "./version.ts";

```

---

## Arquivo: `packages/utils/src/tools/cli-flags.ts`

```ts
import {
  DenoBundleGlobalConfig,
  GlobalTargetConfig,
  ParsedArgs,
} from "./interfaces.ts";

// ============================================================================
// 🎯 PARSING DE ARGUMENTOS CLI (pura, testável)
// ============================================================================
/**
 * Parseia os argumentos de linha de comando extraindo os alvos solicitados e detectando a flag 'noversion'.
 * A detecção de noversion ocorre no CLI (seja via flag ou argumento posicional).
 * A ordenação correta e resolução dos alvos padrão é delegada ao engine (via resolverOrdemTargets).
 *
 * @param args Lista de argumentos recebidos via linha de comando
 * @param optionsOrConfig Opções do CLI (ex: { noversion?: boolean }) ou configuração de alvos (retrocompatibilidade)
 * @returns Argumentos parseados contendo alvos informados e flag globalNoVersion
 */
export function parseArgs(
  args: string[],
  optionsOrConfig?:
    | { noversion?: boolean }
    | GlobalTargetConfig
    | DenoBundleGlobalConfig,
): ParsedArgs {
  const lowerArgs = args.map((a,) => a.toLowerCase());
  const hasNoVersionInArgs = lowerArgs.includes("noversion",);
  const hasNoVersionInOptions = Boolean(
    optionsOrConfig && "noversion" in optionsOrConfig &&
      (optionsOrConfig as { noversion?: boolean }).noversion,
  );
  const globalNoVersion = hasNoVersionInArgs || hasNoVersionInOptions;
  const rawTargets = args.filter((arg,) => arg.toLowerCase() !== "noversion");

  // Se optionsOrConfig for uma configuração de alvos (retrocompatibilidade com testes existentes):
  if (
    optionsOrConfig &&
    !("noversion" in optionsOrConfig) &&
    typeof optionsOrConfig === "object"
  ) {
    const configKeys = Object.keys(optionsOrConfig,);
    if (rawTargets.length === 0) {
      const defaultTargets = configKeys.filter((t,) => {
        const cfg =
          (optionsOrConfig as Record<string, { default?: boolean }>)[t];
        return cfg?.default !== false;
      },);
      return { targets: defaultTargets, globalNoVersion, };
    }
    const finalTargets = configKeys.filter((t,) =>
      rawTargets.some((rt,) => rt.toLowerCase() === t.toLowerCase())
    );
    return { targets: finalTargets, globalNoVersion, };
  }

  return { targets: rawTargets, globalNoVersion, };
}

```

---

## Arquivo: `packages/utils/src/tools/interfaces.ts`

```ts
/**
 * Extensões de arquivo padrão que são comumente incluídas em snapshots.
 */
export const EXTENSOES_PADRAO: string[] = [
  ".tsx",
  ".jsx",
  ".js",
  ".ts",
  ".css",
  ".html",
  ".manifest",
  ".map",
  ".sh",
  ".py",
  ".json",
  ".jsonc",
  ".yaml",
  ".yml",
  ".toml",
  ".env.example",
  ".md",
];

/** Versão semântica parseada. */
export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
}

/** Argumentos de linha de comando parseados. */
export interface ParsedArgs {
  targets: string[];
  globalNoVersion: boolean;
}

export type EsbuildPlatform = "browser" | "node" | "neutral";
export type EsbuildFormat = "esm" | "iife" | "cjs";
export type EsbuildSourcemap = boolean | "linked" | "inline" | "external";
export type EsbuildJsx = "automatic" | "transform" | "preserve";
export type EsbuildLegalComments =
  | "none"
  | "inline"
  | "eof"
  | "linked"
  | "external";
export type EsbuildDrop = "console" | "debugger";
export type EsbuildCharset = "ascii" | "utf8";
export type EsbuildLogLevel =
  | "verbose"
  | "debug"
  | "info"
  | "warning"
  | "error"
  | "silent";
export type EsbuildLoader =
  | "js"
  | "jsx"
  | "ts"
  | "tsx"
  | "css"
  | "json"
  | "text"
  | "base64"
  | "dataurl"
  | "file"
  | "binary"
  | "empty"
  | "copy";

/** Configuração de um conjunto de arquivos estáticos a serem copiados. */
export interface CopyFileConfig {
  basedir?: string;
  includes?: string[];
  excludes?: string[];
}

/** Configuração de limpeza prévia de arquivos e pastas no diretório de saída. */
export interface CleanConfig {
  includes?: string[];
  excludes?: string[];
}

/** Configuração de um alvo de build (esbuild). */
export interface TargetConfig {
  publicdir?: string;
  srcdir?: string;
  distdir?: string;
  indexHtml?: boolean;
  clean?: CleanConfig | string[];
  copyFiles?: CopyFileConfig[];
  default?: boolean;
  entryPoints: string[];
  platform?: EsbuildPlatform;
  format?: EsbuildFormat;
  bundle?: boolean;
  minify?: boolean;
  sourcemap?: EsbuildSourcemap;
  jsx?: EsbuildJsx;
  jsxImportSource?: string;
  conditions?: string[];
  define?: Record<string, string>;
  drop?: EsbuildDrop[];
  external?: string[];
  metafile?: boolean;
  write?: boolean;
  treeShaking?: boolean;
  legalComments?: EsbuildLegalComments;
  keepNames?: boolean;
  outfile?: string;
  splitting?: boolean;
  loader?: Record<string, EsbuildLoader>;
  alias?: Record<string, string>;
  inject?: string[];
  banner?: { js?: string; css?: string };
  footer?: { js?: string; css?: string };
  target?: string | string[];
  charset?: EsbuildCharset;
  logLevel?: EsbuildLogLevel;
  logLimit?: number;
  logOverride?: Record<string, EsbuildLogLevel>;
  entryNames?: string;
  chunkNames?: string;
  assetNames?: string;
  publicPath?: string;
  pure?: string[];
  plugins?: unknown[];
}

export interface GlobalTargetConfig {
  [targetName: string]: TargetConfig;
}

export type EsbuildTargetConfig = TargetConfig;
export type EsbuildGlobalConfig = GlobalTargetConfig;

export interface EsbuildOptions {
  config: GlobalTargetConfig;
  targets?: string[];
  noversion?: boolean;
  versionPaths?: string[];
  forcepackagesversion?: boolean;
  baseDir?: string;
  denoJsoncPath?: string;
  silencioso?: boolean;
}

export interface WatchTargetConfig {
  publicdir?: string;
  srcdir?: string;
  distdir?: string;
  indexHtml?: boolean;
  clean?: CleanConfig | string[];
  copyFiles?: CopyFileConfig[];
  default?: boolean;
  entryPoints: string[];
  platform?: EsbuildPlatform;
  format?: EsbuildFormat;
  bundle?: boolean;
  minify?: boolean;
  sourcemap?: EsbuildSourcemap;
  jsx?: EsbuildJsx;
  jsxImportSource?: string;
  conditions?: string[];
  define?: Record<string, string>;
  drop?: EsbuildDrop[];
  external?: string[];
  write?: boolean;
  legalComments?: EsbuildLegalComments;
  keepNames?: boolean;
  outfile?: string;
  loader?: Record<string, EsbuildLoader>;
  alias?: Record<string, string>;
  inject?: string[];
  banner?: { js?: string; css?: string };
  footer?: { js?: string; css?: string };
  target?: string | string[];
  charset?: EsbuildCharset;
  logLevel?: EsbuildLogLevel;
  plugins?: unknown[];
}

export interface WatchGlobalConfig {
  [targetName: string]: WatchTargetConfig;
}

export interface WatchConfigFile {
  $schema?: string;
  version?: string;
  targets?: WatchGlobalConfig;
  [key: string]: unknown;
}

export interface WatchConfigResult {
  targets: WatchGlobalConfig;
}

export interface WatchOptions {
  config: WatchGlobalConfig;
  target?: string;
  baseDir?: string;
  lockFile?: string;
  denoJsoncPath?: string;
  silencioso?: boolean;
}

export interface WatchHandle {
  target: string;
  close: () => Promise<void>;
}

/** Configuração de um modo de exportação de snapshot. */
export interface ExportConfig {
  /** Caminho do arquivo de saída Markdown gerado. */
  arquivoSaida: string;
  /** Padrões glob de arquivos a serem incluídos. */
  includes?: string[];
  /** Padrões glob de arquivos a serem excluídos. */
  excludes?: string[];
  /** Se deve incluir a versão da aplicação no cabeçalho. */
  incluiVersao?: boolean;
  /** Instrução personalizada para a IA. */
  instrucaoCustomizada?: string;
  /** Texto ou instruções customizadas para o bloco de cabeçalho da IA. */
  cabecalho?: string;
  /** Nome do projeto exibido no cabeçalho (padrão: "BuildIt"). */
  projeto?: string;
  /** Se o modo deve ser executado por padrão quando nenhum modo for especificado. */
  default?: boolean;
}

export type DenoBundlePlatform = "browser" | "deno";
export type DenoBundleFormat = "esm" | "cjs" | "iife";
export type DenoBundleSourceMap = "linked" | "inline" | "external";
export type DenoBundlePackageHandling = "bundle" | "external";

export interface DenoBundleTargetConfig {
  srcdir?: string;
  distdir?: string;
  publicdir?: string;
  indexHtml?: boolean;
  clean?: CleanConfig | string[];
  copyFiles?: CopyFileConfig[];
  default?: boolean;
  mode?: "build" | "watch";
  entryPoints: string[];
  format?: DenoBundleFormat;
  platform?: DenoBundlePlatform;
  minify?: boolean;
  keepNames?: boolean;
  sourcemap?: DenoBundleSourceMap;
  codeSplitting?: boolean;
  inlineImports?: boolean;
  packages?: DenoBundlePackageHandling;
  external?: string[];
  define?: Record<string, string>;
  outfile?: string;
}

export interface DenoBuildConfigFile {
  $schema?: string;
  version?: string;
  targets?: DenoBundleGlobalConfig;
  versionPaths?: string[];
  forcepackagesversion?: boolean;
  [key: string]: unknown;
}

export interface DenoBuildResult {
  target: string;
  success: boolean;
  durationMs: number;
  outputFiles: string[];
}

export interface DenoBuildConfigResult {
  targets: DenoBundleGlobalConfig;
  versionPaths?: string[];
  forcepackagesversion?: boolean;
}

export interface DenoBundleGlobalConfig {
  [targetName: string]: DenoBundleTargetConfig;
}

export interface DenoBuildOptions {
  config: DenoBundleGlobalConfig;
  targets?: string[];
  noversion?: boolean;
  versionPaths?: string[];
  forcepackagesversion?: boolean;
  baseDir?: string;
  denoJsoncPath?: string;
  silencioso?: boolean;
}

/** Arquivo de configuração de exportação (export.jsonc). */
export interface ExportConfigFile {
  /** Schema JSON opcional. */
  $schema?: string;
  /** Versão do arquivo de configuração. */
  version?: string;
  /** Nome global do projeto (padrão: "BuildIt"). */
  projeto?: string;
  /** Bloco global de cabeçalho customizado para IA. */
  cabecalho?: string;
  /** Dicionário de modos de exportação. */
  modos: Record<string, ExportConfig>;
}

export interface ExportResult {
  modo: string;
  arquivos: number;
  arquivoSaida: string;
  bytes: number;
}

export interface ExportOptions {
  config: Record<string, ExportConfig>;
  modos?: string[];
  baseDir?: string;
  versaoApp?: string;
  denoJsoncPath?: string;
  silencioso?: boolean;
}

export interface CommonCliFlags {
  configPath?: string;
  showVersion: boolean;
  showHelp: boolean;
  noversion: boolean;
  forcepackagesversion: boolean;
  versionPaths?: string[];
  positional: string[];
}

export interface VersionUpdateOptions {
  currentVersion?: string;
  denoJsonPath?: string;
  baseDir?: string;
  noversion?: boolean;
  versionPaths?: string[];
  forcepackagesversion?: boolean;
  buildHash?: string;
}

export interface EsbuildConfigFile {
  $schema?: string;
  version?: string;
  targets?: GlobalTargetConfig;
  versionPaths?: string[];
  forcepackagesversion?: boolean;
  [key: string]: unknown;
}

export interface EsbuildConfigResult {
  targets: GlobalTargetConfig;
  versionPaths?: string[];
  forcepackagesversion?: boolean;
}

export interface EsbuildResult {
  target: string;
  success: boolean;
  durationMs: number;
}

/** Opções para execução de sanitização de versão em arquivos deno.json[c]. */
export interface SanitizeVersionOptions {
  /** Caminho do arquivo a ser sanitizado. Se omitido, busca recursivamente pelo mais próximo. */
  filePath?: string;
  /** Diretório base de busca caso filePath não seja especificado. */
  baseDir?: string;
  /** Se true, não emite logs no console durante a execução. */
  silencioso?: boolean;
}

/** Resultado da operação de sanitização de versão. */
export interface SanitizeVersionResult {
  /** Caminho do arquivo processado. */
  filePath: string;
  /** Versão original encontrada no arquivo. */
  rawVersion: string;
  /** Versão sanitizada no formato semver canônico (MAJOR.MINOR.PATCH). */
  sanitizedVersion: string;
  /** Indica se o arquivo em disco foi modificado. */
  updated: boolean;
}

/** Opções para criação e publicação de tags git baseadas na versão. */
export interface TagVersionOptions {
  /** Caminho do arquivo deno.json[c]. Se omitido, busca automaticamente. */
  file?: string;
  /** Mensagem customizada do commit. Padrão: "Versão vMAJOR.MINOR". */
  message?: string;
  /** Se true, executa a sanitização do arquivo deno.json[c] em disco antes de comitar. */
  sanitize?: boolean;
  /** Se true, apenas simula as operações do git sem persistir commits ou tags. */
  dryRun?: boolean;
  /** Diretório base de execução. */
  baseDir?: string;
  /** Se true, não emite logs no console durante a execução. */
  silencioso?: boolean;
}

/** Resultado da operação de tag git. */
export interface TagVersionResult {
  /** Nome da tag gerada (ex: "v0.3"). */
  tagName: string;
  /** Versão original bruta. */
  rawVersion: string;
  /** Versão semver sanitizada. */
  sanitizedVersion: string;
  /** Mensagem utilizada no commit. */
  message: string;
  /** Se o repositório foi alterado e comitado. */
  committed: boolean;
  /** Se a tag foi criada e publicada. */
  tagged: boolean;
}

```

---

## Arquivo: `packages/utils/src/tools/jsonc.ts`

```ts
import { parse as parseJsonc, } from "@std/jsonc";
import { join, } from "@std/path";

/**
 * Carrega e faz o parse de um arquivo JSON ou JSONC de forma segura.
 * Tenta carregar o arquivo especificado ou busca por alternativas padrão.
 *
 * @param fileName Nome base do arquivo (ex: "denobuild")
 * @param explicitPath Caminho explícito fornecido pelo usuário (opcional)
 * @param baseDir Diretório base para busca (default: ".")
 * @returns O objeto parseado ou null se não encontrado/inválido
 */
export async function loadConfig<T,>(
  fileName: string,
  explicitPath?: string,
  baseDir: string = ".",
): Promise<T | null> {
  const candidates = explicitPath ? [explicitPath,] : [
    join(baseDir, `${fileName}.jsonc`,),
    join(baseDir, `${fileName}.json`,),
  ];

  for (const path of candidates) {
    try {
      const content = await Deno.readTextFile(path,);
      const parsed = parseJsonc(content,);

      if (parsed && typeof parsed === "object") {
        return parsed as T;
      }
    } catch (error) {
      // Se o usuário passou um caminho específico e ele não existe ou está quebrado, avisamos.
      // Se for a busca padrão, falhamos silenciosamente para tentar o próximo candidato.
      if (explicitPath && !(error instanceof Deno.errors.NotFound)) {
        console.warn(
          `⚠️ Erro ao ler arquivo de configuração em ${path}:`,
          error,
        );
      }
    }
  }

  return null;
}

```

---

## Arquivo: `packages/utils/src/tools/mod.ts`

```ts
export { EXTENSOES_PADRAO, } from "./interfaces.ts";

```

---

## Arquivo: `packages/utils/src/tools/paths.ts`

```ts
import { copy, emptyDir, ensureDir, expandGlob, walk, } from "@std/fs";
import {
  basename,
  dirname,
  globToRegExp,
  isAbsolute,
  join,
  relative,
} from "@std/path";

import type {
  CleanConfig,
  CopyFileConfig,
  DenoBundleTargetConfig,
  TargetConfig,
  WatchTargetConfig,
} from "./interfaces.ts";

// ============================================================================
// 🛡️ VALIDAÇÃO DE PATHS E GLOBS (pura, testável)
// ============================================================================
/**
 * Verifica se um caminho é seguro (evita path traversal e caminhos absolutos).
 * @param cleanPath Caminho a ser verificado
 * @returns True se for seguro
 */
export function isSafePath(cleanPath: string,): boolean {
  if (cleanPath.includes("..",)) return false;
  if (isAbsolute(cleanPath,)) return false;
  return true;
}

/**
 * Resolve um caminho relativo adicionando o baseDir caso fornecido e não seja caminho absoluto.
 *
 * @param pathStr Caminho a ser resolvido
 * @param baseDir Diretório base geral
 * @returns Caminho resolvido com baseDir
 */
export function resolveWithBase(
  pathStr: string | undefined,
  baseDir: string = ".",
): string | undefined {
  if (!pathStr) return undefined;
  if (isAbsolute(pathStr,) || baseDir === "." || !baseDir) return pathStr;
  return join(baseDir, pathStr,);
}

/**
 * Testa se um caminho relativo corresponde a algum dos padrões glob fornecidos.
 *
 * @param caminho Caminho relativo a ser testado
 * @param padroes Lista de padrões glob (suporta brace expansion e globstar)
 * @returns True se o caminho casar com ao menos um padrão
 */
export function correspondeGlobs(caminho: string, padroes: string[],): boolean {
  const caminhoNormalizado = caminho.replace(/\\/g, "/",);
  for (const padrao of padroes) {
    try {
      const reg = globToRegExp(padrao, {
        globstar: true,
        caseInsensitive: true,
      },);
      if (reg.test(caminhoNormalizado,) || reg.test(caminho,)) {
        return true;
      }
    } catch {
      // Ignora padrão inválido
    }
  }
  return false;
}

// ============================================================================
// 📍 RESOLUÇÃO DE OUTPUT PATHS (outfile relativo ao distdir)
// ============================================================================
/**
 * Resolve os caminhos de saída (outfile/outdir) baseado na configuração.
 *
 * Regras:
 * 1. Se 'outfile' e 'distdir' existem: outfile é RELATIVO ao distdir → join(distdir, outfile)
 * 2. Se apenas 'outfile' existe (sem distdir): outfile é ABSOLUTO
 * 3. Se apenas 'distdir' existe (sem outfile): distdir é usado como outdir
 * 4. Se nenhum existe: retorna objeto vazio (não deveria acontecer se validateTargetConfig foi chamado)
 *
 * @returns Objeto com 'outfile' ou 'outdir' resolvidos (nunca ambos)
 */
export function resolveOutputPaths(
  config: TargetConfig | DenoBundleTargetConfig,
): { outfile?: string; outdir?: string } {
  if (config.outfile) {
    if (config.distdir) {
      // outfile relativo ao distdir
      return { outfile: join(config.distdir, config.outfile,), };
    }
    // outfile absoluto (sem distdir)
    return { outfile: config.outfile, };
  }
  // Sem outfile, usa distdir como outdir
  if (config.distdir) {
    return { outdir: config.distdir, };
  }
  // Nem outfile nem distdir (não deveria chegar aqui se validateTargetConfig foi chamado)
  return {};
}

// ============================================================================
// 🎯 RESOLUÇÃO DE ENTRYPOINTS (relativo ao srcdir quando disponível)
// ============================================================================
/**
 * Resolve os entrypoints relativos ao srcdir (se disponível) e valida sua existência no disco.
 * Lança um erro claro e didático se algum arquivo não for encontrado.
 *
 * Se srcdir não está configurado, trata todos os entrypoints como absolutos.
 */
export function resolveEntryPoints(
  srcdir: string | undefined,
  entryPoints: string[],
): string[] {
  return entryPoints.map((entry,) => {
    let resolvedPath: string;

    if (srcdir && !isAbsolute(entry,)) {
      // srcdir existe e entry é relativo → faz join
      resolvedPath = join(srcdir, entry,);
    } else {
      // srcdir não existe OU entry já é absoluto → usa como está
      resolvedPath = entry;
    }

    try {
      Deno.statSync(resolvedPath,);
    } catch {
      throw new Error(
        `❌ Entrypoint não encontrado em: "${resolvedPath}"\n` +
          `   Origem configurada: "${entry}"\n` +
          (srcdir
            ? `   Verifique se o caminho está correto em relação ao srcdir: "${srcdir}".`
            : `   Verifique se o caminho absoluto está correto.`),
      );
    }

    return resolvedPath;
  },);
}

/**
 * Garante que o diretório pai de um arquivo existe.
 * @param filePath Caminho do arquivo
 */
export async function ensureDirForFile(filePath: string,): Promise<void> {
  const dir = dirname(filePath,);
  if (dir && dir !== ".") {
    await ensureDir(dir,);
  }
}

// ============================================================================
// 📂 FUNÇÕES DE FILESYSTEM
// ============================================================================
/**
 * Limpa os diretórios/arquivos configurados no alvo.
 * Suporta globs e brace expansion através de { includes, excludes } ou array de caminhos.
 *
 * Regras:
 * 0. Includes e excludes são sempre relativos ao distdir. Não permite que nenhum arquivo nível acima ao distdir seja deletado.
 * 1. Para excluir tudo do distdir usa-se includes: ["*"] (ou legado ["."]).
 *
 * @param distDir Diretório de saída
 * @param cleanConfig Configuração de limpeza ({ includes, excludes }) ou lista de caminhos
 */
export async function cleanTarget(
  distDir: string,
  cleanConfig?: CleanConfig | string[],
): Promise<void> {
  if (!cleanConfig || !distDir) return;
  try {
    const stat = await Deno.stat(distDir,);
    if (!stat.isDirectory) return;
  } catch {
    // Diretório de saída ainda não existe no disco
    return;
  }

  // Normaliza CleanConfig
  const config: CleanConfig = Array.isArray(cleanConfig,)
    ? { includes: cleanConfig.map((p,) => p === "." ? "*" : p), }
    : cleanConfig;

  if (!config || !config.includes || config.includes.length === 0) return;

  console.log(`🧹 Limpando em ${distDir}...`,);
  const includes = config.includes;
  const excludes = config.excludes ?? [];

  // Otimização: Se includes for ["*"] e excludes vazio, esvazia diretamente o distDir
  if (
    includes.length === 1 &&
    includes[0] === "*" &&
    excludes.length === 0
  ) {
    try {
      await emptyDir(distDir,);
      console.log(`   ✅ Diretório esvaziado: ${distDir}`,);
      return;
    } catch (error) {
      console.warn(`   ⚠️ Falha ao esvaziar ${distDir}:`, error,);
      return;
    }
  }

  // Limpeza via globs / brace expansion
  for (const padrao of includes) {
    // Proteção direta contra caminhos com traversal ou absolutos no padrão
    if (!isSafePath(padrao,)) {
      console.warn(
        `   ⚠️ Path perigoso ignorado (traversal/absoluto): "${padrao}"`,
      );
      continue;
    }

    try {
      for await (
        const entry of expandGlob(padrao, {
          root: distDir,
          exclude: excludes,
          includeDirs: true,
        },)
      ) {
        const rel = relative(distDir, entry.path,).replace(/\\/g, "/",);

        // 🔒 Regra 0: Proteção estrita contra path traversal / nível acima ao distdir
        if (
          rel.startsWith("..",) || isAbsolute(rel,) || rel === "" || rel === "."
        ) {
          console.warn(
            `   ⚠️ Path perigoso ignorado (fora do distdir): "${entry.path}"`,
          );
          continue;
        }

        // Verifica excludes
        if (excludes.length > 0 && correspondeGlobs(rel, excludes,)) {
          continue;
        }

        try {
          await Deno.remove(entry.path, { recursive: true, },);
          console.log(`   ✅ Removido: ${rel}`,);
        } catch {
          // pode já ter sido removido recursivamente por pasta pai
        }
      }
    } catch (err) {
      console.warn(
        `   ⚠️ Erro ao avaliar limpeza com padrão '${padrao}':`,
        err,
      );
    }
  }
}

/**
 * Lista todos os assets gerados no distdir para cache do Service Worker.
 * @param distDir Diretório de saída
 * @param excludeFiles Lista de arquivos para ignorar
 * @returns Lista de caminhos relativos
 */
export async function listAssetsForCache(
  distDir: string,
  excludeFiles: string[] = [],
): Promise<string[]> {
  // 🔥 CORREÇÃO: Verifica se distDir foi fornecido antes de tentar caminhar
  if (!distDir) {
    console.warn(
      `⚠️ 'listAssetsForCache' chamado sem 'distDir'. Retornando array vazio.`,
    );
    return [];
  }

  const assets: string[] = [];
  const exclude = new Set([
    ...excludeFiles,
    "service-worker.js",
    "service-worker.tmp.js",
  ],);
  for await (const entry of walk(distDir, { includeDirs: false, },)) {
    if (
      !entry.name.endsWith(".map",) &&
      !entry.name.endsWith("metafile.json",) &&
      !exclude.has(entry.name,)
    ) {
      let webPath = entry.path.replace(distDir, "",).replace(/\\/g, "/",);
      webPath = webPath.startsWith("/",) ? "." + webPath : "./" + webPath;
      assets.push(webPath,);
    }
  }
  return assets;
}

/**
 * Copia arquivos estáticos para o distdir seguindo as regras de copyFiles.
 *
 * Regras:
 * 0. Será feito join de item.basedir com generalBaseDir
 * 1. Se basedir informado, includes e excludes são relativos ao basedir e preserva a árvore de diretórios relativas ao basedir
 * 2. Se basedir informado e includes inexistente, vazio ou "*", copia tudo do diretório basedir, respeitando excludes
 * 3. Se basedir inexistente, includes e excludes são relativos ao generalBaseDir e árvore NÃO é preservada (arquivos copiados diretamente no distdir)
 * 4. copyFiles é um array
 * 5. index.html é copiado usando essa configuração
 * 6. se o arquivo copiado for manifest.json continua injetando a versão, e se for index.html informa no console.log
 *
 * @param copyFiles Lista de configurações de cópia
 * @param distDir Diretório de saída final (já resolvido)
 * @param appVersion Versão da aplicação para injeção no manifest.json
 * @param generalBaseDir Diretório base geral da execução (padrão ".")
 */
export async function copyTargetFiles(
  copyFiles: CopyFileConfig[] | undefined,
  distDir: string,
  appVersion: string,
  generalBaseDir: string = ".",
): Promise<void> {
  if (!copyFiles || copyFiles.length === 0) return;
  if (!distDir) {
    console.warn(
      `⚠️ 'copyFiles' configurado mas 'distdir' ausente. Pulando cópia.`,
    );
    return;
  }

  await ensureDir(distDir,);

  for (const item of copyFiles) {
    const hasItemBase = typeof item.basedir === "string" &&
      item.basedir.trim().length > 0;
    // 0. Será feito join deste basedir com o "basedir geral"
    const effectiveBaseDir = hasItemBase
      ? (generalBaseDir && generalBaseDir !== "." && !isAbsolute(item.basedir!,)
        ? join(generalBaseDir, item.basedir!,)
        : item.basedir!)
      : (generalBaseDir ?? ".");

    if (hasItemBase) {
      // 1. se basedir informado, includes e excludes são relativos ao basedir e é preservada a árvore
      // 2. se basedir informado e includes inexistente, vazio ou "*", copia tudo do basedir respeitando excludes
      const isAll = !item.includes ||
        item.includes.length === 0 ||
        (item.includes.length === 1 && item.includes[0] === "*");

      const patterns = isAll ? ["**/*",] : item.includes!;

      try {
        const stat = await Deno.stat(effectiveBaseDir,);
        if (!stat.isDirectory) {
          console.warn(
            `⚠️ '${effectiveBaseDir}' não é um diretório, pulando cópia.`,
          );
          continue;
        }
      } catch {
        console.warn(
          `⚠️ Pasta ${effectiveBaseDir} não encontrada, pulando cópia.`,
        );
        continue;
      }

      for (const padrao of patterns) {
        try {
          for await (
            const entry of expandGlob(padrao, {
              root: effectiveBaseDir,
              exclude: item.excludes,
              includeDirs: false,
            },)
          ) {
            if (entry.isFile) {
              const relPath = relative(effectiveBaseDir, entry.path,).replace(
                /\\/g,
                "/",
              );

              if (item.excludes && item.excludes.length > 0) {
                if (correspondeGlobs(relPath, item.excludes,)) {
                  continue;
                }
              }

              const destPath = join(distDir, relPath,);
              await ensureDirForFile(destPath,);
              await copy(entry.path, destPath, { overwrite: true, },);

              const fileName = basename(entry.path,).toLowerCase();
              if (fileName === "index.html") {
                console.log(
                  `📄 index.html copiado de ${effectiveBaseDir} para ${destPath}`,
                );
              }
              if (fileName === "manifest.json") {
                try {
                  const manifestText = await Deno.readTextFile(destPath,);
                  const manifestObj = JSON.parse(manifestText,);
                  manifestObj.version = appVersion;
                  await Deno.writeTextFile(
                    destPath,
                    JSON.stringify(manifestObj, null, 2,),
                  );
                  console.log(
                    `📱 Versão v${appVersion} injetada em manifest.json`,
                  );
                } catch {
                  // manifest não é JSON válido
                }
              }
            }
          }
        } catch (err) {
          console.warn(
            `⚠️ Erro ao expandir glob '${padrao}' em '${effectiveBaseDir}':`,
            err,
          );
        }
      }
      console.log(
        `📁 Arquivos de ${effectiveBaseDir} copiados para ${distDir}`,
      );
    } else {
      // 3. se basedir inexistente, includes e excludes são relativos ao "basedir geral"
      // e árvore de diretórios não é preservada na cópia e arquivos são copiados diretamente no distdir
      const patterns = item.includes && item.includes.length > 0
        ? item.includes
        : [];
      for (const padrao of patterns) {
        try {
          for await (
            const entry of expandGlob(padrao, {
              root: effectiveBaseDir,
              exclude: item.excludes,
              includeDirs: false,
            },)
          ) {
            if (entry.isFile) {
              const relPath = relative(effectiveBaseDir, entry.path,).replace(
                /\\/g,
                "/",
              );
              if (item.excludes && item.excludes.length > 0) {
                if (correspondeGlobs(relPath, item.excludes,)) {
                  continue;
                }
              }

              const fileName = basename(entry.path,);
              const destPath = join(distDir, fileName,);
              await ensureDirForFile(destPath,);
              await copy(entry.path, destPath, { overwrite: true, },);

              if (fileName.toLowerCase() === "index.html") {
                console.log(`📄 index.html copiado para ${destPath}`,);
              }
              if (fileName.toLowerCase() === "manifest.json") {
                try {
                  const manifestText = await Deno.readTextFile(destPath,);
                  const manifestObj = JSON.parse(manifestText,);
                  manifestObj.version = appVersion;
                  await Deno.writeTextFile(
                    destPath,
                    JSON.stringify(manifestObj, null, 2,),
                  );
                  console.log(
                    `📱 Versão v${appVersion} injetada em manifest.json`,
                  );
                } catch {
                  // manifest não é JSON válido
                }
              }
            }
          }
        } catch (err) {
          console.warn(
            `⚠️ Erro ao expandir glob '${padrao}' em '${effectiveBaseDir}':`,
            err,
          );
        }
      }
    }
  }
}

/**
 * Copia arquivos estáticos para o distdir (novo suporte a copyFiles e retrocompatibilidade com publicdir/indexHtml).
 * @param config Configuração do alvo
 * @param appVersion Versão da aplicação para injeção no manifest
 * @param generalBaseDir Diretório base geral da execução (padrão ".")
 * @param distDir Diretório de saída opcional já resolvido
 */
export async function copyStaticFiles(
  config: TargetConfig | DenoBundleTargetConfig | WatchTargetConfig,
  appVersion: string,
  generalBaseDir: string = ".",
  distDir?: string,
): Promise<void> {
  const effectiveDistDir = distDir ??
    (config.distdir
      ? (generalBaseDir && generalBaseDir !== "." &&
          !isAbsolute(config.distdir,)
        ? join(generalBaseDir, config.distdir,)
        : config.distdir)
      : undefined);

  if (!effectiveDistDir) {
    if (config.copyFiles || config.publicdir || config.indexHtml) {
      console.warn(
        `⚠️ Arquivos estáticos configurados mas 'distdir' ausente. Pulando cópia.`,
      );
    }
    return;
  }

  // 1. Caso use o novo sistema: copyFiles
  if (config.copyFiles && config.copyFiles.length > 0) {
    await copyTargetFiles(
      config.copyFiles,
      effectiveDistDir,
      appVersion,
      generalBaseDir,
    );
    return;
  }

  // 2. Fallback retrocompatível para publicdir e indexHtml
  const legacyCopyFiles: CopyFileConfig[] = [];
  if (config.publicdir) {
    legacyCopyFiles.push({ basedir: config.publicdir, },);
  }
  if (config.indexHtml && config.srcdir) {
    legacyCopyFiles.push({
      basedir: config.srcdir,
      includes: ["index.html",],
    },);
  }

  if (legacyCopyFiles.length > 0) {
    await copyTargetFiles(
      legacyCopyFiles,
      effectiveDistDir,
      appVersion,
      generalBaseDir,
    );
  }
}

/**
 * Procura por deno.json ou deno.jsonc no diretório "./" (cwd).
 * Retorna o caminho absoluto do primeiro encontrado, ou null.
 * Prioriza deno.json sobre deno.jsonc (mesma ordem do Deno).
 */
export function findDenoConfig(): string | null {
  const candidates = ["deno.json", "deno.jsonc",];

  for (const name of candidates) {
    try {
      const stat = Deno.statSync(name,); // relativo ao cwd
      if (stat.isFile) return name;
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) continue;
      if (err instanceof Deno.errors.PermissionDenied) continue;
      throw err;
    }
  }

  return null;
}

```

---

## Arquivo: `packages/utils/src/tools/targets.ts`

```ts
/**
 * @module @vanaware/buildit/tools/targets
 * @description Resolução determinística e garantia da ordem de execução de alvos baseada na configuração.
 */

/**
 * Resolve e preserva estritamente a ordem de execução dos alvos conforme declarados
 * no arquivo de configuração do projeto (única fonte da verdade).
 *
 * @param config Objeto de configuração contendo as chaves na ordem desejada
 * @param requestedTargets Lista opcional de alvos solicitados pelo usuário (ex: via CLI)
 * @returns Lista de alvos filtrados respeitando a ordem original da configuração
 */
export function resolverOrdemTargets<T extends object,>(
  config: T,
  requestedTargets?: string[],
): string[] {
  const configKeys = Object.keys(config,);

  if (!requestedTargets || requestedTargets.length === 0) {
    // Retorna todos os alvos que não possuem default: false
    return configKeys.filter((key,) => {
      const targetConfig = (config as Record<string, unknown>)[key];
      if (targetConfig && typeof targetConfig === "object") {
        return (targetConfig as { default?: boolean }).default !== false;
      }
      return true;
    },);
  }

  // Normaliza os alvos solicitados para comparação case-insensitive
  const normalizedRequested = requestedTargets.map((t,) => t.toLowerCase());

  // Preserva estritamente a ordem das chaves do objeto de configuração
  return configKeys.filter((key,) =>
    normalizedRequested.includes(key.toLowerCase(),)
  );
}

```

---

## Arquivo: `packages/utils/src/tools/validate.ts`

```ts
import { dirname, isAbsolute, join, } from "@std/path";

import type { DenoBundleTargetConfig, TargetConfig, } from "./interfaces.ts";

// ============================================================================
// 🎯 VALIDAÇÃO DE CONFIGURAÇÃO DO ALVO (fail-fast com mensagens claras)
// ============================================================================
/**
 * Valida se a configuração do alvo possui os campos obrigatórios para as operações solicitadas.
 * Lança erro com mensagem didática indicando exatamente qual condição falhou.
 *
 * Regras de obrigatoriedade:
 * - 'distdir' é obrigatório quando 'publicdir' está configurado, 'indexHtml' é true, ou 'outfile' não está configurado
 * - 'srcdir' é obrigatório quando 'indexHtml' é true ou quando 'entryPoints' contém paths relativos
 */
export function validateTargetConfig(
  targetName: string,
  config: TargetConfig | DenoBundleTargetConfig,
): void {
  const reasons: string[] = [];

  // Validação de distdir
  if (config.publicdir && !config.distdir) {
    reasons.push(
      "'publicdir' está configurado (necessário 'distdir' para copiar arquivos estáticos)",
    );
  }
  if (config.indexHtml === true && !config.distdir) {
    reasons.push(
      "'indexHtml' é true (necessário 'distdir' para copiar o HTML)",
    );
  }
  if (!config.outfile && !config.distdir) {
    reasons.push(
      "'outfile' não está configurado (necessário 'distdir' para usar como 'outdir')",
    );
  }

  // Validação de srcdir
  if (config.indexHtml === true && !config.srcdir) {
    reasons.push(
      "'indexHtml' é true (necessário 'srcdir' para copiar o HTML)",
    );
  }

  // Verifica se algum entrypoint é relativo e srcdir não existe
  if (!config.srcdir && config.entryPoints && config.entryPoints.length > 0) {
    const hasRelativeEntry = config.entryPoints.some((entry,) =>
      !isAbsolute(entry,)
    );
    if (hasRelativeEntry) {
      reasons.push(
        "'entryPoints' contém caminhos relativos (necessário 'srcdir' para resolver)",
      );
    }
  }

  if (reasons.length > 0) {
    const missingFields: string[] = [];
    if (!config.distdir && reasons.some((r,) => r.includes("'distdir'",))) {
      missingFields.push("'distdir'",);
    }
    if (!config.srcdir && reasons.some((r,) => r.includes("'srcdir'",))) {
      missingFields.push("'srcdir'",);
    }

    throw new Error(
      `❌ [${targetName}] Configuração incompleta.\n` +
        `   Campos obrigatórios faltando: ${missingFields.join(", ",)}\n` +
        `   Motivos:\n` +
        reasons.map((r,) => `   - ${r}`).join("\n",) +
        `\n   Por favor, configure os campos necessários no alvo '${targetName}'.`,
    );
  }
}

```

---

## Arquivo: `packages/utils/src/tools/version.ts`

````ts
/**
 * @module @vanaware/buildit/config/version
 * @description Gerenciamento centralizado de versões semânticas e sincronização
 * de workspaces para Deno projects e snapshots.
 */

import { dirname, isAbsolute, join, } from "@std/path";
import { parse as parseJsonc, } from "@std/jsonc";
import { APP_VERSION as FALLBACK_VERSION, } from "../version.ts";

import type { ParsedVersion, VersionUpdateOptions, } from "./interfaces.ts";

import { loadConfig, } from "./jsonc.ts";

/**
 * Obtém a versão atual do arquivo de configuração deno.jsonc.
 * @param denoJsoncPath Caminho para o deno.jsonc
 * @returns Versão atual
 */
export async function currentVersion(denoJsoncPath: string,): Promise<string> {
  const parsed = await loadConfig<{ version?: string }>("deno", denoJsoncPath,);
  if (!parsed?.version) {
    throw new Error("❌ Versão não encontrada no deno.jsonc",);
  }
  console.log(`📌 Versão Atual: v${parsed.version}`,);
  return parsed.version;
}

/**
 * Sincroniza a versão em um diretório de workspace (deno.jsonc ou deno.json).
 */
async function syncWorkspaceDir(
  wsPath: string,
  newVersion: string,
  wsRelPath: string,
): Promise<void> {
  for (const fileName of ["deno.jsonc", "deno.json",]) {
    const configPath = join(wsPath, fileName,);
    try {
      const content = await Deno.readTextFile(configPath,);
      const updated = replaceVersionInContent(content, newVersion,);
      await Deno.writeTextFile(configPath, updated,);
      console.log(`   ✅ Sincronizado: ${join(wsRelPath, fileName,)}`,);
      return; // Sucesso, para de procurar neste workspace
    } catch (err) {
      if (!(err instanceof Deno.errors.NotFound)) {
        console.warn(`   ⚠️ Erro ao sincronizar ${configPath}:`, err,);
      }
    }
  }
}

/**
 * Incrementa a versão patch e sincroniza workspaces e arquivos de versão.
 * @param version Versão atual
 * @param denoJsoncPath Caminho para o deno.jsonc raiz
 * @param buildHash Hash opcional do build
 * @returns Nova versão incrementada
 */
export async function incrementVersion(
  version: string,
  denoJsoncPath: string,
  buildHash?: string,
): Promise<string> {
  return await updateProjectVersion({
    currentVersion: version,
    denoJsonPath: denoJsoncPath,
    buildHash,
    forcepackagesversion: true,
  },);
}

/**
 * Caminhos padrão onde o arquivo version.ts é sincronizado.
 */
export const DEFAULT_VERSION_PATHS: string[] = [
  "packages/utils/src/version.ts",
];

/**
 * Parseia uma string de versão no formato major.minor.patch[#hash].
 *
 * @param version String de versão
 * @returns Objeto ParsedVersion com major, minor e patch numéricos
 */
export function parseVersion(version: string,): ParsedVersion {
  const trimmed = version.trim();
  if (trimmed !== version) {
    throw new Error(`❌ Versão não pode ter espaços: ${version}`,);
  }
  const versionWithoutHash = version.split("#",)[0] ?? "";
  if (version.includes("#",) && version.endsWith("#",)) {
    throw new Error(`❌ Formato de versão inválido (# sem hash): ${version}`,);
  }
  const parts = versionWithoutHash.split(".",);
  if (parts.length !== 3) {
    throw new Error(`❌ Formato de versão inválido: ${version}`,);
  }
  const majorStr = parts[0];
  const minorStr = parts[1];
  const patchStr = parts[2];
  if (
    majorStr === undefined || minorStr === undefined || patchStr === undefined
  ) {
    throw new Error(`❌ Formato de versão inválido: ${version}`,);
  }
  const major = parseInt(majorStr, 10,);
  const minor = parseInt(minorStr, 10,);
  const patch = parseInt(patchStr, 10,);
  if (isNaN(major,) || isNaN(minor,) || isNaN(patch,)) {
    throw new Error(`❌ Versão contém valores não numéricos: ${version}`,);
  }
  return { major, minor, patch, };
}

/**
 * Formata os componentes da versão em uma string padronizada.
 */
export function formatVersion(
  major: number,
  minor: number,
  patch: number,
  buildHash?: string,
): string {
  const hash = buildHash ?? Date.now().toString(36,);
  return `${major}.${minor}.${patch}#${hash}`;
}

/**
 * Extrai a string de versão de um conteúdo textual (ex: deno.jsonc ou deno.json).
 */
export function extractVersionFromContent(content: string,): string | null {
  const match = content.match(/"version"\s*:\s*"([^"]+)"/,);
  return match && match[1] ? match[1] : null;
}

/**
 * Substitui a versão no conteúdo textual fornecido.
 */
export function replaceVersionInContent(
  content: string,
  newVersion: string,
): string {
  return content.replace(
    /"version"\s*:\s*"[^"]+"/,
    `"version": "${newVersion}"`,
  );
}

/**
 * Lê a versão semântica do projeto a partir do arquivo deno.jsonc ou deno.json raiz.
 *
 * @param denoJsonPath Caminho opcional para o arquivo de configuração
 * @param baseDir Diretório base caso denoJsonPath não seja absoluto
 * @returns Versão lida do projeto
 */
export async function readProjectVersion(
  denoJsonPath?: string,
  baseDir: string = ".",
): Promise<string> {
  const parsed = await loadConfig<{ version?: string }>(
    "deno",
    denoJsonPath,
    baseDir,
  );

  if (parsed?.version) {
    return parsed.version;
  }

  return FALLBACK_VERSION;
}

/**
 * Grava o arquivo version.ts no caminho ou diretório especificado.
 */
export async function writeVersionFile(
  targetPathOrDir: string,
  version: string,
): Promise<void> {
  const filePath = targetPathOrDir.endsWith(".ts",)
    ? targetPathOrDir
    : join(targetPathOrDir, "version.ts",);

  const dir = dirname(filePath,);
  if (dir && dir !== ".") {
    try {
      await Deno.mkdir(dir, { recursive: true, },);
    } catch {
      // diretório já existe ou sem permissão
    }
  }

  const versionContent = `// Automatically generated file during build
declare const __APP_VERSION__: string;

/** Current library/application version. */
export const APP_VERSION: string = typeof __APP_VERSION__ !== "undefined"
  ? __APP_VERSION__
  : "${version}";
`;

  await Deno.writeTextFile(filePath, versionContent,);
}

/**
 * Sincroniza a versão do projeto em arquivos de configuração e código sem incrementar.
 * Útil para garantir que todos os pacotes e arquivos de versão estejam alinhados.
 *
 * @param options Opções de sincronização
 * @returns Versão sincronizada
 */
export async function syncVersion(
  options: VersionUpdateOptions = {},
): Promise<string> {
  const baseDir = options.baseDir ?? ".";
  const denoJsonPath = options.denoJsonPath ??
    join(baseDir, "deno.jsonc",);
  const forcePackages = options.forcepackagesversion ?? false;
  const versionPaths = options.versionPaths ?? DEFAULT_VERSION_PATHS;

  let finalVersion = options.currentVersion;
  if (!finalVersion) {
    try {
      finalVersion = await readProjectVersion(denoJsonPath, baseDir,);
    } catch {
      finalVersion = FALLBACK_VERSION;
    }
  }

  // Sincroniza workspaces se solicitado
  if (forcePackages) {
    try {
      const rootContent = await Deno.readTextFile(denoJsonPath,);
      const rootDir = dirname(denoJsonPath,);
      const parsed = parseJsonc(rootContent,) as { workspace?: string[] };

      if (parsed.workspace && Array.isArray(parsed.workspace,)) {
        console.log(`📦 Sincronizando workspaces para v${finalVersion}...`,);
        for (const ws of parsed.workspace) {
          const wsPath = isAbsolute(ws,) ? ws : join(rootDir, ws,);
          await syncWorkspaceDir(wsPath, finalVersion, ws,);
        }
      }
    } catch (err) {
      console.warn(`⚠️ Falha ao sincronizar workspaces:`, err,);
    }
  }

  // Atualiza os arquivos version.ts nos caminhos especificados
  for (const vPath of versionPaths) {
    try {
      await writeVersionFile(vPath, finalVersion,);
      console.log(`📝 Versão atualizada em: ${vPath}`,);
    } catch (err) {
      if (options.versionPaths) {
        console.warn(`⚠️ Aviso ao gravar version.ts em ${vPath}:`, err,);
      }
    }
  }

  return finalVersion;
}

/**
 * Incrementa a versão patch e sincroniza o projeto.
 *
 * @param options Opções de atualização
 * @returns Versão final aplicada
 */
export async function updateProjectVersion(
  options: VersionUpdateOptions = {},
): Promise<string> {
  const baseDir = options.baseDir ?? ".";
  const denoJsonPath = options.denoJsonPath ??
    join(baseDir, "deno.jsonc",);
  const noversion = options.noversion ?? false;

  let currentVer = options.currentVersion;
  if (!currentVer) {
    currentVer = await readProjectVersion(denoJsonPath, baseDir,);
  }

  let finalVersion = currentVer;

  if (!noversion) {
    const { major, minor, patch, } = parseVersion(currentVer,);
    finalVersion = formatVersion(major, minor, patch + 1, options.buildHash,);

    // Atualiza deno.jsonc raiz
    try {
      const rootContent = await Deno.readTextFile(denoJsonPath,);
      const updatedRootContent = replaceVersionInContent(
        rootContent,
        finalVersion,
      );
      await Deno.writeTextFile(denoJsonPath, updatedRootContent,);
      console.log(`📈 Versão incrementada para: v${finalVersion}`,);
    } catch (err) {
      console.warn(`⚠️ Erro ao atualizar versão no ${denoJsonPath}:`, err,);
    }
  } else {
    console.log(`📌 Versão mantida (noversion): v${finalVersion}`,);
  }

  // Sincroniza arquivos e subpacotes
  return await syncVersion({
    ...options,
    currentVersion: finalVersion,
  },);
}

/**
 * Procura deno.jsonc (preferido) ou deno.json subindo a árvore de diretórios a partir de startDir.
 * Equivalente TypeScript para a função `find_deno_file` de `lib-version.sh`.
 *
 * @param startDir Diretório inicial para busca (padrão: ".")
 * @returns Caminho do arquivo encontrado ou null caso não encontre
 *
 * @example
 * ```typescript
 * const file = findDenoFile();
 * console.log(file); // ".../deno.jsonc"
 * ```
 */
export function findDenoFile(startDir: string = ".",): string | null {
  try {
    let current = isAbsolute(startDir,)
      ? startDir
      : Deno.realPathSync(startDir,);
    while (current && current !== "/") {
      const jsonc = join(current, "deno.jsonc",);
      try {
        if (Deno.statSync(jsonc,).isFile) return jsonc;
      } catch {
        // tenta próximo
      }

      const json = join(current, "deno.json",);
      try {
        if (Deno.statSync(json,).isFile) return json;
      } catch {
        // tenta próximo
      }

      const parent = dirname(current,);
      if (parent === current) break;
      current = parent;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Extrai o valor bruto do campo "version" a partir do conteúdo textual de um arquivo deno.json[c].
 * Equivalente TypeScript para a função `extract_raw_version` de `lib-version.sh`.
 *
 * @param content Conteúdo textual do arquivo JSON/JSONC
 * @returns Versão bruta encontrada ou null
 *
 * @example
 * ```typescript
 * const raw = extractRawVersion('{\n  "version": "0.3.14#abc1234"\n}'); // "0.3.14#abc1234"
 * ```
 */
export function extractRawVersion(content: string,): string | null {
  const match = content.match(/^[ \t]*"version"\s*:\s*"([^"]*)"/m,);
  return match && match[1] !== undefined ? match[1] : null;
}

/**
 * Normaliza qualquer string de versão para o formato semver canônico estrito "MAJOR.MINOR.PATCH".
 * Remove prefixos como "v", metadados de build (+build), identificadores de pre-release (-alpha)
 * e sufixos de commit hash (#hash), garantindo exatamente 3 componentes numéricos.
 * Equivalente TypeScript para a função `sanitize_version` de `lib-version.sh`.
 *
 * @param raw Versão original bruta (ex: "v1.2.3-beta+exp.sha.5114f85", "0.3.14#muesu7z0")
 * @returns Versão semver sanitizada (ex: "1.2.3", "0.3.14")
 *
 * @example
 * ```typescript
 * sanitizeVersion("v0.3.14#abc"); // "0.3.14"
 * sanitizeVersion("1.2"); // "1.2.0"
 * sanitizeVersion("invalid"); // "0.0.0"
 * ```
 */
export function sanitizeVersion(raw: string,): string {
  if (!raw) return "0.0.0";
  // Remove caracteres não-numéricos no início (ex: "v")
  let clean = raw.replace(/^[^0-9]+/, "",);
  // Remove sufixos iniciados por '-', '+', ou '#'
  clean = clean.replace(/[-+#].*$/, "",);
  // Remove tudo exceto dígitos e pontos
  clean = clean.replace(/[^0-9.]/g, "",);
  // Remove múltiplos pontos seguidos e pontos nas pontas
  clean = clean.replace(/\.+/g, ".",).replace(/^\./, "",).replace(/\.$/, "",);

  const parts = clean.split(".",);
  const ma = parts[0] && /^\d+$/.test(parts[0],) ? parts[0] : "0";
  const mi = parts[1] && /^\d+$/.test(parts[1],) ? parts[1] : "0";
  const pa = parts[2] && /^\d+$/.test(parts[2],) ? parts[2] : "0";

  return `${ma}.${mi}.${pa}`;
}

````

---

## Arquivo: `packages/utils/src/version.ts`

```ts
// Automatically generated file during build
declare const __APP_VERSION__: string;

/** Current library/application version. */
export const APP_VERSION: string = typeof __APP_VERSION__ !== "undefined"
  ? __APP_VERSION__
  : "1.0.3#h3";

```

---

## Arquivo: `packages/utils/src/version/sanitize/cli.ts`

```ts
/**
 * @module @vanaware/buildit/version/sanitize/cli
 * @description Ponto de entrada CLI para sanitização de versão via Cliffy.
 */

import { Command, } from "@cliffy/command";
import { APP_VERSION, } from "../../version.ts";
import { sanitizeVersionFile, } from "./engine.ts";

/**
 * Cria o comando CLI para sanitização de versão do deno.json[c].
 *
 * @returns Instância do comando Cliffy configurado
 */
export function sanitizeVersionCli() {
  return new Command()
    .name("sanitize-version",)
    .description(
      "Normaliza a versão do deno.json[c] para formato semver estrito (MAJOR.MINOR.PATCH)",
    )
    .version(APP_VERSION,)
    .arguments("[file:string]",)
    .option("-b, --base-dir [dir:string]", "Diretório base de busca", {
      default: ".",
      env: { prefix: "BUILDIT_", },
    },)
    .action(async function (options, file,): Promise<void> {
      try {
        await sanitizeVersionFile({
          filePath: file as string | undefined,
          baseDir: options.baseDir as string,
        },);
      } catch (error) {
        console.error(error instanceof Error ? error.message : error,);
        Deno.exit(1,);
      }
    },);
}

if (import.meta.main) {
  const cli = sanitizeVersionCli();
  await cli.parse(Deno.args,);
}

```

---

## Arquivo: `packages/utils/src/version/sanitize/engine.ts`

````ts
/**
 * @module @vanaware/buildit/version/sanitize/engine
 * @description Motor de sanitização de versão semântica em arquivos deno.json e deno.jsonc.
 */

import {
  extractRawVersion,
  findDenoFile,
  replaceVersionInContent,
  sanitizeVersion,
} from "../../tools/version.ts";
import type {
  SanitizeVersionOptions,
  SanitizeVersionResult,
} from "../../tools/interfaces.ts";

/**
 * Normaliza o campo "version" de um arquivo deno.json[c] para o formato semver estrito (MAJOR.MINOR.PATCH).
 * Se o campo "version" não existir, injeta `"version": "0.0.0"` no início do arquivo.
 *
 * @param options Opções de execução da sanitização
 * @returns Objeto com o resultado da sanitização
 *
 * @example
 * ```typescript
 * const result = await sanitizeVersionFile({ filePath: "deno.jsonc" });
 * console.log(result.sanitizedVersion); // "0.3.14"
 * ```
 */
export async function sanitizeVersionFile(
  options: SanitizeVersionOptions = {},
): Promise<SanitizeVersionResult> {
  const baseDir = options.baseDir ?? ".";
  let targetPath = options.filePath;

  if (targetPath) {
    try {
      const stat = await Deno.stat(targetPath,);
      if (!stat.isFile) {
        throw new Error(`❌ Erro: Arquivo '${targetPath}' não encontrado.`,);
      }
    } catch {
      throw new Error(`❌ Erro: Arquivo '${targetPath}' não encontrado.`,);
    }
  } else {
    const found = findDenoFile(baseDir,);
    if (!found) {
      throw new Error(
        `❌ Erro: Nenhum deno.json[c] encontrado a partir de ${baseDir}`,
      );
    }
    targetPath = found;
  }

  if (!options.silencioso) {
    console.log(`🔍 Buscando versão em: ${targetPath}`,);
  }

  let content = await Deno.readTextFile(targetPath,);
  let rawVersion = extractRawVersion(content,);

  if (rawVersion === null) {
    if (!options.silencioso) {
      console.log(
        `⚠️  Nenhum campo 'version' encontrado. Inserindo "0.0.0"...`,
      );
    }
    const braceIndex = content.indexOf("{",);
    if (braceIndex === -1) {
      throw new Error(
        `❌ Arquivo ${targetPath} não contém JSON/JSONC válido.`,
      );
    }
    content = content.slice(0, braceIndex + 1,) + '\n  "version": "0.0.0",' +
      content.slice(braceIndex + 1,);
    rawVersion = "0.0.0";
    await Deno.writeTextFile(targetPath, content,);
  }

  if (!options.silencioso) {
    console.log(`📌 Versão original: ${rawVersion}`,);
  }

  const sanitizedVersion = sanitizeVersion(rawVersion,);
  if (!options.silencioso) {
    console.log(`✅ Versão sanitizada: ${sanitizedVersion}`,);
  }

  let updated = false;
  if (rawVersion !== sanitizedVersion) {
    const updatedContent = replaceVersionInContent(content, sanitizedVersion,);
    await Deno.writeTextFile(targetPath, updatedContent,);
    updated = true;
    if (!options.silencioso) {
      console.log(
        `📝 Arquivo atualizado: ${rawVersion} → ${sanitizedVersion}`,
      );
    }
  } else {
    if (!options.silencioso) {
      console.log(`✨ Já estava no formato semver correto.`,);
    }
  }

  return {
    filePath: targetPath,
    rawVersion,
    sanitizedVersion,
    updated,
  };
}

````

---

## Arquivo: `packages/utils/src/version/sanitize/mod.ts`

```ts
/**
 * @module @vanaware/buildit/version/sanitize
 * @description Módulo de sanitização semver de arquivos deno.json e deno.jsonc.
 */

export { sanitizeVersionFile, } from "./engine.ts";

```

---

## Arquivo: `packages/utils/src/version/tag/cli.ts`

```ts
/**
 * @module @vanaware/buildit/version/tag/cli
 * @description Ponto de entrada CLI para publicação de tags git via Cliffy.
 */

import { Command, } from "@cliffy/command";
import { APP_VERSION, } from "../../version.ts";
import { tagVersionEngine, } from "./engine.ts";

/**
 * Cria o comando CLI para bump e publicação de tags git.
 *
 * @returns Instância do comando Cliffy configurado
 */
export function tagVersionCli() {
  return new Command()
    .name("tag-version",)
    .description(
      "Cria e publica uma tag git baseada na versão do deno.json[c] (vMAJOR.MINOR)",
    )
    .version(APP_VERSION,)
    .option("-m, --message <msg:string>", "Mensagem personalizada do commit",)
    .option(
      "-s, --sanitize",
      "Sanitiza o arquivo deno.json[c] em disco antes do commit",
      {
        default: false,
      },
    )
    .option("-f, --file <file:string>", "Caminho específico do deno.json[c]",)
    .option("-b, --base-dir <dir:string>", "Diretório base de busca", {
      default: ".",
    },)
    .option(
      "--dry-run",
      "Simula as operações git sem efetuar commits ou pushes",
      {
        default: false,
      },
    )
    .action(async function (options,): Promise<void> {
      try {
        await tagVersionEngine({
          file: options.file,
          message: options.message,
          sanitize: options.sanitize,
          baseDir: options.baseDir,
          dryRun: options.dryRun,
        },);
      } catch (error) {
        console.error(error instanceof Error ? error.message : error,);
        Deno.exit(1,);
      }
    },);
}

if (import.meta.main) {
  const cli = tagVersionCli();
  await cli.parse(Deno.args,);
}

```

---

## Arquivo: `packages/utils/src/version/tag/engine.ts`

````ts
/**
 * @module @vanaware/buildit/version/tag/engine
 * @description Motor de criação e publicação automatizada de tags git baseado na versão do deno.json[c].
 */

import {
  extractRawVersion,
  findDenoFile,
  sanitizeVersion,
} from "../../tools/version.ts";
import { sanitizeVersionFile, } from "../sanitize/engine.ts";
import type {
  TagVersionOptions,
  TagVersionResult,
} from "../../tools/interfaces.ts";

/**
 * Executa um comando git capturando stdout, stderr e código de saída.
 */
async function runGit(
  args: string[],
  cwd?: string,
): Promise<{ success: boolean; code: number; stdout: string; stderr: string }> {
  try {
    const cmd = new Deno.Command("git", {
      args,
      cwd,
      stdout: "piped",
      stderr: "piped",
    },);
    const output = await cmd.output();
    const decoder = new TextDecoder();
    return {
      success: output.success,
      code: output.code,
      stdout: decoder.decode(output.stdout,).trim(),
      stderr: decoder.decode(output.stderr,).trim(),
    };
  } catch (error) {
    return {
      success: false,
      code: 1,
      stdout: "",
      stderr: error instanceof Error ? error.message : String(error,),
    };
  }
}

/**
 * Cria e publica uma tag git baseada na versão do deno.json[c] (vMAJOR.MINOR).
 *
 * @param options Opções de configuração da tag
 * @returns Resultado da operação
 *
 * @example
 * ```typescript
 * const res = await tagVersionEngine({ sanitize: true });
 * console.log(res.tagName); // "v0.3"
 * ```
 */
export async function tagVersionEngine(
  options: TagVersionOptions = {},
): Promise<TagVersionResult> {
  const baseDir = options.baseDir ?? ".";
  const dryRun = options.dryRun ?? false;
  const silencioso = options.silencioso ?? false;

  let targetFile = options.file;
  if (!targetFile) {
    const found = findDenoFile(baseDir,);
    if (!found) {
      throw new Error(`❌ deno.json[c] não encontrado a partir de ${baseDir}`,);
    }
    targetFile = found;
  }

  // Sanitiza em disco se solicitado
  if (options.sanitize) {
    if (!silencioso) {
      console.log(`🧼 Sanitizando ${targetFile} antes do commit...`,);
    }
    await sanitizeVersionFile({
      filePath: targetFile,
      baseDir,
      silencioso,
    },);
  }

  // Extrai e sanitiza versão em memória
  const fileContent = await Deno.readTextFile(targetFile,);
  const rawVersion = extractRawVersion(fileContent,);
  if (!rawVersion) {
    throw new Error(`❌ Campo "version" ausente em ${targetFile}`,);
  }

  const sanitizedVersion = sanitizeVersion(rawVersion,);
  const [major = "0", minor = "0",] = sanitizedVersion.split(".",);
  const tagName = `v${major}.${minor}`;
  const message = options.message || `Versão ${tagName}`;

  if (!silencioso) {
    console.log(
      "============================================================",
    );
    console.log("🚀 INICIANDO TAG VERSION BUMP",);
    console.log(
      "============================================================",
    );
    console.log(`📌 Versão original:    ${rawVersion}`,);
    console.log(`🧼 Versão sanitizada:  ${sanitizedVersion}`,);
    console.log(`🏷️  Tag alvo:           ${tagName}`,);
    console.log(`📝 Mensagem de commit: ${message}`,);
    if (dryRun) {
      console.log("🔍 MODO DRY-RUN: Nenhuma alteração git será persistida.",);
    }
    console.log(
      "============================================================",
    );
  }

  // Sanidade: repositório git?
  const isGit = await runGit(["rev-parse", "--is-inside-work-tree",], baseDir,);
  if (!isGit.success) {
    if (dryRun) {
      if (!silencioso) {
        console.warn(
          "⚠️ Aviso: Diretório não é um repositório git ativo (dry-run prossegue).",
        );
      }
      return {
        tagName,
        rawVersion,
        sanitizedVersion,
        message,
        committed: false,
        tagged: false,
      };
    }
    throw new Error("❌ Não está dentro de um repositório git.",);
  }

  if (dryRun) {
    if (!silencioso) {
      console.log(`\n📦 [Dry-Run] 1/3 - Simularia git add -A, commit e push`,);
      console.log(
        `🧹 [Dry-Run] 2/3 - Simularia limpeza de tag antiga (${tagName})`,
      );
      console.log(
        `🏷️  [Dry-Run] 3/3 - Simularia criação e push de ${tagName}`,
      );
      console.log("\n✅ [Dry-Run] Concluído com sucesso.",);
      console.log(
        "============================================================",
      );
    }
    return {
      tagName,
      rawVersion,
      sanitizedVersion,
      message,
      committed: false,
      tagged: false,
    };
  }

  // 1/3 - Empacotando e enviando código fonte
  if (!silencioso) {
    console.log("\n📦 1/3 - Empacotando e enviando código fonte...",);
  }
  await runGit(["add", "-A",], baseDir,);

  const diffCached = await runGit(["diff", "--cached", "--quiet",], baseDir,);
  let committed = false;
  if (diffCached.code !== 0) {
    const commitResult = await runGit(["commit", "-m", message,], baseDir,);
    if (!commitResult.success) {
      throw new Error(`❌ Falha no commit git: ${commitResult.stderr}`,);
    }
    committed = true;
  } else {
    if (!silencioso) {
      console.log("ℹ️  Nada para comitar.",);
    }
  }

  const pushResult = await runGit(["push",], baseDir,);
  if (!pushResult.success && !silencioso) {
    console.warn(
      `⚠️ Aviso no push do código (pode não haver remote configurado): ${pushResult.stderr}`,
    );
  }

  // 2/3 - Limpando tag antiga
  if (!silencioso) {
    console.log(`\n🧹 2/3 - Limpando tag antiga (${tagName})...`,);
  }
  await runGit(["push", "origin", "--delete", tagName,], baseDir,);
  await runGit(["tag", "-d", tagName,], baseDir,);

  // 3/3 - Publicando nova tag
  if (!silencioso) {
    console.log("\n🏷️  3/3 - Publicando nova tag...",);
  }
  const tagCreate = await runGit([
    "tag",
    "-a",
    "-m",
    `Versão ${tagName}`,
    tagName,
  ], baseDir,);
  if (!tagCreate.success) {
    throw new Error(`❌ Falha ao criar tag git: ${tagCreate.stderr}`,);
  }

  const tagPush = await runGit(
    ["push", "--force", "origin", tagName,],
    baseDir,
  );
  if (!tagPush.success && !silencioso) {
    console.warn(
      `⚠️ Aviso no push da tag origin ${tagName}: ${tagPush.stderr}`,
    );
  }

  if (!silencioso) {
    console.log("\n✅ NOVA TAG ADICIONADA COM SUCESSO!",);
    console.log("Acompanhe o andamento na aba Actions do seu repositório.",);
    console.log(
      "============================================================",
    );
  }

  return {
    tagName,
    rawVersion,
    sanitizedVersion,
    message,
    committed,
    tagged: true,
  };
}

````

---

## Arquivo: `packages/utils/src/version/tag/mod.ts`

```ts
/**
 * @module @vanaware/buildit/version/tag
 * @description Módulo de automação de tags git baseado na versão semântica.
 */

export { tagVersionEngine, } from "./engine.ts";

```

---

## Arquivo: `packages/utils/src/watch/cli.ts`

```ts
/**
 * @module @vanaware/buildit/watch/cli
 * @description Ponto de entrada CLI para o monitoramento e recarregamento contínuo (Watch).
 */

import { Command, } from "@cliffy/command";
import { carregarConfigWatch, } from "./config.ts";
import { watchEngine, } from "./engine.ts";
import { APP_VERSION, } from "../version.ts";
import { findDenoConfig, } from "../tools/paths.ts";

/**
 * Cria a instância do comando CLI para o modo watch.
 */
export function watchCli() {
  return new Command()
    .name("watch",)
    .description("BuildIt Watch Orchestrator (Desenvolvimento Contínuo)",)
    .version(APP_VERSION,)
    .option("-c, --app-config [file:string]", "Arquivo de configuração", {
      default: "watch.jsonc",
      env: { prefix: "WATCH_", },
    },)
    .option("-b, --base-dir [dir:string]", "Diretório Base", {
      default: "./",
      env: true,
    },)
    .option("-d, --deno-config [file:string]", "Configuração do Deno", {
      default: findDenoConfig() ?? "deno.jsonc",
      env: true,
    },)
    .arguments("[target:string]",)
    .action(async function (options, target?: string,): Promise<void> {
      const baseDir = (options.baseDir as string) || ".";
      const configPath = options.appConfig as string;
      const loaded = await carregarConfigWatch(configPath, baseDir,);
      const configs = loaded.targets;

      const denoConfigPath = (options.denoConfig as string) || "deno.jsonc";

      console.log(
        "\n👀 Iniciando Orquestrador de Watch BuildIt (esbuild context + @deno/esbuild-plugin)",
      );

      try {
        const handles = await watchEngine({
          config: configs,
          target: target || undefined,
          baseDir,
          denoJsoncPath: denoConfigPath,
          silencioso: false,
        },);

        if (handles.length === 0) {
          console.log("ℹ️ Nenhum processo watch ativo.",);
          return;
        }

        console.log("\n💡 Pressione Ctrl+C para encerrar o monitoramento.\n",);

        // Tratamento gracioso de sinais de encerramento
        const onSignal = async () => {
          console.log("\n🛑 Encerrando modo watch...",);
          for (const handle of handles) {
            await handle.close();
          }
          Deno.exit(0,);
        };

        try {
          Deno.addSignalListener("SIGINT", onSignal,);
          Deno.addSignalListener("SIGTERM", onSignal,);
        } catch {
          // Ignora se o runtime não suportar SignalListener
        }

        // Manter o processo vivo
        await new Promise(() => {},);
      } catch (error) {
        const mensagem = error instanceof Error
          ? error.message
          : String(error,);
        console.error(`\n🛑 Falha na inicialização do Watch:\n${mensagem}`,);
        Deno.exit(1,);
      }
    },);
}

if (import.meta.main) {
  await watchCli().parse(Deno.args,);
}

```

---

## Arquivo: `packages/utils/src/watch/config.ts`

```ts
/**
 * @module @vanaware/buildit/watch/config
 * @description Carregamento e validação de configurações para o modo de desenvolvimento contínuo (Watch).
 */

import { loadConfig, } from "../tools/jsonc.ts";
import type {
  WatchConfigFile,
  WatchConfigResult,
  WatchGlobalConfig,
  WatchTargetConfig,
} from "../tools/interfaces.ts";

/** Configurações padrão para o modo watch caso nenhum arquivo exista */
export const CONFIGURACOES_PADRAO_WATCH: WatchGlobalConfig = {
  ui: {
    default: true,
    srcdir: "packages/ui/src",
    distdir: "packages/server/build/dist",
    copyFiles: [
      { basedir: "packages/ui/public", },
      { basedir: "packages/ui/src", includes: ["index.html",], },
    ],
    entryPoints: ["main.tsx",],
    platform: "browser",
    format: "esm",
    bundle: true,
    minify: false,
    sourcemap: "inline",
    conditions: ["browser",],
    jsx: "automatic",
    jsxImportSource: "preact",
    write: true,
    legalComments: "eof",
    outfile: "app.js",
  },
};

/** Alias retrocompatível para configurações padrão de watch */
export const CONFIGURACOES_WATCH_PADRAO: Record<string, WatchTargetConfig> =
  CONFIGURACOES_PADRAO_WATCH;

/**
 * Carrega e valida o arquivo de configuração do watch (watch.jsonc ou watch.json).
 *
 * @param configPath Caminho explícito opcional para o arquivo
 * @param baseDir Diretório base do projeto (padrão: ".")
 * @returns Configuração resolvida de alvos do watch
 */
export async function carregarConfigWatch(
  configPath?: string,
  baseDir: string = ".",
): Promise<WatchConfigResult> {
  const parsed = await loadConfig<WatchConfigFile | WatchGlobalConfig>(
    "watch",
    configPath,
    baseDir,
  );

  if (!parsed) {
    console.warn(
      "⚠️ Arquivo de configuração watch não encontrado. Usando padrões.",
    );
    return { targets: CONFIGURACOES_PADRAO_WATCH, };
  }

  let targets: WatchGlobalConfig = {};

  if (
    "targets" in parsed && parsed.targets && typeof parsed.targets === "object"
  ) {
    targets = parsed.targets as WatchGlobalConfig;
  }

  if (Object.keys(targets,).length === 0) {
    targets = CONFIGURACOES_PADRAO_WATCH;
  }

  return { targets, };
}

```

---

## Arquivo: `packages/utils/src/watch/engine.ts`

```ts
/**
 * @module @vanaware/buildit/watch/engine
 * @description Motor de desenvolvimento contínuo (Watch) utilizando esbuild context e @deno/esbuild-plugin.
 */

import { join, } from "@std/path";
import * as esbuild from "esbuild";
import { denoPlugin, } from "@deno/esbuild-plugin";
import type {
  WatchHandle,
  WatchOptions,
  WatchTargetConfig,
} from "../tools/interfaces.ts";
import {
  cleanTarget,
  copyStaticFiles,
  listAssetsForCache,
  resolveEntryPoints,
  resolveOutputPaths,
  resolveWithBase,
} from "../tools/paths.ts";
import { readProjectVersion, } from "../tools/version.ts";
import { validateTargetConfig, } from "../tools/validate.ts";
import { acquireWatchLock, } from "./lock.ts";

/**
 * Constrói as opções do esbuild específicas para monitoramento contínuo.
 */
export async function buildWatchEsbuildOptions(
  targetName: string,
  config: WatchTargetConfig,
  appVersion: string,
  listAssetsFn?: (distDir: string,) => Promise<string[]>,
  // deno-lint-ignore no-explicit-any
): Promise<any> {
  const finalDefine: Record<string, string> = {
    ...config.define,
    __APP_VERSION__: JSON.stringify(`v${appVersion}`,),
  };

  if (targetName === "sw" && listAssetsFn && config.distdir) {
    const assets = await listAssetsFn(config.distdir,);
    finalDefine["__GENERATED_ASSETS__"] = JSON.stringify(assets,);
  }

  const resolvedEntryPoints = resolveEntryPoints(
    config.srcdir,
    config.entryPoints,
  );

  const { outfile, outdir, } = resolveOutputPaths(config,);

  // deno-lint-ignore no-explicit-any
  const options: any = {
    entryPoints: resolvedEntryPoints,
    sourcemap: config.sourcemap ?? "inline",
  };

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
    "jsx",
    "jsxImportSource",
    "conditions",
    "external",
    "drop",
    "write",
    "legalComments",
    "keepNames",
    "loader",
    "alias",
    "inject",
    "target",
    "charset",
    "logLevel",
    "plugins",
  ];

  for (const prop of optionalProps) {
    // deno-lint-ignore no-explicit-any
    if ((config as any)[prop] !== undefined) {
      // deno-lint-ignore no-explicit-any
      options[prop] = (config as any)[prop];
    }
  }

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

/**
 * Inicializa o processo de desenvolvimento contínuo (Watch) para um único alvo.
 * Restringe estritamente a execução a 1 alvo por vez e impede instâncias simultâneas via lock.
 *
 * @param opcoes Opções de execução do watch
 * @returns Lista contendo o handle de controle para encerramento gracioso
 */
export async function watchEngine(
  opcoes: WatchOptions,
): Promise<WatchHandle[]> {
  const configs = opcoes.config;
  const baseDir = opcoes.baseDir ?? ".";
  const denoJsoncPath = opcoes.denoJsoncPath ?? join(baseDir, "deno.jsonc",);
  const version = await readProjectVersion(denoJsoncPath, baseDir,);

  // 1. Resolução do alvo: se fornecido utiliza opcoes.target, senão executa o primeiro default
  let targetName: string;
  const configKeys = Object.keys(configs,);
  const requested = opcoes.target;

  if (requested) {
    const matchingKey = configKeys.find(
      (k,) => k.toLowerCase() === requested.toLowerCase(),
    );
    if (!matchingKey || !configs[matchingKey]) {
      throw new Error(
        `❌ Alvo '${requested}' não encontrado na configuração de watch. Alvos disponíveis: ${
          configKeys.join(", ",)
        }.`,
      );
    }
    targetName = matchingKey;
  } else {
    // Se não for passado nenhum literal, busca o primeiro com default !== false
    const defaultTargets = configKeys.filter(
      (k,) => configs[k]?.default !== false,
    );

    const firstDefault = defaultTargets[0];
    if (!firstDefault) {
      if (!opcoes.silencioso) {
        console.warn("⚠️ Nenhum alvo configurado para watch.",);
      }
      return [];
    }

    targetName = firstDefault;
  }

  const targetConfig = configs[targetName];
  if (!targetConfig) {
    return [];
  }

  const resolvedConfig: WatchTargetConfig = {
    ...targetConfig,
    srcdir: resolveWithBase(targetConfig.srcdir, baseDir,),
    distdir: resolveWithBase(targetConfig.distdir, baseDir,),
    publicdir: resolveWithBase(targetConfig.publicdir, baseDir,),
  };

  validateTargetConfig(targetName, resolvedConfig,);

  // 3. Bloqueio de concorrência: adquire o lock para o watch
  const releaseLock = await acquireWatchLock(
    baseDir,
    targetName,
    opcoes.lockFile,
  );

  try {
    if (!opcoes.silencioso) {
      console.log(`\n👀 Iniciando Watch: ${targetName.toUpperCase()}`,);
    }

    if (resolvedConfig.clean && resolvedConfig.distdir) {
      await cleanTarget(resolvedConfig.distdir, resolvedConfig.clean,);
    }

    await copyStaticFiles(
      resolvedConfig,
      version,
      baseDir,
      resolvedConfig.distdir,
    );

    const esbuildOptions = await buildWatchEsbuildOptions(
      targetName,
      resolvedConfig,
      version,
      listAssetsForCache,
    );

    esbuildOptions.plugins = [
      ...(esbuildOptions.plugins || []),
      denoPlugin({ configPath: denoJsoncPath, },),
    ];

    const ctx = await esbuild.context(esbuildOptions,);
    await ctx.watch();

    if (!opcoes.silencioso) {
      console.log(
        `✅ [${targetName}] Monitorando alterações em tempo real...`,
      );
      const resolvedOutfile = esbuildOptions.outfile ||
        (resolvedConfig.distdir ? `${resolvedConfig.distdir}/` : "disco");
      console.log(`📦 Saída: ${resolvedOutfile}`,);
    }

    const handle: WatchHandle = {
      target: targetName,
      close: async () => {
        try {
          await ctx.dispose();
        } finally {
          await releaseLock();
        }
      },
    };

    return [handle,];
  } catch (error) {
    await releaseLock();
    throw error;
  }
}

```

---

## Arquivo: `packages/utils/src/watch/lock.ts`

```ts
/**
 * @module @vanaware/buildit/watch/lock
 * @description Mecanismo de controle de concorrência e Lock para evitar instâncias simultâneas do modo Watch.
 */

import { join, } from "@std/path";

/** Estrutura armazenada no arquivo de lock do Watch */
export interface WatchLockData {
  /** PID do processo Deno ativo */
  pid: number;
  /** Nome do alvo em monitoramento */
  target: string;
  /** Timestamp ISO do início do processo */
  startedAt: string;
  /** Diretório base de execução */
  baseDir?: string;
}

/**
 * Verifica se um processo com o PID fornecido ainda está em execução no sistema operacional.
 *
 * @param pid ID do processo a verificar
 * @returns `true` se o processo estiver ativo, `false` caso contrário
 */
export function isProcessRunning(pid: number,): boolean {
  if (pid <= 0) return false;
  if (pid === Deno.pid) return true;

  try {
    if (Deno.build.os === "linux") {
      try {
        Deno.statSync(`/proc/${pid}`,);
        return true;
      } catch {
        return false;
      }
    }

    const cmd = new Deno.Command("kill", {
      args: ["-0", String(pid,),],
      stdout: "null",
      stderr: "null",
    },);
    const res = cmd.outputSync();
    return res.success;
  } catch {
    return false;
  }
}

/**
 * Tenta adquirir o Lock exclusivo para execução do Watch.
 * Lança um erro se já houver outro processo watch ativo.
 *
 * @param baseDir Diretório base do projeto
 * @param target Nome do alvo que será executado
 * @param customLockPath Caminho opcional customizado para o arquivo de lock
 * @returns Função assíncrona para liberação do lock
 */
export async function acquireWatchLock(
  baseDir: string,
  target: string,
  customLockPath?: string,
): Promise<() => Promise<void>> {
  const lockPath = customLockPath ?? join(baseDir, ".buildit-watch.lock",);

  // 1. Verificar se já existe um arquivo de lock
  try {
    const existingContent = await Deno.readTextFile(lockPath,);
    const existingLock = JSON.parse(existingContent,) as WatchLockData;

    if (existingLock && typeof existingLock.pid === "number") {
      if (isProcessRunning(existingLock.pid,)) {
        throw new Error(
          `❌ Já existe uma instância do watch em execução (PID: ${existingLock.pid}, Alvo: "${existingLock.target}", Iniciada em: ${existingLock.startedAt}). Encerre o processo anterior para evitar conflitos.`,
        );
      } else {
        // O processo anterior morreu sem limpar o lock (órfão)
        try {
          await Deno.remove(lockPath,);
        } catch {
          // Ignora erro se outro processo já removeu
        }
      }
    }
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.startsWith("❌ Já existe uma instância do watch",)
    ) {
      throw err;
    }
    // Arquivo não existe ou JSON corrompido, pode prosseguir
  }

  // 2. Grava o novo lock
  const lockData: WatchLockData = {
    pid: Deno.pid,
    target,
    startedAt: new Date().toISOString(),
    baseDir,
  };

  await Deno.writeTextFile(lockPath, JSON.stringify(lockData, null, 2,),);

  // 3. Prepara a liberação segura do lock
  let released = false;
  const release = async (): Promise<void> => {
    if (released) return;
    released = true;
    try {
      const currentContent = await Deno.readTextFile(lockPath,);
      const currentLock = JSON.parse(currentContent,) as WatchLockData;
      if (currentLock.pid === Deno.pid) {
        await Deno.remove(lockPath,);
      }
    } catch {
      // Ignora erros caso o arquivo já tenha sido removido
    }
  };

  // Garante liberação na saída do processo
  const unloadHandler = () => {
    try {
      const currentContent = Deno.readTextFileSync(lockPath,);
      const currentLock = JSON.parse(currentContent,) as WatchLockData;
      if (currentLock.pid === Deno.pid) {
        Deno.removeSync(lockPath,);
      }
    } catch {
      // Ignora erros
    }
  };

  globalThis.addEventListener("unload", unloadHandler, { once: true, },);

  return release;
}

```

---

## Arquivo: `packages/utils/src/watch/mod.ts`

```ts
/**
 * @module @vanaware/buildit/watch
 * @description Módulo de desenvolvimento contínuo (Watch) para Deno e Preact.
 */

export * from "./engine.ts";
export * from "./config.ts";
export * from "./cli.ts";
export * from "./lock.ts";

```

---

## Arquivo: `packages/utils/tests/bdd_example_test.ts`

```ts
/**
 * @buildit/packages/utils/tests/bdd_example_test.ts
 *
 * Exemplo de uso do estilo BDD (describe/it) com @std/testing/bdd,
 * conforme definido na ADR 008.
 */

import { assert, assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";

describe("bdd_example", () => {
  it("deve passar com uma afirmação simples", () => {
    assertEquals(1 + 1, 2,);
  });

  it("deve falhar corretamente quando a condição não é atendida", () => {
    // Este teste demonstra que o framework BDD funciona conforme esperado.
    const value = "buildit";
    assert(value.length > 0,);
  });
});

```

---

## Arquivo: `packages/utils/tests/config/cli-flags.test.ts`

```ts
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { parseArgs, } from "../../src/tools/cli-flags.ts";
import { GlobalTargetConfig, } from "../../src/tools/interfaces.ts";

describe("parseArgs", () => {
  const config: GlobalTargetConfig = {
    ui: {
      entryPoints: ["main.tsx",],
      srcdir: "src",
      distdir: "dist",
      default: true,
    },
    sw: {
      entryPoints: ["sw.ts",],
      srcdir: "src",
      distdir: "dist",
      default: false,
    },
    worker: {
      entryPoints: ["worker.ts",],
      srcdir: "src",
      distdir: "dist",
      default: true,
    },
  };

  it("deve usar alvos padrão se nenhum for especificado", () => {
    const res = parseArgs([], config,);
    assertEquals(res.targets, ["ui", "worker",],);
    assertEquals(res.globalNoVersion, false,);
  });

  it("deve identificar a flag noversion", () => {
    const res = parseArgs(["noversion",], config,);
    assertEquals(res.globalNoVersion, true,);
  });

  it("deve filtrar alvos solicitados", () => {
    const res = parseArgs(["ui", "sw",], config,);
    assertEquals(res.targets, ["ui", "sw",],);
  });

  it("deve respeitar a ordem do config independente da ordem dos args", () => {
    const res = parseArgs(["sw", "ui",], config,);
    assertEquals(res.targets, ["ui", "sw",],);
  });
});

```

---

## Arquivo: `packages/utils/tests/config/version.test.ts`

```ts
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertThrows, } from "@std/assert";
import { join, } from "@std/path";
import {
  formatVersion,
  parseVersion,
  readProjectVersion,
  updateProjectVersion,
  writeVersionFile,
} from "../../src/tools/version.ts";

describe("version utils", () => {
  describe("parseVersion e formatVersion", () => {
    it("deve parsear versões semânticas válidas", () => {
      const parsed = parseVersion("1.2.3#abc",);
      assertEquals(parsed, { major: 1, minor: 2, patch: 3, },);
    });

    it("deve formatar componentes em formato semântico", () => {
      const formatted = formatVersion(1, 2, 4, "hash123",);
      assertEquals(formatted, "1.2.4#hash123",);
    });

    it("deve rejeitar versões inválidas", () => {
      assertThrows(() => {
        parseVersion("invalid",);
      },);
    });
  });

  describe("readProjectVersion", () => {
    it("deve ler a versão do deno.jsonc raiz", async () => {
      const tempDir = await Deno.makeTempDir();
      const denoJsonc = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        denoJsonc,
        JSON.stringify({ version: "0.5.0", },),
      );

      const ver = await readProjectVersion(denoJsonc,);
      assertEquals(ver, "0.5.0",);

      await Deno.remove(tempDir, { recursive: true, },);
    });
  });

  describe("updateProjectVersion e versionPaths", () => {
    it("deve respeitar a opção noversion e não incrementar patch", async () => {
      const tempDir = await Deno.makeTempDir();
      const denoJsonc = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        denoJsonc,
        JSON.stringify({ version: "1.0.0", },),
      );

      const ver = await updateProjectVersion({
        denoJsonPath: denoJsonc,
        noversion: true,
        versionPaths: [join(tempDir, "version.ts",),],
      },);

      assertEquals(ver, "1.0.0",);
      const generated = await Deno.readTextFile(join(tempDir, "version.ts",),);
      assertEquals(generated.includes("1.0.0",), true,);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("deve incrementar a versão e salvar em múltiplos versionPaths", async () => {
      const tempDir = await Deno.makeTempDir();
      const denoJsonc = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        denoJsonc,
        JSON.stringify({ version: "1.0.0", },),
      );

      const path1 = join(tempDir, "pkg1", "version.ts",);
      const path2 = join(tempDir, "pkg2",); // diretório

      const ver = await updateProjectVersion({
        denoJsonPath: denoJsonc,
        noversion: false,
        buildHash: "fixedhash",
        versionPaths: [path1, path2,],
      },);

      assertEquals(ver, "1.0.1#fixedhash",);

      const file1 = await Deno.readTextFile(path1,);
      const file2 = await Deno.readTextFile(join(path2, "version.ts",),);

      assertEquals(file1.includes("1.0.1#fixedhash",), true,);
      assertEquals(file2.includes("1.0.1#fixedhash",), true,);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("deve propagar a versão nos workspaces quando forcepackagesversion for true", async () => {
      const tempDir = await Deno.makeTempDir();
      const rootJson = join(tempDir, "deno.jsonc",);
      const subpkgDir = join(tempDir, "packages", "sub",);
      await Deno.mkdir(subpkgDir, { recursive: true, },);

      await Deno.writeTextFile(
        rootJson,
        JSON.stringify({
          version: "2.0.0",
          workspace: ["./packages/sub",],
        },),
      );

      const subJson = join(subpkgDir, "deno.jsonc",);
      await Deno.writeTextFile(
        subJson,
        JSON.stringify({ name: "sub", version: "2.0.0", },),
      );

      const ver = await updateProjectVersion({
        denoJsonPath: rootJson,
        noversion: false,
        buildHash: "testws",
        forcepackagesversion: true,
        versionPaths: [],
      },);

      assertEquals(ver, "2.0.1#testws",);

      const subContent = await Deno.readTextFile(subJson,);
      assertEquals(subContent.includes("2.0.1#testws",), true,);

      await Deno.remove(tempDir, { recursive: true, },);
    });
  });
});

```

---

## Arquivo: `packages/utils/tests/denobuild/denobuild-api.test.ts`

```ts
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import { denoBuild, } from "../../src/denobuild/engine.ts";

describe("denoBuild programmatic API", () => {
  it("deve aceitar objeto DenoBundleGlobalConfig em memória diretamente", async () => {
    const tempDir = await Deno.makeTempDir();
    const srcDir = join(tempDir, "src",);
    const distDir = join(tempDir, "dist",);
    await Deno.mkdir(srcDir, { recursive: true, },);

    // Cria entrypoint
    await Deno.writeTextFile(
      join(srcDir, "main.ts",),
      'export const version = "test";',
    );

    const config = {
      app: {
        mode: "build" as const,
        entryPoints: ["main.ts",],
        srcdir: srcDir,
        distdir: distDir,
        platform: "browser" as const,
        format: "esm" as const,
      },
    };

    const results = await denoBuild({
      config,
      targets: ["app",],
      baseDir: tempDir,
      noversion: true,
      silencioso: true,
    },);

    assertEquals(results.length, 1,);
    assertEquals(results[0]?.target, "app",);
    assertEquals(results[0]?.success, true,);

    await Deno.remove(tempDir, { recursive: true, },);
  });
});

```

---

## Arquivo: `packages/utils/tests/denobuild/denobuild.test.ts`

```ts
/**
 * @file denobuild.test.ts
 * @description Testes unitários BDD para a lógica de configuração e utilitários do denobuild.
 */

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import {
  applyDefines,
  buildBundleOptions,
} from "../../src/denobuild/bundle.ts";
import { CONFIGURACOES_PADRAO, } from "../../src/denobuild/mod.ts";

describe("denobuild - applyDefines", () => {
  it("deve substituir identificadores simples", () => {
    const code = "const version = __APP_VERSION__;";
    const defines = { "__APP_VERSION__": '"1.2.3"', };
    const result = applyDefines(code, defines,);
    assertEquals(result, 'const version = "1.2.3";',);
  });

  it("deve substituir múltiplos identificadores", () => {
    const code = "if (__DEBUG__) console.log(__MSG__);";
    const defines = { "__DEBUG__": "true", "__MSG__": '"hello"', };
    const result = applyDefines(code, defines,);
    assertEquals(result, 'if (true) console.log("hello");',);
  });

  it("deve lidar com caracteres especiais em chaves", () => {
    const code = "process.env.NODE_ENV";
    const defines = { "process.env.NODE_ENV": '"production"', };
    const result = applyDefines(code, defines,);
    assertEquals(result, '"production"',);
  });
});

describe("denobuild - buildBundleOptions", () => {
  it("deve gerar opções básicas a partir da configuração", () => {
    const config = CONFIGURACOES_PADRAO.ui!;
    const options = buildBundleOptions(config,);

    assertEquals(options.minify, false,);
    assertEquals(options.platform, "browser",);
    assertEquals(options.format, "esm",);
    assertEquals(options.write, false,);
  });
});

```

---

## Arquivo: `packages/utils/tests/esbuild/cli.test.ts`

```ts
/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { parseArgs, } from "../../src/tools/cli-flags.ts";
import type { GlobalTargetConfig, } from "../../src/tools/interfaces.ts";

// Helper para criar config mínima
function makeTarget(overrides: Record<string, unknown> = {},) {
  return {
    srcdir: "src",
    distdir: "dist",
    entryPoints: ["a.ts",],
    ...overrides,
  };
}

describe("parseArgs", () => {
  const CONFIG_DEFAULT: GlobalTargetConfig = {
    ui: makeTarget({ default: true, },),
    worker: makeTarget({ default: true, },),
    sw: makeTarget({ default: true, },),
    admin: makeTarget({ default: false, },),
  };

  it("deve usar alvos padrão se nenhum for especificado", () => {
    const result = parseArgs([], CONFIG_DEFAULT,);
    assertEquals(result.targets, ["ui", "worker", "sw",],);
    assertEquals(result.globalNoVersion, false,);
  });

  it("inclui alvo com default: false quando solicitado explicitamente", () => {
    const result = parseArgs(["admin",], CONFIG_DEFAULT,);
    assertEquals(result.targets, ["admin",],);
    assertEquals(result.globalNoVersion, false,);
  });

  it("deve detectar flag noversion isolada", () => {
    const result = parseArgs(["noversion",], CONFIG_DEFAULT,);
    assertEquals(result.targets, ["ui", "worker", "sw",],);
    assertEquals(result.globalNoVersion, true,);
  });

  it("deve combinar alvos específicos e flag noversion", () => {
    const result = parseArgs(["ui", "noversion",], CONFIG_DEFAULT,);
    assertEquals(result.targets, ["ui",],);
    assertEquals(result.globalNoVersion, true,);
  });

  it("deve ser case-insensitive para os argumentos", () => {
    const result = parseArgs(["UI", "NOVERSION",], CONFIG_DEFAULT,);
    assertEquals(result.targets, ["ui",],);
    assertEquals(result.globalNoVersion, true,);
  });

  it("CONFIG vazio retorna tudo vazio", () => {
    const result = parseArgs([], {},);
    assertEquals(result.targets, [],);
    assertEquals(result.globalNoVersion, false,);
  });
});

```

---

## Arquivo: `packages/utils/tests/esbuild/esbuild-api.test.ts`

```ts
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { parseArgs, } from "../../src/tools/cli-flags.ts";

describe("esbuild API & CLI flags integration", () => {
  it("deve integrar flags CLI com parseArgs", () => {
    const config = {
      ui: {
        mode: "build" as const,
        entryPoints: ["main.tsx",],
        srcdir: "src",
        distdir: "dist",
      },
    };

    const rawArgs = ["ui", "noversion",];
    const parsed = parseArgs(rawArgs, config,);

    assertEquals(parsed.targets, ["ui",],);
    assertEquals(parsed.globalNoVersion, true,);
  });
});

```

---

## Arquivo: `packages/utils/tests/esbuild/esbuild-options.test.ts`

```ts
/// <reference lib="deno.ns" />
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes, } from "@std/assert";
import { join, } from "@std/path";
import { buildEsbuildOptions, } from "../../src/esbuild/engine.ts";
import type { TargetConfig, } from "../../src/tools/interfaces.ts";
import { withFileStructure, } from "../helpers/fixtures.ts";

// Helper para criar config mínima válida com paths que existem
function makeConfig(
  dir: string,
  overrides: Partial<TargetConfig> = {},
): TargetConfig {
  return {
    srcdir: join(dir, "src",),
    distdir: "dist",
    entryPoints: ["main.tsx",],
    ...overrides,
  } as TargetConfig;
}

describe("buildEsbuildOptions", () => {
  describe("configuração básica", () => {
    it("usa outfile quando definido", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { outfile: "app.js", },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.outfile, "dist/app.js",);
        assertEquals(options.outdir, undefined,);
      } finally {
        await cleanup();
      }
    });
    it("usa distdir como outdir quando outfile não definido", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { distdir: "monorepo/dist", },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.outdir, "monorepo/dist",);
        assertEquals(options.outfile, undefined,);
      } finally {
        await cleanup();
      }
    });
    it("entryPoints é sempre preservado", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/a.ts": "",
        "src/b.ts": "",
      },);
      try {
        const config = makeConfig(dir, { entryPoints: ["a.ts", "b.ts",], },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.entryPoints, [
          join(dir, "src", "a.ts",),
          join(dir, "src", "b.ts",),
        ],);
      } finally {
        await cleanup();
      }
    });
  });
  describe("propriedades opcionais", () => {
    it("inclui platform quando definido", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { platform: "browser", },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.platform, "browser",);
      } finally {
        await cleanup();
      }
    });
    it("omite propriedades undefined", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir,);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.platform, undefined,);
        assertEquals(options.minify, undefined,);
      } finally {
        await cleanup();
      }
    });
    it("inclui todas as propriedades configuradas", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          platform: "browser",
          format: "esm",
          bundle: true,
          minify: true,
          sourcemap: "linked",
          target: "es2022",
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.platform, "browser",);
        assertEquals(options.format, "esm",);
        assertEquals(options.bundle, true,);
        assertEquals(options.minify, true,);
        assertEquals(options.sourcemap, "linked",);
        assertEquals(options.target, "es2022",);
      } finally {
        await cleanup();
      }
    });
  });
  describe("define", () => {
    it("injeta __APP_VERSION__ com v", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir,);
        const options = await buildEsbuildOptions("ui", config, "1.2.3-abc",);
        assertEquals(options.define.__APP_VERSION__, '"v1.2.3-abc"',);
      } finally {
        await cleanup();
      }
    });
    it("preserva defines customizados do config", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          define: {
            "__FEATURE_X__": "true",
            "__API_URL__": '"https://api.example.com"',
          },
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.define.__FEATURE_X__, "true",);
        assertEquals(options.define.__API_URL__, '"https://api.example.com"',);
        assertEquals(options.define.__APP_VERSION__, '"v1.0.0"',);
      } finally {
        await cleanup();
      }
    });
  });
  describe("banner e footer", () => {
    it("substitui __APP_VERSION__ no banner", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          banner: {
            js: "/* BuildIt v__APP_VERSION__ */\n",
          },
        },);
        const options = await buildEsbuildOptions("ui", config, "2.0.0",);
        assertStringIncludes(options.banner.js, "BuildIt v2.0.0",);
      } finally {
        await cleanup();
      }
    });
    it("substitui múltiplas ocorrências de __APP_VERSION__", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          banner: {
            js: "/* __APP_VERSION__ build __APP_VERSION__ */",
          },
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.banner.js.includes("__APP_VERSION__",), false,);
      } finally {
        await cleanup();
      }
    });
    it("substitui __APP_VERSION__ no CSS também", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          banner: {
            css: "/* CSS __APP_VERSION__ */",
          },
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertStringIncludes(options.banner.css, "CSS 1.0.0",);
      } finally {
        await cleanup();
      }
    });
    it("substitui __APP_VERSION__ no footer", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          footer: {
            js: "/* End __APP_VERSION__ */",
          },
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertStringIncludes(options.footer.js, "End 1.0.0",);
      } finally {
        await cleanup();
      }
    });
    it("lida com banner sem js", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          banner: { css: "/* css only __APP_VERSION__ */", },
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.banner.js, undefined,);
        assertStringIncludes(options.banner.css, "1.0.0",);
      } finally {
        await cleanup();
      }
    });
  });
  describe("lógica especial para SW", () => {
    it("injeta __GENERATED_ASSETS__ quando targetName é 'sw'", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir,);
        const mockListFn = () =>
          Promise.resolve(["./app.js", "./index.html",],);
        const options = await buildEsbuildOptions(
          "sw",
          config,
          "1.0.0",
          mockListFn,
        );
        const assets = JSON.parse(options.define.__GENERATED_ASSETS__,);
        assertEquals(assets, ["./app.js", "./index.html",],);
      } finally {
        await cleanup();
      }
    });
    it("não injeta __GENERATED_ASSETS__ para outros alvos", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir,);
        const mockListFn = () => Promise.resolve(["./app.js",],);
        const options = await buildEsbuildOptions(
          "ui",
          config,
          "1.0.0",
          mockListFn,
        );
        assertEquals(options.define.__GENERATED_ASSETS__, undefined,);
      } finally {
        await cleanup();
      }
    });
    it("não injeta __GENERATED_ASSETS__ se listFn não fornecida", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir,);
        const options = await buildEsbuildOptions("sw", config, "1.0.0",);
        assertEquals(options.define.__GENERATED_ASSETS__, undefined,);
      } finally {
        await cleanup();
      }
    });
  });
  describe("novas opções (1-13)", () => {
    it("inclui splitting", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { splitting: true, },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.splitting, true,);
      } finally {
        await cleanup();
      }
    });
    it("inclui loader customizado", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          loader: { ".png": "file", ".svg": "dataurl", },
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.loader[".png"], "file",);
      } finally {
        await cleanup();
      }
    });
    it("inclui alias", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          alias: { "@": "./src", "moment": "dayjs", },
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.alias["@"], "./src",);
        assertEquals(options.alias.moment, "dayjs",);
      } finally {
        await cleanup();
      }
    });
    it("inclui inject", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          inject: ["./polyfills.ts",],
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.inject, ["./polyfills.ts",],);
      } finally {
        await cleanup();
      }
    });
    it("inclui target como string", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { target: "es2022", },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.target, "es2022",);
      } finally {
        await cleanup();
      }
    });
    it("inclui target como array", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { target: ["es2022", "chrome90",], },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.target, ["es2022", "chrome90",],);
      } finally {
        await cleanup();
      }
    });
    it("inclui drop", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { drop: ["console", "debugger",], },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.drop, ["console", "debugger",],);
      } finally {
        await cleanup();
      }
    });
    it("inclui pure", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { pure: ["console.log",], },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.pure, ["console.log",],);
      } finally {
        await cleanup();
      }
    });
    it("inclui logLevel", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { logLevel: "warning", },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.logLevel, "warning",);
      } finally {
        await cleanup();
      }
    });
    it("inclui entryNames/chunkNames/assetNames", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          entryNames: "[name]-[hash]",
          chunkNames: "chunks/[name]",
          assetNames: "assets/[name]",
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.entryNames, "[name]-[hash]",);
        assertEquals(options.chunkNames, "chunks/[name]",);
        assertEquals(options.assetNames, "assets/[name]",);
      } finally {
        await cleanup();
      }
    });
  });
  describe("plugins", () => {
    it("inclui plugins quando definidos na config", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const mockPlugin = { name: "test-plugin", setup: () => {}, };
        const config = makeConfig(dir, { plugins: [mockPlugin,], },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.plugins, [mockPlugin,],);
        assertEquals(options.plugins.length, 1,);
        assertEquals(options.plugins[0].name, "test-plugin",);
      } finally {
        await cleanup();
      }
    });
    it("inclui múltiplos plugins na ordem definida", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const plugin1 = { name: "plugin-1", setup: () => {}, };
        const plugin2 = { name: "plugin-2", setup: () => {}, };
        const config = makeConfig(dir, { plugins: [plugin1, plugin2,], },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.plugins.length, 2,);
        assertEquals(options.plugins[0].name, "plugin-1",);
        assertEquals(options.plugins[1].name, "plugin-2",);
      } finally {
        await cleanup();
      }
    });
    it("omite plugins quando não definidos (undefined)", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir,);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.plugins, undefined,);
      } finally {
        await cleanup();
      }
    });
    it("omite plugins quando array vazio", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { plugins: [], },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.plugins, [],);
      } finally {
        await cleanup();
      }
    });
    it("plugins são independentes de outras opções", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const mockPlugin = { name: "my-plugin", setup: () => {}, };
        const config = makeConfig(dir, {
          plugins: [mockPlugin,],
          platform: "browser",
          bundle: true,
          minify: true,
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.plugins, [mockPlugin,],);
        assertEquals(options.platform, "browser",);
        assertEquals(options.bundle, true,);
        assertEquals(options.minify, true,);
      } finally {
        await cleanup();
      }
    });
  });
});

```

---

## Arquivo: `packages/utils/tests/esbuild/esbuild.test.ts`

```ts
/**
 * @file esbuild.test.ts
 * @description Testes unitários BDD para a lógica de configuração e utilitários do esbuild.
 */

import { describe, it, } from "@std/testing/bdd";
import { assert, assertEquals, } from "@std/assert";
import { formatVersion, parseVersion, } from "../../src/tools/version.ts";
import { isSafePath, resolveOutputPaths, } from "../../src/tools/paths.ts";
import { CONFIGURACOES_PADRAO, } from "../../src/esbuild/mod.ts";

describe("esbuild - versioning", () => {
  it("deve parsear versão semântica com hash", () => {
    const v = parseVersion("1.2.3#hash",);
    assertEquals(v.major, 1,);
    assertEquals(v.minor, 2,);
    assertEquals(v.patch, 3,);
  });

  it("deve formatar versão corretamente", () => {
    const v = formatVersion(0, 3, 8, "test",);
    assertEquals(v, "0.3.8#test",);
  });
});

describe("esbuild - paths", () => {
  it("deve validar caminhos seguros", () => {
    assert(isSafePath("dist/output.js",),);
    assert(!isSafePath("../secret.js",),);
    assert(!isSafePath("/etc/passwd",),);
  });

  it("deve resolver caminhos de saída corretamente", () => {
    const config = {
      outfile: "bundle.js",
      distdir: "dist",
      entryPoints: ["main.ts",],
    };
    const resolved = resolveOutputPaths(config,);
    assertEquals(resolved.outfile, "dist/bundle.js",);
  });
});

describe("esbuild - config", () => {
  it("deve ter configurações padrão válidas", () => {
    assert(CONFIGURACOES_PADRAO.ui !== undefined,);
    assertEquals(CONFIGURACOES_PADRAO.ui!.default, true,);
    assertEquals(CONFIGURACOES_PADRAO.ui!.platform, "browser",);
  });
});

```

---

## Arquivo: `packages/utils/tests/esbuild/filesystem.test.ts`

```ts
/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import {
  cleanTarget,
  copyStaticFiles,
  listAssetsForCache,
} from "../../src/tools/paths.ts";
import {
  fileExists,
  listFiles,
  readText,
  withFileStructure,
  withTempDir,
} from "../helpers/fixtures.ts";

describe("cleanTarget", () => {
  it("remove arquivo específico", async () => {
    await withTempDir(async (dir,) => {
      await Deno.writeTextFile(join(dir, "teste.js",), "code",);
      assertEquals(await fileExists(join(dir, "teste.js",),), true,);

      await cleanTarget(dir, ["teste.js",],);

      assertEquals(await fileExists(join(dir, "teste.js",),), false,);
    },);
  });

  it("remove pasta recursivamente", async () => {
    await withTempDir(async (dir,) => {
      const subDir = join(dir, "subpasta",);
      await Deno.mkdir(subDir,);
      await Deno.writeTextFile(join(subDir, "arquivo.js",), "code",);

      await cleanTarget(dir, ["subpasta",],);

      assertEquals(await fileExists(subDir,), false,);
    },);
  });

  it("esvazia diretório com '.'", async () => {
    await withTempDir(async (dir,) => {
      await Deno.writeTextFile(join(dir, "a.js",), "a",);
      await Deno.writeTextFile(join(dir, "b.js",), "b",);
      await Deno.mkdir(join(dir, "sub",),);
      await Deno.writeTextFile(join(dir, "sub/c.js",), "c",);

      await cleanTarget(dir, [".",],);

      const files = await listFiles(dir,);
      assertEquals(files.length, 0,);
    },);
  });

  it("ignora path traversal (..)", async () => {
    await withTempDir(async (dir,) => {
      // Cria arquivo fora do dir que não deve ser removido
      const outsideFile = join(dir, "..", "protegido.txt",);
      try {
        await Deno.writeTextFile(outsideFile, "não me remova",);
      } catch {
        // Pode falhar se não tiver permissão
      }

      await cleanTarget(dir, ["../protegido.txt",],);

      // O arquivo fora do dir deve ainda existir (se foi criado)
      try {
        assertEquals(await fileExists(outsideFile,), true,);
        await Deno.remove(outsideFile,);
      } catch {
        // Se não conseguiu criar, ok
      }
    },);
  });

  it("ignora paths absolutos", async () => {
    await withTempDir(async (dir,) => {
      // Não deve lançar erro nem remover nada
      await cleanTarget(dir, ["/etc/passwd", "/tmp/test",],);
      assertEquals(true, true,);
    },);
  });

  it("não lança erro para arquivo inexistente", async () => {
    await withTempDir(async (dir,) => {
      await cleanTarget(dir, ["nao-existe.js",],);
      assertEquals(true, true,);
    },);
  });

  it("lista vazia não faz nada", async () => {
    await withTempDir(async (dir,) => {
      await Deno.writeTextFile(join(dir, "keep.js",), "keep",);
      await cleanTarget(dir, [],);
      assertEquals(await fileExists(join(dir, "keep.js",),), true,);
    },);
  });

  it("processa múltiplos paths de uma vez", async () => {
    await withTempDir(async (dir,) => {
      await Deno.writeTextFile(join(dir, "a.js",), "a",);
      await Deno.writeTextFile(join(dir, "b.js",), "b",);
      await Deno.writeTextFile(join(dir, "c.js",), "c",);

      await cleanTarget(dir, ["a.js", "c.js",],);

      assertEquals(await fileExists(join(dir, "a.js",),), false,);
      assertEquals(await fileExists(join(dir, "b.js",),), true,);
      assertEquals(await fileExists(join(dir, "c.js",),), false,);
    },);
  });
});

describe("listAssetsForCache", () => {
  it("lista arquivos em estrutura simples", async () => {
    const { dir, cleanup, } = await withFileStructure({
      "app.js": "code",
      "style.css": "css",
    },);

    try {
      const assets = await listAssetsForCache(dir,);
      assertEquals(assets.length, 2,);
      assertEquals(assets.includes("./app.js",), true,);
      assertEquals(assets.includes("./style.css",), true,);
    } finally {
      await cleanup();
    }
  });

  it("exclui arquivos .map", async () => {
    const { dir, cleanup, } = await withFileStructure({
      "app.js": "code",
      "app.js.map": "map",
    },);

    try {
      const assets = await listAssetsForCache(dir,);
      assertEquals(assets.length, 1,);
      assertEquals(assets[0], "./app.js",);
    } finally {
      await cleanup();
    }
  });

  it("exclui metafile.json", async () => {
    const { dir, cleanup, } = await withFileStructure({
      "app.js": "code",
      "ui-metafile.json": "{}",
    },);

    try {
      const assets = await listAssetsForCache(dir,);
      assertEquals(assets.length, 1,);
    } finally {
      await cleanup();
    }
  });

  it("exclui service-worker.js por padrão", async () => {
    const { dir, cleanup, } = await withFileStructure({
      "app.js": "code",
      "service-worker.js": "sw code",
    },);

    try {
      const assets = await listAssetsForCache(dir,);
      assertEquals(assets.includes("./service-worker.js",), false,);
      assertEquals(assets.length, 1,);
    } finally {
      await cleanup();
    }
  });

  it("aceita lista de exclusão customizada", async () => {
    const { dir, cleanup, } = await withFileStructure({
      "app.js": "code",
      "temp.js": "temp",
      "debug.js": "debug",
    },);

    try {
      const assets = await listAssetsForCache(dir, ["temp.js", "debug.js",],);
      assertEquals(assets.length, 1,);
      assertEquals(assets[0], "./app.js",);
    } finally {
      await cleanup();
    }
  });

  it("lida com subdiretórios", async () => {
    const { dir, cleanup, } = await withFileStructure({
      "app.js": "code",
      "assets/logo.png": "png",
      "assets/icons/favicon.ico": "ico",
    },);

    try {
      const assets = await listAssetsForCache(dir,);
      assertEquals(assets.length, 3,);
      // Deve conter os paths relativos
      const hasLogo = assets.some((a,) => a.includes("logo.png",));
      const hasIcon = assets.some((a,) => a.includes("favicon.ico",));
      assertEquals(hasLogo, true,);
      assertEquals(hasIcon, true,);
    } finally {
      await cleanup();
    }
  });
});

describe("copyStaticFiles", () => {
  it("copia publicdir para distdir", async () => {
    const { dir: publicDir, cleanup: cleanupPublic, } = await withFileStructure(
      {
        "manifest.json": `{ "name": "BuildIt", "version": "1.0.0" }`,
        "icon.png": "png",
      },
    );

    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure(
      {},
    );

    try {
      const config = {
        srcdir: "/tmp/src",
        distdir: distDir,
        publicdir: publicDir,
        entryPoints: [],
      };

      await copyStaticFiles(config, "2.0.0",);

      // Arquivos foram copiados
      assertEquals(await fileExists(join(distDir, "manifest.json",),), true,);
      assertEquals(await fileExists(join(distDir, "icon.png",),), true,);

      // manifest.json foi atualizado
      const manifest = JSON.parse(
        await readText(join(distDir, "manifest.json",),),
      );
      assertEquals(manifest.version, "2.0.0",);
    } finally {
      await cleanupPublic();
      await cleanupDist();
    }
  });

  it("copia index.html quando indexHtml é true", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({
      "index.html": "<html></html>",
    },);

    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure(
      {},
    );

    try {
      const config = {
        srcdir: srcDir,
        distdir: distDir,
        indexHtml: true,
        entryPoints: [],
      };

      await copyStaticFiles(config, "1.0.0",);

      assertEquals(await fileExists(join(distDir, "index.html",),), true,);
      const content = await readText(join(distDir, "index.html",),);
      assertEquals(content, "<html></html>",);
    } finally {
      await cleanupSrc();
      await cleanupDist();
    }
  });

  it("não falha quando publicdir não existe", async () => {
    const { dir: distDir, cleanup, } = await withFileStructure({},);

    try {
      const config = {
        srcdir: "/tmp/src",
        distdir: distDir,
        publicdir: "/caminho/inexistente",
        entryPoints: [],
      };

      // Não deve lançar erro
      await copyStaticFiles(config, "1.0.0",);
      assertEquals(true, true,);
    } finally {
      await cleanup();
    }
  });

  it("não falha quando index.html não existe", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({},);
    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure(
      {},
    );

    try {
      const config = {
        srcdir: srcDir,
        distdir: distDir,
        indexHtml: true,
        entryPoints: [],
      };

      await copyStaticFiles(config, "1.0.0",);
      assertEquals(await fileExists(join(distDir, "index.html",),), false,);
    } finally {
      await cleanupSrc();
      await cleanupDist();
    }
  });

  it("preserva manifest.json sem version quando não há campo", async () => {
    const { dir: publicDir, cleanup: cleanupPublic, } = await withFileStructure(
      {
        "manifest.json": `{ "name": "BuildIt" }`,
      },
    );

    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure(
      {},
    );

    try {
      const config = {
        srcdir: "/tmp/src",
        distdir: distDir,
        publicdir: publicDir,
        entryPoints: [],
      };

      await copyStaticFiles(config, "3.0.0",);

      const manifest = JSON.parse(
        await readText(join(distDir, "manifest.json",),),
      );
      assertEquals(manifest.name, "BuildIt",);
      assertEquals(manifest.version, "3.0.0",);
    } finally {
      await cleanupPublic();
      await cleanupDist();
    }
  });
});

```

---

## Arquivo: `packages/utils/tests/esbuild/integration.test.ts`

```ts
/// <reference lib="deno.ns" />
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes, } from "@std/assert";
import { join, } from "@std/path";
import { processTarget, } from "../../src/esbuild/engine.ts";
import type { TargetConfig, } from "../../src/tools/interfaces.ts";
import {
  fileExists,
  readText,
  withFileStructure,
} from "../helpers/fixtures.ts";

describe("processTarget (integração)", () => {
  it("executa pipeline completo: clean, copy, build", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({
      "index.html": "<html></html>",
      "dummy.ts": "// dummy",
    },);
    const { dir: publicDir, cleanup: cleanupPublic, } = await withFileStructure(
      {
        "manifest.json": `{ "name": "BuildIt", "version": "1.0.0" }`,
      },
    );
    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure({
      "old-file.js": "should be deleted",
    },);
    try {
      const config: TargetConfig = {
        srcdir: srcDir,
        distdir: distDir,
        publicdir: publicDir,
        indexHtml: true,
        clean: [".",],
        entryPoints: ["dummy.ts",],
      };
      // Mock esbuild.build
      const mockBuild = (options: Record<string, unknown>,) => {
        // Simula escrita do arquivo de saída
        const outFile = (options.outfile as string) ||
          join(options.outdir as string, "output.js",);
        Deno.writeTextFileSync(outFile, "// bundled code",);
        return Promise.resolve({ metafile: null, errors: [], warnings: [], },);
      };
      await processTarget("ui", config, "2.0.0", mockBuild,);
      // Arquivo antigo foi removido (clean: ["."])
      assertEquals(await fileExists(join(distDir, "old-file.js",),), false,);
      // Arquivos estáticos foram copiados
      assertEquals(await fileExists(join(distDir, "index.html",),), true,);
      assertEquals(await fileExists(join(distDir, "manifest.json",),), true,);
      // manifest.json foi atualizado
      const manifest = JSON.parse(
        await readText(join(distDir, "manifest.json",),),
      );
      assertEquals(manifest.version, "2.0.0",);
      // Bundle foi gerado
      assertEquals(await fileExists(join(distDir, "output.js",),), true,);
    } finally {
      await cleanupSrc();
      await cleanupPublic();
      await cleanupDist();
    }
  });

  it("salva metafile quando gerado", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({
      "dummy.ts": "// dummy",
    },);
    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure(
      {},
    );
    try {
      const config: TargetConfig = {
        srcdir: srcDir,
        distdir: distDir,
        entryPoints: ["dummy.ts",],
        metafile: true,
      };
      const mockBuild = () =>
        Promise.resolve({
          metafile: {
            inputs: { "src/main.ts": { bytes: 100, }, },
            outputs: { "dist/main.js": { bytes: 500, }, },
          },
          errors: [],
          warnings: [],
        },);
      await processTarget("ui", config, "1.0.0", mockBuild,);
      const metafilePath = join(distDir, "ui-metafile.json",);
      assertEquals(await fileExists(metafilePath,), true,);
      const metafile = JSON.parse(await readText(metafilePath,),);
      assertEquals(metafile.inputs["src/main.ts"].bytes, 100,);
    } finally {
      await cleanupSrc();
      await cleanupDist();
    }
  });

  it("não salva metafile quando metafile é false", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({
      "dummy.ts": "// dummy",
    },);
    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure(
      {},
    );
    try {
      const config: TargetConfig = {
        srcdir: srcDir,
        distdir: distDir,
        entryPoints: ["dummy.ts",],
        metafile: false,
      };
      const mockBuild = () =>
        Promise.resolve({
          metafile: { inputs: {}, },
        },);
      await processTarget("ui", config, "1.0.0", mockBuild,);
      assertEquals(
        await fileExists(join(distDir, "ui-metafile.json",),),
        false,
      );
    } finally {
      await cleanupSrc();
      await cleanupDist();
    }
  });

  it("propaga erro do esbuild.build", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({
      "dummy.ts": "// dummy",
    },);
    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure(
      {},
    );
    try {
      const config: TargetConfig = {
        srcdir: srcDir,
        distdir: distDir,
        entryPoints: ["dummy.ts",],
      };
      const mockBuild = () => {
        throw new Error("Build failed",);
      };
      let caughtError: Error | null = null;
      try {
        await processTarget("ui", config, "1.0.0", mockBuild,);
      } catch (error) {
        caughtError = error as Error;
      }
      assertEquals(caughtError !== null, true,);
      assertStringIncludes(caughtError!.message, "Build failed",);
    } finally {
      await cleanupSrc();
      await cleanupDist();
    }
  });

  it("usa outfile quando especificado", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({
      "dummy.ts": "// dummy",
    },);
    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure(
      {},
    );
    try {
      const config: TargetConfig = {
        srcdir: srcDir,
        distdir: distDir,
        entryPoints: ["dummy.ts",],
        outfile: "custom-name.js",
      };
      let capturedOptions: Record<string, unknown> = {};
      const mockBuild = (options: Record<string, unknown>,) => {
        capturedOptions = options;
        Deno.writeTextFileSync(options.outfile as string, "// code",);
        return Promise.resolve({ metafile: null, errors: [], warnings: [], },);
      };
      await processTarget("ui", config, "1.0.0", mockBuild,);
      assertEquals(capturedOptions.outfile, join(distDir, "custom-name.js",),);
      assertEquals(capturedOptions.outdir, undefined,);
    } finally {
      await cleanupSrc();
      await cleanupDist();
    }
  });

  it("lida com SW injetando assets via listFn", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({
      "sw.ts": "// sw",
    },);
    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure({
      "app.js": "code",
      "index.html": "html",
      "service-worker.js": "sw",
    },);
    try {
      const config: TargetConfig = {
        srcdir: srcDir,
        distdir: distDir,
        entryPoints: ["sw.ts",],
      };
      let capturedDefine: Record<string, string> = {};
      const mockBuild = (options: Record<string, unknown>,) => {
        capturedDefine = options.define as Record<string, string>;
        return Promise.resolve({ metafile: null, errors: [], warnings: [], },);
      };
      const mockListFn = () => Promise.resolve(["./app.js", "./index.html",],);
      await processTarget("sw", config, "1.0.0", mockBuild, mockListFn,);
      // 🔥 CORREÇÃO: Tratamento explícito de undefined (noUncheckedIndexedAccess)
      const generatedAssets = capturedDefine["__GENERATED_ASSETS__"]!;
      const appVersion = capturedDefine["__APP_VERSION__"]!;
      const assets = JSON.parse(generatedAssets,);
      assertEquals(assets, ["./app.js", "./index.html",],);
      assertStringIncludes(appVersion, "v1.0.0",);
    } finally {
      await cleanupSrc();
      await cleanupDist();
    }
  });
});

```

---

## Arquivo: `packages/utils/tests/esbuild/output-paths.test.ts`

```ts
/// <reference lib="deno.ns" />
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes, assertThrows, } from "@std/assert";
import { resolveOutputPaths, } from "../../src/tools/paths.ts";
import { validateTargetConfig, } from "../../src/tools/validate.ts";
import type { TargetConfig, } from "../../src/tools/interfaces.ts";

describe("validateTargetConfig", () => {
  describe("distdir obrigatório", () => {
    it("lança erro quando publicdir existe mas distdir não", () => {
      const config: TargetConfig = {
        srcdir: "src",
        publicdir: "public",
        entryPoints: ["app.tsx",],
      };
      assertThrows(
        () => validateTargetConfig("ui", config,),
        Error,
        "'distdir'",
      );
    });
    it("lança erro quando indexHtml é true mas distdir não", () => {
      const config: TargetConfig = {
        srcdir: "src",
        indexHtml: true,
        entryPoints: ["app.tsx",],
      };
      assertThrows(
        () => validateTargetConfig("ui", config,),
        Error,
        "'distdir'",
      );
    });
    it("lança erro quando outfile não existe e distdir não", () => {
      const config: TargetConfig = {
        srcdir: "src",
        entryPoints: ["app.tsx",],
      };
      assertThrows(
        () => validateTargetConfig("ui", config,),
        Error,
        "'distdir'",
      );
    });
    it("NÃO lança erro quando outfile existe mas distdir não", () => {
      const config: TargetConfig = {
        srcdir: "src",
        outfile: "/absolute/path/app.js",
        entryPoints: ["app.tsx",],
      };
      // Não deve lançar
      validateTargetConfig("ui", config,);
    });
    it("NÃO lança erro quando distdir existe", () => {
      const config: TargetConfig = {
        srcdir: "src",
        distdir: "dist",
        entryPoints: ["app.tsx",],
      };
      validateTargetConfig("ui", config,);
    });
  });

  describe("mensagens de erro didáticas", () => {
    it("lista todos os motivos quando múltiplas condições falham", () => {
      const config: TargetConfig = {
        srcdir: "src",
        publicdir: "public",
        indexHtml: true,
        entryPoints: ["app.tsx",],
      };
      try {
        validateTargetConfig("ui", config,);
      } catch (e) {
        const msg = (e as Error).message;
        assertStringIncludes(msg, "'publicdir' está configurado",);
        assertStringIncludes(msg, "'indexHtml' é true",);
        assertStringIncludes(msg, "'outfile' não está configurado",);
      }
    });
  });
});

describe("resolveOutputPaths", () => {
  describe("outfile relativo ao distdir", () => {
    it("faz join quando ambos existem", () => {
      const config: TargetConfig = {
        srcdir: "src",
        distdir: "monorepo/server/build/dist",
        outfile: "app.js",
        entryPoints: ["app.tsx",],
      };
      const result = resolveOutputPaths(config,);
      assertEquals(result.outfile, "monorepo/server/build/dist/app.js",);
      assertEquals(result.outdir, undefined,);
    });
    it("faz join com subdiretórios", () => {
      const config: TargetConfig = {
        srcdir: "src",
        distdir: "dist",
        outfile: "js/app.js",
        entryPoints: ["app.tsx",],
      };
      const result = resolveOutputPaths(config,);
      assertEquals(result.outfile, "dist/js/app.js",);
    });
  });

  describe("outfile absoluto (sem distdir)", () => {
    it("mantém outfile como está quando distdir não existe", () => {
      const config: TargetConfig = {
        srcdir: "src",
        outfile: "/absolute/path/app.js",
        entryPoints: ["app.tsx",],
      };
      const result = resolveOutputPaths(config,);
      assertEquals(result.outfile, "/absolute/path/app.js",);
      assertEquals(result.outdir, undefined,);
    });
  });

  describe("distdir como outdir (sem outfile)", () => {
    it("usa distdir como outdir quando outfile não existe", () => {
      const config: TargetConfig = {
        srcdir: "src",
        distdir: "dist",
        entryPoints: ["app.tsx",],
      };
      const result = resolveOutputPaths(config,);
      assertEquals(result.outdir, "dist",);
      assertEquals(result.outfile, undefined,);
    });
  });

  describe("nenhum configurado", () => {
    it("retorna objeto vazio", () => {
      const config: TargetConfig = {
        srcdir: "src",
        entryPoints: ["app.tsx",],
      };
      const result = resolveOutputPaths(config,);
      assertEquals(result.outfile, undefined,);
      assertEquals(result.outdir, undefined,);
    });
  });
});

```

---

## Arquivo: `packages/utils/tests/esbuild/paths.test.ts`

```ts
/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { isSafePath, } from "../../src/tools/paths.ts";

describe("isSafePath", () => {
  describe("paths seguros", () => {
    const safePaths = [
      "arquivo.js",
      "pasta/arquivo.js",
      "pasta/subpasta/arquivo.js",
      ".",
      "file-with-dash.js",
      "file_with_underscore.js",
      "file.name.with.dots.js",
      "UPPERCASE.js",
      "123.js",
      "path/to/file",
    ];

    for (const path of safePaths) {
      it(`aceita "${path}"`, () => {
        assertEquals(isSafePath(path,), true,);
      });
    }
  });

  describe("paths bloqueados (path traversal)", () => {
    const traversalPaths = [
      "..",
      "../file.js",
      "pasta/../file.js",
      "a/b/c/../../file.js",
      "../../../etc/passwd",
      "foo..bar",
      "file..js",
    ];

    for (const path of traversalPaths) {
      it(`bloqueia "${path}"`, () => {
        assertEquals(isSafePath(path,), false,);
      });
    }
  });

  describe("paths bloqueados (absolutos Unix)", () => {
    const absolutePaths = [
      "/etc/passwd",
      "/home/user",
      "/var/log/system.log",
      "/tmp/test",
    ];

    for (const path of absolutePaths) {
      it(`bloqueia "${path}"`, () => {
        assertEquals(isSafePath(path,), false,);
      });
    }
  });

  describe("edge cases", () => {
    it("string vazia é considerada segura (não é traversal nem absoluta)", () => {
      assertEquals(isSafePath("",), true,);
    });

    it("path com apenas espaços é seguro", () => {
      assertEquals(isSafePath("   ",), true,);
    });

    it("path com caracteres especiais é seguro", () => {
      assertEquals(isSafePath("file@name.js",), true,);
      assertEquals(isSafePath("file+name.js",), true,);
    });
  });
});

```

---

## Arquivo: `packages/utils/tests/esbuild/version.test.ts`

```ts
/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes, assertThrows, } from "@std/assert";
import {
  currentVersion,
  extractVersionFromContent,
  formatVersion,
  incrementVersion,
  parseVersion,
  replaceVersionInContent,
} from "../../src/tools/version.ts";
import { withTempDenoJsonc, } from "../helpers/fixtures.ts";

describe("parseVersion", () => {
  describe("casos válidos", () => {
    const validCases = [
      { input: "1.2.3", expected: { major: 1, minor: 2, patch: 3, }, },
      { input: "0.0.0", expected: { major: 0, minor: 0, patch: 0, }, },
      { input: "99.99.99", expected: { major: 99, minor: 99, patch: 99, }, },
      {
        input: "0.2.148#msv0okam",
        expected: { major: 0, minor: 2, patch: 148, },
      },
      { input: "1.0.0#alpha", expected: { major: 1, minor: 0, patch: 0, }, },
      { input: "2.0.0#beta.1", expected: { major: 2, minor: 0, patch: 0, }, },
      {
        input: "1.0.0#alpha-beta-1",
        expected: { major: 1, minor: 0, patch: 0, },
      },
    ];
    for (const { input, expected, } of validCases) {
      it(`parseia "${input}" corretamente`, () => {
        assertEquals(parseVersion(input,), expected,);
      });
    }
  });
  describe("casos inválidos", () => {
    const invalidCases = [
      { input: "", desc: "string vazia", },
      { input: "1.2", desc: "apenas 2 partes", },
      { input: "1.2.3.4", desc: "4 partes", },
      { input: "a.b.c", desc: "letras", },
      { input: "1.abc.3", desc: "parte não numérica", },
      { input: "v1.2.3", desc: "prefixo v", },
      { input: "1.2.3#", desc: "cardinal sem hash", },
      { input: " 1.2.3", desc: "espaço antes", },
      { input: "1.2.3 ", desc: "espaço depois", },
    ];
    for (const { input, desc, } of invalidCases) {
      it(`lança erro para ${desc} ("${input}")`, () => {
        assertThrows(() => parseVersion(input,), Error,);
      });
    }
  });
});

describe("formatVersion", () => {
  it("formata com hash fornecido", () => {
    assertEquals(formatVersion(1, 2, 3, "abc",), "1.2.3#abc",);
  });
  it("gera hash automático quando não fornecido", () => {
    const result = formatVersion(0, 2, 149,);
    assertStringIncludes(result, "0.2.149#",);
    // Hash deve ter pelo menos alguns caracteres
    const hash = result.split("#",)[1];
    // 🔥 CORREÇÃO: Tratamento explícito de undefined (noUncheckedIndexedAccess)
    assertEquals(hash !== undefined && hash.length > 0, true,);
  });
  it("usa o mesmo hash em chamadas com mesmo parâmetro", () => {
    const hash = "fixedhash";
    assertEquals(
      formatVersion(1, 0, 0, hash,),
      formatVersion(1, 0, 0, hash,),
    );
  });
  it("lida com números grandes", () => {
    assertEquals(formatVersion(999, 999, 999, "x",), "999.999.999#x",);
  });
});

describe("extractVersionFromContent", () => {
  it("extrai versão de JSON simples", () => {
    assertEquals(
      extractVersionFromContent(`{ "version": "1.2.3" }`,),
      "1.2.3",
    );
  });
  it("extrai versão de JSONC com comentários", () => {
    const content = `{
      // Comentário
      "name": "buildit",
      "version": "2.0.0", /* inline */
    }`;
    assertEquals(extractVersionFromContent(content,), "2.0.0",);
  });
  it("extrai versão com hash", () => {
    assertEquals(
      extractVersionFromContent(`{ "version": "1.2.3-abc123" }`,),
      "1.2.3-abc123",
    );
  });
  it("retorna null quando não há versão", () => {
    assertEquals(
      extractVersionFromContent(`{ "name": "buildit" }`,),
      null,
    );
  });
  it("retorna null para string vazia", () => {
    assertEquals(extractVersionFromContent("",), null,);
  });
  it("ignora campos 'version' dentro de strings", () => {
    const content = `{ "name": "tem version: 1.0.0 no nome" }`;
    assertEquals(extractVersionFromContent(content,), null,);
  });
});

describe("replaceVersionInContent", () => {
  it("substitui versão preservando o resto", () => {
    const content = `{
      "name": "@buildit/app",
      "version": "1.0.0-old",
      "imports": {}
    }`;
    const result = replaceVersionInContent(content, "2.0.0-new",);
    assertStringIncludes(result, `"version": "2.0.0-new"`,);
    assertStringIncludes(result, `"name": "@buildit/app"`,);
    assertStringIncludes(result, `"imports"`,);
  });
  it("substitui apenas a primeira ocorrência", () => {
    const content = `{ "version": "1.0.0", "other": "version": "2.0.0" }`;
    const result = replaceVersionInContent(content, "3.0.0",);
    // A primeira deve ser substituída
    assertStringIncludes(result, `"version": "3.0.0"`,);
  });
});

describe("currentVersion (integração)", () => {
  it("lê versão de arquivo existente", async () => {
    const { path, cleanup, } = await withTempDenoJsonc("1.2.3-abc",);
    try {
      const version = await currentVersion(path,);
      assertEquals(version, "1.2.3-abc",);
    } finally {
      await cleanup();
    }
  });
  it("lança erro quando arquivo não existe", async () => {
    let threw = false;
    try {
      await currentVersion("/caminho/que/nao/existe/deno.jsonc",);
    } catch {
      threw = true;
    }
    assertEquals(threw, true,);
  });
  it("lança erro quando versão não está no arquivo", async () => {
    const { path, cleanup, } = await withTempDenoJsonc("1.0.0", {
      version: undefined,
    },);
    try {
      // Reescreve sem version
      await Deno.writeTextFile(path, `{ "name": "buildit" }`,);
      let errorMessage = "";
      try {
        await currentVersion(path,);
      } catch (error) {
        errorMessage = (error as Error).message;
      }
      assertStringIncludes(errorMessage, "Versão não encontrada",);
    } finally {
      await cleanup();
    }
  });
});

describe("incrementVersion (integração)", () => {
  it("incrementa patch e atualiza arquivo", async () => {
    const { path, cleanup, } = await withTempDenoJsonc("1.2.3",);
    try {
      const newVersion = await incrementVersion("1.2.3", path, "testhash",);
      assertEquals(newVersion, "1.2.4#testhash",);
      const content = await Deno.readTextFile(path,);
      assertStringIncludes(content, `"version": "1.2.4#testhash"`,);
    } finally {
      await cleanup();
    }
  });
  it("preserva outras propriedades do JSON", async () => {
    const { path, cleanup, } = await withTempDenoJsonc("0.0.1", {
      name: "@buildit/app",
      imports: { preact: "https://esm.sh/preact", },
    },);
    try {
      await incrementVersion("0.0.1", path, "x",);
      const content = await Deno.readTextFile(path,);
      assertStringIncludes(content, `"name": "@buildit/app"`,);
      assertStringIncludes(content, `"preact"`,);
    } finally {
      await cleanup();
    }
  });
  it("incrementa múltiplas vezes", async () => {
    const { path, cleanup, } = await withTempDenoJsonc("1.0.0",);
    try {
      const v1 = await incrementVersion("1.0.0", path, "h1",);
      assertEquals(v1, "1.0.1#h1",);
      const v2 = await incrementVersion(v1, path, "h2",);
      assertEquals(v2, "1.0.2#h2",);
      const v3 = await incrementVersion(v2, path, "h3",);
      assertEquals(v3, "1.0.3#h3",);
    } finally {
      await cleanup();
    }
  });
});

```

---

## Arquivo: `packages/utils/tests/export/export-api.test.ts`

```ts
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import { exportEngine, } from "../../src/export/engine.ts";

describe("exportEngine programmatic API", () => {
  it("deve aceitar configuração baseada em includes/excludes e realizar streaming para o disco", async () => {
    const tempDir = await Deno.makeTempDir();
    const srcDir = join(tempDir, "src",);
    await Deno.mkdir(srcDir, { recursive: true, },);

    // Cria deno.jsonc com versão customizada do projeto
    const denoJsonc = join(tempDir, "deno.jsonc",);
    await Deno.writeTextFile(
      denoJsonc,
      JSON.stringify({ version: "0.9.5", },),
    );

    // Cria arquivos de teste
    await Deno.writeTextFile(
      join(srcDir, "sample.ts",),
      'export const hello = "world";',
    );
    await Deno.writeTextFile(join(srcDir, "ignore.test.ts",), "test",);

    const configEmMemoria = {
      testMode: {
        arquivoSaida: "snapshots/test-out.md",
        includes: ["src/**/*.{ts,tsx}",],
        excludes: ["**/*.test.ts",],
        incluiVersao: true,
        instrucaoCustomizada: "Snapshot de teste para IA",
        default: true,
      },
    };

    const resultados = await exportEngine({
      config: configEmMemoria,
      modos: ["testMode",],
      baseDir: tempDir,
      denoJsoncPath: denoJsonc,
      silencioso: true,
    },);

    assertEquals(resultados.length, 1,);
    assertEquals(resultados[0]?.modo, "testMode",);
    assertEquals(resultados[0]?.arquivos, 1,);
    assertEquals((resultados[0]?.bytes ?? 0) > 0, true,);

    const snapshotConteudo = await Deno.readTextFile(
      join(tempDir, "snapshots", "test-out.md",),
    );
    assertEquals(snapshotConteudo.includes("[v0.9.5]",), true,);
    assertEquals(
      snapshotConteudo.includes("Snapshot de teste para IA",),
      true,
    );
    assertEquals(
      snapshotConteudo.includes('export const hello = "world";',),
      true,
    );
    assertEquals(snapshotConteudo.includes("ignore.test.ts",), false,);

    await Deno.remove(tempDir, { recursive: true, },);
  });

  it("deve exportar com sucesso utilizando includes e globs", async () => {
    const tempDir = await Deno.makeTempDir();
    const srcDir = join(tempDir, "src",);
    await Deno.mkdir(srcDir, { recursive: true, },);

    await Deno.writeTextFile(
      join(srcDir, "index.ts",),
      'console.log("direct config");',
    );

    const resultados = await exportEngine({
      config: {
        direto: {
          arquivoSaida: "direct.md",
          includes: ["src/**/*.{ts,tsx}",],
          incluiVersao: false,
          instrucaoCustomizada: "Teste direto",
        },
      },
      modos: ["direto",],
      baseDir: tempDir,
      silencioso: true,
    },);

    assertEquals(resultados.length, 1,);
    assertEquals(resultados[0]?.modo, "direto",);
    assertEquals(resultados[0]?.arquivos, 1,);

    const snapshot = await Deno.readTextFile(join(tempDir, "direct.md",),);
    assertEquals(snapshot.includes('console.log("direct config");',), true,);

    await Deno.remove(tempDir, { recursive: true, },);
  });
});

```

---

## Arquivo: `packages/utils/tests/export/export.test.ts`

```ts
/**
 * @file export.test.ts
 * @description Testes unitários BDD para a lógica de filtragem, expandGlob e execução do exportador de contexto.
 */

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import { CONFIGURACOES_PADRAO, } from "../../src/export/mod.ts";
import { deveIncluirArquivo, } from "../../src/export/formatter.ts";
import {
  coletarArquivosParaExportacao,
  parseArgs,
} from "../../src/export/engine.ts";
import type { ExportConfig, } from "../../src/tools/interfaces.ts";

describe("deveIncluirArquivo", () => {
  it("deve BLOQUEAR qualquer arquivo dentro da pasta exports/ ou snapshots/", () => {
    const config = CONFIGURACOES_PADRAO.server!;
    assertEquals(deveIncluirArquivo("exports/server.md", config,), false,);
    assertEquals(deveIncluirArquivo("snapshots/server.md", config,), false,);
    assertEquals(
      deveIncluirArquivo("exports/.github/workflows/test.yml", config,),
      false,
    );
  });

  it("deve PERMITIR caminhos contemplados pelo padrão includes", () => {
    const config: ExportConfig = {
      arquivoSaida: "snapshots/custom.md",
      includes: [
        "packages/server/{src,docs}/**/*.{ts,md}",
        ".github/workflows/**/*.{yaml,yml}",
      ],
      excludes: ["**/*.test.ts",],
    };

    assertEquals(
      deveIncluirArquivo("packages/server/src/main.ts", config,),
      true,
    );
    assertEquals(
      deveIncluirArquivo("packages/server/docs/arquitetura.md", config,),
      true,
    );
    assertEquals(
      deveIncluirArquivo(".github/workflows/deploy.yml", config,),
      true,
    );
  });

  it("deve BLOQUEAR caminhos contemplados pelo padrão excludes", () => {
    const config: ExportConfig = {
      arquivoSaida: "snapshots/custom.md",
      includes: ["packages/server/src/**/*.{ts,tsx}",],
      excludes: ["**/*.test.ts", "**/dist/**",],
    };

    assertEquals(
      deveIncluirArquivo("packages/server/src/main.ts", config,),
      true,
    );
    assertEquals(
      deveIncluirArquivo("packages/server/src/main.test.ts", config,),
      false,
    );
    assertEquals(
      deveIncluirArquivo("packages/server/src/dist/bundle.ts", config,),
      false,
    );
  });

  it("deve BLOQUEAR arquivos fora dos padrões includes", () => {
    const config: ExportConfig = {
      arquivoSaida: "snapshots/custom.md",
      includes: ["packages/server/src/**/*.{ts,tsx}",],
    };

    assertEquals(
      deveIncluirArquivo("packages/ui/src/app.tsx", config,),
      false,
    );
    assertEquals(
      deveIncluirArquivo("docs/readme.md", config,),
      false,
    );
  });
});

describe("coletarArquivosParaExportacao (expandGlob)", () => {
  it("deve coletar arquivos usando brace expansion e respeitar excludes de forma ordenada", async () => {
    const tempDir = await Deno.makeTempDir();
    const srcDir = join(tempDir, "src",);
    const testDir = join(tempDir, "tests",);
    await Deno.mkdir(srcDir, { recursive: true, },);
    await Deno.mkdir(testDir, { recursive: true, },);

    await Deno.writeTextFile(join(srcDir, "index.ts",), "console.log(1);",);
    await Deno.writeTextFile(
      join(srcDir, "app.tsx",),
      "export default () => {};",
    );
    await Deno.writeTextFile(join(srcDir, "helper.test.ts",), "test",);
    await Deno.writeTextFile(join(testDir, "suite.test.ts",), "test",);

    const config: ExportConfig = {
      arquivoSaida: "snapshots/out.md",
      includes: [
        "src/**/*.{ts,tsx}",
      ],
      excludes: [
        "**/*.test.ts",
      ],
    };

    const arquivos = await coletarArquivosParaExportacao(config, tempDir,);

    assertEquals(arquivos, [
      "src/app.tsx",
      "src/index.ts",
    ],);

    await Deno.remove(tempDir, { recursive: true, },);
  });
});

describe("parseArgs", () => {
  it("deve retornar todos os modos com default !== false quando sem argumentos", () => {
    const modos = parseArgs([], CONFIGURACOES_PADRAO,);
    assertEquals(modos.includes("ui",), true,);
    assertEquals(modos.includes("server",), true,);
    assertEquals(modos.includes("utils",), true,);
    assertEquals(modos.includes("docs",), false,); // docs tem default: false
  });

  it("deve retornar apenas o modo solicitado via CLI", () => {
    const modos = parseArgs(["docs",], CONFIGURACOES_PADRAO,);
    assertEquals(modos, ["docs",],);
  });

  it("deve ignorar argumentos desconhecidos", () => {
    const modos = parseArgs(["desconhecido", "ui",], CONFIGURACOES_PADRAO,);
    assertEquals(modos, ["ui",],);
  });
});

```

---

## Arquivo: `packages/utils/tests/export/utils.test.ts`

```````ts
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes, } from "@std/assert";
import {
  calcularCraseWrapper,
  correspondeGlobs,
  deveIncluirArquivo,
  formatarArquivoMarkdown,
  gerarCabecalho,
  mapearExtensao,
  normalizarCaminho,
} from "../../src/export/formatter.ts";
import { EXTENSOES_PADRAO, } from "../../src/tools/interfaces.ts";
import type { ExportConfig, } from "../../src/tools/interfaces.ts";

// Helper para criar config customizada em testes
function makeConfig(overrides: Partial<ExportConfig> = {},): ExportConfig {
  return {
    arquivoSaida: "snapshot.md",
    includes: ["**/*",],
    incluiVersao: false,
    instrucaoCustomizada: "Teste",
    ...overrides,
  };
}

// ============================================================================
// 🛠️ FUNÇÕES UTILITÁRIAS
// ============================================================================

describe("normalizarCaminho", () => {
  it("converte barras invertidas em barras normais", () => {
    assertEquals(normalizarCaminho("a\\b\\c",), "a/b/c",);
  });

  it("converte para minúsculas", () => {
    assertEquals(normalizarCaminho("ABC/DEF",), "abc/def",);
  });

  it("lida com ambos simultaneamente", () => {
    assertEquals(normalizarCaminho("A\\B\\C/DEF",), "a/b/c/def",);
  });

  it("preserva caminho já normalizado", () => {
    assertEquals(normalizarCaminho("a/b/c",), "a/b/c",);
  });

  it("lida com string vazia", () => {
    assertEquals(normalizarCaminho("",), "",);
  });
});

describe("calcularCraseWrapper", () => {
  it("retorna ``` para texto sem crases", () => {
    assertEquals(calcularCraseWrapper("texto normal",), "```",);
  });

  it("retorna ```` para texto com ```", () => {
    assertEquals(calcularCraseWrapper("código com ```",), "````",);
  });

  it("retorna 6 crases para texto com `````", () => {
    assertEquals(calcularCraseWrapper("texto `````",), "``````",);
  });

  it("usa no mínimo 3 crases", () => {
    assertEquals(calcularCraseWrapper("com ` uma crase",), "```",);
    assertEquals(calcularCraseWrapper("com `` duas",), "```",);
  });

  it("lida com múltiplas sequências (usa a maior)", () => {
    assertEquals(
      calcularCraseWrapper("com ` e ``` e ``",),
      "````",
    );
  });

  it("lida com string vazia", () => {
    assertEquals(calcularCraseWrapper("",), "```",);
  });
});

describe("mapearExtensao", () => {
  it("mapeia .manifest para json", () => {
    assertEquals(mapearExtensao("manifest.manifest",), "json",);
  });

  it("mapeia .jsonc para json", () => {
    assertEquals(mapearExtensao("config.jsonc",), "json",);
  });

  it("mapeia .yml para yaml", () => {
    assertEquals(mapearExtensao("workflow.yml",), "yaml",);
  });

  it("mapeia .sh para bash", () => {
    assertEquals(mapearExtensao("deploy.sh",), "bash",);
  });

  it("mapeia .env* para properties", () => {
    assertEquals(mapearExtensao(".env",), "properties",);
    assertEquals(mapearExtensao(".env.example",), "properties",);
    assertEquals(mapearExtensao(".env.local",), "properties",);
  });

  it("retorna a extensão como está para casos não mapeados", () => {
    assertEquals(mapearExtensao("arquivo.ts",), "ts",);
    assertEquals(mapearExtensao("arquivo.tsx",), "tsx",);
    assertEquals(mapearExtensao("arquivo.md",), "md",);
  });

  it("é case insensitive", () => {
    assertEquals(mapearExtensao("arquivo.JSONC",), "json",);
    assertEquals(mapearExtensao("arquivo.YML",), "yaml",);
  });
});

describe("correspondeGlobs", () => {
  it("deve corresponder com wildcards simples", () => {
    assertEquals(correspondeGlobs("src/main.ts", ["src/*.ts",],), true,);
    assertEquals(correspondeGlobs("src/main.js", ["src/*.ts",],), false,);
  });

  it("deve corresponder com globstar recursivo", () => {
    assertEquals(
      correspondeGlobs("packages/ui/src/app.tsx", ["packages/ui/**",],),
      true,
    );
  });

  it("deve corresponder com brace expansion", () => {
    assertEquals(
      correspondeGlobs("src/main.tsx", ["src/**/*.{ts,tsx}",],),
      true,
    );
    assertEquals(
      correspondeGlobs("src/main.ts", ["src/**/*.{ts,tsx}",],),
      true,
    );
    assertEquals(
      correspondeGlobs("src/main.css", ["src/**/*.{ts,tsx}",],),
      false,
    );
  });
});

// ============================================================================
// 🎯 LÓGICA DE FILTRAGEM
// ============================================================================

describe("deveIncluirArquivo", () => {
  describe("proteção anti-loop", () => {
    it("bloqueia qualquer arquivo dentro de exports/", () => {
      const config = makeConfig({
        includes: ["**/*",],
      },);
      assertEquals(deveIncluirArquivo("exports/server.md", config,), false,);
      assertEquals(deveIncluirArquivo("exports/sub/file.ts", config,), false,);
    });

    it("bloqueia mesmo com extensão válida", () => {
      const config = makeConfig({
        includes: ["**/*.{md,ts}",],
      },);
      assertEquals(deveIncluirArquivo("exports/qualquer.ts", config,), false,);
    });
  });

  describe("modo moderno includes / excludes", () => {
    it("permite arquivo que casa com includes e não casa com excludes", () => {
      const config: ExportConfig = {
        arquivoSaida: "snapshot.md",
        includes: ["src/**/*.{ts,tsx}",],
        excludes: ["**/*.test.ts",],
      };
      assertEquals(deveIncluirArquivo("src/app.tsx", config,), true,);
      assertEquals(deveIncluirArquivo("src/app.test.ts", config,), false,);
    });
  });

  describe("caminhos adicionais e arquivos raiz via glob", () => {
    it("permite caminho adicional com extensão válida", () => {
      const config: ExportConfig = {
        arquivoSaida: "snapshot.md",
        includes: ["src/**/*.{ts,tsx}", ".github/workflows/*.{yml,yaml}",],
      };
      assertEquals(
        deveIncluirArquivo(".github/workflows/deploy.yml", config,),
        true,
      );
      assertEquals(
        deveIncluirArquivo(".github/workflows/ci.yaml", config,),
        true,
      );
    });

    it("bloqueia caminho com extensão que não casa com glob", () => {
      const config: ExportConfig = {
        arquivoSaida: "snapshot.md",
        includes: [".github/workflows/*.yml",],
      };
      assertEquals(
        deveIncluirArquivo(".github/workflows/segredo.png", config,),
        false,
      );
    });

    it("permite arquivo exato no caminho adicional", () => {
      const config: ExportConfig = {
        arquivoSaida: "snapshot.md",
        includes: ["README.md",],
      };
      assertEquals(deveIncluirArquivo("README.md", config,), true,);
    });
  });

  describe("pastas e subpastas via glob", () => {
    it("permite arquivo dentro de subpasta permitida", () => {
      const config: ExportConfig = {
        arquivoSaida: "snapshot.md",
        includes: ["monorepo/server/{src,docs}/**/*.{ts,md}",],
      };
      assertEquals(
        deveIncluirArquivo("monorepo/server/src/main.ts", config,),
        true,
      );
      assertEquals(
        deveIncluirArquivo("monorepo/server/docs/arquitetura.md", config,),
        true,
      );
    });

    it("bloqueia arquivo fora das pastas incluídas", () => {
      const config: ExportConfig = {
        arquivoSaida: "snapshot.md",
        includes: ["monorepo/server/src/**/*",],
      };
      assertEquals(
        deveIncluirArquivo("monorepo/ui/src/app.tsx", config,),
        false,
      );
    });

    it("bloqueia arquivo em subpasta excluída", () => {
      const config: ExportConfig = {
        arquivoSaida: "snapshot.md",
        includes: ["monorepo/server/**/*",],
        excludes: ["monorepo/server/dist/**/*",],
      };
      assertEquals(
        deveIncluirArquivo("monorepo/server/dist/bundle.js", config,),
        false,
      );
    });
  });

  describe("arquivos raiz via glob", () => {
    it("permite arquivos raiz explicitamente configurados", () => {
      const config: ExportConfig = {
        arquivoSaida: "snapshot.md",
        includes: ["monorepo/server/{deno.json,deploy.sh}",],
      };
      assertEquals(
        deveIncluirArquivo("monorepo/server/deno.json", config,),
        true,
      );
      assertEquals(
        deveIncluirArquivo("monorepo/server/deploy.sh", config,),
        true,
      );
    });

    it("bloqueia arquivos raiz não configurados", () => {
      const config: ExportConfig = {
        arquivoSaida: "snapshot.md",
        includes: ["monorepo/server/deno.json",],
      };
      assertEquals(
        deveIncluirArquivo("monorepo/server/package.json", config,),
        false,
      );
    });
  });

  describe("configuração tipo docs via glob", () => {
    it("captura raiz e subpasta docs", () => {
      const config: ExportConfig = {
        arquivoSaida: "snapshot.md",
        includes: ["readme.md", "docs/**/*.md",],
      };
      assertEquals(deveIncluirArquivo("readme.md", config,), true,);
      assertEquals(deveIncluirArquivo("docs/arquitetura.md", config,), true,);
    });

    it("bloqueia código fonte fora de docs", () => {
      const config: ExportConfig = {
        arquivoSaida: "snapshot.md",
        includes: ["docs/**/*.md",],
      };
      assertEquals(deveIncluirArquivo("src/main.ts", config,), false,);
    });
  });
});

// ============================================================================
// 📝 GERAÇÃO DE CONTEÚDO
// ============================================================================

describe("gerarCabecalho", () => {
  it("inclui instrução customizada", () => {
    const config = makeConfig({
      instrucaoCustomizada: "Este é um código de TESTE.",
    },);
    const resultado = gerarCabecalho(config, "test", "1.0.0",);
    assertStringIncludes(resultado, "código de TESTE",);
  });

  it("inclui versão quando incluiVersao é true", () => {
    const config = makeConfig({ incluiVersao: true, },);
    const resultado = gerarCabecalho(config, "ui", "1.2.3",);
    assertStringIncludes(resultado, "[v1.2.3]",);
    assertStringIncludes(resultado, "BuildIt [v1.2.3]",);
  });

  it("não inclui versão quando incluiVersao é false", () => {
    const config = makeConfig({ incluiVersao: false, },);
    const resultado = gerarCabecalho(config, "server", "1.2.3",);
    assertEquals(resultado.includes("[v1.2.3]",), false,);
  });

  it("inclui nome do modo em maiúsculas", () => {
    const config = makeConfig();
    const resultado = gerarCabecalho(config, "ui", "1.0.0",);
    assertStringIncludes(resultado, "Modo: UI",);
  });

  it("inclui timestamp de geração", () => {
    const config = makeConfig();
    const resultado = gerarCabecalho(config, "ui", "1.0.0",);
    assertStringIncludes(resultado, "Gerado automaticamente em:",);
  });

  it("usa cabeçalho padrão com diretrizes de arquivo quando cabecalho não for fornecido", () => {
    const config = makeConfig();
    const resultado = gerarCabecalho(config, "ui", "1.0.0",);
    assertStringIncludes(
      resultado,
      "> Cada arquivo começa com um título indicando seu caminho relativo exato (ex: `## Arquivo: src/main.ts`).",
    );
    assertStringIncludes(
      resultado,
      "> Sempre que sugerir alterações, indique claramente qual arquivo deve ser modificado com base nesses caminhos e forneça o novo código completo do arquivo.",
    );
  });

  it("permite substituir o cabeçalho através da opção cabecalho", () => {
    const customCabecalho = "> Diretriz especial e única para este projeto.";
    const config = makeConfig({ cabecalho: customCabecalho, },);
    const resultado = gerarCabecalho(config, "ui", "1.0.0",);
    assertStringIncludes(resultado, customCabecalho,);
    assertEquals(
      resultado.includes(
        "Cada arquivo começa com um título indicando seu caminho relativo exato",
      ),
      false,
    );
  });

  it("permite customizar o nome do projeto via opção projeto", () => {
    const config = makeConfig({ projeto: "MeuSuperApp", },);
    const resultado = gerarCabecalho(config, "ui", "1.0.0",);
    assertStringIncludes(
      resultado,
      "# Contexto Exportado do Projeto MeuSuperApp - Modo: UI",
    );
  });
});

describe("formatarArquivoMarkdown", () => {
  it("formata arquivo com caminho e conteúdo", () => {
    const resultado = formatarArquivoMarkdown(
      "src/main.ts",
      "console.log('hello');",
    );
    assertStringIncludes(resultado, "## Arquivo: `src/main.ts`",);
    assertStringIncludes(resultado, "```ts",);
    assertStringIncludes(resultado, "console.log('hello');",);
  });

  it("usa extensão mapeada para highlight", () => {
    const resultado = formatarArquivoMarkdown("config.jsonc", "{}",);
    assertStringIncludes(resultado, "```json",);
  });

  it("aumenta crases quando conteúdo tem ```", () => {
    const conteudo = "código com ```\nmais código";
    const resultado = formatarArquivoMarkdown("arquivo.md", conteudo,);
    assertStringIncludes(resultado, "````md",);
    assertStringIncludes(resultado, "````",);
  });

  it("inclui separador no final", () => {
    const resultado = formatarArquivoMarkdown("src/main.ts", "code",);
    assertStringIncludes(resultado, "---",);
  });
});

```````

---

## Arquivo: `packages/utils/tests/helpers/fixtures.ts`

```ts
/// <reference lib="deno.ns" />

import { join, } from "@std/path";

/**
 * Cria um diretório temporário com estrutura controlada para testes.
 * Retorna o caminho e uma função de cleanup.
 */
export async function withTempDir<T,>(
  fn: (dir: string,) => Promise<T>,
): Promise<T> {
  const tempDir = await Deno.makeTempDir({ prefix: "buildit-test-", },);
  try {
    return await fn(tempDir,);
  } finally {
    await Deno.remove(tempDir, { recursive: true, },);
  }
}

/**
 * Cria um arquivo deno.jsonc temporário com versão especificada.
 */
export async function withTempDenoJsonc(
  version: string,
  extras?: Record<string, unknown>,
): Promise<{ path: string; cleanup: () => Promise<void> }> {
  const tempDir = await Deno.makeTempDir({ prefix: "buildit-deno-test-", },);
  const path = join(tempDir, "deno.jsonc",);

  const content = JSON.stringify(
    {
      name: "@buildit/test",
      version,
      ...extras,
    },
    null,
    2,
  );

  await Deno.writeTextFile(path, content,);

  return {
    path,
    cleanup: async () => await Deno.remove(tempDir, { recursive: true, },),
  };
}

/**
 * Cria uma estrutura de arquivos temporária para testes de filesystem.
 */
export async function withFileStructure(
  files: Record<string, string>,
): Promise<{ dir: string; cleanup: () => Promise<void> }> {
  const tempDir = await Deno.makeTempDir({ prefix: "buildit-fs-test-", },);

  for (const [path, content,] of Object.entries(files,)) {
    const fullPath = join(tempDir, path,);
    const dirPath = fullPath.substring(0, fullPath.lastIndexOf("/",),);

    if (dirPath) {
      await Deno.mkdir(dirPath, { recursive: true, },);
    }

    await Deno.writeTextFile(fullPath, content,);
  }

  return {
    dir: tempDir,
    cleanup: async () => await Deno.remove(tempDir, { recursive: true, },),
  };
}

/**
 * Verifica se um arquivo existe.
 */
export async function fileExists(path: string,): Promise<boolean> {
  try {
    await Deno.stat(path,);
    return true;
  } catch {
    return false;
  }
}

/**
 * Lê o conteúdo de um arquivo como texto.
 */
export async function readText(path: string,): Promise<string> {
  return await Deno.readTextFile(path,);
}

/**
 * Lista arquivos em um diretório recursivamente.
 */
export async function listFiles(dir: string,): Promise<string[]> {
  const files: string[] = [];
  for await (const entry of Deno.readDir(dir,)) {
    files.push(entry.name,);
  }
  return files;
}

```

---

## Arquivo: `packages/utils/tests/helpers/targets.test.ts`

```ts
/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { resolverOrdemTargets, } from "../../src/tools/targets.ts";

describe("resolverOrdemTargets", () => {
  const config = {
    server: { default: true, },
    ui: { default: true, },
    sw: { default: true, },
    admin: { default: false, },
    docs: { default: false, },
  };

  it("retorna alvos padrão na ordem exata de definição do config quando nenhum solicitado", () => {
    const targets = resolverOrdemTargets(config,);
    assertEquals(targets, ["server", "ui", "sw",],);
  });

  it("garante a ordem do config mesmo se o chamador passar alvos invertidos ou desordenados", () => {
    // Passado ["docs", "ui", "server"] -> deve resolver para ["server", "ui", "docs"]
    const targets = resolverOrdemTargets(config, ["docs", "ui", "server",],);
    assertEquals(targets, ["server", "ui", "docs",],);
  });

  it("lida de forma case-insensitive preservando as chaves originais do config", () => {
    const targets = resolverOrdemTargets(config, ["SW", "SERVER",],);
    assertEquals(targets, ["server", "sw",],);
  });

  it("permite incluir alvos com default: false quando solicitados explicitamente", () => {
    const targets = resolverOrdemTargets(config, ["admin",],);
    assertEquals(targets, ["admin",],);
  });

  it("retorna vazio se os alvos solicitados não existirem no config", () => {
    const targets = resolverOrdemTargets(config, ["inexistente", "fantasma",],);
    assertEquals(targets, [],);
  });

  it("retorna array vazio quando config está vazio", () => {
    const targets = resolverOrdemTargets({}, ["ui",],);
    assertEquals(targets, [],);
  });
});

```

---

## Arquivo: `packages/utils/tests/tools/paths.test.ts`

```ts
import { describe, it, } from "@std/testing/bdd";
import { assert, assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import {
  cleanTarget,
  copyStaticFiles,
  copyTargetFiles,
  correspondeGlobs,
  resolveWithBase,
} from "../../src/tools/paths.ts";

describe("paths.ts - Utilitários e novas funcionalidades", () => {
  describe("correspondeGlobs", () => {
    it("deve validar padrões glob simples e extensões", () => {
      assertEquals(correspondeGlobs("src/main.ts", ["**/*.ts",],), true,);
      assertEquals(correspondeGlobs("src/main.ts", ["**/*.js",],), false,);
      assertEquals(
        correspondeGlobs("dist/app.min.js", ["*.js", "**/*.js",],),
        true,
      );
    });

    it("deve suportar brace expansion", () => {
      assertEquals(correspondeGlobs("file.jpg", ["*.{png,jpg,gif}",],), true,);
      assertEquals(correspondeGlobs("file.svg", ["*.{png,jpg,gif}",],), false,);
      assertEquals(correspondeGlobs("file.png", ["*.{png,jpg,gif}",],), true,);
    });
  });

  describe("resolveWithBase", () => {
    it("deve juntar baseDir quando o caminho for relativo e baseDir for diferente de .", () => {
      assertEquals(
        resolveWithBase("src", "packages/ui",),
        join("packages/ui", "src",),
      );
      assertEquals(resolveWithBase("dist", ".",), "dist",);
      assertEquals(resolveWithBase(undefined, "packages/ui",), undefined,);
    });

    it("não deve modificar caminhos já absolutos", () => {
      const absPath = "/absolute/path";
      assertEquals(resolveWithBase(absPath, "packages/ui",), absPath,);
    });
  });

  describe("cleanTarget", () => {
    it("deve limpar arquivos correspondentes ao glob respeitando excludes", async () => {
      const tempDir = await Deno.makeTempDir({
        prefix: "buildit_test_clean_",
      },);
      try {
        await Deno.writeTextFile(join(tempDir, "file1.tmp",), "temp 1",);
        await Deno.writeTextFile(join(tempDir, "file2.tmp",), "temp 2",);
        await Deno.writeTextFile(join(tempDir, "keep.tmp",), "keep",);
        await Deno.writeTextFile(join(tempDir, "data.json",), "data",);

        await cleanTarget(tempDir, {
          includes: ["*.tmp",],
          excludes: ["keep.tmp",],
        },);

        // file1.tmp e file2.tmp devem ter sido deletados
        let file1Exists = true;
        try {
          await Deno.stat(join(tempDir, "file1.tmp",),);
        } catch {
          file1Exists = false;
        }
        assertEquals(file1Exists, false,);

        // keep.tmp e data.json devem permanecer
        const keepStat = await Deno.stat(join(tempDir, "keep.tmp",),);
        assert(keepStat.isFile,);
        const dataStat = await Deno.stat(join(tempDir, "data.json",),);
        assert(dataStat.isFile,);
      } finally {
        await Deno.remove(tempDir, { recursive: true, },).catch(() => {},);
      }
    });

    it("deve limpar todo o diretório com includes: ['*']", async () => {
      const tempDir = await Deno.makeTempDir({
        prefix: "buildit_test_clean_all_",
      },);
      try {
        await Deno.writeTextFile(join(tempDir, "file1.txt",), "hello",);
        await Deno.mkdir(join(tempDir, "sub",),);
        await Deno.writeTextFile(join(tempDir, "sub", "file2.txt",), "world",);

        await cleanTarget(tempDir, { includes: ["*",], },);

        const entries: string[] = [];
        for await (const entry of Deno.readDir(tempDir,)) {
          entries.push(entry.name,);
        }
        assertEquals(entries.length, 0,);
      } finally {
        await Deno.remove(tempDir, { recursive: true, },).catch(() => {},);
      }
    });
  });

  describe("copyTargetFiles", () => {
    it("deve preservar árvore relativa ao basedir quando basedir for especificado", async () => {
      const tempSrc = await Deno.makeTempDir({ prefix: "buildit_test_src_", },);
      const tempDist = await Deno.makeTempDir({
        prefix: "buildit_test_dist_",
      },);

      try {
        await Deno.mkdir(join(tempSrc, "icons",), { recursive: true, },);
        await Deno.writeTextFile(join(tempSrc, "icons", "icon.png",), "image",);
        await Deno.writeTextFile(
          join(tempSrc, "manifest.json",),
          JSON.stringify({ name: "App", },),
        );

        await copyTargetFiles(
          [{ basedir: tempSrc, },],
          tempDist,
          "1.2.3",
        );

        // Verifica integridade da árvore preservada
        const copiedIcon = await Deno.readTextFile(
          join(tempDist, "icons", "icon.png",),
        );
        assertEquals(copiedIcon, "image",);

        // Verifica injeção da versão no manifest.json
        const copiedManifest = JSON.parse(
          await Deno.readTextFile(join(tempDist, "manifest.json",),),
        );
        assertEquals(copiedManifest.version, "1.2.3",);
      } finally {
        await Deno.remove(tempSrc, { recursive: true, },).catch(() => {},);
        await Deno.remove(tempDist, { recursive: true, },).catch(() => {},);
      }
    });

    it("deve copiar arquivos diretamente na raiz do distdir quando basedir não for informado", async () => {
      const tempRoot = await Deno.makeTempDir({
        prefix: "buildit_test_root_",
      },);
      const tempDist = await Deno.makeTempDir({
        prefix: "buildit_test_dist2_",
      },);

      try {
        await Deno.mkdir(join(tempRoot, "sub1", "sub2",), {
          recursive: true,
        },);
        await Deno.writeTextFile(
          join(tempRoot, "sub1", "sub2", "style.css",),
          "body{}",
        );

        await copyTargetFiles(
          [{ includes: ["sub1/sub2/*.css",], },],
          tempDist,
          "1.0.0",
          tempRoot,
        );

        // Quando basedir não é informado, arquivo é colocado diretamente no distdir
        const fileContent = await Deno.readTextFile(
          join(tempDist, "style.css",),
        );
        assertEquals(fileContent, "body{}",);
      } finally {
        await Deno.remove(tempRoot, { recursive: true, },).catch(() => {},);
        await Deno.remove(tempDist, { recursive: true, },).catch(() => {},);
      }
    });
  });
});

```

---

## Arquivo: `packages/utils/tests/tools/targets.test.ts`

```ts
import { assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { resolverOrdemTargets, } from "../../src/tools/targets.ts";

describe("resolverOrdemTargets", () => {
  const config = {
    first: { default: true, },
    second: { default: true, },
    third: { default: false, },
    fourth: { default: true, },
  };

  it("deve retornar todos os alvos com default !== false na ordem exata da configuração", () => {
    const ordenados = resolverOrdemTargets(config,);
    assertEquals(ordenados, ["first", "second", "fourth",],);
  });

  it("deve preservar a ordem da configuração mesmo se os alvos forem passados fora de ordem", () => {
    const ordenados = resolverOrdemTargets(config, [
      "fourth",
      "first",
      "third",
    ],);
    assertEquals(ordenados, ["first", "third", "fourth",],);
  });

  it("deve suportar alvos solicitados em maiúsculas ou minúsculas", () => {
    const ordenados = resolverOrdemTargets(config, ["FOURTH", "First",],);
    assertEquals(ordenados, ["first", "fourth",],);
  });

  it("deve ignorar alvos solicitados inexistentes mantendo os válidos ordenados", () => {
    const ordenados = resolverOrdemTargets(config, [
      "inexistente",
      "second",
      "first",
    ],);
    assertEquals(ordenados, ["first", "second",],);
  });
});

```

---

## Arquivo: `packages/utils/tests/version/lib-version.test.ts`

```ts
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertNotEquals, } from "@std/assert";
import {
  extractRawVersion,
  findDenoFile,
  sanitizeVersion,
} from "../../src/tools/version.ts";

describe("lib-version - Equivalente TypeScript de lib-version.sh", () => {
  describe("sanitizeVersion", () => {
    it("mantém versões semver puras inalteradas", () => {
      assertEquals(sanitizeVersion("1.2.3",), "1.2.3",);
      assertEquals(sanitizeVersion("0.3.14",), "0.3.14",);
      assertEquals(sanitizeVersion("10.20.30",), "10.20.30",);
    });

    it("remove prefixo 'v'", () => {
      assertEquals(sanitizeVersion("v1.2.3",), "1.2.3",);
      assertEquals(sanitizeVersion("v0.3.14",), "0.3.14",);
    });

    it("remove sufixo de hash (#hash)", () => {
      assertEquals(sanitizeVersion("0.3.14#muesu7z0",), "0.3.14",);
      assertEquals(sanitizeVersion("v1.2.3#abc1234",), "1.2.3",);
    });

    it("remove tags de pré-lançamento (-alpha, -beta.1)", () => {
      assertEquals(sanitizeVersion("1.2.3-alpha",), "1.2.3",);
      assertEquals(sanitizeVersion("2.0.0-rc.1",), "2.0.0",);
    });

    it("remove metadados de build (+build.123)", () => {
      assertEquals(sanitizeVersion("1.2.3+20130313144700",), "1.2.3",);
      assertEquals(sanitizeVersion("1.2.3-beta+exp.sha.5114f85",), "1.2.3",);
    });

    it("preenche componentes ausentes com 0", () => {
      assertEquals(sanitizeVersion("1.2",), "1.2.0",);
      assertEquals(sanitizeVersion("5",), "5.0.0",);
      assertEquals(sanitizeVersion("",), "0.0.0",);
    });

    it("descarta componentes além do patch (ex: 1.2.3.4.5)", () => {
      assertEquals(sanitizeVersion("1.2.3.4.5",), "1.2.3",);
    });

    it("retorna 0.0.0 para strings não numéricas inválidas", () => {
      assertEquals(sanitizeVersion("invalid",), "0.0.0",);
      assertEquals(sanitizeVersion("v",), "0.0.0",);
      assertEquals(sanitizeVersion("###",), "0.0.0",);
    });
  });

  describe("extractRawVersion", () => {
    it("extrai a versão ancorada em 'version'", () => {
      const jsonc =
        `{\n  "name": "meu-pacote",\n  "version": "0.3.14#abc1234",\n  "license": "MIT"\n}`;
      assertEquals(extractRawVersion(jsonc,), "0.3.14#abc1234",);
    });

    it("ignora espaços e tabulações ao redor de 'version'", () => {
      const jsonc = `{\n\t"version" \t : \t "1.0.0" \t,\n}`;
      assertEquals(extractRawVersion(jsonc,), "1.0.0",);
    });

    it("retorna null se não houver version", () => {
      const jsonc = `{\n  "name": "sem-versao"\n}`;
      assertEquals(extractRawVersion(jsonc,), null,);
    });
  });

  describe("findDenoFile", () => {
    it("localiza deno.jsonc no diretório do workspace", () => {
      const found = findDenoFile(".",);
      assertNotEquals(found, null,);
      assertEquals(found?.endsWith("deno.jsonc",), true,);
    });

    it("sobe a árvore de diretórios a partir de subpastas", () => {
      const found = findDenoFile("packages/utils/src",);
      assertNotEquals(found, null,);
    });

    it("retorna null para caminhos inexistentes fora do projeto", () => {
      const found = findDenoFile("/tmp/non-existent-dir-for-test-999",);
      assertEquals(found, null,);
    });
  });
});

```

---

## Arquivo: `packages/utils/tests/version/sanitize.test.ts`

```ts
import { describe, it, } from "@std/testing/bdd";
import { assert, assertEquals, assertRejects, } from "@std/assert";
import { sanitizeVersionFile, } from "../../src/version/sanitize/engine.ts";
import { sanitizeVersionCli, } from "../../src/version/sanitize/cli.ts";
import { join, } from "@std/path";

describe("sanitize-version - Motor e CLI", () => {
  describe("sanitizeVersionFile", () => {
    it("não altera arquivo que já possui versão semver válida", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(filePath, '{\n  "version": "1.2.3"\n}',);

      const res = await sanitizeVersionFile({ filePath, silencioso: true, },);
      assertEquals(res.rawVersion, "1.2.3",);
      assertEquals(res.sanitizedVersion, "1.2.3",);
      assertEquals(res.updated, false,);

      const content = await Deno.readTextFile(filePath,);
      assertEquals(content, '{\n  "version": "1.2.3"\n}',);
      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("sanitiza versão com hash no arquivo", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        filePath,
        '{\n  "name": "teste",\n  "version": "0.3.14#muesu7z0",\n  "license": "MIT"\n}',
      );

      const res = await sanitizeVersionFile({ filePath, silencioso: true, },);
      assertEquals(res.rawVersion, "0.3.14#muesu7z0",);
      assertEquals(res.sanitizedVersion, "0.3.14",);
      assertEquals(res.updated, true,);

      const updated = await Deno.readTextFile(filePath,);
      assert(updated.includes('"version": "0.3.14"',),);
      assert(!updated.includes("#muesu7z0",),);
      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("injeta version: 0.0.0 quando o campo version estiver ausente", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(filePath, '{\n  "name": "sem-versao"\n}',);

      const res = await sanitizeVersionFile({ filePath, silencioso: true, },);
      assertEquals(res.rawVersion, "0.0.0",);
      assertEquals(res.sanitizedVersion, "0.0.0",);
      assertEquals(res.updated, false,);

      const updated = await Deno.readTextFile(filePath,);
      assert(updated.includes('"version": "0.0.0"',),);
      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("falha quando arquivo explícito não existe", async () => {
      await assertRejects(
        () =>
          sanitizeVersionFile({
            filePath: "/caminho/ficticio/deno.jsonc",
            silencioso: true,
          },),
        Error,
        "não encontrado",
      );
    });
  });

  describe("sanitizeVersionCli", () => {
    it("instancia o comando Cliffy com definições corretas", () => {
      const cmd = sanitizeVersionCli();
      assertEquals(cmd.getName(), "sanitize-version",);
    });
  });
});

```

---

## Arquivo: `packages/utils/tests/version/tag.test.ts`

```ts
import { describe, it, } from "@std/testing/bdd";
import { assert, assertEquals, assertRejects, } from "@std/assert";
import { tagVersionEngine, } from "../../src/version/tag/engine.ts";
import { tagVersionCli, } from "../../src/version/tag/cli.ts";
import { join, } from "@std/path";

describe("tag-version - Motor e CLI", () => {
  describe("tagVersionEngine", () => {
    it("deriva a tag vMAJOR.MINOR corretamente em modo dryRun", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        filePath,
        '{\n  "version": "0.3.14#abc1234"\n}',
      );

      const res = await tagVersionEngine({
        file: filePath,
        dryRun: true,
        silencioso: true,
      },);

      assertEquals(res.tagName, "v0.3",);
      assertEquals(res.rawVersion, "0.3.14#abc1234",);
      assertEquals(res.sanitizedVersion, "0.3.14",);
      assertEquals(res.message, "Versão v0.3",);
      assertEquals(res.committed, false,);
      assertEquals(res.tagged, false,);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("respeita mensagem de commit personalizada", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(filePath, '{\n  "version": "1.2.9"\n}',);

      const res = await tagVersionEngine({
        file: filePath,
        message: "Release 1.2 oficial",
        dryRun: true,
        silencioso: true,
      },);

      assertEquals(res.tagName, "v1.2",);
      assertEquals(res.message, "Release 1.2 oficial",);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("executa sanitização em disco quando sanitize é true", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        filePath,
        '{\n  "version": "0.3.14#muesu7z0"\n}',
      );

      const res = await tagVersionEngine({
        file: filePath,
        sanitize: true,
        dryRun: true,
        silencioso: true,
      },);

      assertEquals(res.tagName, "v0.3",);
      const diskContent = await Deno.readTextFile(filePath,);
      assert(diskContent.includes('"version": "0.3.14"',),);
      assert(!diskContent.includes("#muesu7z0",),);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("rejeita quando campo version está ausente", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(filePath, '{\n  "name": "sem-versao"\n}',);

      await assertRejects(
        () =>
          tagVersionEngine({
            file: filePath,
            dryRun: true,
            silencioso: true,
          },),
        Error,
        "ausente",
      );

      await Deno.remove(tempDir, { recursive: true, },);
    });
  });

  describe("tagVersionCli", () => {
    it("instancia o comando Cliffy com definições corretas", () => {
      const cmd = tagVersionCli();
      assertEquals(cmd.getName(), "tag-version",);
    });
  });
});

```

---

## Arquivo: `packages/utils/tests/watch/config.test.ts`

```ts
/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assert, assertEquals, } from "@std/assert";
import {
  carregarConfigWatch,
  CONFIGURACOES_WATCH_PADRAO,
} from "../../src/watch/config.ts";

describe("watch/config", () => {
  it("carrega configurações padrão caso o arquivo de config não exista", async () => {
    const config = await carregarConfigWatch("inexistente.jsonc",);
    assertEquals(config.targets, CONFIGURACOES_WATCH_PADRAO,);
    const ui = config.targets["ui"];
    assert(ui !== undefined,);
  });

  it("carrega configurações a partir do watch.jsonc real do projeto", async () => {
    const config = await carregarConfigWatch("watch.jsonc", ".",);
    const ui = config.targets["ui"];
    assert(ui !== undefined,);
    assertEquals(ui.format, "esm",);
    assertEquals(ui.entryPoints, ["main.tsx",],);
  });
});

```

---

## Arquivo: `packages/utils/tests/watch/lock.test.ts`

```ts
import { assertEquals, assertRejects, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import {
  acquireWatchLock,
  isProcessRunning,
  type WatchLockData,
} from "../../src/watch/lock.ts";

describe("Watch Lock Mechanism", () => {
  it("isProcessRunning deve identificar o processo atual como ativo", () => {
    assertEquals(isProcessRunning(Deno.pid,), true,);
  });

  it("isProcessRunning deve retornar false para PIDs inválidos ou inativos", () => {
    assertEquals(isProcessRunning(-1,), false,);
    assertEquals(isProcessRunning(0,), false,);
    // PID 9999999 improvável de existir
    assertEquals(isProcessRunning(9999999,), false,);
  });

  it("acquireWatchLock deve adquirir o lock e liberá-lo corretamente", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const lockPath = `${tempDir}/.buildit-watch.lock`;
      const release = await acquireWatchLock(tempDir, "ui", lockPath,);

      // Lock deve existir no disco
      const stat = await Deno.stat(lockPath,);
      assertEquals(stat.isFile, true,);

      const content = JSON.parse(
        await Deno.readTextFile(lockPath,),
      ) as WatchLockData;
      assertEquals(content.pid, Deno.pid,);
      assertEquals(content.target, "ui",);

      // Libera o lock
      await release();

      // Lock deve ter sido removido
      let exists = true;
      try {
        await Deno.stat(lockPath,);
      } catch {
        exists = false;
      }
      assertEquals(exists, false,);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("acquireWatchLock deve lançar erro se já houver lock ativo para processo em execução", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const lockPath = `${tempDir}/.buildit-watch.lock`;
      const release = await acquireWatchLock(tempDir, "ui", lockPath,);

      try {
        await assertRejects(
          async () => {
            await acquireWatchLock(tempDir, "sw", lockPath,);
          },
          Error,
          "Já existe uma instância do watch em execução",
        );
      } finally {
        await release();
      }
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("acquireWatchLock deve descartar lock órfão de processo morto e prosseguir", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const lockPath = `${tempDir}/.buildit-watch.lock`;
      const orphanLock: WatchLockData = {
        pid: 9999999, // PID inativo
        target: "antigo",
        startedAt: "2026-01-01T00:00:00.000Z",
        baseDir: tempDir,
      };
      await Deno.writeTextFile(lockPath, JSON.stringify(orphanLock,),);

      // Deve substituir o lock órfão com sucesso
      const release = await acquireWatchLock(tempDir, "novo", lockPath,);

      const content = JSON.parse(
        await Deno.readTextFile(lockPath,),
      ) as WatchLockData;
      assertEquals(content.pid, Deno.pid,);
      assertEquals(content.target, "novo",);

      await release();
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });
});

```

---

## Arquivo: `packages/utils/tests/watch/watch.test.ts`

```ts
import { assert, assertEquals, assertRejects, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import {
  carregarConfigWatch,
  CONFIGURACOES_PADRAO_WATCH,
} from "../../src/watch/config.ts";
import { watchEngine, } from "../../src/watch/engine.ts";
import { watchCli, } from "../../src/watch/cli.ts";
import type { WatchGlobalConfig, } from "../../src/tools/interfaces.ts";

describe("carregarConfigWatch", () => {
  it("deve retornar configuração padrão quando arquivo não for encontrado", async () => {
    const result = await carregarConfigWatch(
      "arquivo_inexistente.jsonc",
      "/tmp",
    );
    assertEquals(result.targets, CONFIGURACOES_PADRAO_WATCH,);
  });

  it("deve carregar configuração de watch válida de um arquivo temporário", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const configContent = JSON.stringify({
        targets: {
          app: {
            entryPoints: ["src/index.ts",],
            distdir: "dist",
            format: "esm",
            sourcemap: "inline",
          },
        },
      },);
      const configPath = `${tempDir}/watch.jsonc`;
      await Deno.writeTextFile(configPath, configContent,);

      const result = await carregarConfigWatch(configPath, tempDir,);
      const app = result.targets["app"];
      assert(app !== undefined,);
      assertEquals(app.entryPoints, ["src/index.ts",],);
      assertEquals(app.format, "esm",);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });
});

describe("watchCli Validação de Argumentos (Cliffy)", () => {
  it("Cliffy deve rejeitar quando mais de 1 argumento posicional for passado", async () => {
    const cli = watchCli().throwErrors();
    await assertRejects(
      async () => {
        await cli.parse(["ui", "sw",],);
      },
      Error,
      "Too many arguments: sw",
    );
  });
});

describe("watchEngine Restrições de Alvos e Lock", () => {
  it("deve aceitar target como string única", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      await Deno.mkdir(`${tempDir}/src`, { recursive: true, },);
      await Deno.writeTextFile(
        `${tempDir}/src/main.ts`,
        "console.log('main');",
      );
      await Deno.writeTextFile(
        `${tempDir}/deno.jsonc`,
        JSON.stringify({ version: "0.1.0", },),
      );

      const config: WatchGlobalConfig = {
        first: {
          default: true,
          entryPoints: ["main.ts",],
          srcdir: `${tempDir}/src`,
          distdir: `${tempDir}/dist`,
        },
      };

      const handles = await watchEngine({
        config,
        target: "first",
        baseDir: tempDir,
        lockFile: `${tempDir}/.watch.lock`,
        silencioso: true,
      },);

      assertEquals(handles.length, 1,);
      assertEquals(handles[0]?.target, "first",);
      await handles[0]?.close();
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("deve rejeitar se o alvo solicitado não existir", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const config: WatchGlobalConfig = {
        first: {
          default: true,
          entryPoints: ["main.ts",],
          srcdir: `${tempDir}/src`,
          distdir: `${tempDir}/dist`,
        },
      };

      await assertRejects(
        async () => {
          await watchEngine({
            config,
            target: "inexistente",
            baseDir: tempDir,
            lockFile: `${tempDir}/.watch.lock`,
            silencioso: true,
          },);
        },
        Error,
        "Alvo 'inexistente' não encontrado",
      );
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("deve selecionar apenas o primeiro alvo quando nenhum literal é fornecido e há múltiplos default: true", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      await Deno.mkdir(`${tempDir}/src`, { recursive: true, },);
      await Deno.writeTextFile(
        `${tempDir}/src/main.ts`,
        "console.log('main');",
      );
      await Deno.writeTextFile(
        `${tempDir}/src/other.ts`,
        "console.log('other');",
      );
      await Deno.writeTextFile(
        `${tempDir}/deno.jsonc`,
        JSON.stringify({ version: "0.1.0", },),
      );

      const config: WatchGlobalConfig = {
        first: {
          default: true,
          entryPoints: ["main.ts",],
          srcdir: `${tempDir}/src`,
          distdir: `${tempDir}/dist`,
        },
        second: {
          default: true,
          entryPoints: ["other.ts",],
          srcdir: `${tempDir}/src`,
          distdir: `${tempDir}/dist`,
        },
      };

      const handles = await watchEngine({
        config,
        baseDir: tempDir,
        lockFile: `${tempDir}/.watch.lock`,
        silencioso: true,
      },);

      assertEquals(handles.length, 1,);
      assertEquals(handles[0]?.target, "first",);

      // Encerra e limpa o lock
      await handles[0]?.close();
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("deve impedir concorrência entre chamadas simultâneas via Lock", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      await Deno.mkdir(`${tempDir}/src`, { recursive: true, },);
      await Deno.writeTextFile(
        `${tempDir}/src/main.ts`,
        "console.log('main');",
      );
      await Deno.writeTextFile(
        `${tempDir}/deno.jsonc`,
        JSON.stringify({ version: "0.1.0", },),
      );

      const config: WatchGlobalConfig = {
        first: {
          default: true,
          entryPoints: ["main.ts",],
          srcdir: `${tempDir}/src`,
          distdir: `${tempDir}/dist`,
        },
      };

      const lockPath = `${tempDir}/.watch.lock`;
      const handles = await watchEngine({
        config,
        target: "first",
        baseDir: tempDir,
        lockFile: lockPath,
        silencioso: true,
      },);

      try {
        await assertRejects(
          async () => {
            await watchEngine({
              config,
              target: "first",
              baseDir: tempDir,
              lockFile: lockPath,
              silencioso: true,
            },);
          },
          Error,
          "Já existe uma instância do watch em execução",
        );
      } finally {
        await handles[0]?.close();
      }
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });
});

```

---

