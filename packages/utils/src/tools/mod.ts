export { loadConfig } from "./jsonc.ts";

// ⚙️ Gerenciamento de Versão
export {
  currentVersion,
  extractRawVersion,
  extractVersionFromContent,
  findDenoFile,
  formatVersion,
  incrementVersion,
  parseVersion,
  readProjectVersion,
  replaceVersionInContent,
  sanitizeVersion,
  syncVersion,
  updateProjectVersion,
  writeVersionFile,
} from "./version.ts";

// 🛠️ Utilitários de CLI e Validação
export { parseArgs } from "./cli-flags.ts";
export { validateTargetConfig } from "./validate.ts";
export { resolverOrdemTargets } from "./targets.ts";
export {
  cleanTarget,
  copyStaticFiles,
  ensureDirForFile,
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
  DenoBundleFormat,
  DenoBundleGlobalConfig,
  DenoBundlePackageHandling,
  DenoBundlePlatform,
  DenoBundleSourceMap,
  DenoBundleTargetConfig,
  EsbuildCharset,
  EsbuildDrop,
  EsbuildFormat,
  EsbuildGlobalConfig,
  EsbuildJsx,
  EsbuildLegalComments,
  EsbuildLoader,
  EsbuildLogLevel,
  EsbuildOptions,
  EsbuildPlatform,
  EsbuildResult,
  EsbuildSourcemap,
  EsbuildTargetConfig,
  ExportConfig,
  ExportOptions,
  ExportResult,
  GlobalTargetConfig,
  ParsedArgs,
  ParsedVersion,
  SanitizeVersionOptions,
  SanitizeVersionResult,
  TagVersionOptions,
  TagVersionResult,
  TargetConfig,
  VersionUpdateOptions,
  WatchConfigFile,
  WatchConfigResult,
  WatchGlobalConfig,
  WatchHandle,
  WatchOptions,
  WatchTargetConfig,
} from "./interfaces.ts";
