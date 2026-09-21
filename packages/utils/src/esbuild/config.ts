/**
 * @module @vanaware/buildit/esbuild/config
 * @description Carregamento de configurações externas a partir de `esbuild.jsonc`
 * e fallback para configurações padrão do projeto BuildIt.
 */

import { loadConfig } from "../config/mod.ts";
import type {
  GlobalTargetConfig,
} from "../interfaces/mod.ts";

/**
 * Configuração padrão para o motor esbuild no projeto BuildIt.
 */
export const CONFIGURACOES_PADRAO: GlobalTargetConfig = {
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
  "watch": {
    mode: "watch",
    default: false,
    srcdir: "packages/ui/src",
    distdir: "packages/server/build/dist",
    publicdir: "packages/ui/public",
    indexHtml: true,
    entryPoints: ["main.ts",],
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

/**
 * Estrutura do arquivo de configuração externo `esbuild.jsonc`.
 */
export interface EsbuildConfigFile {
  /** URL do JSON Schema para validação e autocomplete no editor */
  $schema?: string;
  /** Versão semântica da configuração */
  version?: string;
  /** Alvos de build configurados no projeto */
  targets?: GlobalTargetConfig;
  /** Alias em português para alvos de build configurados */
  alvos?: GlobalTargetConfig;
  /** Lista de caminhos de arquivos ou diretórios onde salvar o version.ts */
  versionPaths?: string[];
  /** Se true, sincroniza versão para os subpacotes do workspace */
  forcepackagesversion?: boolean;
  /** Suporte a alvos definidos diretamente no nível raiz do JSON */
  [key: string]: unknown;
}

/**
 * Resultado do carregamento da configuração, incluindo alvos e opções globais.
 */
export interface EsbuildConfigResult {
  targets: GlobalTargetConfig;
  versionPaths?: string[];
  forcepackagesversion?: boolean;
}

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
    targets: { ...CONFIGURACOES_PADRAO },
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
    const filteredKeys = Object.keys(parsed).filter(
      (k) =>
        !k.startsWith("$") &&
        !["version", "versionPaths", "forcepackagesversion",].includes(k,),
    );

    if (filteredKeys.length > 0) {
      const resultado: GlobalTargetConfig = {};
      let hasValidTargets = false;

      for (const key of filteredKeys) {
        const val = (parsed as Record<string, unknown>)[key];
        if (val && typeof val === "object") {
          resultado[key] = val as GlobalTargetConfig[string];
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
