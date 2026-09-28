/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes, } from "@std/assert";
import { join, } from "@std/path";
import {
  generateChangelogContent,
  updateChangelogFile,
  updateReadmeChangelog,
} from "../../src/version/tag/changelog.ts";
import { runGit, } from "../../src/tools/git.ts";

describe("changelog utility", () => {
  it("deve gerar conteúdo de changelog a partir de um repositório git", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      // Inicializa repo git
      await runGit(["init",], tempDir,);
      await runGit(["config", "user.email", "test@example.com",], tempDir,);
      await runGit(["config", "user.name", "Test User",], tempDir,);
      await runGit(["config", "commit.gpgsign", "false",], tempDir,);

      // Primeiro commit e tag
      await Deno.writeTextFile(join(tempDir, "file1.txt",), "content 1",);
      await runGit(["add", ".",], tempDir,);
      const c1 = await runGit(["commit", "-m", "feat: initial commit",], tempDir,);
      if (!c1.success) console.warn("Commit 1 failed:", c1.stderr);
      
      const t1 = await runGit(["tag", "v0.1",], tempDir,);
      if (!t1.success) console.warn("Tag 1 failed:", t1.stderr);

      // Segundo commit (será o log da nova versão)
      await Deno.writeTextFile(join(tempDir, "file2.txt",), "content 2",);
      await runGit(["add", ".",], tempDir,);
      const c2 = await runGit(["commit", "-m", "fix: bug fixed",], tempDir,);
      if (!c2.success) console.warn("Commit 2 failed:", c2.stderr);

      const content = await generateChangelogContent("v0.2", tempDir,);
      
      assertStringIncludes(content, "## v0.2",);
      assertStringIncludes(content, "fix: bug fixed",);
      // Não deve incluir o commit da tag v0.1 no range v0.1..HEAD
      assertEquals(content.includes("feat: initial commit",), false,);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("deve atualizar o arquivo CHANGELOG.md (prepend)", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const changelogPath = join(tempDir, "CHANGELOG.md",);
      await Deno.writeTextFile(changelogPath, "## v0.1\n- Initial",);

      await updateChangelogFile("## v0.2\n- New feature", tempDir,);

      const content = await Deno.readTextFile(changelogPath,);
      assertStringIncludes(content, "## v0.2",);
      assertStringIncludes(content, "## v0.1",);
      assertEquals(content.indexOf("## v0.2",), 0,);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("deve atualizar o README.md usando os marcadores", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const readmePath = join(tempDir, "README.md",);
      const initialReadme = `# Project\n\nSome text.\n\n<!-- START:changelog -->\nOld content\n<!-- END:changelog -->\nFooter`;
      await Deno.writeTextFile(readmePath, initialReadme,);

      await updateReadmeChangelog("## v0.2 (2024-01-01)\n- Line 1\n- Line 2", tempDir,);

      const content = await Deno.readTextFile(readmePath,);
      assertStringIncludes(content, "### 📦 Últimas atualizações",);
      assertStringIncludes(content, "- Line 1",);
      assertStringIncludes(content, "Footer",);
      assertEquals(content.includes("Old content",), false,);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });
});
