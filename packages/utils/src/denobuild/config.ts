/**
 * @module @vanaware/buildit/denobuild/config
 * @description Carregamento de configurações externas a partir de `denobuild.jsonc`
 * e fallback para configurações padrão do projeto BuildIt.
 */

import { loadConfig } from "../config/mod.ts";
import type {
  DenoBuildConfigFile,
  DenoBundleGlobalConfig,
} from "./types.ts";

/**
 * Configuração padrão para o motor Deno.bundle no projeto BuildIt.
 */
export const CONFIGURACOES_PADRAO: DenoBundleGlobalConfig = {
  ui: {
    mode: "build",
    default: true,
    srcdir: "packages/ui/src",
    distdir: "packages/server/build/dist",
    publicdir: "packages/ui/public",
    indexHtml: true,
    clean: [".",],
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
 * @returns Mapeamento de alvos para suas configurações `DenoBundleTargetConfig`
 *
 * @example
 * ```typescript
 * const configs = await carregarConfigDenoBuild("denobuild.jsonc");
 * console.log(Object.keys(configs)); // ["ui"]
 * ```
 */
export async function carregarConfigDenoBuild(
  caminhoConfig?: string,
  baseDir: string = ".",
): Promise<DenoBundleGlobalConfig> {
  const parsed = await loadConfig<DenoBuildConfigFile>(
    "denobuild",
    caminhoConfig,
    baseDir,
  );

  if (parsed) {
    // Caso 1: Objeto possui a chave "targets"
    if (parsed.targets && typeof parsed.targets === "object") {
      return parsed.targets;
    }

    // Caso 2: Objeto possui a chave em português "alvos"
    if (parsed.alvos && typeof parsed.alvos === "object") {
      return parsed.alvos;
    }

    // Caso 3: Objeto define alvos diretamente na raiz excluindo metadados
    const filteredKeys = Object.keys(parsed).filter(
      (k) => !k.startsWith("$") && k !== "version",
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
        return resultado;
      }
    }
  }

  return { ...CONFIGURACOES_PADRAO };
}
