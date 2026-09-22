import { dirname, isAbsolute, join, } from "@std/path";

import type {
  DenoBundleTargetConfig,
  TargetConfig,
} from "./interfaces.ts";

// ============================================================================
// 🎯 VALIDAÇÃO DE CONFIGURAÇÃO DO ALVO (fail-fast com mensagens claras)
// ============================================================================
/**
 * Valida se a configuração do alvo possui os campos obrigatórios para as operações solicitadas.
 * Lança erro com mensagem didática indicando exatamente qual condição falhou.
 *
 * Regras de obrigatoriedade:
 * - 'distdir' é obrigatório quando 'publicdir' está configurado, 'indexHtml' é true, ou 'outfile' não está configurado
 * - 'srcdir' é obrigatório quando 'indexHtml' é true ou quando 'entryPoints' contém paths relativos
 */
export function validateTargetConfig(
  targetName: string,
  config: TargetConfig | DenoBundleTargetConfig,
): void {
  const reasons: string[] = [];

  // Validação de distdir
  if (config.publicdir && !config.distdir) {
    reasons.push(
      "'publicdir' está configurado (necessário 'distdir' para copiar arquivos estáticos)",
    );
  }
  if (config.indexHtml === true && !config.distdir) {
    reasons.push(
      "'indexHtml' é true (necessário 'distdir' para copiar o HTML)",
    );
  }
  if (!config.outfile && !config.distdir) {
    reasons.push(
      "'outfile' não está configurado (necessário 'distdir' para usar como 'outdir')",
    );
  }

  // Validação de srcdir
  if (config.indexHtml === true && !config.srcdir) {
    reasons.push(
      "'indexHtml' é true (necessário 'srcdir' para copiar o HTML)",
    );
  }

  // Verifica se algum entrypoint é relativo e srcdir não existe
  if (!config.srcdir && config.entryPoints && config.entryPoints.length > 0) {
    const hasRelativeEntry = config.entryPoints.some((entry,) =>
      !isAbsolute(entry,)
    );
    if (hasRelativeEntry) {
      reasons.push(
        "'entryPoints' contém caminhos relativos (necessário 'srcdir' para resolver)",
      );
    }
  }

  if (reasons.length > 0) {
    const missingFields: string[] = [];
    if (!config.distdir && reasons.some((r,) => r.includes("'distdir'",))) {
      missingFields.push("'distdir'",);
    }
    if (!config.srcdir && reasons.some((r,) => r.includes("'srcdir'",))) {
      missingFields.push("'srcdir'",);
    }

    throw new Error(
      `❌ [${targetName}] Configuração incompleta.\n` +
        `   Campos obrigatórios faltando: ${missingFields.join(", ",)}\n` +
        `   Motivos:\n` +
        reasons.map((r,) => `   - ${r}`).join("\n",) +
        `\n   Por favor, configure os campos necessários no alvo '${targetName}'.`,
    );
  }
}
