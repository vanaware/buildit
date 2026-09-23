/**
 * @module @vanaware/buildit/watch
 * @description Módulo de desenvolvimento contínuo (Watch Mode) com esbuild context.
 */

export { watchCli, } from "./cli.ts";
export { carregarConfigWatch, CONFIGURACOES_WATCH_PADRAO, } from "./config.ts";
export { startTargetWatcher, watchEngine, } from "./engine.ts";
