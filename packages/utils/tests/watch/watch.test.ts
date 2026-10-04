import { assert, assertEquals, assertRejects, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { join, } from "@std/path";
import {
  loadWatchConfig,
  WATCH_CONFIG_EXAMPLE,
} from "../../src/watch/config.ts";
import { watchEngine, } from "../../src/watch/engine.ts";
import { watchCli, } from "../../src/watch/cli.ts";
import type { WatchGlobalConfig, } from "../../src/tools/interfaces.ts";

describe("loadWatchConfig", () => {
  it("should return error when file is not found", async () => {
    await assertRejects(
      () =>
        loadWatchConfig(
          "non_existent_file.jsonc",
          "/tmp",
        ),
      Error,
      "not found",
    );
  });

  it("should load valid watch configuration from a temporary file", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const configContent = JSON.stringify({
        targets: {
          app: {
            entryPoints: ["src/index.ts",],
            distdir: "dist",
            format: "esm",
            sourcemap: "inline",
          },
        },
      },);
      const configPath = `${tempDir}/watch.jsonc`;
      await Deno.writeTextFile(configPath, configContent,);

      const result = await loadWatchConfig(configPath, tempDir,);
      const app = result.targets["app"];
      assert(app !== undefined,);
      assertEquals(app.entryPoints, ["src/index.ts",],);
      assertEquals(app.format, "esm",);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });
});

describe("watchCli Argument Validation (Cliffy)", () => {
  it("Cliffy should reject when more than 1 positional argument is passed", async () => {
    const cli = watchCli().throwErrors();
    await assertRejects(
      async () => {
        await cli.parse(["ui", "sw",],);
      },
      Error,
      "Too many arguments: sw",
    );
  });
});

describe("watchEngine Target Restrictions and Lock", () => {
  it("should accept target as a single string", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      await Deno.mkdir(`${tempDir}/src`, { recursive: true, },);
      await Deno.writeTextFile(
        `${tempDir}/src/main.ts`,
        "console.log('main');",
      );
      await Deno.writeTextFile(
        `${tempDir}/deno.jsonc`,
        JSON.stringify({ version: "0.1.0", },),
      );

      const config: WatchGlobalConfig = {
        first: {
          default: true,
          entryPoints: ["main.ts",],
          srcdir: `${tempDir}/src`,
          distdir: `${tempDir}/dist`,
        },
      };

      const handles = await watchEngine({
        config,
        target: "first",
        baseDir: tempDir,
        lockFile: `${tempDir}/.watch.lock`,
        silent: true,
      },);

      assertEquals(handles.length, 1,);
      assertEquals(handles[0]?.target, "first",);
      await handles[0]?.close();
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("should reject if the requested target does not exist", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      await Deno.writeTextFile(
        join(tempDir, "deno.jsonc",),
        JSON.stringify({ version: "1.0.0", },),
      );
      const config: WatchGlobalConfig = {
        first: {
          default: true,
          entryPoints: ["main.ts",],
          srcdir: `${tempDir}/src`,
          distdir: `${tempDir}/dist`,
        },
      };

      await assertRejects(
        async () => {
          await watchEngine({
            config,
            target: "non-existent",
            baseDir: tempDir,
            lockFile: `${tempDir}/.watch.lock`,
            silent: true,
          },);
        },
        Error,
        "Target 'non-existent' not found",
      );
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("should select only the first target when no literal is provided and there are multiple default: true", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      await Deno.mkdir(`${tempDir}/src`, { recursive: true, },);
      await Deno.writeTextFile(
        `${tempDir}/src/main.ts`,
        "console.log('main');",
      );
      await Deno.writeTextFile(
        `${tempDir}/src/other.ts`,
        "console.log('other');",
      );
      await Deno.writeTextFile(
        `${tempDir}/deno.jsonc`,
        JSON.stringify({ version: "0.1.0", },),
      );

      const config: WatchGlobalConfig = {
        first: {
          default: true,
          entryPoints: ["main.ts",],
          srcdir: `${tempDir}/src`,
          distdir: `${tempDir}/dist`,
        },
        second: {
          default: true,
          entryPoints: ["other.ts",],
          srcdir: `${tempDir}/src`,
          distdir: `${tempDir}/dist`,
        },
      };

      const handles = await watchEngine({
        config,
        baseDir: tempDir,
        lockFile: `${tempDir}/.watch.lock`,
        silent: true,
      },);

      assertEquals(handles.length, 1,);
      assertEquals(handles[0]?.target, "first",);

      // Close and clean lock
      await handles[0]?.close();
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("should prevent concurrency between simultaneous calls via Lock", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      await Deno.mkdir(`${tempDir}/src`, { recursive: true, },);
      await Deno.writeTextFile(
        `${tempDir}/src/main.ts`,
        "console.log('main');",
      );
      await Deno.writeTextFile(
        `${tempDir}/deno.jsonc`,
        JSON.stringify({ version: "0.1.0", },),
      );

      const config: WatchGlobalConfig = {
        first: {
          default: true,
          entryPoints: ["main.ts",],
          srcdir: `${tempDir}/src`,
          distdir: `${tempDir}/dist`,
        },
      };

      const lockPath = `${tempDir}/.watch.lock`;
      const handles = await watchEngine({
        config,
        target: "first",
        baseDir: tempDir,
        lockFile: lockPath,
        silent: true,
      },);

      try {
        await assertRejects(
          async () => {
            await watchEngine({
              config,
              target: "first",
              baseDir: tempDir,
              lockFile: lockPath,
              silent: true,
            },);
          },
          Error,
          "A watch instance is already running",
        );
      } finally {
        await handles[0]?.close();
      }
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });
});
