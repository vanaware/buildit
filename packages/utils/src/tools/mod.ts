export { loadConfig, } from "./jsonc.ts";

// ⚙️ Gerenciamento de Versão
export {
  readProjectVersion,
  syncVersion,
  updateProjectVersion,
} from "./version.ts";

// 🛠️ Utilitários de CLI e Validação
export { parseArgs, } from "./cli-flags.ts";
export { validateTargetConfig, } from "./validate.ts";
export {
  cleanTarget,
  copyStaticFiles,
  isSafePath,
  listAssetsForCache,
  resolveEntryPoints,
  resolveOutputPaths,
} from "./paths.ts";

export {
  EXTENSOES_PADRAO,
} from "./interfaces.ts";

export type {
  DenoBuildOptions,
  DenoBuildResult,
  DenoBundleGlobalConfig,
  DenoBundleTargetConfig,
  EsbuildFormat,
  EsbuildGlobalConfig,
  EsbuildOptions,
  EsbuildPlatform,
  EsbuildResult,
  EsbuildTargetConfig,
  ExportConfig,
  ExportOptions,
  ExportResult,
  GlobalTargetConfig,
  ParsedArgs,
  ParsedVersion,
  TargetConfig,
  TargetMode,
  VersionUpdateOptions,
} from "./interfaces.ts";
