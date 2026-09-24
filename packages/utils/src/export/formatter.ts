/**
 * @module @vanaware/buildit/export/formatter
 * @description Funções utilitárias puras para normalização de caminhos,
 * mapeamento de extensões, avaliação de padrões glob e formatação Markdown com proteção contra crases.
 */

import { globToRegExp, } from "@std/path";
import type { ExportConfig, } from "../tools/interfaces.ts";

/**
 * Normaliza um caminho de arquivo para comparação consistente entre sistemas operacionais.
 * - Converte barras invertidas Windows (\) em barras normais (/)
 * - Converte todos os caracteres para minúsculas
 *
 * @param caminho Caminho relativo ou absoluto a ser normalizado
 * @returns Caminho normalizado em minúsculas com barras normais
 *
 * @example
 * ```typescript
 * normalizarCaminho("src\\components\\App.tsx"); // "src/components/app.tsx"
 * ```
 */
export function normalizarCaminho(caminho: string,): string {
  return caminho.replace(/\\/g, "/",).toLowerCase();
}

/**
 * Calcula a quantidade mínima de crases necessárias para envolver um texto
 * em um bloco de código markdown, evitando conflitos quando o próprio conteúdo
 * possui crases consecutivas.
 *
 * @param texto Conteúdo textual do arquivo
 * @returns String contendo 3 ou mais crases (ex: "```", "````")
 *
 * @example
 * ```typescript
 * calcularCraseWrapper("console.log('oi');"); // "```"
 * calcularCraseWrapper("```markdown```"); // "````"
 * ```
 */
export function calcularCraseWrapper(texto: string,): string {
  const matches = texto.match(/`+/g,);
  if (!matches) return "```";
  const maiorSequencia = Math.max(...matches.map((m,) => m.length),);
  const tamanhoNecessario = Math.max(3, maiorSequencia + 1,);
  return "`".repeat(tamanhoNecessario,);
}

/**
 * Mapeia extensões de arquivo para a sintaxe de highlight correspondente do Markdown.
 *
 * @param caminhoRelativo Caminho relativo do arquivo
 * @returns Nome da linguagem para bloco de código Markdown (ex: "json", "bash")
 *
 * @example
 * ```typescript
 * mapearExtensao("deno.jsonc"); // "json"
 * mapearExtensao("script.sh"); // "bash"
 * ```
 */
export function mapearExtensao(caminhoRelativo: string,): string {
  const ext = caminhoRelativo.split(".",).pop()?.toLowerCase() || "";
  const mapa: Record<string, string> = {
    manifest: "json",
    jsonc: "json",
    yml: "yaml",
    sh: "bash",
    env: "properties",
  };

  if (caminhoRelativo.includes(".env",)) return "properties";

  return mapa[ext] || ext;
}

/**
 * Testa se um caminho corresponde a algum dos padrões glob fornecidos.
 *
 * @param caminho Caminho relativo normalizado a ser testado
 * @param padroes Lista de padrões glob (suporta brace expansion e globstar)
 * @returns True se o caminho casar com ao menos um padrão
 */
export function correspondeGlobs(caminho: string, padroes: string[],): boolean {
  const caminhoNormalizado = caminho.replace(/\\/g, "/",);
  for (const padrao of padroes) {
    try {
      const reg = globToRegExp(padrao, {
        globstar: true,
        caseInsensitive: true,
      },);
      if (reg.test(caminhoNormalizado,) || reg.test(caminho,)) {
        return true;
      }
    } catch {
      // Ignora padrão inválido
    }
  }
  return false;
}

/**
 * Determina se um determinado arquivo deve ser incluído no snapshot baseado na configuração do modo.
 * Suporta a sintaxe moderna baseada em `includes` / `excludes` (globs) e mantém suporte a propriedades legadas.
 *
 * Regras aplicadas:
 * 1. Proteção anti-loop: sempre exclui arquivos dentro de pastas `exports/` ou `snapshots/`.
 * 2. Se configurado com `includes`:
 *    - Se casar com qualquer padrão de `excludes`, retorna `false`.
 *    - Se casar com qualquer padrão de `includes`, retorna `true`.
 * 3. Modo Legado (se `includes` não estiver definido):
 *    - Verifica caminhos adicionais permitidos.
 *    - Valida pastaBase, arquivos raiz, subpastas e extensões permitidas.
 *
 * @param caminhoRelativo Caminho relativo do arquivo no repositório
 * @param config Configuração do modo de exportação
 * @returns True se o arquivo deve ser adicionado ao snapshot, false caso contrário
 *
 * @example
 * ```typescript
 * deveIncluirArquivo("packages/ui/src/main.tsx", config); // true
 * ```
 */
export function deveIncluirArquivo(
  caminhoRelativo: string,
  config: ExportConfig,
): boolean {
  const caminhoNormalizado = normalizarCaminho(caminhoRelativo,);

  // 🔒 Proteção anti-loop: nunca inclui arquivos gerados de exportação
  if (
    caminhoNormalizado.startsWith("exports/",) ||
    caminhoNormalizado.startsWith("snapshots/",)
  ) {
    return false;
  }

  // 🌟 MODO MODERNO: Padrões `includes` e `excludes` (globs com brace expansion)
  if (config.excludes && config.excludes.length > 0) {
    if (correspondeGlobs(caminhoRelativo, config.excludes,)) {
      return false;
    }
  }

  if (config.includes && config.includes.length > 0) {
    return correspondeGlobs(caminhoRelativo, config.includes,);
  }

  return false;
}

/**
 * Gera o cabeçalho estruturado do snapshot Markdown contendo metadados e diretrizes para a IA.
 *
 * @param config Configuração do modo
 * @param modo Nome identificador do modo
 * @param versaoApp Versão semântica atual do projeto
 * @returns Cabeçalho formatado em Markdown
 *
 * @example
 * ```typescript
 * const header = gerarCabecalho(config, "ui", "0.3.1");
 * ```
 */
export function gerarCabecalho(
  config: ExportConfig,
  modo: string,
  versaoApp: string,
): string {
  const versaoDisplay = config.incluiVersao ? `[v${versaoApp}] ` : "";
  const instrucao = config.instrucaoCustomizada ?? "Contexto do projeto.";

  return `> **INSTRUÇÃO PARA A IA:** 
> ${instrucao}
> O projeto é o **BuildIt ${versaoDisplay}** estruturado em módulos. 
> Cada arquivo começa com um título indicando seu caminho relativo exato (ex: \`## Arquivo: src/main.ts\`).
> Sempre que sugerir alterações, indique claramente qual arquivo deve ser modificado com base nesses caminhos e forneça o novo código completo do arquivo.

---

# Contexto Exportado do Projeto BuildIt ${versaoDisplay}- Modo: ${modo.toUpperCase()}

Gerado automaticamente em: ${new Date().toISOString()}

---

`;
}

/**
 * Formata um arquivo individual com caminho relativo e bloco de código Markdown seguro.
 *
 * @param caminhoRelativo Caminho relativo do arquivo a ser exibido
 * @param conteudo Conteúdo de texto original do arquivo
 * @returns Bloco de código Markdown formatado com separador
 *
 * @example
 * ```typescript
 * formatarArquivoMarkdown("src/index.ts", "console.log('oi');");
 * ```
 */
export function formatarArquivoMarkdown(
  caminhoRelativo: string,
  conteudo: string,
): string {
  const extensaoMarkdown = mapearExtensao(caminhoRelativo,);
  const wrapperCrasis = calcularCraseWrapper(conteudo,);

  let resultado = `## Arquivo: \`${caminhoRelativo}\`\n\n`;
  resultado += `${wrapperCrasis}${extensaoMarkdown}\n`;
  resultado += conteudo;
  resultado += `\n${wrapperCrasis}\n\n---\n\n`;

  return resultado;
}
