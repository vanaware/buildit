# 🚀 Rules for Publishing to JSR (`@vanaware/buildit`)

This document defines the quality and documentation standards required for all packages in the `@vanaware/buildit` suite before publication to the **JSR (Deno)** registry.

---

## 1. Zero Node.js Dependencies

All code in `packages/utils` MUST be pure Deno.
- **Specifiers:** Use only `jsr:` and `npm:` (via Deno resolution).
- **APIs:** Use `Deno.*` and `@std/*`. Avoid `node:*` or standard Node.js libraries.
- **Portability:** The library must be importable in any environment that supports JSR/Deno 2.x.

## 2. Complete JSDoc (Mandatory)

Every exported function, interface, type, or constant must have a JSDoc block in English.

### Required Fields:
- `@description`: Detailed explanation of the item's purpose.
- `@param`: Description of each parameter and its type.
- `@returns`: Explanation of the return value.
- `@example`: A runnable and clear usage example.

**Example:**
```typescript
/**
 * @description Normalizes a semver string.
 * @param raw - The original version string.
 * @returns The sanitized MAJOR.MINOR.PATCH string.
 */
export function sanitizeVersion(raw: string): string { ... }
```

## 3. Documentation Linter (`deno doc --lint`)

Before every push/release, you must run the documentation linter:
```bash
deno task lint:doc
```
- No warnings or errors are allowed.
- All public items must be documented.

## 4. Descriptive README per Package

Each sub-package (e.g., `packages/utils`) must have its own `README.md` (English).
- **Core Value:** What problem does this specific package solve?
- **Quick Start:** One or two examples of common usage.
- **JSR Badges:** Links to the module on JSR.

## 5. Automation via GitHub Actions

Publication is managed exclusively by the `.github/workflows/jsr-publish.yml` workflow.
- **Prerequisite:** The version must be a valid SemVer (e.g., `0.3.14`).
- **Sanitization:** The `sanitize-version.ts` script is executed before publication to ensure no git hashes (e.g., `#mu...`) remain in the version.

---

## ✅ Checklist for Pull Requests:
- [ ] `deno task test` passes.
- [ ] `deno task lint` passes.
- [ ] `deno task lint:doc` returns zero warnings.
- [ ] New exports have runnable `@example` in JSDoc.
- [ ] New configuration fields are added to the corresponding JSON Schema in `schema/`.
