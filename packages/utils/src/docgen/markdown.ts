/**
 * @module @vanaware/buildit/docgen/markdown
 * @description Markdown generation logic for the Documentation Engine.
 */

import type {
  DocNode,
  DocNodeKind,
  TsTypeDef,
} from "@deno/doc";
import type {
  DocgenOptions,
  SymbolIndex,
  SymbolIndexEntry,
} from "./types.ts";

/**
 * Generates the Markdown content for a module.
 */
export function generateModuleMarkdown(
  fileUrl: string,
  nodes: DocNode[],
  index: SymbolIndex,
  options: DocgenOptions,
): string {
  const fileName = nodes[0]?.location.filename ?? "Unknown";
  const moduleDoc = nodes.find(n => n.kind === "moduleDoc")?.jsDoc?.doc ?? "";

  let md = `---
title: ${fileName}
---

# ${fileName}

${moduleDoc}

## Index
`;

  const categories: Record<string, DocNode[]> = {
    "Classes": [],
    "Interfaces": [],
    "Functions": [],
    "Types": [],
    "Constants": [],
    "Enums": [],
  };

  for (const node of nodes) {
    if (node.kind === "class") categories["Classes"]?.push(node);
    else if (node.kind === "interface") categories["Interfaces"]?.push(node);
    else if (node.kind === "function") categories["Functions"]?.push(node);
    else if (node.kind === "typeAlias") categories["Types"]?.push(node);
    else if (node.kind === "variable") categories["Constants"]?.push(node);
    else if (node.kind === "enum") categories["Enums"]?.push(node);
  }

  // TOC
  for (const [name, list] of Object.entries(categories)) {
    if (list.length > 0) {
      md += `- [${name}](#${name.toLowerCase()})\n`;
    }
  }

  md += "\n";

  // Content
  for (const [category, list] of Object.entries(categories)) {
    if (list.length === 0) continue;

    md += `## ${category}\n\n`;

    // Sort alphabetically
    list.sort((a, b) => a.name.localeCompare(b.name));

    for (const node of list) {
      md += renderNode(node, index, options);
    }
  }

  return md;
}

/**
 * Renders a TypeScript type with cross-links.
 */
export function renderType(type: TsTypeDef | undefined, index: SymbolIndex): string {
  if (!type) return "any";

  switch (type.kind) {
    case "keyword":
      return `\`${type.keyword}\``;
    case "typeRef": {
      const name = type.typeRef.typeName;
      const entry = index.byName.get(name);
      const text = entry ? `[\`${name}\`](#/${entry.url}?id=${entry.anchor})` : `\`${name}\``;
      if (type.typeRef.typeParams && type.typeRef.typeParams.length > 0) {
        return `${text}&lt;${type.typeRef.typeParams.map((t) => renderType(t, index)).join(", ")}&gt;`;
      }
      return text;
    }
    case "union":
      return type.union.map((t) => renderType(t, index)).join(" | ");
    case "intersection":
      return type.intersection.map((t) => renderType(t, index)).join(" & ");
    case "array":
      return `${renderType(type.array, index)}[]`;
    case "fnOrConstructor":
      return `\`${type.repr}\``;
    case "typeOperator":
      return `\`${type.typeOperator.operator}\` ${renderType(type.typeOperator.tsType, index)}`;
    default:
      return `\`${(type as any).repr || "any"}\``;
  }
}

/**
 * Processes JSDoc text to replace {@link Symbol} with cross-links.
 */
export function processJsDoc(text: string | undefined, index: SymbolIndex): string {
  if (!text) return "";

  // Replace {@link Symbol}
  return text.replace(/\{@link\s+([^}]+)\}/g, (match, symbol) => {
    const entry = index.byName.get(symbol.trim());
    if (entry) {
      return `[\`${symbol.trim()}\`](#/${entry.url}?id=${entry.anchor})`;
    }
    return `\`${symbol.trim()}\``;
  });
}

/**
 * Renders a single DocNode to Markdown.
 */
function renderNode(
  node: DocNode,
  index: SymbolIndex,
  options: DocgenOptions,
): string {
  let md = `### \`${node.name}\`\n\n`;

  const jsDoc = node.jsDoc;
  if (jsDoc?.doc) {
    const lines = jsDoc.doc.split("\n");
    md += `> ${processJsDoc(lines[0], index)}\n\n`;
    if (lines.length > 1) {
      md += `${processJsDoc(lines.slice(1).join("\n"), index)}\n\n`;
    }
  } else {
    md += `> ⚠️ No documentation.\n\n`;
  }

  if (node.kind === "function" && node.functionDef) {
    const paramsText = node.functionDef.params.map(p => {
      if (p.kind === "identifier") return p.name + (p.optional ? "?" : "");
      return "arg";
    }).join(", ");
    md += `**Signature:**\n\n\`\`\`ts\n${node.name}(${paramsText})\n\`\`\`\n\n`;
    
    if (node.functionDef.params.length > 0) {
      md += `**Parameters:**\n\n| Name | Type | Description |\n|------|------|-------------|\n`;
      for (const p of node.functionDef.params) {
        if (p.kind === "identifier") {
          const pTag = jsDoc?.tags?.find(t => (t as any).name === p.name);
          md += `| ${p.name}${p.optional ? "?" : ""} | ${renderType(p.tsType, index)} | ${processJsDoc((pTag as any)?.doc, index)} |\n`;
        }
      }
      md += "\n";
    }

    if (node.functionDef.returnType) {
      const rTag = jsDoc?.tags?.find(t => t.kind === "return");
      md += `**Returns:** ${renderType(node.functionDef.returnType, index)}${(rTag as any)?.doc ? ` — ${processJsDoc((rTag as any).doc, index)}` : ""}\n\n`;
    }
  }

  // TODO: Add support for classes, interfaces, etc.

  // @example
  if (options.includeExamples !== false) {
    const examples = jsDoc?.tags?.filter(t => t.kind === "example") ?? [];
    for (const ex of examples) {
      md += `**Example:**\n\n\`\`\`ts\n${(ex as any).doc}\n\`\`\`\n\n`;
    }
  }

  return md;
}

/**
 * Generates the global sidebar for Docsify.
 */
export function generateSidebar(
  index: SymbolIndex,
  options: DocgenOptions,
): string {
  let md = `- [Home](README.md)\n`;
  
  // Group by file
  for (const [fileUrl, entries] of index.byFile.entries()) {
    const fileName = entries[0]?.fileName ?? "Unknown";
    const slug = fileName.replace(/\.(ts|tsx)$/, "").replace(/\//g, "-");
    md += `- [${fileName}](api/${slug}.md)\n`;
    
    // Sort entries by kind and then name
    entries.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind.localeCompare(b.kind);
      return a.name.localeCompare(b.name);
    });

    for (const entry of entries) {
      md += `  - [${getEmoji(entry.kind)} ${entry.name}](api/${slug}.md#${entry.anchor})\n`;
    }
  }

  return md;
}

function getEmoji(kind: DocNodeKind): string {
  switch (kind) {
    case "function": return "🔧";
    case "class": return "🏛️";
    case "interface": return "📐";
    case "typeAlias": return "📐";
    case "variable": return "🔢";
    case "enum": return "🔢";
    default: return "📄";
  }
}
