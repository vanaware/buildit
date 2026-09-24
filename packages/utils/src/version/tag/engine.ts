/**
 * @module @vanaware/buildit/version/tag/engine
 * @description Motor de criação e publicação automatizada de tags git baseado na versão do deno.json[c].
 */

import {
  extractRawVersion,
  findDenoFile,
  sanitizeVersion,
} from "../../tools/version.ts";
import { sanitizeVersionFile } from "../sanitize/engine.ts";
import type {
  TagVersionOptions,
  TagVersionResult,
} from "../../tools/interfaces.ts";

/**
 * Executa um comando git capturando stdout, stderr e código de saída.
 */
async function runGit(
  args: string[],
  cwd?: string,
): Promise<{ success: boolean; code: number; stdout: string; stderr: string }> {
  try {
    const cmd = new Deno.Command("git", {
      args,
      cwd,
      stdout: "piped",
      stderr: "piped",
    });
    const output = await cmd.output();
    const decoder = new TextDecoder();
    return {
      success: output.success,
      code: output.code,
      stdout: decoder.decode(output.stdout).trim(),
      stderr: decoder.decode(output.stderr).trim(),
    };
  } catch (error) {
    return {
      success: false,
      code: 1,
      stdout: "",
      stderr: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Cria e publica uma tag git baseada na versão do deno.json[c] (vMAJOR.MINOR).
 *
 * @param options Opções de configuração da tag
 * @returns Resultado da operação
 *
 * @example
 * ```typescript
 * const res = await tagVersionEngine({ sanitize: true });
 * console.log(res.tagName); // "v0.3"
 * ```
 */
export async function tagVersionEngine(
  options: TagVersionOptions = {},
): Promise<TagVersionResult> {
  const baseDir = options.baseDir ?? ".";
  const dryRun = options.dryRun ?? false;
  const silencioso = options.silencioso ?? false;

  let targetFile = options.file;
  if (!targetFile) {
    const found = findDenoFile(baseDir);
    if (!found) {
      throw new Error(`❌ deno.json[c] não encontrado a partir de ${baseDir}`);
    }
    targetFile = found;
  }

  // Sanitiza em disco se solicitado
  if (options.sanitize) {
    if (!silencioso) {
      console.log(`🧼 Sanitizando ${targetFile} antes do commit...`);
    }
    await sanitizeVersionFile({
      filePath: targetFile,
      baseDir,
      silencioso,
    });
  }

  // Extrai e sanitiza versão em memória
  const fileContent = await Deno.readTextFile(targetFile);
  const rawVersion = extractRawVersion(fileContent);
  if (!rawVersion) {
    throw new Error(`❌ Campo "version" ausente em ${targetFile}`);
  }

  const sanitizedVersion = sanitizeVersion(rawVersion);
  const [major = "0", minor = "0"] = sanitizedVersion.split(".");
  const tagName = `v${major}.${minor}`;
  const message = options.message || `Versão ${tagName}`;

  if (!silencioso) {
    console.log("============================================================");
    console.log("🚀 INICIANDO TAG VERSION BUMP");
    console.log("============================================================");
    console.log(`📌 Versão original:    ${rawVersion}`);
    console.log(`🧼 Versão sanitizada:  ${sanitizedVersion}`);
    console.log(`🏷️  Tag alvo:           ${tagName}`);
    console.log(`📝 Mensagem de commit: ${message}`);
    if (dryRun) {
      console.log("🔍 MODO DRY-RUN: Nenhuma alteração git será persistida.");
    }
    console.log("============================================================");
  }

  // Sanidade: repositório git?
  const isGit = await runGit(["rev-parse", "--is-inside-work-tree"], baseDir);
  if (!isGit.success) {
    if (dryRun) {
      if (!silencioso) {
        console.warn("⚠️ Aviso: Diretório não é um repositório git ativo (dry-run prossegue).");
      }
      return {
        tagName,
        rawVersion,
        sanitizedVersion,
        message,
        committed: false,
        tagged: false,
      };
    }
    throw new Error("❌ Não está dentro de um repositório git.");
  }

  if (dryRun) {
    if (!silencioso) {
      console.log(`\n📦 [Dry-Run] 1/3 - Simularia git add -A, commit e push`);
      console.log(`🧹 [Dry-Run] 2/3 - Simularia limpeza de tag antiga (${tagName})`);
      console.log(`🏷️  [Dry-Run] 3/3 - Simularia criação e push de ${tagName}`);
      console.log("\n✅ [Dry-Run] Concluído com sucesso.");
      console.log("============================================================");
    }
    return {
      tagName,
      rawVersion,
      sanitizedVersion,
      message,
      committed: false,
      tagged: false,
    };
  }

  // 1/3 - Empacotando e enviando código fonte
  if (!silencioso) {
    console.log("\n📦 1/3 - Empacotando e enviando código fonte...");
  }
  await runGit(["add", "-A"], baseDir);

  const diffCached = await runGit(["diff", "--cached", "--quiet"], baseDir);
  let committed = false;
  if (diffCached.code !== 0) {
    const commitResult = await runGit(["commit", "-m", message], baseDir);
    if (!commitResult.success) {
      throw new Error(`❌ Falha no commit git: ${commitResult.stderr}`);
    }
    committed = true;
  } else {
    if (!silencioso) {
      console.log("ℹ️  Nada para comitar.");
    }
  }

  const pushResult = await runGit(["push"], baseDir);
  if (!pushResult.success && !silencioso) {
    console.warn(`⚠️ Aviso no push do código (pode não haver remote configurado): ${pushResult.stderr}`);
  }

  // 2/3 - Limpando tag antiga
  if (!silencioso) {
    console.log(`\n🧹 2/3 - Limpando tag antiga (${tagName})...`);
  }
  await runGit(["push", "origin", "--delete", tagName], baseDir);
  await runGit(["tag", "-d", tagName], baseDir);

  // 3/3 - Publicando nova tag
  if (!silencioso) {
    console.log("\n🏷️  3/3 - Publicando nova tag...");
  }
  const tagCreate = await runGit(["tag", "-a", "-m", `Versão ${tagName}`, tagName], baseDir);
  if (!tagCreate.success) {
    throw new Error(`❌ Falha ao criar tag git: ${tagCreate.stderr}`);
  }

  const tagPush = await runGit(["push", "--force", "origin", tagName], baseDir);
  if (!tagPush.success && !silencioso) {
    console.warn(`⚠️ Aviso no push da tag origin ${tagName}: ${tagPush.stderr}`);
  }

  if (!silencioso) {
    console.log("\n✅ NOVA TAG ADICIONADA COM SUCESSO!");
    console.log("Acompanhe o andamento na aba Actions do seu repositório.");
    console.log("============================================================");
  }

  return {
    tagName,
    rawVersion,
    sanitizedVersion,
    message,
    committed,
    tagged: true,
  };
}
