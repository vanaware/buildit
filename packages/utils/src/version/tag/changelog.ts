/**
 * @module @vanaware/buildit/version/tag/changelog
 * @description Utilitários para geração automatizada de changelog baseada em commits git.
 */

import { join, } from "@std/path";
import { runGit, } from "../../tools/git.ts";

/**
 * Obtém a última tag git disponível, opcionalmente limpando o prefixo 'v'.
 */
export async function getLastTag(baseDir?: string,): Promise<string | null> {
  // Tenta fetch tags primeiro (ignora falhas se não houver remote)
  await runGit(["fetch", "--tags", "--quiet",], baseDir,);

  // Tenta obter tags ordenadas pela data de criação
  let result = await runGit([
    "tag",
    "--sort=-creatordate",
  ], baseDir,);

  // Fallback para listagem simples caso a ordenação falhe (git antigo)
  if (!result.success || !result.stdout) {
    result = await runGit(["tag",], baseDir,);
  }

  if (!result.success || !result.stdout) {
    return null;
  }

  const tags = result.stdout.split("\n",).filter(Boolean,);
  // No caso de fallback, pega a última tag alfabética (geralmente v0.2 > v0.1)
  return tags[0] || null;
}

/**
 * Gera o conteúdo do changelog para a nova versão baseando-se nos commits desde a última tag.
 *
 * @param tagName Nome da nova tag (ex: "v0.4")
 * @param baseDir Diretório base do repositório
 * @returns Bloco de markdown com as mudanças
 */
export async function generateChangelogContent(
  tagName: string,
  baseDir?: string,
): Promise<string> {
  const lastTag = await getLastTag(baseDir,);
  const range = lastTag ? `${lastTag}..HEAD` : "HEAD";

  const logResult = await runGit([
    "log",
    "--pretty=format:%h %s",
    range,
  ], baseDir,);

  if (!logResult.success) {
    throw new Error(`❌ Falha ao obter git log: ${logResult.stderr}`,);
  }

  const date = new Date().toISOString().slice(0, 10,);
  const logs = logResult.stdout.trim();
  
  const formattedLogs = logs
    ? logs.split("\n",).map((line,) => `- ${line}`).join("\n",)
    : "- Sem alterações relevantes";

  return `## ${tagName} (${date})\n\n${formattedLogs}\n`;
}

/**
 * Atualiza o arquivo CHANGELOG.md prepandendo as novas alterações.
 */
export async function updateChangelogFile(
  content: string,
  baseDir: string = ".",
): Promise<void> {
  const filePath = join(baseDir, "CHANGELOG.md",);
  let existing = "";
  try {
    existing = await Deno.readTextFile(filePath,);
  } catch {
    // Arquivo não existe, será criado
  }

  await Deno.writeTextFile(filePath, `${content}\n${existing}`,);
}

/**
 * Atualiza a seção de últimas atualizações no README.md.
 */
export async function updateReadmeChangelog(
  content: string,
  baseDir: string = ".",
): Promise<void> {
  const filePath = join(baseDir, "README.md",);
  let readme = "";
  try {
    readme = await Deno.readTextFile(filePath,);
  } catch {
    return; // Sem README, nada a fazer
  }

  const summary = content
    .split("\n",)
    .slice(0, 6,)
    .join("\n",)
    .replace(/^## v\d+\.\d+.*$/m, "### 📦 Últimas atualizações",);

  const markerStart = "<!-- START:changelog -->";
  const markerEnd = "<!-- END:changelog -->";
  const changelogSection = `${markerStart}\n${summary}\n${markerEnd}`;

  if (readme.includes(markerStart,) && readme.includes(markerEnd,)) {
    const regex = new RegExp(`${markerStart}[\\s\\S]*${markerEnd}`, "m",);
    readme = readme.replace(regex, changelogSection,);
  } else {
    readme += `\n\n## 📦 Últimas Atualizações\n\n${changelogSection}\n`;
  }

  await Deno.writeTextFile(filePath, readme,);
}
