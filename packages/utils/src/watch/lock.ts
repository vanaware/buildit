/**
 * @module @vanaware/buildit/watch/lock
 * @description Concurrency control and Lock mechanism to prevent simultaneous Watch mode instances.
 */

import { join, } from "@std/path";

/** Data structure stored in the Watch lock file */
import { WatchLockData, } from "../tools/interfaces.ts";

/**
 * Checks if a process with the given PID is still running in the operating system.
 *
 * @param pid Process ID to check
 * @returns `true` if the process is active, `false` otherwise
 */
export function isProcessRunning(pid: number,): boolean {
  if (pid <= 0) return false;
  if (pid === Deno.pid) return true;

  try {
    if (Deno.build.os === "linux") {
      try {
        Deno.statSync(`/proc/${pid}`,);
        return true;
      } catch {
        return false;
      }
    }

    const cmd = new Deno.Command("kill", {
      args: ["-0", String(pid,),],
      stdout: "null",
      stderr: "null",
    },);
    const res = cmd.outputSync();
    return res.success;
  } catch {
    return false;
  }
}

/**
 * Tries to acquire an exclusive lock for Watch execution.
 * Throws an error if another watch process is already active.
 *
 * @param baseDir Project base directory
 * @param target Name of the target being executed
 * @param customLockPath Optional custom path for the lock file
 * @returns Async function to release the lock
 */
export async function acquireWatchLock(
  baseDir: string,
  target: string,
  customLockPath?: string,
): Promise<() => Promise<void>> {
  const lockPath = customLockPath ?? join(baseDir, ".buildit-watch.lock",);

  // 1. Check if a lock file already exists
  try {
    const existingContent = await Deno.readTextFile(lockPath,);
    const existingLock = JSON.parse(existingContent,) as WatchLockData;

    if (existingLock && typeof existingLock.pid === "number") {
      if (isProcessRunning(existingLock.pid,)) {
        throw new Error(
          `❌ A watch instance is already running (PID: ${existingLock.pid}, Target: "${existingLock.target}", Started at: ${existingLock.startedAt}). Terminate the previous process to avoid conflicts.`,
        );
      } else {
        // Previous process died without cleaning the lock (orphan)
        try {
          await Deno.remove(lockPath,);
        } catch {
          // Ignore error if another process removed it already
        }
      }
    }
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes("A watch instance is already running",)
    ) {
      throw err;
    }
    // File doesn't exist or JSON is corrupted, can proceed
  }

  // 2. Write new lock
  const lockData: WatchLockData = {
    pid: Deno.pid,
    target,
    startedAt: new Date().toISOString(),
    baseDir,
  };

  await Deno.writeTextFile(lockPath, JSON.stringify(lockData, null, 2,),);

  // 3. Prepare secure lock release
  let released = false;
  const release = async (): Promise<void> => {
    if (released) return;
    released = true;
    try {
      const currentContent = await Deno.readTextFile(lockPath,);
      const currentLock = JSON.parse(currentContent,) as WatchLockData;
      if (currentLock.pid === Deno.pid) {
        await Deno.remove(lockPath,);
      }
    } catch {
      // Ignore errors if the file has already been removed
    }
  };

  // Ensure release on process exit
  const unloadHandler = () => {
    try {
      const currentContent = Deno.readTextFileSync(lockPath,);
      const currentLock = JSON.parse(currentContent,) as WatchLockData;
      if (currentLock.pid === Deno.pid) {
        Deno.removeSync(lockPath,);
      }
    } catch {
      // Ignore errors
    }
  };

  globalThis.addEventListener("unload", unloadHandler, { once: true, },);

  return release;
}
