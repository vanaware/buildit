/**
 * @module @vanaware/buildit/export/formatter
 * @description Funções utilitárias puras para normalização de caminhos,
 * mapeamento de extensões e formatação Markdown com proteção contra crases.
 */

import type { ExportConfig, } from "./types.ts";

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
 * Normaliza um caminho para comparação de prefixos de diretório.
 * Remove prefixos `./` ou `.` redundantes e trailing slash.
 *
 * @param caminho Caminho do diretório
 * @returns Prefixo limpo pronto para comparação de início de string
 *
 * @example
 * ```typescript
 * normalizarPrefixo("./packages/ui/"); // "packages/ui"
 * ```
 */
export function normalizarPrefixo(caminho: string,): string {
  let normalized = caminho.replace(/\\/g, "/",).toLowerCase();
  if (normalized === "./" || normalized === ".") {
    return "";
  }
  if (normalized.startsWith("./",)) {
    normalized = normalized.substring(2,);
  }
  normalized = normalized.replace(/\/$/, "",);
  return normalized;
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
 * Determina se um determinado arquivo deve ser incluído no snapshot baseado na configuração do modo.
 *
 * Regras aplicadas (em ordem estrita):
 * 1. Proteção anti-loop: sempre exclui arquivos dentro de pastas `exports/` ou `snapshots/` gerados anteriormente.
 * 2. Verifica se está em caminhos adicionais explicitamente permitidos.
 * 3. Verifica se está dentro de `pastaBase`.
 * 4. Se está na raiz de `pastaBase`, valida contra `arquivosRaizPermitidos`.
 * 5. Se está em subpasta, valida contra `subpastasPermitidas`.
 * 6. Valida se a extensão do arquivo consta em `extensoesPermitidas`.
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

  // 🔍 Verifica caminhos adicionais (fora de pastaBase)
  if (
    config.caminhosAdicionaisPermitidos &&
    config.caminhosAdicionaisPermitidos.length > 0
  ) {
    const correspondeAdicional = config.caminhosAdicionaisPermitidos.some(
      (caminhoExtra,) => {
        const extraNormalizado = normalizarCaminho(caminhoExtra,);
        return (
          caminhoNormalizado === extraNormalizado ||
          caminhoNormalizado.startsWith(extraNormalizado + "/",)
        );
      },
    );

    if (correspondeAdicional) {
      if (config.extensoesPermitidas.length === 0) return true;
      return config.extensoesPermitidas.some(
        (ext,) =>
          caminhoNormalizado.endsWith(ext,) || caminhoNormalizado === ext,
      );
    }
  }

  // 🔍 Verifica se está dentro de pastaBase
  const prefixoBase = normalizarPrefixo(config.pastaBase,);
  const prefixoBaseComBarra = prefixoBase !== "" ? prefixoBase + "/" : "";

  if (
    prefixoBaseComBarra !== "" &&
    !caminhoNormalizado.startsWith(prefixoBaseComBarra,)
  ) {
    return false;
  }

  // 🔍 Extrai o caminho relativo dentro de pastaBase
  const caminhoInterno = prefixoBaseComBarra !== ""
    ? caminhoNormalizado.substring(prefixoBaseComBarra.length,)
    : caminhoNormalizado;

  // Verifica se está NA RAIZ de pastaBase (não possui barras no caminho interno)
  const estaNaRaiz = !caminhoInterno.includes("/",);

  if (estaNaRaiz) {
    return config.arquivosRaizPermitidos.some(
      (raiz,) => normalizarCaminho(raiz,) === caminhoInterno,
    );
  }

  // 🔍 Está em subpasta: verifica subpastasPermitidas
  let emSubpastaPermitida = false;

  if (config.subpastasPermitidas.length === 0) {
    // Lista vazia = permite varrer todas as subpastas
    emSubpastaPermitida = true;
  } else {
    emSubpastaPermitida = config.subpastasPermitidas.some((sub,) => {
      const subNormalizada = normalizarCaminho(sub,) + "/";
      return (
        caminhoInterno.startsWith(subNormalizada,) ||
        caminhoInterno === normalizarCaminho(sub,)
      );
    },);
  }

  if (emSubpastaPermitida) {
    if (config.extensoesPermitidas.length === 0) return true;
    return config.extensoesPermitidas.some(
      (ext,) => caminhoNormalizado.endsWith(ext,) || caminhoNormalizado === ext,
    );
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

  return `> **INSTRUÇÃO PARA A IA:** 
> ${config.instrucaoCustomizada}
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
