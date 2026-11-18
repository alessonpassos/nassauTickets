import { Component } from "react";

// Evita a tela branca: mostra o erro em vez de desmontar toda a aplicação.
export default class ErrorBoundary extends Component {
    state = { erro: null };

    static getDerivedStateFromError(erro) {
        return { erro };
    }

    render() {
        if (!this.state.erro) return this.props.children;
            return (
                <div role="alert" style={{ padding: "2rem", fontFamily: "sans-serif" }}>
                <h1>Algo deu errado</h1>
                <p>{String(this.state.erro?.message || this.state.erro)}</p>
            <button type="button" onClick={() => window.location.reload()}>Recarregar</button>
        </div>
        );
    }
}
