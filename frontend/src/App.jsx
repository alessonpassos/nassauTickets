import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PainelAtendente from "./pages/PainelAtendente";
import PainelSenhas from "./pages/PainelSenhas";

export default function App() {
    return (
        <BrowserRouter>
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
            </Routes>
        </BrowserRouter>
    );
}