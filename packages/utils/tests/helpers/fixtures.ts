/// <reference lib="deno.ns" />

import { join, } from "@std/path";

/**
 * Creates a temporary directory with a controlled structure for tests.
 * Returns the path and a cleanup function.
 */
export async function withTempDir<T,>(
  fn: (dir: string,) => Promise<T>,
): Promise<T> {
  const tempDir = await Deno.makeTempDir({ prefix: "buildit-test-", },);
  try {
    return await fn(tempDir,);
  } finally {
    await Deno.remove(tempDir, { recursive: true, },);
  }
}

/**
 * Creates a temporary deno.jsonc file with the specified version.
 */
export async function withTempDenoJsonc(
  version: string,
  extras?: Record<string, unknown>,
): Promise<{ path: string; cleanup: () => Promise<void> }> {
  const tempDir = await Deno.makeTempDir({ prefix: "buildit-deno-test-", },);
  const path = join(tempDir, "deno.jsonc",);

  const content = JSON.stringify(
    {
      name: "@buildit/test",
      version,
      ...extras,
    },
    null,
    2,
  );

  await Deno.writeTextFile(path, content,);

  return {
    path,
    cleanup: async () => await Deno.remove(tempDir, { recursive: true, },),
  };
}

/**
 * Creates a temporary file structure for filesystem tests.
 */
export async function withFileStructure(
  files: Record<string, string>,
): Promise<{ dir: string; cleanup: () => Promise<void> }> {
  const tempDir = await Deno.makeTempDir({ prefix: "buildit-fs-test-", },);

  for (const [path, content,] of Object.entries(files,)) {
    const fullPath = join(tempDir, path,);
    const dirPath = fullPath.substring(0, fullPath.lastIndexOf("/",),);

    if (dirPath) {
      await Deno.mkdir(dirPath, { recursive: true, },);
    }

    await Deno.writeTextFile(fullPath, content,);
  }

  return {
    dir: tempDir,
    cleanup: async () => await Deno.remove(tempDir, { recursive: true, },),
  };
}

/**
 * Checks if a file exists.
 */
export async function fileExists(path: string,): Promise<boolean> {
  try {
    await Deno.stat(path,);
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads the content of a file as text.
 */
export async function readText(path: string,): Promise<string> {
  return await Deno.readTextFile(path,);
}

/**
 * Lists files in a directory recursively.
 */
export async function listFiles(dir: string,): Promise<string[]> {
  const files: string[] = [];
  for await (const entry of Deno.readDir(dir,)) {
    files.push(entry.name,);
  }
  return files;
}
