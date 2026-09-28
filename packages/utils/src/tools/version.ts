/**
 * @module @vanaware/buildit/config/version
 * @description Gerenciamento centralizado de versões semânticas e sincronização
 * de workspaces para Deno projects e snapshots.
 */

import { dirname, isAbsolute, join, } from "@std/path";
import { parse as parseJsonc, } from "@std/jsonc";

import type { ParsedVersion, VersionUpdateOptions, } from "./interfaces.ts";

import { loadConfig, } from "./jsonc.ts";

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

  throw new Error(`❌ Campo "version" obrigatório não encontrado no deno.jsonc.
Exemplo de configuração necessária:
{
  "name": "@buildit/app",
  "version": "1.0.0"
}`);
}

/**
 * Sincroniza a versão em um diretório de workspace (deno.jsonc ou deno.json).
 */
export async function syncWorkspaceDir(
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
 * Exemplo de caminhos onde o arquivo version.ts pode ser sincronizado.
 */
export const VERSION_PATHS_EXAMPLE: string[] = [
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
 * Substitui a versão no conteúdo textual fornecido.
 */
export function replaceVersionInContent(
  content: string,
  newVersion: string,
): string {
  return content.replace(
    /"version"\s*:\s*"[^"]*"/,
    `"version": "${newVersion}"`,
  );
}

/**
 * Gera o template padrão para arquivos version.ts com a constante customizada.
 */
export function getVersionFileTemplate(defineVersionString: string = "__APP_VERSION__",): string {
  return `// Automatically generated file during build
declare const ${defineVersionString}: string;

/** Current library/application version. */
export const APP_VERSION: string = typeof ${defineVersionString} !== "undefined"
  ? ${defineVersionString}
  : "";
`;
}

/**
 * Garante a existência do arquivo version.ts no caminho ou diretório especificado.
 * Se o arquivo já existir, NÃO o sobrescreve a cada execução.
 * Se o arquivo não existir, cria o arquivo com o template usando a palavra-chave defineVersionString.
 *
 * @param targetPathOrDir Caminho do arquivo ou diretório
 * @param baseDir Diretório base opcional (padrão: ".")
 * @param defineVersionString Identificador customizado da constante (padrão: "__APP_VERSION__")
 * @returns true se o arquivo foi criado, false se já existia
 */
export async function ensureVersionFile(
  targetPathOrDir: string,
  baseDir: string = ".",
  defineVersionString: string = "__APP_VERSION__",
): Promise<boolean> {
  const resolvedPath = isAbsolute(targetPathOrDir,)
    ? targetPathOrDir
    : join(baseDir, targetPathOrDir,);

  const filePath = resolvedPath.endsWith(".ts",)
    ? resolvedPath
    : join(resolvedPath, "version.ts",);

  try {
    const stat = await Deno.stat(filePath,);
    if (stat.isFile) {
      return false;
    }
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
  }

  const dir = dirname(filePath,);
  if (dir && dir !== ".") {
    try {
      await Deno.mkdir(dir, { recursive: true, },);
    } catch {
      // diretório já existe ou sem permissão
    }
  }

  await Deno.writeTextFile(filePath, getVersionFileTemplate(defineVersionString,),);
  return true;
}

/**
 * Garante a existência dos arquivos declarados em versionPaths antes do build/bundle.
 * Verifica previamente a existência de cada arquivo e não o sobrescreve caso já exista.
 *
 * @param versionPaths Lista de caminhos de arquivos version.ts
 * @param baseDir Diretório base opcional (padrão: ".")
 * @param defineVersionString Identificador customizado da constante (padrão: "__APP_VERSION__")
 * @returns Lista de caminhos processados
 */
export async function ensureVersionFiles(
  versionPaths: string[] = [],
  baseDir: string = ".",
  defineVersionString: string = "__APP_VERSION__",
): Promise<string[]> {
  const processed: string[] = []; 

  for (const vPath of versionPaths) {
    const targetPath = isAbsolute(vPath,) ? vPath : join(baseDir, vPath,);
    const filePath = targetPath.endsWith(".ts",)
      ? targetPath
      : join(targetPath, "version.ts",);

    try {
      const created = await ensureVersionFile(filePath, baseDir, defineVersionString,);
      if (created) {
        console.log(`📝 Arquivo de versão criado com template ${defineVersionString}: ${filePath}`,);
      } else {
        console.log(`ℹ️ Arquivo de versão existente mantido: ${filePath}`,);
      }
      processed.push(filePath,);
    } catch (err) {
      console.warn(`⚠️ Aviso ao verificar/criar version.ts em ${filePath}:`, err,);
    }
  }

  return processed;
}

/**
 * Grava ou assegura a existência do arquivo version.ts no caminho ou diretório especificado.
 * Mantido para compatibilidade.
 */
export async function writeVersionFile(
  targetPathOrDir: string,
  _version?: string,
): Promise<void> {
  await ensureVersionFile(targetPathOrDir,);
}

/**
 * Sincroniza a versão do projeto em arquivos de configuração e código sem incrementar.
 * Útil para garantir que todos os pacotes e arquivos de versão estejam alinhados.
 *
 * @param options Opções de sincronização
 * @returns Versão sincronizada
 *
 * @example
 * ```typescript
 * await syncVersion({
 *   versionPaths: ["src/version.ts"],
 *   forcepackagesversion: true
 * });
 * ```
 */
export async function syncVersion(
  options: VersionUpdateOptions = {},
): Promise<string> {
  const baseDir = options.baseDir ?? ".";
  const denoJsonPath = options.denoJsonPath ??
    join(baseDir, "deno.jsonc",);
  const forcePackages = options.forcepackagesversion ?? false;
  const versionPaths = options.versionPaths ?? [];
  const defineVersionString = options.defineVersionString ?? "__APP_VERSION__";

  let finalVersion = options.currentVersion;
  if (!finalVersion) {
    finalVersion = await readProjectVersion(denoJsonPath, baseDir,);
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

  // Garante a existência dos arquivos version.ts sem sobrescrever caso já existam
  if (versionPaths.length > 0) {
    await ensureVersionFiles(versionPaths, baseDir, defineVersionString,);
  } else if (!forcePackages) {
    console.warn(
      `⚠️ Nenhum caminho de versão (versionPaths) foi especificado para sincronização.`,
    );
    console.log(`Exemplo de uso: syncVersion({ versionPaths: ["src/version.ts"] })`,);
  }

  return finalVersion;
}

/**
 * Incrementa a versão patch e sincroniza o projeto.
 *
 * @param options Opções de atualização
 * @returns Versão final aplicada
 *
 * @example
 * ```typescript
 * const newVersion = await updateProjectVersion({
 *   noversion: false,
 *   buildHash: "abc1234"
 * });
 * ```
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
 * Normaliza qualquer string de versão para o formato semver canônico estrito "MAJOR.MINOR.PATCH".
 * Remove prefixos como "v", metadados de build (+build), identificadores de pre-release (-alpha)
 * e sufixos de commit hash (#hash), garantindo exatamente 3 componentes numéricos.
 * Equivalente TypeScript para a função `sanitize_version` de `lib-version.sh`.
 *
 * @param raw Versão original bruta (ex: "v1.2.3-beta+exp.sha.5114f85", "0.3.14#muesu7z0")
 * @returns Versão semver sanitizada (ex: "1.2.3", "0.3.14")
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
