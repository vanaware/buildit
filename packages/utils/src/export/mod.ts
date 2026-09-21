/**
 * @module @vanaware/buildit/export
 * @description Ferramenta e biblioteca para consolidação estruturada de código-fonte
 * e documentação de projetos em snapshots Markdown otimizados para consumo por IAs.
 *
 * Suporta configuração declarativa externa via `export.jsonc`, filtros por extensão,
 * proteção contra loops e execução via CLI ou programática.
 *
 * @example
 * ```typescript
 * import { builditExport } from "@vanaware/buildit/export";
 *
 * const resultados = await builditExport({
 *   caminhoConfig: "export.jsonc",
 *   modos: ["ui", "docs"],
 * });
 * ```
 */

export * from "./types.ts";
export * from "./formatter.ts";
export * from "./config.ts";
export * from "./engine.ts";
export * from "./cli.ts";
