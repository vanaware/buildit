/**
 * @module @vanaware/buildit/version/sanitize/engine
 * @description Motor de sanitização de versão semântica em arquivos deno.json e deno.jsonc.
 */

import {
  extractRawVersion,
  findDenoFile,
  replaceVersionInContent,
  sanitizeVersion,
} from "../../tools/version.ts";
import type {
  SanitizeVersionOptions,
  SanitizeVersionResult,
} from "../../tools/interfaces.ts";

/**
 * Normaliza o campo "version" de um arquivo deno.json[c] para o formato semver estrito (MAJOR.MINOR.PATCH).
 * Se o campo "version" não existir, injeta `"version": "0.0.0"` no início do arquivo.
 *
 * @param options Opções de execução da sanitização
 * @returns Objeto com o resultado da sanitização
 *
 * @example
 * ```typescript
 * const result = await sanitizeVersionFile({ filePath: "deno.jsonc" });
 * console.log(result.sanitizedVersion); // "0.3.14"
 * ```
 */
export async function sanitizeVersionFile(
  options: SanitizeVersionOptions = {},
): Promise<SanitizeVersionResult> {
  const baseDir = options.baseDir ?? ".";
  let targetPath = options.filePath;

  if (targetPath) {
    try {
      const stat = await Deno.stat(targetPath);
      if (!stat.isFile) {
        throw new Error(`❌ Erro: Arquivo '${targetPath}' não encontrado.`);
      }
    } catch {
      throw new Error(`❌ Erro: Arquivo '${targetPath}' não encontrado.`);
    }
  } else {
    const found = findDenoFile(baseDir);
    if (!found) {
      throw new Error(`❌ Erro: Nenhum deno.json[c] encontrado a partir de ${baseDir}`);
    }
    targetPath = found;
  }

  if (!options.silencioso) {
    console.log(`🔍 Buscando versão em: ${targetPath}`);
  }

  let content = await Deno.readTextFile(targetPath);
  let rawVersion = extractRawVersion(content);

  if (rawVersion === null) {
    if (!options.silencioso) {
      console.log(`⚠️  Nenhum campo 'version' encontrado. Inserindo "0.0.0"...`);
    }
    const braceIndex = content.indexOf("{");
    if (braceIndex === -1) {
      throw new Error(`❌ Arquivo ${targetPath} não contém JSON/JSONC válido.`);
    }
    content = content.slice(0, braceIndex + 1) + '\n  "version": "0.0.0",' + content.slice(braceIndex + 1);
    rawVersion = "0.0.0";
    await Deno.writeTextFile(targetPath, content);
  }

  if (!options.silencioso) {
    console.log(`📌 Versão original: ${rawVersion}`);
  }

  const sanitizedVersion = sanitizeVersion(rawVersion);
  if (!options.silencioso) {
    console.log(`✅ Versão sanitizada: ${sanitizedVersion}`);
  }

  let updated = false;
  if (rawVersion !== sanitizedVersion) {
    const updatedContent = replaceVersionInContent(content, sanitizedVersion);
    await Deno.writeTextFile(targetPath, updatedContent);
    updated = true;
    if (!options.silencioso) {
      console.log(`📝 Arquivo atualizado: ${rawVersion} → ${sanitizedVersion}`);
    }
  } else {
    if (!options.silencioso) {
      console.log(`✨ Já estava no formato semver correto.`);
    }
  }

  return {
    filePath: targetPath,
    rawVersion,
    sanitizedVersion,
    updated,
  };
}
