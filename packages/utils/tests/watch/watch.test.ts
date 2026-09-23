import { assertEquals, assertRejects } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { carregarConfigWatch, CONFIGURACOES_PADRAO_WATCH } from "../../src/watch/config.ts";
import { watchEngine } from "../../src/watch/engine.ts";
import type { WatchGlobalConfig } from "../../src/tools/interfaces.ts";

describe("carregarConfigWatch", () => {
  it("deve retornar configuração padrão quando arquivo não for encontrado", async () => {
    const result = await carregarConfigWatch("arquivo_inexistente.jsonc", "/tmp");
    assertEquals(result.targets, CONFIGURACOES_PADRAO_WATCH);
  });

  it("deve carregar configuração de watch válida de um arquivo temporário", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const configContent = JSON.stringify({
        targets: {
          app: {
            entryPoints: ["src/index.ts"],
            distdir: "dist",
            format: "esm",
            sourcemap: "inline",
          },
        },
      });
      const configPath = `${tempDir}/watch.jsonc`;
      await Deno.writeTextFile(configPath, configContent);

      const result = await carregarConfigWatch(configPath, tempDir);
      assertEquals(result.targets.app.entryPoints, ["src/index.ts"]);
      assertEquals(result.targets.app.format, "esm");
    } finally {
      await Deno.remove(tempDir, { recursive: true });
    }
  });
});

describe("watchEngine Restrições de Alvos e Lock", () => {
  it("deve rejeitar se múltiplos alvos forem passados", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const config: WatchGlobalConfig = {
        first: {
          default: true,
          entryPoints: ["main.ts"],
          srcdir: `${tempDir}/src`,
          distdir: `${tempDir}/dist`,
        },
        second: {
          default: true,
          entryPoints: ["other.ts"],
          srcdir: `${tempDir}/src`,
          distdir: `${tempDir}/dist`,
        },
      };

      await assertRejects(
        async () => {
          await watchEngine({
            config,
            targets: ["first", "second"],
            baseDir: tempDir,
            lockFile: `${tempDir}/.watch.lock`,
            silencioso: true,
          });
        },
        Error,
        "O modo watch suporta apenas 1 alvo por execução. Foram fornecidos 2: first, second.",
      );
    } finally {
      await Deno.remove(tempDir, { recursive: true });
    }
  });

  it("deve rejeitar se o alvo solicitado não existir", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const config: WatchGlobalConfig = {
        first: {
          default: true,
          entryPoints: ["main.ts"],
          srcdir: `${tempDir}/src`,
          distdir: `${tempDir}/dist`,
        },
      };

      await assertRejects(
        async () => {
          await watchEngine({
            config,
            targets: ["inexistente"],
            baseDir: tempDir,
            lockFile: `${tempDir}/.watch.lock`,
            silencioso: true,
          });
        },
        Error,
        "Alvo 'inexistente' não encontrado",
      );
    } finally {
      await Deno.remove(tempDir, { recursive: true });
    }
  });

  it("deve selecionar apenas o primeiro alvo quando nenhum literal é fornecido e há múltiplos default: true", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      await Deno.mkdir(`${tempDir}/src`, { recursive: true });
      await Deno.writeTextFile(`${tempDir}/src/main.ts`, "console.log('main');");
      await Deno.writeTextFile(`${tempDir}/src/other.ts`, "console.log('other');");
      await Deno.writeTextFile(`${tempDir}/deno.jsonc`, JSON.stringify({ version: "0.1.0" }));

      const config: WatchGlobalConfig = {
        first: {
          default: true,
          entryPoints: ["main.ts"],
          srcdir: `${tempDir}/src`,
          distdir: `${tempDir}/dist`,
        },
        second: {
          default: true,
          entryPoints: ["other.ts"],
          srcdir: `${tempDir}/src`,
          distdir: `${tempDir}/dist`,
        },
      };

      const handles = await watchEngine({
        config,
        baseDir: tempDir,
        lockFile: `${tempDir}/.watch.lock`,
        silencioso: true,
      });

      assertEquals(handles.length, 1);
      assertEquals(handles[0].target, "first");

      // Encerra e limpa o lock
      await handles[0].close();
    } finally {
      await Deno.remove(tempDir, { recursive: true });
    }
  });

  it("deve impedir concorrência entre chamadas simultâneas via Lock", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      await Deno.mkdir(`${tempDir}/src`, { recursive: true });
      await Deno.writeTextFile(`${tempDir}/src/main.ts`, "console.log('main');");
      await Deno.writeTextFile(`${tempDir}/deno.jsonc`, JSON.stringify({ version: "0.1.0" }));

      const config: WatchGlobalConfig = {
        first: {
          default: true,
          entryPoints: ["main.ts"],
          srcdir: `${tempDir}/src`,
          distdir: `${tempDir}/dist`,
        },
      };

      const lockPath = `${tempDir}/.watch.lock`;
      const handles = await watchEngine({
        config,
        targets: ["first"],
        baseDir: tempDir,
        lockFile: lockPath,
        silencioso: true,
      });

      try {
        await assertRejects(
          async () => {
            await watchEngine({
              config,
              targets: ["first"],
              baseDir: tempDir,
              lockFile: lockPath,
              silencioso: true,
            });
          },
          Error,
          "Já existe uma instância do watch em execução",
        );
      } finally {
        await handles[0].close();
      }
    } finally {
      await Deno.remove(tempDir, { recursive: true });
    }
  });
});
