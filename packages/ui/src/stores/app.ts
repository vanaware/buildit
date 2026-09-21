import { computed, signal, } from "@preact/signals";

export type TabKey = "overview" | "cli" | "interactive" | "snapshots";
export type ToolKey = "esbuild" | "denobuild" | "export";

export const activeTab = signal<TabKey>("overview",);
export const themeMode = signal<"dark" | "light">("dark",);
export const selectedTool = signal<ToolKey>("esbuild",);

export const targetName = signal<string>("ui",);
export const minifyEnabled = signal<boolean>(false,);
export const sourcemapEnabled = signal<boolean>(true,);
export const cleanDistEnabled = signal<boolean>(true,);

export const bundleSimCount = signal<number>(0,);
export const isSimulating = signal<boolean>(false,);
export const simLogs = signal<string[]>([
  "🚀 BuildIt Workspace Initialized.",
  "📦 Packages active: server, ui, utils (@vanaware/buildit)",
  "💡 Ready to orchestrate builds and context exports.",
],);

export const totalLogsCount = computed(() => simLogs.value.length,);

export const addLog = (msg: string,) => {
  const timestamp = new Date().toLocaleTimeString();
  simLogs.value = [...simLogs.value, `[${timestamp}] ${msg}`,];
};

export const applyPreset = (preset: "prod" | "dev" | "export",) => {
  if (preset === "prod") {
    selectedTool.value = "esbuild";
    targetName.value = "ui";
    minifyEnabled.value = true;
    sourcemapEnabled.value = true;
    cleanDistEnabled.value = true;
    addLog("⚡ Predefinição 'Produção' aplicada (esbuild, minify, sourcemap, clean).",);
  } else if (preset === "dev") {
    selectedTool.value = "esbuild";
    targetName.value = "ui";
    minifyEnabled.value = false;
    sourcemapEnabled.value = true;
    cleanDistEnabled.value = false;
    addLog("🛠️ Predefinição 'Dev Rápido' aplicada (esbuild, unminified, sourcemap).",);
  } else {
    selectedTool.value = "export";
    targetName.value = "ui";
    minifyEnabled.value = false;
    sourcemapEnabled.value = false;
    cleanDistEnabled.value = false;
    addLog("📝 Predefinição 'Snapshot IA' aplicada (exportador de contexto).",);
  }
};

export const clearLogs = () => {
  simLogs.value = [];
};

export const toggleTheme = () => {
  const next = themeMode.value === "dark" ? "light" : "dark";
  themeMode.value = next;
  if (typeof document !== "undefined") {
    document.body.className = next;
  }
};

export const runSimulator = async () => {
  if (isSimulating.value) return;
  isSimulating.value = true;
  bundleSimCount.value += 1;

  const target = targetName.value;
  const tool = selectedTool.value;

  addLog(`--- Iniciando execução de ${tool} para o alvo: ${target} ---`,);

  if (cleanDistEnabled.value) {
    addLog(`🧹 Limpando diretório de distribuição em packages/server/build/dist...`,);
  }

  await new Promise((r,) => setTimeout(r, 400,));

  if (tool === "esbuild") {
    addLog(
      `🔨 Compilando via esbuild com @deno/esbuild-plugin (minify: ${minifyEnabled.value}, sourcemap: ${sourcemapEnabled.value})...`,
    );
    await new Promise((r,) => setTimeout(r, 350,));
    addLog(`📄 Copiando assets estáticos e injetando versão em manifest.json...`,);
    await new Promise((r,) => setTimeout(r, 300,));
    addLog(`✅ Alvo [${target}] gerado com sucesso: dist/${target === "ui" ? "main.js" : target + ".js"}`,);
  } else if (tool === "denobuild") {
    addLog(`📦 Empacotando com Deno.bundle API nativo (--unstable-bundle)...`,);
    await new Promise((r,) => setTimeout(r, 450,));
    addLog(`✅ Bundle autônomo gerado sem dependências de bundlers externos!`,);
  } else {
    addLog(`🔍 Varrendo workspace e filtrando arquivos por extensões permitidas...`,);
    await new Promise((r,) => setTimeout(r, 350,));
    addLog(`📝 Gerando snapshot em markdown formatado para contexto de IA: snapshots/${target}.md`,);
  }

  addLog(`🎉 Pipeline finalizada com êxito! (Build #${bundleSimCount.value})`,);
  isSimulating.value = false;
};
