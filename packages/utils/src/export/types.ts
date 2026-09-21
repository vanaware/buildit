/**
 * @module @vanaware/buildit/export/types
 * @description Definições de tipos e interfaces para o motor de exportação de contexto para IAs.
 */

import type { ExportConfig, } from "../interfaces/mod.ts";

export type { ExportConfig };

/**
 * Estrutura do arquivo de configuração externo `export.jsonc`.
 */
export interface ExportConfigFile {
  /** URL do JSON Schema para validação e autocomplete no editor */
  $schema?: string;
  /** Versão opcional do schema de configuração */
  version?: string;
  /** Modos de exportação configurados para o projeto */
  modos: Record<string, ExportConfig>;
}

/**
 * Resultado detalhado da execução de exportação de um modo.
 */
export interface ExportResult {
  /** Nome identificador do modo executado (ex: "ui", "docs", "server", "utils") */
  modo: string;
  /** Quantidade de arquivos incluídos no snapshot gerado */
  arquivos: number;
  /** Caminho relativo do arquivo de saída gravado */
  arquivoSaida: string;
  /** Tamanho total do arquivo de saída em bytes */
  bytes: number;
}

/**
 * Opções de configuração para o método programático `executarExport`.
 */
export interface ExportOptions {
  /** Configuração direta de modos em memória (substitui leitura de arquivo) */
  config?: Record<string, ExportConfig>;
  /** Caminho do arquivo de configuração (padrão: "export.jsonc" ou "export.json") */
  caminhoConfig?: string;
  /** Lista explícita de modos a serem executados. Se omitido, executa os marcados como default */
  modos?: string[];
  /** Diretório base de varredura (padrão: ".") */
  baseDir?: string;
  /** Versão da aplicação a ser injetada no cabeçalho (se omitido, lê do deno.jsonc raiz) */
  versaoApp?: string;
  /** Caminho alternativo para o deno.jsonc para extração da versão */
  denoJsoncPath?: string;
  /** Se true, suprime logs informativos no console */
  silencioso?: boolean;
}
