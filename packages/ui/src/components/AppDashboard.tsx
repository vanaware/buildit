import {
  activeTab,
  API_CODE_SNIPPETS,
  CLI_COMMANDS,
  CONFIG_SNIPPETS,
  copiedId,
  copyToClipboard,
  filteredCliCommands,
  searchQuery,
  selectedConfig,
  selectedTool,
  TOOLS,
} from "../stores/app.ts";
import { APP_VERSION, } from "../version.ts";

export const AppDashboard = () => {
  const currentTool = TOOLS.find((t,) => t.id === selectedTool.value) ??
    TOOLS[0]!;

  return (
    <div class="padding">
      {/* ================================================================== */}
      {/* TAB: OVERVIEW */}
      {/* ================================================================== */}
      {activeTab.value === "overview" && (
        <section class="space-y">
          <article class="border padding surface-container-low round">
            <div class="row wrap">
              <div class="circle large primary-container center-align">
                <i class="primary-text extra">
                  construction
                </i>
              </div>
              <div class="max wrap" style="min-width: 0; min-inline-size: 0;">
                <h4 class="no-margin bold">
                  BuildIt
                </h4>
                <p
                  class="secondary-text no-margin wrap"
                  style="overflow-wrap: anywhere; word-break: normal;">
                  TypeScript utility suite for build orchestration,
                  high-performance bundling, and AI context exportation in Deno
                  ecosystems.
                </p>
              </div>
              <div class="row wrap">
                <a
                  class="button primary"
                  onClick={() => activeTab.value = "cli"}
                  style="cursor: pointer;">
                  <i>
                    terminal
                  </i>
                  <span>
                    CLI Commands
                  </span>
                </a>
                <a
                  class="button border"
                  onClick={() => activeTab.value = "configs"}
                  style="cursor: pointer;">
                  <i>
                    tune
                  </i>
                  <span>
                    Configurations
                  </span>
                </a>
              </div>
            </div>
          </article>

          <div class="space">
          </div>

          <h5 class="bold">
            Library Pillars
          </h5>
          <div class="grid">
            {TOOLS.map((tool,) => (
              <div key={tool.id} class="s12">
                <article
                  class="border padding fill wave"
                  style="cursor: pointer; height: 100%; display: flex; flex-direction: column;"
                  onClick={() => {
                    selectedTool.value = tool.id;
                    activeTab.value = "tools";
                  }}>
                  <div class="row space">
                    <i class={`${tool.colorClass} circle surface-variant`}>
                      {tool.icon}
                    </i>
                    <span class="chip small outline">
                      {tool.badge}
                    </span>
                  </div>
                  <div class="space">
                  </div>
                  <h6 class="bold no-margin">
                    {tool.name}
                  </h6>
                  <p
                    class="small-text secondary-text max wrap"
                    style="flex: 1; overflow-wrap: anywhere;">
                    {tool.summary}
                  </p>
                  <div class="divider">
                  </div>
                  <div class="row space no-space">
                    <span class="small-text tertiary-text font-monospace">
                      {tool.configFile}
                    </span>
                    <i class="small-text">
                      arrow_forward
                    </i>
                  </div>
                </article>
              </div>
            ))}
          </div>

          <div class="space">
          </div>

          <article class="border padding surface-container-highest">
            <h6 class="bold">
              Deno &amp; Zero Bloat Philosophy
            </h6>
            <div class="grid">
              <div class="s12">
                <div class="row">
                  <i>
                    speed
                  </i>
                  <div>
                    <div class="bold">
                      Zero node_modules
                    </div>
                    <div class="small-text secondary-text wrap">
                      Dependencies resolved via URLs,{" "}
                      <code>
                        npm:
                      </code>{" "}
                      and{" "}
                      <code>
                        jsr:
                      </code>{" "}
                      specifiers.
                    </div>
                  </div>
                </div>
              </div>
              <div class="s12">
                <div class="row">
                  <i>
                    security
                  </i>
                  <div>
                    <div class="bold">
                      Fail-Fast &amp; Explicit
                    </div>
                    <div class="small-text secondary-text wrap">
                      Educational errors with configuration examples instead of
                      silent fallbacks.
                    </div>
                  </div>
                </div>
              </div>
              <div class="s12">
                <div class="row">
                  <i>
                    lock
                  </i>
                  <div>
                    <div class="bold">
                      Anti-Concurrency
                    </div>
                    <div class="small-text secondary-text wrap">
                      Disk Lock mechanism (PID) to prevent concurrent rebuilds.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>
      )}

      {/* ================================================================== */}
      {/* TAB: TOOLS */}
      {/* ================================================================== */}
      {activeTab.value === "tools" && (
        <section>
          <div class="row wrap gap margin-bottom">
            {TOOLS.map((t,) => (
              <button
                key={t.id}
                type="button"
                class={`chip ${
                  selectedTool.value === t.id ? "primary" : "outline"
                }`}
                onClick={() => selectedTool.value = t.id}>
                <i>
                  {t.icon}
                </i>
                <span>
                  {t.name}
                </span>
              </button>
            ))}
          </div>

          <div class="space">
          </div>

          <article class="border padding">
            <div class="row space wrap">
              <div class="row gap">
                <i
                  class={`${currentTool.colorClass} circle large surface-variant`}>
                  {currentTool.icon}
                </i>
                <div>
                  <h5 class="bold no-margin">
                    {currentTool.name}
                  </h5>
                  <span class="chip small secondary-container">
                    {currentTool.badge}
                  </span>
                </div>
              </div>
              <div class="row gap">
                <span class="small-text secondary-text">
                  Configuration:
                </span>
                <button
                  type="button"
                  class="chip small tertiary-container"
                  onClick={() => {
                    selectedConfig.value = currentTool.configFile;
                    activeTab.value = "configs";
                  }}>
                  <i>
                    tune
                  </i>
                  <span>
                    {currentTool.configFile}
                  </span>
                </button>
              </div>
            </div>

            <div class="space">
            </div>
            <p
              class="secondary-text wrap"
              style="font-size: 1.05rem; line-height: 1.5; overflow-wrap: anywhere;">
              {currentTool.description}
            </p>

            <div class="divider margin">
            </div>

            <h6 class="bold">
              Canonical CLI Command
            </h6>
            <div class="field border padding surface-container-highest round row">
              <i class="primary-text">
                terminal
              </i>
              <code
                class="max font-monospace margin-left"
                style="user-select: all; overflow-wrap: anywhere;">
                {currentTool.cliCommand}
              </code>
              <button
                type="button"
                class="chip small primary wave"
                onClick={() =>
                  copyToClipboard(
                    currentTool.cliCommand,
                    `tool-${currentTool.id}`,
                  )}>
                <i>
                  {copiedId.value === `tool-${currentTool.id}`
                    ? "check"
                    : "content_copy"}
                </i>
                <span>
                  {copiedId.value === `tool-${currentTool.id}`
                    ? "Copied!"
                    : "Copy"}
                </span>
              </button>
            </div>

            <div class="space">
            </div>

            <h6 class="bold">
              Features &amp; Capabilities
            </h6>
            <div class="grid">
              {currentTool.features.map((feat, idx,) => (
                <div key={idx} class="s12">
                  <div class="row gap no-margin padding-bottom">
                    <i class="green-text">
                      check_circle
                    </i>
                    <span class="small-text">
                      {feat}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}

      {/* ================================================================== */}
      {/* TAB: CLI & SCRIPTS */}
      {/* ================================================================== */}
      {activeTab.value === "cli" && (
        <section>
          <div class="row space wrap gap">
            <div>
              <h5 class="bold no-margin">
                CLI Command Reference
              </h5>
              <div class="small-text secondary-text">
                All utilities can be executed directly via Deno via JSR or local
                files.
              </div>
            </div>
            <div
              class="field border prefix round small max"
              style="max-width: 320px;">
              <i>
                search
              </i>
              <input
                type="text"
                placeholder="Filter commands..."
                value={searchQuery.value}
                onInput={(e,) =>
                  searchQuery.value = (e.target as HTMLInputElement).value} />
            </div>
          </div>

          <div class="space">
          </div>

          <div class="space-y">
            {filteredCliCommands.value.map((item,) => (
              <article
                key={item.id}
                class="border padding surface-container-low round">
                <div class="row space wrap">
                  <div class="row gap">
                    <span class="chip small outline">
                      {item.tag}
                    </span>
                    <h6 class="bold no-margin">
                      {item.title}
                    </h6>
                  </div>
                  <button
                    type="button"
                    class="chip small primary wave"
                    onClick={() => copyToClipboard(item.command, item.id,)}>
                    <i>
                      {copiedId.value === item.id ? "check" : "content_copy"}
                    </i>
                    <span>
                      {copiedId.value === item.id ? "Copied!" : "Copy Command"}
                    </span>
                  </button>
                </div>

                <p
                  class="small-text secondary-text margin-top-small no-margin-bottom wrap"
                  style="overflow-wrap: anywhere;">
                  {item.description}
                </p>

                <div class="field border padding surface-container-highest round margin-top-small row">
                  <i class="primary-text">
                    terminal
                  </i>
                  <code
                    class="max font-monospace margin-left small-text"
                    style="user-select: all; overflow-wrap: anywhere;">
                    {item.command}
                  </code>
                </div>
              </article>
            ))}

            {filteredCliCommands.value.length === 0 && (
              <div class="center-align padding">
                <p class="secondary-text">
                  No commands found matching the search term.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ================================================================== */}
      {/* TAB: CONFIGURATIONS (.JSONC) */}
      {/* ================================================================== */}
      {activeTab.value === "configs" && (
        <section>
          <div class="row space wrap gap">
            <div>
              <h5 class="bold no-margin">
                Configuration Files (.jsonc)
              </h5>
              <div class="small-text secondary-text">
                BuildIt uses JSON with comments (JSONC) for a typed and
                human-readable declaration.
              </div>
            </div>
            <div class="row gap wrap">
              {Object.keys(CONFIG_SNIPPETS,).map((name,) => (
                <button
                  key={name}
                  type="button"
                  class={`chip ${
                    selectedConfig.value === name ? "primary" : "outline"
                  }`}
                  onClick={() => selectedConfig.value = name}>
                  <i>
                    tune
                  </i>
                  <span>
                    {name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div class="space">
          </div>

          <article class="border padding surface-container-low round">
            <div class="row space padding-bottom wrap">
              <div class="row gap">
                <i class="primary-text">
                  description
                </i>
                <span class="bold font-monospace">
                  {selectedConfig.value}
                </span>
              </div>
              <button
                type="button"
                class="chip small outline"
                onClick={() =>
                  copyToClipboard(
                    CONFIG_SNIPPETS[selectedConfig.value] ?? "",
                    selectedConfig.value,
                  )}>
                <i>
                  {copiedId.value === selectedConfig.value
                    ? "check"
                    : "content_copy"}
                </i>
                <span>
                  {copiedId.value === selectedConfig.value
                    ? "Copied!"
                    : "Copy JSON"}
                </span>
              </button>
            </div>

            <pre
              class="border padding surface-container-highest round scroll font-monospace small-text"
              style="line-height: 1.5; max-height: 480px; overflow: auto; box-sizing: border-box; width: 100%; max-width: 100%;">
              <code style="display: block; overflow-x: auto; max-width: 100%; box-sizing: border-box;">{CONFIG_SNIPPETS[selectedConfig.value]}</code>
            </pre>
          </article>
        </section>
      )}

      {/* ================================================================== */}
      {/* TAB: DENO API (PROGRAMMATIC) */}
      {/* ================================================================== */}
      {activeTab.value === "api" && (
        <section>
          <div>
            <h5 class="bold no-margin">
              TypeScript Programmatic API
            </h5>
            <div class="small-text secondary-text">
              How to import and orchestrate tools directly inside
              TypeScript/Deno code.
            </div>
          </div>

          <div class="space">
          </div>

          <div class="grid">
            <div class="s12">
              <article class="border padding surface-container-low round fill">
                <div class="row space padding-bottom wrap">
                  <div class="row gap">
                    <i class="primary-text">
                      bolt
                    </i>
                    <span class="bold">
                      esbuild Engine (esBuild)
                    </span>
                  </div>
                  <button
                    type="button"
                    class="chip small outline"
                    onClick={() =>
                      copyToClipboard(
                        API_CODE_SNIPPETS.esbuild,
                        "api-esbuild",
                      )}>
                    <i>
                      {copiedId.value === "api-esbuild"
                        ? "check"
                        : "content_copy"}
                    </i>
                    <span>
                      {copiedId.value === "api-esbuild" ? "Copied!" : "Copy"}
                    </span>
                  </button>
                </div>
                <pre
                  class="border padding surface-container-highest round scroll font-monospace small-text"
                  style="line-height: 1.4; max-height: 380px; overflow: auto; box-sizing: border-box; width: 100%; max-width: 100%;">
                  <code style="display: block; overflow-x: auto; max-width: 100%; box-sizing: border-box;">{API_CODE_SNIPPETS.esbuild}</code>
                </pre>
              </article>
            </div>

            <div class="s12">
              <article class="border padding surface-container-low round fill">
                <div class="row space padding-bottom wrap">
                  <div class="row gap">
                    <i class="tertiary-text">
                      visibility
                    </i>
                    <span class="bold">
                      Watch Engine (watchEngine)
                    </span>
                  </div>
                  <button
                    type="button"
                    class="chip small outline"
                    onClick={() =>
                      copyToClipboard(API_CODE_SNIPPETS.watch, "api-watch",)}>
                    <i>
                      {copiedId.value === "api-watch"
                        ? "check"
                        : "content_copy"}
                    </i>
                    <span>
                      {copiedId.value === "api-watch" ? "Copied!" : "Copy"}
                    </span>
                  </button>
                </div>
                <pre
                  class="border padding surface-container-highest round scroll font-monospace small-text"
                  style="line-height: 1.4; max-height: 380px; overflow: auto; box-sizing: border-box; width: 100%; max-width: 100%;">
                  <code style="display: block; overflow-x: auto; max-width: 100%; box-sizing: border-box;">{API_CODE_SNIPPETS.watch}</code>
                </pre>
              </article>
            </div>

            <div class="s12">
              <article class="border padding surface-container-low round">
                <div class="row space padding-bottom wrap">
                  <div class="row gap">
                    <i class="primary-text">
                      smart_toy
                    </i>
                    <span class="bold">
                      AI Export Engine (exportEngine)
                    </span>
                  </div>
                  <button
                    type="button"
                    class="chip small outline"
                    onClick={() =>
                      copyToClipboard(API_CODE_SNIPPETS.export, "api-export",)}>
                    <i>
                      {copiedId.value === "api-export"
                        ? "check"
                        : "content_copy"}
                    </i>
                    <span>
                      {copiedId.value === "api-export" ? "Copied!" : "Copy"}
                    </span>
                  </button>
                </div>
                <pre
                  class="border padding surface-container-highest round scroll font-monospace small-text"
                  style="line-height: 1.4; max-height: 380px; overflow: auto; box-sizing: border-box; width: 100%; max-width: 100%;">
                  <code style="display: block; overflow-x: auto; max-width: 100%; box-sizing: border-box;">{API_CODE_SNIPPETS.export}</code>
                </pre>
              </article>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
