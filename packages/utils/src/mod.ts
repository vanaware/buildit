/**
 * @vanaware/buildit
 * Entry point for shared utilities.
 */

// ⚙️ Gerenciamento de Versão
export {
  readProjectVersion,
  syncVersion,
  updateProjectVersion,
} from "./config/version.ts";

// 🏗️ Orquestradores de Build
export { denoBuild } from "./denobuild/engine.ts";
export { denoBuildCli } from "./denobuild/cli.ts";
export { esBuild } from "./esbuild/engine.ts";
export { esBuildCli } from "./esbuild/cli.ts";
export { builditExport as export } from "./export/engine.ts";
export { exportCli } from "./export/cli.ts";

// 📜 Interfaces e Tipos
export * from "./interfaces/mod.ts";
export * from "./denobuild/types.ts";
export * from "./export/types.ts";
export { APP_VERSION } from "./version.ts";
