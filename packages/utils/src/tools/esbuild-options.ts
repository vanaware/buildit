/**
 * @module @vanaware/buildit/tools/esbuild-options
 * @description Shared option-building helpers used by the esbuild, watch, and
 * denobuild engines: version define resolution, asset define injection, and
 * banner/footer placeholder substitution.
 */

/** Default identifier used to inject the application version at build time. */
export const DEFAULT_VERSION_DEFINE = "__APP_VERSION__";

/**
 * Resolves the identifier used to inject the application version.
 * Precedence: explicit argument > per-target `defineVersionString` > default.
 *
 * @param config Target configuration (may carry `defineVersionString`)
 * @param defineVersionString Explicit global identifier (optional)
 * @returns The resolved define identifier
 *
 * @example
 * ```typescript
 * resolveDefineVersionKey({}, undefined); // "__APP_VERSION__"
 * resolveDefineVersionKey({ defineVersionString: "__VER__" }); // "__VER__"
 * ```
 */
export function resolveDefineVersionKey(
  config: { defineVersionString?: string },
  defineVersionString?: string,
): string {
  return defineVersionString || config.defineVersionString ||
    DEFAULT_VERSION_DEFINE;
}

/**
 * Builds the final `define` map with the version constant injected.
 *
 * @param config Target configuration with optional custom `define` entries
 * @param appVersion Current application semantic version
 * @param defineVersionKey Identifier reserved for the version constant
 * @returns Merged map of compile-time definitions
 */
export function buildVersionedDefine(
  config: { define?: Record<string, string> },
  appVersion: string,
  defineVersionKey: string,
): Record<string, string> {
  return {
    ...config.define,
    [defineVersionKey]: JSON.stringify(`v${appVersion}`),
  };
}

/**
 * Injects the generated asset list into the define map when `defineAssetsString`
 * is configured. Mutates `finalDefine` in place.
 *
 * @param finalDefine Define map to receive the asset list entry
 * @param config Target configuration with `defineAssetsString` and `distdir`
 * @param listAssetsFn Optional function to list assets in the output directory
 */
export async function applyAssetDefine(
  finalDefine: Record<string, string>,
  config: { defineAssetsString?: string; distdir?: string },
  listAssetsFn?: (distDir: string) => Promise<string[]>,
): Promise<void> {
  if (
    config.defineAssetsString &&
    config.defineAssetsString.trim() !== "" &&
    listAssetsFn &&
    config.distdir
  ) {
    const assets = await listAssetsFn(config.distdir);
    finalDefine[config.defineAssetsString] = JSON.stringify(assets);
    console.log(
      `📋 ${assets.length} assets listed for define '${config.defineAssetsString}'`,
    );
  }
}

/**
 * Replaces version placeholders (`__APP_VERSION__` and the custom define key)
 * in a text fragment with the actual application version.
 *
 * @param text Source text (banner/footer content)
 * @param appVersion Current application semantic version
 * @param defineVersionKey Custom identifier also treated as a placeholder
 * @returns Text with all version placeholders substituted
 */
export function injectVersionPlaceholders(
  text: string,
  appVersion: string,
  defineVersionKey: string,
): string {
  return text
    .replaceAll(DEFAULT_VERSION_DEFINE, appVersion)
    .replaceAll(defineVersionKey, appVersion);
}

/**
 * Builds a version-injected banner/footer block for esbuild options.
 * Returns `undefined` when no js/css fragment is present (mirroring the
 * historical behavior of only assigning `banner`/`footer` when non-empty).
 *
 * @param source Raw banner/footer configuration
 * @param appVersion Current application semantic version
 * @param defineVersionKey Custom identifier treated as a placeholder
 * @returns Processed banner/footer block or `undefined`
 */
export function buildBannerFooter(
  source: { js?: string; css?: string } | undefined,
  appVersion: string,
  defineVersionKey: string,
): { js?: string; css?: string } | undefined {
  if (source === undefined) return undefined;

  const block: { js?: string; css?: string } = {};
  if (source.js !== undefined) {
    block.js = injectVersionPlaceholders(source.js, appVersion, defineVersionKey);
  }
  if (source.css !== undefined) {
    block.css = injectVersionPlaceholders(
      source.css,
      appVersion,
      defineVersionKey,
    );
  }
  if (block.js === undefined && block.css === undefined) return undefined;
  return block;
}

/**
 * Copies the listed optional properties from a source config to a target
 * options object, skipping `undefined` values.
 *
 * @param source Configuration object to read from
 * @param target Options object to write into
 * @param props Property names considered for copying
 */
export function copyOptionalProps(
  source: Record<string, unknown>,
  target: Record<string, unknown>,
  props: readonly string[],
): void {
  for (const prop of props) {
    if (source[prop] !== undefined) {
      target[prop] = source[prop];
    }
  }
}
