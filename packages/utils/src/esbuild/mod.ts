import { copy, emptyDir, ensureDir, walk, } from "@std/fs";
import { dirname, isAbsolute, join, } from "@std/path";
import { parse as parseJsonc, } from "@std/jsonc";

// ============================================================================
// 📦 TIPOS
// ============================================================================
import type {
  DenoBundleGlobalConfig,
  DenoBundleTargetConfig,
  GlobalTargetConfig,
  ParsedArgs,
  ParsedVersion,
  TargetConfig,
} from "../interfaces/mod.ts";

// ============================================================================
// 🔢 FUNÇÕES DE VERSÃO (re-exportadas de config/version.ts)
// ============================================================================
export {
  extractVersionFromContent,
  formatVersion,
  parseVersion,
  replaceVersionInContent,
} from "../config/version.ts";

// ============================================================================
// 🛡️ VALIDAÇÃO DE PATHS (pura, testável)
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

// ============================================================================
// 🎯 PARSING DE ARGUMENTOS CLI (pura, testável)
// ============================================================================
/**
 * Parseia os argumentos de linha de comando para determinar alvos e flags.
 * @param args Lista de argumentos
 * @param config Configuração global de alvos
 * @returns Argumentos parseados
 */
export function parseArgs(
  args: string[],
  config: GlobalTargetConfig | DenoBundleGlobalConfig,
): ParsedArgs {
  const lowerArgs = args.map((a,) => a.toLowerCase());
  const globalNoVersion = lowerArgs.includes("noversion",);
  const isWatchFlag = lowerArgs.includes("watch",);
  const configKeys = Object.keys(config,);
  const defaultTargets = configKeys.filter((t,) => {
    const cfg = config[t]!;
    return cfg.mode !== "watch" && cfg.default !== false;
  },);
  const requestedTargets = lowerArgs.filter(
    (arg,) =>
      !["noversion", "watch",].includes(arg,) && configKeys.includes(arg,),
  );
  let watchTarget: string | null = null;
  if (isWatchFlag) {
    watchTarget = configKeys.find((t,) => config[t]!.mode === "watch") ?? null;
  } else if (requestedTargets.length > 0) {
    const requestedWatches = requestedTargets.filter((t,) =>
      config[t]!.mode === "watch"
    );
    if (requestedWatches.length > 0) {
      watchTarget = configKeys.find((t,) => requestedWatches.includes(t,)) ??
        null;
    }
  }
  let finalTargets: string[];
  if (watchTarget !== null) {
    finalTargets = [];
  } else if (requestedTargets.length > 0) {
    finalTargets = configKeys.filter((t,) => requestedTargets.includes(t,));
  } else {
    finalTargets = defaultTargets;
  }
  return { targets: finalTargets, globalNoVersion, watchTarget, };
}

// ============================================================================
// 📂 FUNÇÕES DE FILESYSTEM
// ============================================================================
/**
 * Limpa os diretórios/arquivos configurados no alvo.
 * @param distDir Diretório de saída
 * @param cleanPaths Lista de caminhos relativos para limpar
 */
export async function cleanTarget(
  distDir: string,
  cleanPaths: string[],
): Promise<void> {
  if (!cleanPaths || cleanPaths.length === 0) return;
  console.log(`🧹 Limpando em ${distDir}...`,);
  for (const cleanPath of cleanPaths) {
    if (!isSafePath(cleanPath,)) {
      console.warn(
        `   ⚠️ Path perigoso ignorado (traversal/absoluto): "${cleanPath}"`,
      );
      continue;
    }
    if (cleanPath === ".") {
      try {
        await emptyDir(distDir,);
        console.log(`   ✅ Diretório esvaziado: ${distDir}`,);
      } catch (error) {
        console.warn(`   ⚠️ Falha ao esvaziar ${distDir}:`, error,);
      }
    } else {
      const fullPath = join(distDir, cleanPath,);
      try {
        await Deno.stat(fullPath,);
        await Deno.remove(fullPath, { recursive: true, },);
        console.log(`   ✅ Removido: ${cleanPath}`,);
      } catch {
        console.log(`   ⏭️  Não existia: ${cleanPath}`,);
      }
    }
  }
}

/**
 * Obtém a versão atual do arquivo de configuração deno.jsonc.
 * @param denoJsoncPath Caminho para o deno.jsonc
 * @returns Versão atual
 */
export async function currentVersion(denoJsoncPath: string,): Promise<string> {
  const content = await Deno.readTextFile(denoJsoncPath,);
  const version = extractVersionFromContent(content,);
  if (!version) {
    throw new Error("❌ Versão não encontrada no deno.jsonc",);
  }
  console.log(`📌 Versão Atual: v${version}`,);
  return version;
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
  const { major, minor, patch, } = parseVersion(version,);
  const nextPatch = patch + 1;
  const newVersion = formatVersion(major, minor, nextPatch, buildHash,);
  const content = await Deno.readTextFile(denoJsoncPath,);
  const updatedRootContent = replaceVersionInContent(content, newVersion,);
  await Deno.writeTextFile(denoJsoncPath, updatedRootContent,);
  console.log(`📈 Versão incrementada para: v${newVersion}`,);

  // Sincronização de Workspaces
  try {
    const rootDir = dirname(denoJsoncPath,);
    const parsed = parseJsonc(content,) as { workspace?: string[] };

    if (parsed.workspace && Array.isArray(parsed.workspace,)) {
      console.log(`📦 Sincronizando workspaces...`,);
      for (const ws of parsed.workspace) {
        const wsPath = isAbsolute(ws,) ? ws : join(rootDir, ws,);

        // Tenta deno.jsonc depois deno.json
        for (const fileName of ["deno.jsonc", "deno.json",]) {
          const configPath = join(wsPath, fileName,);
          try {
            const stat = await Deno.stat(configPath,);
            if (stat.isFile) {
              let wsContent = await Deno.readTextFile(configPath,);
              wsContent = replaceVersionInContent(wsContent, newVersion,);
              await Deno.writeTextFile(configPath, wsContent,);
              console.log(`   ✅ Sincronizado: ${join(ws, fileName,)}`,);
              break; // Para no primeiro que encontrar
            }
          } catch {
            continue;
          }
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️ Falha ao sincronizar workspaces:`, error,);
  }

  // Atualiza arquivo de versão (específico para injeção de código)
  try {
    const utilsVersionPath = "packages/utils/src/version.ts";
    const versionContent = `// Automatically generated file during build
declare const __APP_VERSION__: string;

/** Current library/application version. */
export const APP_VERSION: string = typeof __APP_VERSION__ !== "undefined"
  ? __APP_VERSION__
  : "${newVersion}";
`;
    await Deno.writeTextFile(utilsVersionPath, versionContent,);
    console.log(`📝 Versão atualizada em: ${utilsVersionPath}`,);
  } catch {
    // Ignora quando executando em ambientes sem a estrutura completa (ex: testes)
  }

  return newVersion;
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
 * Copia arquivos estáticos da pasta publicdir e srcdir para o distdir.
 * @param config Configuração do alvo
 * @param appVersion Versão da aplicação para injeção no manifest
 */
export async function copyStaticFiles(
  config: TargetConfig | DenoBundleTargetConfig,
  appVersion: string,
): Promise<void> {
  // 🔥 CORREÇÃO: Valida distdir e srcdir antes de operações
  if (!config.distdir) {
    if (config.publicdir) {
      console.warn(
        `⚠️ 'publicdir' configurado mas 'distdir' ausente. Pulando cópia de estáticos.`,
      );
    }
    if (config.indexHtml) {
      console.warn(
        `⚠️ 'indexHtml' é true mas 'distdir' ausente. Pulando cópia do HTML.`,
      );
    }
    return;
  }

  if (config.indexHtml && !config.srcdir) {
    console.warn(
      `⚠️ 'indexHtml' é true mas 'srcdir' ausente. Pulando cópia do HTML.`,
    );
    return;
  }

  const distDir = config.distdir;
  await ensureDir(distDir,);

  if (config.publicdir) {
    try {
      await copy(config.publicdir, distDir, { overwrite: true, },);
      console.log(
        `📁 Arquivos de ${config.publicdir} copiados para ${distDir}`,
      );
      const manifestPath = join(distDir, "manifest.json",);
      try {
        const manifestText = await Deno.readTextFile(manifestPath,);
        const manifestObj = JSON.parse(manifestText,);
        manifestObj.version = appVersion;
        await Deno.writeTextFile(
          manifestPath,
          JSON.stringify(manifestObj, null, 2,),
        );
        console.log(`📱 Versão v${appVersion} injetada em manifest.json`,);
      } catch {
        // manifest.json não existe
      }
    } catch {
      console.log(
        `⚠️ Pasta ${config.publicdir} não encontrada, pulando cópia.`,
      );
    }
  }

  if (config.indexHtml && config.srcdir) {
    const srcDir = config.srcdir;
    const srcHtml = join(srcDir, "index.html",);
    const destHtml = join(distDir, "index.html",);
    try {
      await copy(srcHtml, destHtml, { overwrite: true, },);
      console.log(`📄 index.html copiado de ${srcDir} para ${distDir}`,);
    } catch {
      console.log(`⚠️ ${srcHtml} não encontrado, pulando cópia do HTML.`,);
    }
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
// 📦 RE-EXPORTS DE MÓDULOS ESPECÍFICOS
// ============================================================================
export * from "./bundle.ts";
export * from "./config.ts";
export * from "./engine.ts";
export * from "./cli.ts";
export * from "../config/version.ts";
