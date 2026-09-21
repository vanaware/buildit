> **INSTRUÇÃO PARA A IA:** 
> O texto abaixo contém os arquivos de configuração e execução do SERVIDOR @vanaware/server e CI/CD.
> O projeto é o **BuildIt ** estruturado em módulos. 
> Cada arquivo começa com um título indicando seu caminho relativo exato (ex: `## Arquivo: src/main.ts`).
> Sempre que sugerir alterações, indique claramente qual arquivo deve ser modificado com base nesses caminhos e forneça o novo código completo do arquivo.

---

# Contexto Exportado do Projeto BuildIt - Modo: SERVER

Gerado automaticamente em: 2026-09-21T10:40:32.273Z

---

## Arquivo: `packages/server/deno.jsonc`

```json
{
  "name": "@buildit/server",
  "publish": false,
  "compilerOptions": {
    "lib": [
      "deno.window"
    ]
  },
  "imports": {
    "@std/http": "jsr:@std/http@^1.1.3"
  },
  "tasks": {
    "test": "deno test --allow-env --allow-net --allow-read tests/",
    "check": "deno check src/**/*.{ts,tsx} tests/**/*.ts",
    "tests": "deno task check && deno task test",
    "start": "deno run --allow-read --allow-write --allow-env --allow-net --env-file ./src/main.ts",
    "dev": "deno run --allow-read --allow-write --allow-env --allow-net --env-file --watch ./src/main.ts",
    "clean": "deno clean && rm -rf ./build && mkdir -p ./build/dist"
  },
  "exports": "./src/main.ts",
  "exclude": ["./build/"]
}

```

---

## Arquivo: `packages/server/src/main.ts`

```ts
import { serveDir, } from "@std/http/file-server";

const port = 3000;

console.log(`🚀 Iniciando servidor na porta fixa: ${port}`);

Deno.serve({ port, hostname: "0.0.0.0" }, async (req) => {
  try {
    const url = new URL(req.url,);
    console.log(`[REQ] ${req.method} ${url.pathname}`,);

    const fsRoot = (() => {
      try {
        Deno.statSync("./build/dist",);
        return "./build/dist";
      } catch {
        return new URL("../build/dist", import.meta.url,).pathname;
      }
    })();

    const staticResponse = await serveDir(req, {
      fsRoot,
      showDirListing: false,
      quiet: true,
    },);

    staticResponse.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    staticResponse.headers.set("Pragma", "no-cache",);
    staticResponse.headers.set("Expires", "0",);

    // Permitir escopo global para Service Worker
    if (url.pathname === "/sw.js" || url.pathname.endsWith("/sw.js",)) {
      staticResponse.headers.set("Service-Worker-Allowed", "/",);
    }

    return staticResponse;
  } catch (err) {
    console.warn(
      `[STATIC] Falha ao servir arquivo estático. Build ainda não foi executado?`,
      err instanceof Error ? err.message : err,
    );

    return new Response("Internal Server Error", {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8", },
    },);
  }
},);


```

---

## Arquivo: `.github/workflows/jsr-publish.yml`

```yaml
name: Publish to JSR

on:
  push:
    tags:
      - 'v*.*' # Dispara apenas para tags iniciando com 'v' (ex: v0.2, v1.0.0)
  workflow_dispatch:

permissions:
  contents: read
  id-token: write # Required for JSR OIDC authentication

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Deno
        uses: denoland/setup-deno@v2
        with:
          deno-version-file: .tool-versions
          cache: true
        
      - name: Install dependencies
        run: deno ci

      - name: Sanitize Version
        run: |
          sh ./sanitize-version.sh ./packages/utils/deno.jsonc

      - name: Publish BuildIt to JSR
        run: |
          cd packages/utils
          deno publish --allow-dirty

```

---

## Arquivo: `.github/workflows/gh-pages.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    tags:
      - 'v*.*' # Dispara apenas para tags iniciando com 'v' (ex: v0.2, v1.0.0)
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Deno
        uses: denoland/setup-deno@v2
        with:
          deno-version-file: .tool-versions
          cache: true
      
      - name: Install dependencies
        run: deno ci

      - name: Build Application
        run: deno task build noversion

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './packages/server/build/dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

```

---

