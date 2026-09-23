/**
 * @module @vanaware/buildit/config/version
 * @description Gerenciamento centralizado de versões semânticas e sincronização
 * de workspaces para Deno projects e snapshots.
 */

import { dirname, isAbsolute, join, } from "@std/path";
import { parse as parseJsonc, } from "@std/jsonc";
import { APP_VERSION as FALLBACK_VERSION, } from "../version.ts";

import type { ParsedVersion, VersionUpdateOptions, } from "./interfaces.ts";

import { loadConfig } from "./jsonc.ts";

/**
 * Obtém a versão atual do arquivo de configuração deno.jsonc.
 * @param denoJsoncPath Caminho para o deno.jsonc
 * @returns Versão atual
 */
export async function currentVersion(denoJsoncPath: string): Promise<string> {
  const parsed = await loadConfig<{ version?: string }>("deno", denoJsoncPath);
  if (!parsed?.version) {
    throw new Error("❌ Versão não encontrada no deno.jsonc");
  }
  console.log(`📌 Versão Atual: v${parsed.version}`);
  return parsed.version;
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
          for (const fileName of ["deno.jsonc", "deno.json",]) {
            const configPath = join(wsPath, fileName,);
            try {
              const stat = await Deno.stat(configPath,);
              if (stat.isFile) {
                let wsContent = await Deno.readTextFile(configPath,);
                wsContent = replaceVersionInContent(
                  wsContent,
                  finalVersion,
                );
                await Deno.writeTextFile(configPath, wsContent,);
                console.log(`   ✅ Sincronizado: ${join(ws, fileName,)}`,);
                break;
              }
            } catch {
              continue;
            }
          }
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
