/**
 * @module @vanaware/buildit/docgen/engine
 * @description Core logic for the Documentation Engine.
 */

import { doc, } from "@deno/doc";
import { parse, } from "@std/jsonc";
import { walk, } from "@std/fs";
import {
  join,
  relative,
  toFileUrl,
  fromFileUrl,
  dirname,
  resolve,
} from "@std/path";
import type {
  DocgenOptions,
  DocgenResult,
  Logger,
  SymbolIndex,
  SymbolIndexEntry,
  DocsifyOptions,
} from "./types.ts";
import type { DocNode, } from "@deno/doc";
import {
  generateModuleMarkdown,
  generateSidebar,
} from "./markdown.ts";
import {
  generateApiSurface,
  generateCoverageReport,
} from "./reports.ts";

/**
 * Default logger that does nothing.
 */
const DEFAULT_LOGGER: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  verbose: () => {},
};

/**
 * Executes the documentation generation process.
 *
 * @param options Documentation generation options
 * @returns Result of the generation process
 */
export async function runDocgen(
  options: DocgenOptions,
): Promise<DocgenResult> {
  const logger = options.logger ?? DEFAULT_LOGGER;
  const baseDir = options.baseDir ?? Deno.cwd();
  const configPath = options.configPath
    ? resolve(baseDir, options.configPath,)
    : resolve(baseDir, "deno.jsonc",);
  const outDir = resolve(baseDir, options.outDir,);

  logger.info(`🚀 Starting documentation generation to: ${outDir}`,);

  const stats: DocgenResult["stats"] = {
    filesScanned: 0,
    filesInternal: 0,
    nodesTotal: 0,
    nodesKept: 0,
    nodesDroppedExternal: 0,
    nodesDroppedInternal: 0,
    nodesDroppedNoDoc: 0,
    coverage: {
      symbolsTotal: 0,
      symbolsDocumented: 0,
      percentage: 0,
    },
    crossLinks: {
      linksResolved: 0,
      linksFailed: 0,
    },
  };
  const warnings: string[] = [];

  // 1. Read deno.jsonc and discover workspace
  let config: any = {};
  try {
    const configContent = await Deno.readTextFile(configPath,);
    config = parse(configContent,);
  } catch (err) {
    throw new Error(`Failed to read/parse config at ${configPath}: ${err instanceof Error ? err.message : err}`,);
  }

  const workspaceMembers: string[] = config.workspace ?? ["./"];
  const internalFiles = new Set<string>();

  for (const member of workspaceMembers) {
    const memberPath = resolve(dirname(configPath,), member,);
    for await (
      const entry of walk(memberPath, {
        includeDirs: false,
        exts: [".ts", ".tsx"],
        skip: [
          /node_modules/,
          /\.git/,
          /dist/,
          /build/,
          /coverage/,
          /vendor/,
          /\.deno/,
          new RegExp(relative(baseDir, outDir,),),
        ],
      },)
    ) {
      internalFiles.add(toFileUrl(entry.path,).href,);
    }
  }

  stats.filesInternal = internalFiles.size;
  logger.verbose(`Found ${stats.filesInternal} internal files to scan.`,);

  // 2. Extraction via @deno/doc
  let docNodes: Record<string, DocNode[]>;

  try {
    // Try to use Deno CLI for extraction as it handles workspaces and imports perfectly
    const cmd = new Deno.Command("deno", {
      args: ["doc", "--json", ...Array.from(internalFiles)],
    });
    const { stdout, stderr, success } = await cmd.output();
    if (!success) {
      const error = new TextDecoder().decode(stderr);
      throw new Error(`Deno doc CLI failed: ${error}`);
    }
    const json = new TextDecoder().decode(stdout);
    const data = JSON.parse(json);
    
    // Group nodes by file
    docNodes = {};
    
    if (data.version === 2) {
      // Handle Deno 2.x v2 format
      for (const [fileUrl, modData] of Object.entries(data.nodes) as [string, any][]) {
        if (!docNodes[fileUrl]) docNodes[fileUrl] = [];
        
        if (modData.module_doc) {
          docNodes[fileUrl].push({
            kind: "moduleDoc" as any,
            name: "",
            location: { filename: fileUrl, line: 1, col: 1, byteIndex: 0 },
            declarationKind: "private",
            jsDoc: modData.module_doc,
          } as any);
        }
        
        if (modData.symbols) {
          for (const sym of modData.symbols) {
            for (const dec of sym.declarations) {
              docNodes[fileUrl].push({
                name: sym.name,
                ...dec,
              } as any);
            }
          }
        }
      }
    } else {
      // Handle v1 format (array of nodes)
      const nodes = Array.isArray(data) ? data : (data.nodes ? Object.values(data.nodes).flat() : []);
      for (const node of nodes as DocNode[]) {
        const file = node.location.filename;
        if (!docNodes[file]) docNodes[file] = [];
        docNodes[file].push(node);
      }
    }
  } catch (err) {
    logger.warn(`Failed to extract docs via Deno CLI: ${err instanceof Error ? err.message : err}. Falling back to library...`,);
    
    // Original library fallback
    const rootImports = config.imports ?? {};
    try {
      docNodes = await doc(Array.from(internalFiles,), {
        includeAll: false,
        load: async (specifier,) => {
          if (specifier.startsWith("file://",)) {
            try {
              const content = await Deno.readTextFile(fromFileUrl(specifier,),);
              return { kind: "module", specifier, content };
            } catch { return undefined; }
          }
          return { kind: "external", specifier };
        },
        resolve: (specifier, referrer,) => {
          if (specifier.startsWith(".",) || specifier.startsWith("/",)) {
            return new URL(specifier, referrer,).href;
          }
          if (specifier.startsWith("jsr:",) || specifier.startsWith("npm:",) || specifier.startsWith("https:",)) {
            return specifier;
          }
          if (rootImports[specifier]) return rootImports[specifier];
          if (specifier.startsWith("@std/",)) return `jsr:${specifier}`;
          return specifier;
        },
      },);
    } catch (innerErr) {
      throw new Error(`Failed to extract docs via @deno/doc library: ${innerErr instanceof Error ? innerErr.message : innerErr}`,);
    }
  }

  // 3. Filtering and Indexing
  const keptNodesByFile = new Map<string, DocNode[]>();
  const symbolIndex: SymbolIndex = {
    byName: new Map(),
    byFile: new Map(),
  };

  for (const [fileUrl, nodes] of Object.entries(docNodes,)) {
    stats.nodesTotal += nodes.length;

    // Check if file is internal
    if (!internalFiles.has(fileUrl,)) {
      stats.nodesDroppedExternal += nodes.length;
      continue;
    }

    const keptNodes: DocNode[] = [];
    for (const node of nodes) {
      // 1. Must be exported
      if (node.declarationKind !== "export") {
        stats.nodesDroppedInternal++;
        continue;
      }

      // 2. Check for @internal or @ignore if includePrivate is false
      const jsDoc = node.jsDoc;
      const tags = jsDoc?.tags ?? [];
      const isInternal = tags.some((t) =>
        (t.kind === "unsupported" && (t as any).value === "internal") ||
        (t.kind === "unsupported" && (t as any).value === "ignore")
      );

      if (isInternal && !options.includePrivate) {
        stats.nodesDroppedInternal++;
        continue;
      }

      // 3. Check for documentation (for coverage stats)
      if (!jsDoc?.doc) {
        stats.nodesDroppedNoDoc++;
      } else {
        stats.coverage.symbolsDocumented++;
      }
      stats.coverage.symbolsTotal++;

      keptNodes.push(node,);
      stats.nodesKept++;

      // Populate index
      const relativePath = relative(baseDir, fromFileUrl(fileUrl),).replace(
        /\\/g,
        "/",
      );
      // Slugify filename for the URL
      const slug = relativePath.replace(/\.(ts|tsx)$/, "").replace(/\//g, "-");
      const url = `api/${slug}.md`;
      const anchor = node.name.toLowerCase();

      const entry: SymbolIndexEntry = {
        name: node.name,
        url,
        anchor,
        kind: node.kind,
        fileName: relativePath,
      };

      // Handle name collisions if necessary (simplified for now)
      symbolIndex.byName.set(node.name, entry,);

      if (!symbolIndex.byFile.has(fileUrl,)) {
        symbolIndex.byFile.set(fileUrl, [],);
      }
      symbolIndex.byFile.get(fileUrl,)!.push(entry,);
    }

    if (keptNodes.length > 0) {
      keptNodesByFile.set(fileUrl, keptNodes,);
    }
  }

  // Calculate coverage percentage
  if (stats.coverage.symbolsTotal > 0) {
    stats.coverage.percentage = Math.round(
      (stats.coverage.symbolsDocumented / stats.coverage.symbolsTotal) * 100,
    );
  }

  // 4. Artifact Generation
  const generated: DocgenResult["generated"] = [];

  const ensureDir = async (path: string) => {
    try {
      await Deno.mkdir(path, { recursive: true });
    } catch (err) {
      if (!(err instanceof Deno.errors.AlreadyExists)) throw err;
    }
  };

  await ensureDir(outDir);
  await ensureDir(join(outDir, "api"));

  // A) api/*.md
  for (const [fileUrl, nodes] of keptNodesByFile.entries()) {
    const fileEntries = symbolIndex.byFile.get(fileUrl);
    if (!fileEntries) continue;
    const slug = fileEntries[0]?.fileName.replace(/\.(ts|tsx)$/, "").replace(/\//g, "-");
    const content = generateModuleMarkdown(fileUrl, nodes, symbolIndex, options);
    const path = join(outDir, "api", `${slug}.md`);
    await Deno.writeTextFile(path, content);
    generated.push({
      path: relative(baseDir, path).replace(/\\/g, "/"),
      kind: "api",
      bytes: new TextEncoder().encode(content).length,
    });
  }

  // B) README.md
  // Simplified: Use root README if exists, or generate one
  let readmeContent = `# ${config.name ?? "Project Documentation"}\n\n`;
  if (config.version) readmeContent += `Version: ${config.version}\n\n`;
  readmeContent += `See the [API Index](api/index.md) for details.\n`;
  
  const readmePath = join(outDir, "README.md");
  await Deno.writeTextFile(readmePath, readmeContent);
  generated.push({
    path: relative(baseDir, readmePath).replace(/\\/g, "/"),
    kind: "readme",
    bytes: new TextEncoder().encode(readmeContent).length,
  });

  // C) _sidebar.md
  if (options.includeSidebar !== false) {
    const sidebarContent = generateSidebar(symbolIndex, options);
    const sidebarPath = join(outDir, "_sidebar.md");
    await Deno.writeTextFile(sidebarPath, sidebarContent);
    generated.push({
      path: relative(baseDir, sidebarPath).replace(/\\/g, "/"),
      kind: "sidebar",
      bytes: new TextEncoder().encode(sidebarContent).length,
    });
  }

  // 5. Reports (P0.2, P0.3)
  if (options.reports?.apiSurface !== false) {
    const apiSurfaceContent = await generateApiSurface(symbolIndex, config.name ?? "unnamed", config.version ?? "0.0.0");
    const apiSurfacePath = join(outDir, "_api-surface.md");
    await Deno.writeTextFile(apiSurfacePath, apiSurfaceContent);
    generated.push({
      path: relative(baseDir, apiSurfacePath).replace(/\\/g, "/"),
      kind: "api-surface",
      bytes: new TextEncoder().encode(apiSurfaceContent).length,
    });
  }

  if (options.reports?.coverage !== false) {
    const coverageContent = generateCoverageReport(stats, symbolIndex, keptNodesByFile);
    const coveragePath = join(outDir, "_coverage.md");
    await Deno.writeTextFile(coveragePath, coverageContent);
    generated.push({
      path: relative(baseDir, coveragePath).replace(/\\/g, "/"),
      kind: "coverage",
      bytes: new TextEncoder().encode(coverageContent).length,
    });

    // P0.3 Check threshold
    if (options.checkThreshold && stats.coverage.percentage < options.checkThreshold) {
      throw new Error(`Documentation coverage (${stats.coverage.percentage}%) is below threshold (${options.checkThreshold}%)`,);
    }
  }

  // 6. Docsify (Opt-in)
  if (options.docsify?.enabled) {
    const htmlContent = generateDocsifyHtml(options.docsify);
    const htmlPath = join(outDir, "index.html");
    await Deno.writeTextFile(htmlPath, htmlContent);
    generated.push({
      path: relative(baseDir, htmlPath).replace(/\\/g, "/"),
      kind: "docsify-html",
      bytes: new TextEncoder().encode(htmlContent).length,
    });

    // .nojekyll
    const nojekyllPath = join(outDir, ".nojekyll");
    await Deno.writeTextFile(nojekyllPath, "");
    generated.push({
      path: relative(baseDir, nojekyllPath).replace(/\\/g, "/"),
      kind: "docsify-asset",
      bytes: 0,
    });
  }

  return {
    generated,
    stats,
    warnings,
  };
}

/**
 * Generates the Docsify index.html content.
 */
function generateDocsifyHtml(options: DocsifyOptions): string {
  const theme = options.theme ?? "vue";
  const name = options.name ?? options.title;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${options.title}</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
  <meta name="description" content="${options.description ?? ""}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/${theme}.css">
</head>
<body>
  <div id="app"></div>
  <script>
    window.$docsify = {
      name: '${name}',
      repo: '${options.repo?.url ?? ""}',
      loadSidebar: true,
      subMaxLevel: 3,
      auto2top: true,
      search: ${options.search !== false ? "true" : "false"},
      pagination: ${options.pagination !== false ? "{ previousText: 'Previous', nextText: 'Next', crossChapter: true }" : "false"},
      copyCode: ${options.copyCode !== false ? "{ buttonText: 'Copy', errorText: 'Error', successText: 'Copied' }" : "false"}
    }
  </script>
  <!-- Docsify v4 -->
  <script src="//cdn.jsdelivr.net/npm/docsify@4"></script>
  ${options.search !== false ? '<script src="//cdn.jsdelivr.net/npm/docsify@4/lib/plugins/search.min.js"></script>' : ""}
  ${options.pagination !== false ? '<script src="//cdn.jsdelivr.net/npm/docsify-pagination@2/dist/docsify-pagination.min.js"></script>' : ""}
  ${options.copyCode !== false ? '<script src="//cdn.jsdelivr.net/npm/docsify-copy-code@2"></script>' : ""}
</body>
</html>`;
}
