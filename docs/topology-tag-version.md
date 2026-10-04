# Execution Topology: `tag-version`

This document describes the execution topology of the **`tag-version`** utility, which automates the git release cycle (commit, tag cleanup, and push).

---

## 1. Call Graph

```
[CLI / Terminal]
       │
       ▼
tagVersionCli() (packages/utils/src/version/tag/cli.ts)
       │
       ├──► findDenoConfig()
       │
       ▼
tagVersionEngine(options: TagVersionOptions) (packages/utils/src/version/tag/engine.ts)
       │
       ├──► [If sanitize === true]
       │       └──► sanitizeVersionFile({ filePath, baseDir })
       │
       ├──► readProjectVersion(denoJsonPath)
       │
       ├──► [Git Flow]
       │       ├──► git add -A
       │       ├──► git commit -m "Version vX.Y"
       │       ├──► git push
       │       │
       │       ├──► git tag -d vX.Y (local)
       │       ├──► git push origin :refs/tags/vX.Y (remote)
       │       │
       │       ├──► git tag -a vX.Y -m "Release vX.Y"
       │       └──► git push origin vX.Y
```

---

## 2. Step-by-Step Execution Mapping

### Step 1: CLI Initialization
* **Function**: `tagVersionCli()`
* **File**: `packages/utils/src/version/tag/cli.ts`
* **Input**: CLI arguments (`-s/--sanitize`, `-m/--message`, etc.).
* **Actions**:
  1. Resolves the `deno.jsonc` path.
  2. Calls `tagVersionEngine(options)`.

### Step 2: Git Release Orchestration
* **Function**: `tagVersionEngine(options)`
* **File**: `packages/utils/src/version/tag/engine.ts`
* **Actions**:
  1. Optionally normalizes the version on disk via `sanitizeVersionFile`.
  2. Reads the current version from `deno.jsonc`.
  3. Executes a sequence of `git` commands using `runGit`:
     - **Commit**: Adds all changes and creates a commit with the version.
     - **Push**: Pushes the current branch to the remote.
     - **Cleanup**: Removes previous tags at the same level (MAJOR.MINOR) to ensure the release tag always points to the latest commit.
     - **Tagging**: Creates a new annotated tag and pushes it to origin with `--force`.

---

## 3. Summary Table

| Function | Caller | Input | Return | Side Effect |
|---|---|---|---|---|
| `tagVersionCli()` | Deno CLI | `Deno.args` | `void` | Git command execution |
| `tagVersionEngine()` | CLI / API | `TagVersionOptions` | `Promise<TagVersionResult>` | Local/remote Git state mutation |
| `sanitizeVersionFile()` | `tagVersionEngine` | `SanitizeOptions` | `Promise<string>` | `deno.jsonc` writing |
