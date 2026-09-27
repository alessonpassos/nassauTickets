import { BrowserRouter, Routes, Route } from "react-router-dom";
import Totem from "./pages/Totem";
import PaginaIndisponivel from "./pages/PaginaIndisponivel";

// Este roteador não contém telas, menus ou contexto de funcionários.
export default function TotemApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Totem />} />
        <Route path="/totem" element={<Totem />} />
        <Route path="/totem/retirar" element={<Totem retirar />} />
        <Route path="*" element={<PaginaIndisponivel />} />
      </Routes>
    </BrowserRouter>
  );
}
