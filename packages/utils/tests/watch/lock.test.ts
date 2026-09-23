import { assertEquals, assertRejects } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  acquireWatchLock,
  isProcessRunning,
  type WatchLockData,
} from "../../src/watch/lock.ts";

describe("Watch Lock Mechanism", () => {
  it("isProcessRunning deve identificar o processo atual como ativo", () => {
    assertEquals(isProcessRunning(Deno.pid), true);
  });

  it("isProcessRunning deve retornar false para PIDs inválidos ou inativos", () => {
    assertEquals(isProcessRunning(-1), false);
    assertEquals(isProcessRunning(0), false);
    // PID 9999999 improvável de existir
    assertEquals(isProcessRunning(9999999), false);
  });

  it("acquireWatchLock deve adquirir o lock e liberá-lo corretamente", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const lockPath = `${tempDir}/.buildit-watch.lock`;
      const release = await acquireWatchLock(tempDir, "ui", lockPath);

      // Lock deve existir no disco
      const stat = await Deno.stat(lockPath);
      assertEquals(stat.isFile, true);

      const content = JSON.parse(await Deno.readTextFile(lockPath)) as WatchLockData;
      assertEquals(content.pid, Deno.pid);
      assertEquals(content.target, "ui");

      // Libera o lock
      await release();

      // Lock deve ter sido removido
      let exists = true;
      try {
        await Deno.stat(lockPath);
      } catch {
        exists = false;
      }
      assertEquals(exists, false);
    } finally {
      await Deno.remove(tempDir, { recursive: true });
    }
  });

  it("acquireWatchLock deve lançar erro se já houver lock ativo para processo em execução", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const lockPath = `${tempDir}/.buildit-watch.lock`;
      const release = await acquireWatchLock(tempDir, "ui", lockPath);

      try {
        await assertRejects(
          async () => {
            await acquireWatchLock(tempDir, "sw", lockPath);
          },
          Error,
          "Já existe uma instância do watch em execução",
        );
      } finally {
        await release();
      }
    } finally {
      await Deno.remove(tempDir, { recursive: true });
    }
  });

  it("acquireWatchLock deve descartar lock órfão de processo morto e prosseguir", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const lockPath = `${tempDir}/.buildit-watch.lock`;
      const orphanLock: WatchLockData = {
        pid: 9999999, // PID inativo
        target: "antigo",
        startedAt: "2026-01-01T00:00:00.000Z",
        baseDir: tempDir,
      };
      await Deno.writeTextFile(lockPath, JSON.stringify(orphanLock));

      // Deve substituir o lock órfão com sucesso
      const release = await acquireWatchLock(tempDir, "novo", lockPath);

      const content = JSON.parse(await Deno.readTextFile(lockPath)) as WatchLockData;
      assertEquals(content.pid, Deno.pid);
      assertEquals(content.target, "novo");

      await release();
    } finally {
      await Deno.remove(tempDir, { recursive: true });
    }
  });
});
