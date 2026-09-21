import { parse as parseJsonc } from "@std/jsonc";
import { join } from "@std/path";

/**
 * Carrega e faz o parse de um arquivo JSON ou JSONC de forma segura.
 * Tenta carregar o arquivo especificado ou busca por alternativas padrão.
 * 
 * @param fileName Nome base do arquivo (ex: "denobuild")
 * @param explicitPath Caminho explícito fornecido pelo usuário (opcional)
 * @param baseDir Diretório base para busca (default: ".")
 * @returns O objeto parseado ou null se não encontrado/inválido
 */
export async function loadConfig<T>(
  fileName: string,
  explicitPath?: string,
  baseDir: string = ".",
): Promise<T | null> {
  const candidates = explicitPath
    ? [explicitPath]
    : [
      join(baseDir, `${fileName}.jsonc`),
      join(baseDir, `${fileName}.json`),
    ];

  for (const path of candidates) {
    try {
      const content = await Deno.readTextFile(path);
      const parsed = parseJsonc(content);
      
      if (parsed && typeof parsed === "object") {
        return parsed as T;
      }
    } catch (error) {
      // Se o usuário passou um caminho específico e ele não existe ou está quebrado, avisamos.
      // Se for a busca padrão, falhamos silenciosamente para tentar o próximo candidato.
      if (explicitPath && !(error instanceof Deno.errors.NotFound)) {
        console.warn(`⚠️ Erro ao ler arquivo de configuração em ${path}:`, error);
      }
    }
  }

  return null;
}
