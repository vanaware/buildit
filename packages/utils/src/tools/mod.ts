
export { 
    EXTENSIONS_EXAMPLE as defaultExtensions,
    type VersionUpdateOptions
 } from "./interfaces.ts";
export { VERSION_PATHS_EXAMPLE as versionPathsExample } from "./version.ts";

export { 
    readProjectVersion,
    sanitizeVersion,
    ensureVersionFiles,
    syncVersion,
    syncWorkspaceDir
} from "./version.ts"

export {
    loadConfig
} from "./jsonc.ts"

export {
    applyDefines,
    findDenoConfig,
    processFilesWithDefines
} from "./paths.ts"

export {
    runGit,
    type GitResult
} from "./git.ts"