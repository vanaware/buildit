> **INSTRUÇÃO PARA A IA:** 
> O texto abaixo contém a DOCUMENTAÇÃO e diretrizes arquiteturais do projeto.
> O projeto é o **BuildIt ** estruturado em módulos. 
> Cada arquivo começa com um título indicando seu caminho relativo exato (ex: `## Arquivo: src/main.ts`).
> Sempre que sugerir alterações, indique claramente qual arquivo deve ser modificado com base nesses caminhos e forneça o novo código completo do arquivo.

---

# Contexto Exportado do Projeto BuildIt - Modo: DOCS

Gerado automaticamente em: 2026-09-20T23:26:54.119Z

---

## Arquivo: `README.md`

````md
# 🌌 BuildIt

**Asynchronous database layer for Web Workers, IndexedDB, and OPFS.**

BuildIt is a high-performance, non-blocking persistence engine designed for modern Deno and Web applications. It offloads all database and filesystem operations to background threads, ensuring a smooth 60fps user interface even during massive data processing.

## ✨ Core Features

- **Non-Blocking Architecture:** Offloads all heavy IndexedDB and OPFS operations to a background Web Worker via a transparent RPC proxy.
- **Advanced Query Engine:** Leverages native IDB indexes for fast aggregations, range filters, and cursor-based pagination.
- **OPFS File System:** High-performance, private, persistent file system integration for large binary blobs and encrypted media.
- **ZIP Compression:** Native in-worker zipping and unzipping of files stored in the OPFS.
- **Offline-First PWA:** Robust Service Worker caching and PWA manifest for a native-app experience.
- **Deno-Native Toolchain:** Zero `node_modules`. Pure TypeScript ecosystem with built-in build orchestration.
- **Reactive UI:** Built with Preact, granular state via `@preact/signals`, and Material Design 3 (BeerCSS).

## 📦 Monorepo Structure

This project is organized as a Deno monorepo publishing multiple packages to JSR:

- `packages/worker-db/`: The core persistence engine (JSR: [`@vanaware/buildit`](https://jsr.io/@vanaware/buildit)).
- `packages/service-worker/`: Standalone OPFS file explorer & Service Worker router (JSR: [`@vanaware/opfs-explorer`](https://jsr.io/@vanaware/opfs-explorer)).
- `packages/ui/`: The Preact-based reactive frontend application.
- `packages/server/`: A lightweight Deno file server for production delivery.
- `packages/utils/`: Shared build tools and esbuild orchestration scripts.

## 📚 Library Usage

If you are a developer looking to use **BuildIt** or **OPFS Explorer** in your own projects, see:
- [Getting Started Guide](./docs/getting-started.md)
- [API Reference](./docs/api.md)
- [OPFS Explorer Documentation](./packages/service-worker/README.md)

### Quick Imports (JSR)

```ts
// BuildIt (Core Persistence)
import { db, opfs, ls } from "jsr:@vanaware/buildit";

// OPFS Explorer (Service Worker Handler)
import { createOpfsFetchHandler } from "jsr:@vanaware/opfs-explorer";
```

## 🚀 Getting Started (Development)

### Prerequisites

You only need **Deno** installed to run this project. 
*(Note: A `package.json` and `install-script.sh` are included exclusively for compatibility with specific containerized environments like AI Studio).*

### Development

To start the development server, you can use standard Deno tasks:

```bash
# Installs dependencies, builds the project into /packages/server/build/dist, and starts the server on port 3000
deno task dev
```

Alternatively, if you are in an NPM-bridged environment:

```bash
npm run dev
```

### Building for Production

Our custom `esbuild.ts` pipeline bundles the UI, Worker, and Service Worker into the `packages/server/build/dist/` directory.

```bash
deno task build
```

### Testing

All tests are written using Deno's native BDD testing standard (`@std/testing/bdd`).

```bash
deno task test
# OR to run checks, linting, formatting, and tests:
deno task check-all
```

## 🛠️ Tech Stack

- **Runtime:** [Deno](https://deno.com/)
- **UI Framework:** [Preact](https://preactjs.com/) (no React)
- **State Management:** [@preact/signals](https://preactjs.com/guide/v10/signals/)
- **CSS Framework:** [BeerCSS](https://www.beercss.com/) (Material Design 3)
- **Database:** [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (via `idb-keyval`)
- **File System:** [OPFS](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system)
- **Bundler:** [esbuild](https://esbuild.github.io/)

## 📂 OPFS Explorer (`@vanaware/opfs-explorer`)

Once the application is running and the Service Worker is registered, you can navigate to the configured explorer endpoint:

```text
# Default route in demo app:
http://localhost:3000/opfs/

# Or on GitHub Pages (auto-detected scope):
https://vanaware.github.io/buildit/opfs/
```

The Service Worker intercepts the request and dynamically renders a visual, dark-mode HTML file explorer directly from the browser's Origin Private File System!

### Pluggable into any Service Worker:

```ts
import { createOpfsFetchHandler } from "jsr:@vanaware/opfs-explorer";

// Configure with any subfolder name ("files", "arquivos", "opfs"):
self.addEventListener("fetch", createOpfsFetchHandler("files"));
// Now accessible at /files/ or /{repo-name}/files/
```

## 📜 License

MIT License

````

---

## Arquivo: `LICENSE`

```license
MIT License

Copyright (c) 2026 Vanaware

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```

---

