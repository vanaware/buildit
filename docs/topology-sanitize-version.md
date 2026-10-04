# Execution Topology: `sanitize-version`

This document describes the execution topology of the **`sanitize-version`** utility, responsible for normalizing the version in the `deno.jsonc` file to strict SemVer format (`MAJOR.MINOR.PATCH`).

---

## 1. Call Graph

```
[CLI / Terminal]
       │
       ▼
sanitizeVersionCli() (packages/utils/src/version/sanitize/cli.ts)
       │
       ├──► findDenoConfig()
       │
       ▼
sanitizeVersionFile(options: SanitizeOptions) (packages/utils/src/version/sanitize/engine.ts)
       │
       ├──► Deno.readTextFile(denoJsonPath)
       ├──► parseJsonc(content)
       │
       ├──► [If version is missing]
       │       └──► version = "0.0.0"
       │
       ├──► parseVersion(version) (packages/utils/src/tools/version.ts)
       │       └──► [Regex extraction: major, minor, patch]
       │
       ├──► formatVersion(parsed)
       │       └──► `${major}.${minor}.${patch}`
       │
       ├──► replaceVersionInContent(content, newVersion)
       │       └──► [Regex replacement in JSONC string]
       │
       └──► Deno.writeTextFile(denoJsonPath, updatedContent)
```

---

## 2. Step-by-Step Execution Mapping

### Step 1: CLI Initialization
* **Function**: `sanitizeVersionCli()`
* **File**: `packages/utils/src/version/sanitize/cli.ts`
* **Input**: CLI arguments via Cliffy (`[path:string]`).
* **Actions**:
  1. Resolves the `deno.jsonc` path (default: automatic search via `findDenoConfig`).
  2. Calls `sanitizeVersionFile({ filePath })`.
  3. Displays a success message with the normalized version.

### Step 2: Version Normalization
* **Function**: `sanitizeVersionFile(options)`
* **File**: `packages/utils/src/version/sanitize/engine.ts`
* **Actions**:
  1. Reads the `deno.jsonc` file content.
  2. Extracts the current `version` field.
  3. Uses `parseVersion` to capture only numeric components (ignoring git suffixes or pre-releases).
  4. Formats the new version string.
  5. Replaces the version in the original content (preserving JSONC comments and formatting).
  6. Writes the file back to disk.

---

## 3. Summary Table

| Function | Caller | Input | Return | Side Effect |
|---|---|---|---|---|
| `sanitizeVersionCli()` | Deno CLI | `Deno.args` | `void` | Console log |
| `sanitizeVersionFile()` | CLI / API | `SanitizeOptions` | `Promise<string>` | `deno.jsonc` writing |
| `parseVersion()` | `sanitizeVersionFile` | `string` | `ParsedVersion` | Pure |
| `formatVersion()` | `sanitizeVersionFile` | `ParsedVersion` | `string` | Pure |
