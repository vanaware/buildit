import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { carregarConfigWatch, CONFIGURACOES_PADRAO_WATCH } from "../../src/watch/config.ts";

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
