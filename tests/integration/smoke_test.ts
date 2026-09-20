/**
 * @buildit/tests/integration/smoke_test.ts
 *
 * Smoke test: verifica que os pacotes principais são importáveis
 * e que a estrutura básica do workspace está saudável.
 */

import { assert, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { join, resolve, } from "@std/path";

const ROOT = resolve(Deno.cwd(),);

describe("smoke", () => {
  it("deve ser possível carregar o módulo buildit principal", async () => {
    const builditMod = await import(join(ROOT, "packages/utils/src/mod.ts",));
    assert(
      typeof builditMod === "object",
      "packages/utils/src/mod.ts deve ser carregável",
    );
  });

  it("deve ser possível carregar o módulo build/esbuild", async () => {
    const esbuildMod = await import(join(ROOT, "packages/utils/src/esbuild/mod.ts",));
    assert(
      typeof esbuildMod === "object",
      "packages/utils/src/esbuild/mod.ts deve ser carregável",
    );
  });
});
