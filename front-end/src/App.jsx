import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PainelAtendente from "./pages/PainelAtendente";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/atendente" replace />} />
                <Route path="/atendente" element={<PainelAtendente />} />
            </Routes>
        </BrowserRouter>
    );
}
