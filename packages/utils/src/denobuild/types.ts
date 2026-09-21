/**
 * @module @vanaware/buildit/denobuild/types
 * @description Definições de tipos e interfaces para o motor de compilação Deno.bundle (denobuild).
 */

import type {
  DenoBundleGlobalConfig,
  DenoBundlePlatform,
  DenoBundleTargetConfig,
  ParsedArgs,
  ParsedVersion,
} from "../interfaces/mod.ts";

export type {
  DenoBundleGlobalConfig,
  DenoBundlePlatform,
  DenoBundleTargetConfig,
  ParsedArgs,
  ParsedVersion,
};

/**
 * Estrutura do arquivo de configuração externo `denobuild.jsonc`.
 */
export interface DenoBuildConfigFile {
  /** URL do JSON Schema para validação e autocomplete no editor */
  $schema?: string;
  /** Versão semântica da configuração */
  version?: string;
  /** Alvos de build configurados no projeto */
  targets?: DenoBundleGlobalConfig;
  /** Alias em português para alvos de build configurados */
  alvos?: DenoBundleGlobalConfig;
  /** Lista de caminhos de arquivos ou diretórios onde salvar o version.ts */
  versionPaths?: string[];
  /** Se true, sincroniza versão para os subpacotes do workspace */
  forcepackagesversion?: boolean;
  /** Suporte a alvos definidos diretamente no nível raiz do JSON */
  [key: string]: unknown;
}

/**
 * Resultado detalhado da execução de compilação de um alvo via Deno.bundle.
 */
export interface DenoBuildResult {
  /** Nome identificador do alvo compilado (ex: "ui") */
  target: string;
  /** Indica se a compilação foi concluída com êxito */
  success: boolean;
  /** Duração da compilação em milissegundos */
  durationMs: number;
  /** Lista de caminhos dos arquivos gerados no disco */
  outputFiles: string[];
}

/**
 * Opções de configuração para o método programático `executarDenoBuild`.
 */
export interface DenoBuildOptions {
  /** Configuração direta de alvos em memória (substitui leitura de arquivo) */
  config?: DenoBundleGlobalConfig;
  /** Caminho do arquivo de configuração externo (padrão: "denobuild.jsonc" ou "denobuild.json") */
  caminhoConfig?: string;
  /** Lista explícita de alvos a serem compilados. Se omitido, compila os marcados como default */
  targets?: string[];
  /** Diretório base de resolução do projeto (padrão: ".") */
  baseDir?: string;
  /** Se true, não incrementa a versão semântica no deno.jsonc */
  noversion?: boolean;
  /** Lista de caminhos de arquivos ou diretórios onde salvar o version.ts */
  versionPaths?: string[];
  /** Se true, sincroniza versão para os subpacotes do workspace */
  forcepackagesversion?: boolean;
  /** Caminho para o arquivo deno.jsonc (padrão: "deno.jsonc") */
  denoJsoncPath?: string;
  /** Se true, suprime mensagens informativas no console */
  silencioso?: boolean;
}
