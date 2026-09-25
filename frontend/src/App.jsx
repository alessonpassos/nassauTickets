import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PainelAtendente from "./pages/PainelAtendente";
import PainelSenhas from "./pages/PainelSenhas";
import Relatorios from "./pages/Relatorios";
import { RelatoriosProvider } from "./context/RelatoriosContext";

export default function App() {
    return (
        <BrowserRouter>
            <RelatoriosProvider>
            <Routes>
                <Route path="/" element={<Navigate to="/atendente" replace />} />
                <Route 
                    path="/atendente" 
                    element={<PainelAtendente />}
                />
                <Route
                    path="/painel-de-senha"
                    element={<PainelSenhas som={true} narrar={true} />}
                />
                <Route path="/relatorios" element={<Relatorios />} />
            </Routes>
            </RelatoriosProvider>
        </BrowserRouter>
    );
}