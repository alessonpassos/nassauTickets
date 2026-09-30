import { Link } from "react-router-dom";
import MarcaTotem from "../components/MarcaTotem";
import "../styles/totem.css";

export default function PaginaIndisponivel() {
  return (
    <div className="totem">
      <MarcaTotem />
      <main className="totem-indisponivel">
        <h1>Página não disponível</h1>
        <p>Este endereço não faz parte do Totem.</p>
        <Link className="botao botao--primario" to="/totem">
          Retirar uma senha
        </Link>
      </main>
    </div>
  );
}
