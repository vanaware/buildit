/**
 * @module @vanaware/buildit/esbuild/config
 * @description Carregamento de configurações externas a partir de `esbuild.jsonc`
 * e fallback para configurações padrão do projeto BuildIt.
 */

import { parse as parseJsonc, } from "@std/jsonc";
import { join, } from "@std/path";
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
  /** Suporte a alvos definidos diretamente no nível raiz do JSON */
  [key: string]: unknown;
}

/**
 * Carrega as configurações de alvos para o motor esbuild a partir de um arquivo JSONC externo
 * (ex: `esbuild.jsonc` ou `esbuild.json`).
 *
 * Se o arquivo não for encontrado ou não contiver alvos válidos, retorna o objeto padrão `CONFIGURACOES_PADRAO`.
 *
 * @param caminhoConfig Caminho opcional do arquivo de configuração
 * @param baseDir Diretório base para resolução de arquivos relativos
 * @returns Mapeamento de alvos para suas configurações `TargetConfig`
 */
export async function carregarConfigEsbuild(
  caminhoConfig?: string,
  baseDir: string = ".",
): Promise<GlobalTargetConfig> {
  const caminhosCandidatos = caminhoConfig
    ? [caminhoConfig,]
    : [
      join(baseDir, "esbuild.jsonc",),
      join(baseDir, "esbuild.json",),
    ];

  for (const caminho of caminhosCandidatos) {
    try {
      const conteudo = await Deno.readTextFile(caminho,);
      const parsed = parseJsonc(conteudo,) as unknown;

      if (parsed && typeof parsed === "object") {
        const configFile = parsed as EsbuildConfigFile;

        // Caso 1: Objeto possui a chave "targets"
        if (configFile.targets && typeof configFile.targets === "object") {
          return configFile.targets;
        }

        // Caso 2: Objeto possui a chave em português "alvos"
        if (configFile.alvos && typeof configFile.alvos === "object") {
          return configFile.alvos;
        }

        // Caso 3: Objeto define alvos diretamente na raiz excluindo metadados
        const filteredKeys = Object.keys(parsed,).filter(
          (k,) => !k.startsWith("$",) && k !== "version",
        );
        if (filteredKeys.length > 0) {
          const resultado: GlobalTargetConfig = {};
          for (const key of filteredKeys) {
            const val = (parsed as Record<string, unknown>)[key];
            if (val && typeof val === "object") {
              resultado[key] = val as GlobalTargetConfig[string];
            }
          }
          if (Object.keys(resultado,).length > 0) {
            return resultado;
          }
        }
      }
    } catch (erro) {
      if (caminhoConfig && !(erro instanceof Deno.errors.NotFound)) {
        console.warn(`⚠️ Aviso ao ler configuração em ${caminho}:`, erro,);
      }
    }
  }

  return { ...CONFIGURACOES_PADRAO, };
}
