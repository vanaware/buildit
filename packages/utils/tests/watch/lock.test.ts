import { assertEquals, assertRejects, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { acquireWatchLock, isProcessRunning, } from "../../src/watch/lock.ts";

import type { WatchLockData, } from "../../src/tools/interfaces.ts";
describe("Watch Lock Mechanism", () => {
  it("isProcessRunning should identify current process as active", () => {
    assertEquals(isProcessRunning(Deno.pid,), true,);
  });

  it("isProcessRunning should return false for invalid or inactive PIDs", () => {
    assertEquals(isProcessRunning(-1,), false,);
    assertEquals(isProcessRunning(0,), false,);
    // PID 9999999 is unlikely to exist
    assertEquals(isProcessRunning(9999999,), false,);
  });

  it("acquireWatchLock should acquire lock and release it correctly", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const lockPath = `${tempDir}/.buildit-watch.lock`;
      const release = await acquireWatchLock(tempDir, "ui", lockPath,);

      // Lock should exist on disk
      const stat = await Deno.stat(lockPath,);
      assertEquals(stat.isFile, true,);

      const content = JSON.parse(
        await Deno.readTextFile(lockPath,),
      ) as WatchLockData;
      assertEquals(content.pid, Deno.pid,);
      assertEquals(content.target, "ui",);

      // Release lock
      await release();

      // Lock should have been removed
      let exists = true;
      try {
        await Deno.stat(lockPath,);
      } catch {
        exists = false;
      }
      assertEquals(exists, false,);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("acquireWatchLock should throw error if active lock exists for running process", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const lockPath = `${tempDir}/.buildit-watch.lock`;
      const release = await acquireWatchLock(tempDir, "ui", lockPath,);

      try {
        await assertRejects(
          async () => {
            await acquireWatchLock(tempDir, "sw", lockPath,);
          },
          Error,
          "A watch instance is already running",
        );
      } finally {
        await release();
      }
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("acquireWatchLock should discard orphan lock of dead process and proceed", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const lockPath = `${tempDir}/.buildit-watch.lock`;
      const orphanLock: WatchLockData = {
        pid: 9999999, // Inactive PID
        target: "old",
        startedAt: "2026-01-01T00:00:00.000Z",
        baseDir: tempDir,
      };
      await Deno.writeTextFile(lockPath, JSON.stringify(orphanLock,),);

      // Should replace orphan lock successfully
      const release = await acquireWatchLock(tempDir, "new", lockPath,);

      const content = JSON.parse(
        await Deno.readTextFile(lockPath,),
      ) as WatchLockData;
      assertEquals(content.pid, Deno.pid,);
      assertEquals(content.target, "new",);

      await release();
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });
});
