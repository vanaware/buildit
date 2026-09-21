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
        console.log("[SERVER] Using fsRoot: ./build/dist");
        return "./build/dist";
      } catch {
        const fallback = new URL("../build/dist", import.meta.url,).pathname;
        console.log(`[SERVER] Fallback fsRoot: ${fallback}`);
        return fallback;
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

