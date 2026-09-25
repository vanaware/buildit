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

    // Caso 1: Objeto possui a chave "targets"
    if (parsed.targets && typeof parsed.targets === "object") {
      result.targets = parsed.targets;
      return result;
    }

    // Caso 2: Objeto possui a chave em português "alvos"
    if (parsed.alvos && typeof parsed.alvos === "object") {
      result.targets = parsed.alvos;
      return result;
    }

    // Caso 3: Objeto define alvos diretamente na raiz excluindo metadados
    const filteredKeys = Object.keys(parsed,).filter(
      (k,) =>
        !k.startsWith("$",) &&
        !["version", "versionPaths", "forcepackagesversion",].includes(k,),
    );

    if (filteredKeys.length > 0) {
      const resultado: DenoBundleGlobalConfig = {};
      let hasValidTargets = false;

      for (const key of filteredKeys) {
        const val = (parsed as Record<string, unknown>)[key];
        if (val && typeof val === "object") {
          resultado[key] = val as DenoBundleGlobalConfig[string];
          hasValidTargets = true;
        }
      }

      if (hasValidTargets) {
        result.targets = resultado;
        return result;
      }
    }
  }

  return result;
}
