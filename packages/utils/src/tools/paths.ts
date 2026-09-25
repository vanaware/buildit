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
