import { activeTab, selectedTool, type ToolKey, } from "../stores/app.ts";

export const ToolDetails = () => {
  const tools: {
    key: ToolKey;
    icon: string;
    title: string;
    badge: string;
    subtitle: string;
    description: string;
    specs: { label: string; value: string }[];
    command: string;
    configFile: string;
    config: string;
  }[] = [
    {
      key: "esbuild",
      icon: "bolt",
      title: "esbuild Pipeline",
      badge: "Velocidade Extrema",
      subtitle: "Empacotamento de alta velocidade para navegadores e web apps",
      description:
        "Orquestrador avançado que conecta esbuild ao @deno/esbuild-plugin. Suporta múltiplos alvos em paralelo, watch mode contínuo, injeção de versão semântica e resolução de dependências remotas do ecossistema Deno.",
      specs: [
        { label: "Plugin Deno", value: "@deno/esbuild-plugin" },
        { label: "Modos", value: "build / watch" },
        { label: "Assets", value: "Cópia automática" },
        { label: "Versão", value: "Injeção no manifest.json" },
      ],
      command: "deno task build\n# ou com argumentos de controle:\ndeno run -A ./esbuild.ts [alvo] [noversion] [watch]",
      configFile: "esbuild.jsonc",
      config: `// Configuração declarativa de alvos esbuild (esbuild.jsonc)
{
  "$schema": "https://deno.land/x/buildit/schemas/esbuild.json",
  "targets": {
    "ui": {
      "srcdir": "packages/ui/src",
      "distdir": "packages/server/build/dist",
      "entryPoints": ["main.tsx"],
      "bundle": true,
      "format": "esm",
      "minify": true,
      "sourcemap": "linked",
      "clean": true
    }
  }
}`,
    },
    {
      key: "denobuild",
      icon: "memory",
      title: "denobuild Engine",
      badge: "Zero Dependências",
      subtitle: "Empacotador autônomo baseado na API nativa Deno.bundle (--unstable-bundle)",
      description:
        "Motor de compilação que emprega a nova API Deno.bundle nativa do Deno 2.x. Ideal para empacotar bibliotecas, Workers e scripts autônomos sem requerer binários compilados externos ou ferramentas de terceiros.",
      specs: [
        { label: "Motor", value: "Deno.bundle nativo" },
        { label: "Flag Deno", value: "--unstable-bundle" },
        { label: "Code Splitting", value: "Suporte ESM" },
        { label: "Dependências", value: "Nenhuma (Zero deps)" },
      ],
      command: "deno task build:deno\n# ou execução direta:\ndeno run --unstable-bundle -A ./build.ts [alvo]",
      configFile: "denobuild.jsonc",
      config: `// Configuração declarativa denobuild (denobuild.jsonc)
{
  "$schema": "https://deno.land/x/buildit/schemas/denobuild.json",
  "targets": {
    "ui": {
      "entryPoints": ["main.tsx"],
      "format": "esm",
      "packages": "bundle",
      "inlineImports": true,
      "minify": true
    }
  }
}`,
    },
    {
      key: "export",
      icon: "auto_stories",
      title: "Context Exporter",
      badge: "IA & Documentação",
      subtitle: "Consolidação de código-fonte estruturada para LLMs e revisões",
      description:
        "Consolidador inteligente de código-fonte e documentação em arquivos Markdown estruturados. Inclui proteção contra loops de pastas de saída, filtros por extensão, inclusão seletiva de arquivos raiz e cabeçalhos explicativos para agentes de Inteligência Artificial.",
      specs: [
        { label: "Formato", value: "Markdown consolidado" },
        { label: "Filtros", value: "Anti-loop & Extensões" },
        { label: "Cabeçalho", value: "Instruções customizadas" },
        { label: "Saída", value: "snapshots/*.md" },
      ],
      command: "deno task export\n# ou com seleção de alvos específicos:\ndeno run --allow-read --allow-write ./export.ts [ui|docs|server|utils]",
      configFile: "export.jsonc",
      config: `// Configuração declarativa export.jsonc
{
  "$schema": "https://deno.land/x/buildit/schemas/export.json",
  "modos": {
    "ui": {
      "arquivoSaida": "snapshots/ui.md",
      "pastaBase": "./packages/ui/",
      "subpastasPermitidas": ["src", "public", "tests"],
      "arquivosRaizPermitidos": ["deno.json", "deno.jsonc"],
      "extensoesPermitidas": [".ts", ".tsx", ".html", ".json"],
      "incluiVersao": true,
      "default": true
    }
  }
}`,
    },
  ];

  return (
    <div>
      {/* 🧭 Seletor de Ferramenta */}
      <nav class="row wrap margin-bottom">
        {tools.map((t,) => (
          <button
            key={t.key}
            type="button"
            class={`round wave ${selectedTool.value === t.key ? "primary" : "border"}`}
            onClick={() => (selectedTool.value = t.key)}
          >
            <i>{t.icon}</i>
            <span class="bold">{t.title}</span>
            <span class="chip small margin-left none s-inline-block">{t.badge}</span>
          </button>
        ))}
      </nav>

      {/* 📋 Detalhes da Ferramenta Ativa */}
      {tools
        .filter((t,) => t.key === selectedTool.value)
        .map((t,) => (
          <article key={t.key} class="border round surface-container-low padding">
            <div class="row middle">
              <div class="circle primary-container middle center-align">
                <i class="primary-text extra">{t.icon}</i>
              </div>
              <div class="max margin-left">
                <div class="row middle no-space">
                  <h5 class="no-margin bold">{t.title}</h5>
                  <span class="chip small primary-container margin-left">{t.configFile}</span>
                </div>
                <div class="small-text secondary-text">{t.subtitle}</div>
              </div>
              <button
                type="button"
                class="primary round wave small none s-inline-flex"
                onClick={() => {
                  selectedTool.value = t.key;
                  activeTab.value = "interactive";
                }}
              >
                <i>play_arrow</i>
                <span>Simular</span>
              </button>
            </div>

            <div class="space"></div>

            <p class="secondary-text medium-line">{t.description}</p>

            <div class="space"></div>

            {/* 🏷️ Especificações e Capacidades */}
            <div class="grid">
              {t.specs.map((s, idx) => (
                <div key={idx} class="s6 m3">
                  <div class="padding border round surface-container center-align">
                    <div class="small-text secondary-text">{s.label}</div>
                    <div class="bold margin-top-xs">{s.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div class="space"></div>
            <div class="divider"></div>
            <div class="space"></div>

            {/* 💻 Comandos e Configurações */}
            <div class="grid">
              <div class="s12 m6">
                <div class="row middle no-space">
                  <i class="primary-text">terminal</i>
                  <h6 class="no-margin bold margin-left">Comandos no Terminal</h6>
                </div>
                <div class="space"></div>
                <pre class="scroll surface-container-highest round padding"><code>{t.command}</code></pre>
              </div>

              <div class="s12 m6">
                <div class="row middle no-space">
                  <i class="primary-text">description</i>
                  <h6 class="no-margin bold margin-left">Configuração ({t.configFile})</h6>
                </div>
                <div class="space"></div>
                <pre class="scroll surface-container-highest round padding"><code>{t.config}</code></pre>
              </div>
            </div>

            <div class="space"></div>
            <nav class="row right-align">
              <button
                type="button"
                class="primary round wave"
                onClick={() => {
                  selectedTool.value = t.key;
                  activeTab.value = "interactive";
                }}
              >
                <i>tune</i>
                <span>Abrir no Simulador de Build</span>
              </button>
            </nav>
          </article>
        ))}
    </div>
  );
};


