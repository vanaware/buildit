import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertNotEquals, } from "@std/assert";
import { loadConfig, } from "../../src/tools/jsonc.ts";
import { join, } from "@std/path";

describe("loadConfig - Prioridades de busca", () => {
  it("deve carregar o arquivo explicitPath se fornecido", async () => {
    const tempFile = await Deno.makeTempFile({ suffix: ".json", },);
    await Deno.writeTextFile(tempFile, JSON.stringify({ explicit: true, },),);

    try {
      const config = await loadConfig<{ explicit: boolean }>("test", tempFile,);
      assertEquals(config?.explicit, true,);
    } finally {
      await Deno.remove(tempFile,);
    }
  });

  it("deve cair para o baseDir se o scriptDir não possuir o arquivo", async () => {
    const tempDir = await Deno.makeTempDir();
    const configPath = join(tempDir, "test.jsonc",);
    await Deno.writeTextFile(configPath, JSON.stringify({ baseDir: true, },),);

    try {
      // Como não podemos mudar facilmente o Deno.mainModule em runtime de teste,
      // verificamos apenas se ele encontra no baseDir passado.
      const config = await loadConfig<{ baseDir: boolean }>(
        "test",
        undefined,
        tempDir,
      );
      assertEquals(config?.baseDir, true,);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("deve retornar null se nenhum arquivo for encontrado", async () => {
    const config = await loadConfig(
      "inexistente",
      undefined,
      "/tmp/pasta-fantasma",
    );
    assertEquals(config, null,);
  });
});
