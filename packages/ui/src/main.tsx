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
    <div>
      <Header />
      <main class="responsive">
        <div class="space"></div>
        <Navigation />

        {activeTab.value === "overview" && <OverviewCard />}
        {activeTab.value === "cli" && <ToolDetails />}
        {activeTab.value === "interactive" && <SimulatorCard />}
        {activeTab.value === "snapshots" && <SnapshotsCard />}

        <div class="large-space"></div>
        <footer class="responsive center-align">
          <div class="divider"></div>
          <div class="space"></div>
          <p class="small-text secondary-text no-margin">
            BuildIt &bull; Deno &amp; Web Toolkit &bull; Construído com Preact, Signals e BeerCSS
          </p>
        </footer>
      </main>
    </div>
  );
};

render(<App />, document.getElementById("app",)!,);

