import { render, } from "preact";
import { activeTab, } from "./stores/app.ts";
import { Header, } from "./components/Header.tsx";
import { Navigation, } from "./components/Navigation.tsx";
import { OverviewCard, } from "./components/OverviewCard.tsx";
import { ToolDetails, } from "./components/ToolDetails.tsx";
import { SimulatorCard, } from "./components/SimulatorCard.tsx";
import { SnapshotsCard, } from "./components/SnapshotsCard.tsx";

const App = () => {
  return (
    <main class="responsive max" style="max-width: 1100px; margin: 0 auto; padding: 1.5rem 1rem;">
      <Header />
      <div class="space"></div>
      <Navigation />

      {activeTab.value === "overview" && <OverviewCard />}
      {activeTab.value === "cli" && <ToolDetails />}
      {activeTab.value === "interactive" && <SimulatorCard />}
      {activeTab.value === "snapshots" && <SnapshotsCard />}

      <div class="large-space"></div>
      <footer class="center-align padding surface-container-highest round">
        <p class="italic small-text no-margin">
          BuildIt — Toolkit de automação de build e exportação de contexto. Construído com Deno, Preact e BeerCSS.
        </p>
      </footer>
    </main>
  );
};

render(<App />, document.getElementById("app",)!,);
