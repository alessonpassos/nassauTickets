import { Navigate } from "react-router-dom";
import { lerSessao } from "../services/sessao";

export default function RotaProtegida({ perfis, children }) {
  const sessao = lerSessao();
  if (!sessao) return <Navigate to="/login" replace />;
  if (perfis && !perfis.includes(sessao.perfil)) return <Navigate to="/" replace />;
  return children;
}
