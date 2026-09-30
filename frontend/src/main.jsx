import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { prepararJanelaTotem } from "./services/janelaTotem";

// A janela carrega somente a interface correspondente ao seu modo.
const somenteTotem = prepararJanelaTotem();
// eslint-disable-next-line react-refresh/only-export-components
const App = lazy(() => somenteTotem ? import("./TotemApp.jsx") : import("./App.jsx"));
import "./styles/global.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={<p role="status">Carregando…</p>}>
      <App />
    </Suspense>
  </StrictMode>
);