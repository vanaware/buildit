import { selectedTool, type ToolKey, } from "../stores/app.ts";

export const ToolDetails = () => {
  const tools: {
    key: ToolKey;
    title: string;
    description: string;
    command: string;
    config: string;
  }[] = [
    {
      key: "esbuild",
      title: "1. esbuild Pipeline",
      description:
        "Orquestrador avançado que conecta esbuild ao @deno/esbuild-plugin. Suporta múltiplos alvos, watch mode contínuo, injeção de versão e empacotamento completo para navegadores.",
      command: "deno task build # ou: deno run -A ./esbuild.ts [alvo] [noversion] [watch]",
      config: `// Configuração declarativa (esbuild.jsonc ou CONFIG interno)
{
  "ui": {
    "srcdir": "packages/ui/src",
    "distdir": "packages/server/build/dist",
    "entryPoints": ["main.tsx"],
    "bundle": true,
    "format": "esm"
  }
}`,
    },
    {
      key: "denobuild",
      title: "2. denobuild (Deno.bundle nativo)",
      description:
        "Motor de build alternativo que emprega a API Deno.bundle nativa (--unstable-bundle). Ideal para empacotar bibliotecas e scripts autônomos sem requerer binários externos.",
      command: "deno task build:deno # ou: deno run --unstable-bundle -A ./build.ts",
      config: `// Configuração denobuild (denobuild.jsonc)
{
  "ui": {
    "entryPoints": ["main.tsx"],
    "format": "esm",
    "packages": "bundle",
    "inlineImports": true
  }
}`,
    },
    {
      key: "export",
      title: "3. export (Snapshot de Contexto)",
      description:
        "Consolidador inteligente de código-fonte e documentação em arquivos Markdown estruturados para uso com agentes de Inteligência Artificial ou documentação.",
      command: "deno task export # ou: deno run --allow-read --allow-write ./export.ts [ui|docs|server|utils]",
      config: `// Configuração de exportação (export.jsonc)
{
  "ui": {
    "arquivoSaida": "snapshots/ui.md",
    "pastaBase": "./packages/ui/",
    "subpastasPermitidas": ["src", "public", "tests"]
  }
}`,
    },
  ];

  return (
    <div>
      <nav class="wrap margin-bottom">
        {tools.map((t,) => (
          <button
            key={t.key}
            type="button"
            class={`chip ${selectedTool.value === t.key ? "secondary" : "transparent"}`}
            onClick={() => (selectedTool.value = t.key)}
          >
            <i>tune</i>
            <span>{t.title}</span>
          </button>
        ))}
      </nav>

      {tools
        .filter((t,) => t.key === selectedTool.value)
        .map((t,) => (
          <article key={t.key} class="border round surface-container-low padding">
            <h4>{t.title}</h4>
            <p>{t.description}</p>

            <h6>Comando de Execução:</h6>
            <pre><code>{t.command}</code></pre>

            <h6>Estrutura de Configuração:</h6>
            <pre><code>{t.config}</code></pre>
          </article>
        ))}
    </div>
  );
};
