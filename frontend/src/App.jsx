import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import PainelAtendente from "./pages/PainelAtendente";
import PainelSenhas from "./pages/PainelSenhas";
import Relatorios from "./pages/Relatorios";
import RotaProtegida from "./components/RotaProtegida";
import "./styles/extras.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/atendente"
          element={<RotaProtegida perfis={["atendente", "gestor"]}><PainelAtendente /></RotaProtegida>}
        />
        <Route path="/painel-de-senha" element={<PainelSenhas som narrar />} />
        <Route
          path="/relatorios"
          element={<RotaProtegida perfis={["gestor"]}><Relatorios /></RotaProtegida>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
