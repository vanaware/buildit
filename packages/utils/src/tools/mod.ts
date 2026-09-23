export { loadConfig, } from "./jsonc.ts";

// ⚙️ Gerenciamento de Versão
export {
  readProjectVersion,
  syncVersion,
  updateProjectVersion,
} from "./version.ts";

// 🛠️ Utilitários de CLI e Validação
export { parseArgs, parseCommonCliFlags, } from "./cli-flags.ts";
export { validateTargetConfig, } from "./validate.ts";
export {
  cleanTarget,
  copyStaticFiles,
  isSafePath,
  listAssetsForCache,
  resolveEntryPoints,
  resolveOutputPaths,
} from "./paths.ts";

export {} from "./interfaces.ts";
