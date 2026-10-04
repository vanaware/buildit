import { serveDir, } from "@std/http/file-server";
import { fromFileUrl, } from "@std/path";

const rawPort = Deno.env.get("PORT",);
console.log(`Env PORT: ${rawPort}`,);
const port = rawPort ? Number(rawPort,) : 3000;

const fsRoot = (() => {
  const distUrl = fromFileUrl(new URL("../build/dist", import.meta.url,),);
  try {
    Deno.statSync(distUrl,);
    return distUrl;
  } catch {
    try {
      Deno.statSync("./build/dist",);
      return "./build/dist";
    } catch {
      return "./packages/server/build/dist";
    }
  }
})();

console.log(`🚀 Starting server on port: ${port} (fsRoot: ${fsRoot})`,);

Deno.serve({ port, hostname: "0.0.0.0", }, async (req,) => {
  try {
    const url = new URL(req.url,);

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

    // Allow global scope for Service Worker
    if (url.pathname === "/sw.js" || url.pathname.endsWith("/sw.js",)) {
      staticResponse.headers.set("Service-Worker-Allowed", "/",);
    }

    return staticResponse;
  } catch (err) {
    console.warn(
      `[STATIC] Failed to serve static file. Has the build been executed?`,
      err instanceof Error ? err.message : err,
    );

    return new Response("Internal Server Error", {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8", },
    },);
  }
},);
