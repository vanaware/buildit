import { parse as parseJsonc, } from "@std/jsonc";
import { dirname, fromFileUrl, join, } from "@std/path";

/**
 * Carrega e faz o parse de um arquivo JSON ou JSONC de forma segura.
 * Tenta carregar o arquivo especificado ou busca por alternativas padrão.
 *
 * Prioridade de busca:
 * 1. Caminho explícito (se fornecido)
 * 2. Diretório do script em execução (Deno.mainModule)
 * 3. Diretório base informado (baseDir)
 *
 * @param fileName Nome base do arquivo (ex: "denobuild")
 * @param explicitPath Caminho explícito fornecido pelo usuário (opcional)
 * @param baseDir Diretório base para busca (default: ".")
 * @returns O objeto parseado ou null se não encontrado/inválido
 */
export async function loadConfig<T,>(
  fileName: string,
  explicitPath?: string,
  baseDir: string = ".",
): Promise<T | null> {
  const candidates: string[] = [];

  if (explicitPath) {
    candidates.push(explicitPath,);
    candidates.push(join(baseDir, explicitPath,),);
    candidates.push(join(baseDir, "scripts", explicitPath,),);
  } else {
    // 1. Tentar diretório do script principal (se for um arquivo local)
    try {
      if (Deno.mainModule && Deno.mainModule.startsWith("file://",)) {
        const scriptDir = dirname(fromFileUrl(Deno.mainModule,),);
        candidates.push(join(scriptDir, `${fileName}.jsonc`,),);
        candidates.push(join(scriptDir, `${fileName}.json`,),);
      }
    } catch {
      // Ignora erros de URL/Path no mainModule
    }

    // 2. Tentar subpasta scripts/ dentro de baseDir
    candidates.push(join(baseDir, "scripts", `${fileName}.jsonc`,),);
    candidates.push(join(baseDir, "scripts", `${fileName}.json`,),);

    // 3. Tentar diretório base (normalmente o CWD ou raiz do projeto)
    candidates.push(join(baseDir, `${fileName}.jsonc`,),);
    candidates.push(join(baseDir, `${fileName}.json`,),);
  }

  // Remover duplicatas mantendo a ordem
  const uniqueCandidates = [...new Set(candidates),];

  // console.debug(`🔍 Buscando config '${fileName}' em:`, uniqueCandidates);

  for (const path of uniqueCandidates) {
    try {
      const content = await Deno.readTextFile(path,);
      const parsed = parseJsonc(content,);

      if (parsed && typeof parsed === "object") {
        // console.debug(`✅ Config encontrada em: ${path}`);
        return parsed as T;
      }
    } catch (error) {
      if (explicitPath && !(error instanceof Deno.errors.NotFound)) {
        console.warn(
          `⚠️ Erro ao ler arquivo de configuração em ${path}:`,
          error,
        );
      }
    }
  }

  return null;
}
