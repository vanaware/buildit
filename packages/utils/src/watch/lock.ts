/**
 * @module @vanaware/buildit/watch/lock
 * @description Mecanismo de controle de concorrência e Lock para evitar instâncias simultâneas do modo Watch.
 */

import { join, } from "@std/path";

/** Estrutura armazenada no arquivo de lock do Watch */
import { WatchLockData, } from "../tools/interfaces.ts";

/**
 * Verifica se um processo com o PID fornecido ainda está em execução no sistema operacional.
 *
 * @param pid ID do processo a verificar
 * @returns `true` se o processo estiver ativo, `false` caso contrário
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
 * Tenta adquirir o Lock exclusivo para execução do Watch.
 * Lança um erro se já houver outro processo watch ativo.
 *
 * @param baseDir Diretório base do projeto
 * @param target Nome do alvo que será executado
 * @param customLockPath Caminho opcional customizado para o arquivo de lock
 * @returns Função assíncrona para liberação do lock
 */
export async function acquireWatchLock(
  baseDir: string,
  target: string,
  customLockPath?: string,
): Promise<() => Promise<void>> {
  const lockPath = customLockPath ?? join(baseDir, ".buildit-watch.lock",);

  // 1. Verificar se já existe um arquivo de lock
  try {
    const existingContent = await Deno.readTextFile(lockPath,);
    const existingLock = JSON.parse(existingContent,) as WatchLockData;

    if (existingLock && typeof existingLock.pid === "number") {
      if (isProcessRunning(existingLock.pid,)) {
        throw new Error(
          `❌ Já existe uma instância do watch em execução (PID: ${existingLock.pid}, Alvo: "${existingLock.target}", Iniciada em: ${existingLock.startedAt}). Encerre o processo anterior para evitar conflitos.`,
        );
      } else {
        // O processo anterior morreu sem limpar o lock (órfão)
        try {
          await Deno.remove(lockPath,);
        } catch {
          // Ignora erro se outro processo já removeu
        }
      }
    }
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.startsWith("❌ Já existe uma instância do watch",)
    ) {
      throw err;
    }
    // Arquivo não existe ou JSON corrompido, pode prosseguir
  }

  // 2. Grava o novo lock
  const lockData: WatchLockData = {
    pid: Deno.pid,
    target,
    startedAt: new Date().toISOString(),
    baseDir,
  };

  await Deno.writeTextFile(lockPath, JSON.stringify(lockData, null, 2,),);

  // 3. Prepara a liberação segura do lock
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
      // Ignora erros caso o arquivo já tenha sido removido
    }
  };

  // Garante liberação na saída do processo
  const unloadHandler = () => {
    try {
      const currentContent = Deno.readTextFileSync(lockPath,);
      const currentLock = JSON.parse(currentContent,) as WatchLockData;
      if (currentLock.pid === Deno.pid) {
        Deno.removeSync(lockPath,);
      }
    } catch {
      // Ignora erros
    }
  };

  globalThis.addEventListener("unload", unloadHandler, { once: true, },);

  return release;
}
