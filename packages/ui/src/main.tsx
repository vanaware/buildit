import { render, } from "preact";
import { Header, } from "./components/Header.tsx";
import { AppDashboard, } from "./components/AppDashboard.tsx";

const App = () => {
  return (
    <div>
      <Header />
      <main class="responsive">
        <div class="space">
        </div>
        <AppDashboard />

        <div class="large-space">
        </div>
        <footer class="responsive center-align">
          <div class="divider">
          </div>
          <div class="space">
          </div>
          <p class="small-text secondary-text no-margin">
            BuildIt &bull; Deno &amp; Web Toolkit &bull; Construído com Preact,
            Signals e BeerCSS
          </p>
        </footer>
      </main>
    </div>
  );
};

render(<App />, document.getElementById("app",)!,);
