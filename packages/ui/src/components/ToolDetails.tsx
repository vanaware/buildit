import { selectedTool, type ToolKey, } from "../stores/app.ts";

export const ToolDetails = () => {
  const tools: {
    key: ToolKey;
    icon: string;
    title: string;
    subtitle: string;
    description: string;
    command: string;
    configFile: string;
    config: string;
  }[] = [
    {
      key: "esbuild",
      icon: "bolt",
      title: "esbuild Pipeline",
      subtitle: "Empacotamento de alta velocidade para navegadores e web apps",
      description:
        "Orquestrador avançado que conecta esbuild ao @deno/esbuild-plugin. Suporta múltiplos alvos, watch mode contínuo, injeção de versão semântica e resolução de dependências remotas do Deno.",
      command: "deno task build\n# ou execução direta:\ndeno run -A ./esbuild.ts [alvo] [noversion] [watch]",
      configFile: "esbuild.jsonc",
      config: `// Configuração declarativa de alvos esbuild
{
  "ui": {
    "srcdir": "packages/ui/src",
    "distdir": "packages/server/build/dist",
    "entryPoints": ["main.tsx"],
    "bundle": true,
    "format": "esm",
    "minify": true,
    "sourcemap": "linked"
  }
}`,
    },
    {
      key: "denobuild",
      icon: "memory",
      title: "denobuild (Deno.bundle nativo)",
      subtitle: "Empacotador autônomo sem dependências externas via Deno 2.x",
      description:
        "Motor de compilação que emprega a API Deno.bundle nativa (--unstable-bundle). Ideal para empacotar bibliotecas e scripts autônomos sem requerer binários nativos ou ferramentas de terceiros.",
      command: "deno task build:deno\n# ou execução direta:\ndeno run --unstable-bundle -A ./build.ts",
      configFile: "denobuild.jsonc",
      config: `// Configuração declarativa denobuild
{
  "ui": {
    "entryPoints": ["main.tsx"],
    "format": "esm",
    "packages": "bundle",
    "inlineImports": true,
    "minify": true
  }
}`,
    },
    {
      key: "export",
      icon: "auto_stories",
      title: "export (Snapshot de Contexto para IA)",
      subtitle: "Consolidação de código-fonte estruturada para LLMs e documentação",
      description:
        "Consolidador inteligente de código-fonte e documentação em arquivos Markdown estruturados. Inclui proteção contra loops, filtros por extensão, caminhos permitidos e cabeçalhos com instruções para agentes de Inteligência Artificial.",
      command: "deno task export\n# ou com seleção de alvos:\ndeno run --allow-read --allow-write ./export.ts [ui|docs|server|utils]",
      configFile: "export.jsonc",
      config: `// Configuração declarativa export.jsonc
{
  "ui": {
    "arquivoSaida": "snapshots/ui.md",
    "pastaBase": "./packages/ui/",
    "subpastasPermitidas": ["src", "public", "tests"],
    "arquivosRaizPermitidos": ["deno.json", "deno.jsonc"],
    "extensoesPermitidas": [".ts", ".tsx", ".html", ".json"],
    "incluiVersao": true,
    "default": true
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
            class={`chip ${selectedTool.value === t.key ? "primary" : "border"}`}
            onClick={() => (selectedTool.value = t.key)}
          >
            <i>{t.icon}</i>
            <span>{t.title}</span>
          </button>
        ))}
      </nav>

      {tools
        .filter((t,) => t.key === selectedTool.value)
        .map((t,) => (
          <article key={t.key} class="border round surface-container-low padding">
            <div class="row middle">
              <i class="primary-text extra">{t.icon}</i>
              <div class="max">
                <h5 class="no-margin">{t.title}</h5>
                <div class="small-text secondary-text">{t.subtitle}</div>
              </div>
              <span class="chip small primary-container">{t.configFile}</span>
            </div>

            <div class="space"></div>

            <p class="secondary-text">{t.description}</p>

            <div class="divider"></div>
            <div class="space"></div>

            <h6 class="no-margin">Comando de Execução</h6>
            <div class="space"></div>
            <pre class="scroll surface-container-highest round padding"><code>{t.command}</code></pre>

            <div class="space"></div>

            <h6 class="no-margin">Estrutura de Configuração ({t.configFile})</h6>
            <div class="space"></div>
            <pre class="scroll surface-container-highest round padding"><code>{t.config}</code></pre>
          </article>
        ))}
    </div>
  );
};

