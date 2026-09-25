// ============================================================================
// 📦 RE-EXPORTS DE MÓDULOS ESPECÍFICOS
// ============================================================================
export { esBuild, } from "./engine.ts";

export { CONFIGURACOES_PADRAO as esbuildExample, } from "./config.ts";

export type {
  EsbuildGlobalConfig,
  EsbuildOptions,
  EsbuildResult,
  EsbuildTargetConfig,
} from "../tools/interfaces.ts";
