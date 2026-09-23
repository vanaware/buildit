import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { join } from "@std/path";
import { exportEngine } from "../../src/export/engine.ts";

describe("exportEngine programmatic API", () => {
  it("deve aceitar configuração diretamente como objeto em memória e ler versão do deno.jsonc", async () => {
    const tempDir = await Deno.makeTempDir();
    const srcDir = join(tempDir, "src");
    await Deno.mkdir(srcDir, { recursive: true });

    // Cria deno.jsonc com versão customizada do projeto
    const denoJsonc = join(tempDir, "deno.jsonc");
    await Deno.writeTextFile(denoJsonc, JSON.stringify({ version: "0.9.5" }));

    // Cria arquivo de teste
    await Deno.writeTextFile(join(srcDir, "sample.ts"), 'export const hello = "world";');

    const configEmMemoria = {
      testMode: {
        arquivoSaida: "snapshots/test-out.md",
        extensoesPermitidas: [".ts"],
        pastaBase: "./src",
        subpastasPermitidas: [],
        arquivosRaizPermitidos: ["sample.ts"],
        incluiVersao: true,
        instrucaoCustomizada: "Snapshot de teste para IA",
        default: true,
      },
    };

    const resultados = await exportEngine({
      config: configEmMemoria,
      modos: ["testMode"],
      baseDir: tempDir,
      denoJsoncPath: denoJsonc,
      silencioso: true,
    });

    assertEquals(resultados.length, 1);
    assertEquals(resultados[0]?.modo, "testMode");
    assertEquals(resultados[0]?.arquivos, 1);

    const snapshotConteudo = await Deno.readTextFile(join(tempDir, "snapshots", "test-out.md"));
    assertEquals(snapshotConteudo.includes("[v0.9.5]"), true);
    assertEquals(snapshotConteudo.includes("Snapshot de teste para IA"), true);
    assertEquals(snapshotConteudo.includes('export const hello = "world";'), true);

    await Deno.remove(tempDir, { recursive: true });
  });

  it("deve aceitar passar diretamente o objeto Record<string, ExportConfig> no primeiro parâmetro", async () => {
    const tempDir = await Deno.makeTempDir();
    const srcDir = join(tempDir, "src");
    await Deno.mkdir(srcDir, { recursive: true });

    await Deno.writeTextFile(join(srcDir, "index.ts"), 'console.log("direct config");');

    const resultados = await exportEngine({
      config: {
        direto: {
          arquivoSaida: join(tempDir, "direct.md"),
          extensoesPermitidas: [".ts"],
          pastaBase: srcDir,
          subpastasPermitidas: [],
          arquivosRaizPermitidos: ["index.ts"],
          incluiVersao: false,
          instrucaoCustomizada: "Teste direto",
        },
      },
      modos: ["direto"],
    });

    assertEquals(resultados.length, 1);
    assertEquals(resultados[0]?.modo, "direto");

    await Deno.remove(tempDir, { recursive: true });
  });
});
