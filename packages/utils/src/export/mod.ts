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
 * import { exportEngine } from "jsr:@vanaware/buildit";
 *
 * const resultados = await exportEngine({
 *   caminhoConfig: "export.jsonc",
 *   modos: ["ui", "docs"],
 * });
 * ```
 */

export { exportEngine, } from "./engine.ts";

export { EXPORT_CONFIG_EXAMPLE as exportExample, } from "./config.ts";

export type {
  ExportConfig,
  ExportOptions,
  ExportResult,
} from "../tools/interfaces.ts";
