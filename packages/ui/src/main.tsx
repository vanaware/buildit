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

const container = document.getElementById("app",);
if (container) {
  container.innerHTML = "";
  try {
    render(<App />, container,);
  } catch (err) {
    console.error("Erro ao renderizar App:", err,);
    container.innerHTML = `
      <div class="padding center-align surface-error-container round margin">
        <h5 class="bold error-text">Erro ao inicializar a interface</h5>
        <p class="small-text font-monospace">${err instanceof Error ? err.message : String(err,)}</p>
      </div>
    `;
  }
}
