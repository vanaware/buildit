/**
 * @module @vanaware/buildit
 * @description Suite de utilitários em TypeScript para orquestração de compilação (esbuild e Deno.bundle),
 * desenvolvimento contínuo (watch), exportação de contexto para IA e automação SemVer.
 *
 * Todos os motores e utilitários programáticos são exportados diretamente a partir deste módulo raiz:
 *
 * @example
 * ```typescript
 * import { esBuild, watchEngine, denoBuild, exportEngine } from "jsr:@vanaware/buildit";
 *
 * // Executar compilação de produção com esbuild
 * await esBuild({
 *   config: {
 *     ui: {
 *       entryPoints: ["main.tsx"],
 *       distdir: "dist",
 *     },
 *   },
 *   noversion: true,
 * });
 *
 * // Iniciar watch contínuo com esbuild.context e trava anti-concorrência
 * const handles = await watchEngine({
 *   config: {
 *     ui: {
 *       entryPoints: ["main.tsx"],
 *       distdir: "dist",
 *     },
 *   },
 *   target: "ui",
 * });
 *
 * // Gerar snapshot de contexto para LLMs
 * await exportEngine({
 *   config: {
 *     ui: {
 *       arquivoSaida: "snapshots/ui.md",
 *       includes: ["src/**/*"],
 *     },
 *   },
 * });
 * ```
 */

export * from "./tools/mod.ts";

export { APP_VERSION as version, } from "./version.ts";

export * from "./version/sanitize/mod.ts";
export * from "./denobuild/mod.ts";
export * from "./export/mod.ts";
export * from "./watch/mod.ts";
export * from "./esbuild/mod.ts";
export * from "./version/tag/mod.ts";
