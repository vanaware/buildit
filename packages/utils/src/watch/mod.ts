/**
 * @module @vanaware/buildit/watch
 * @description Módulo de desenvolvimento contínuo (Watch) para Deno e Preact.
 */

export { watchEngine, } from "./engine.ts";

export { CONFIGURACOES_PADRAO_WATCH as watchExample, } from "./config.ts";

export type {
  WatchHandle,
  WatchLockData,
  WatchOptions,
  WatchTargetConfig,
} from "../tools/interfaces.ts";
