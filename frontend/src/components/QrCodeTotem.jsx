import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function QrCodeTotem({ caminho }) {
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const url = new URL(caminho, window.location.origin).href;

  useEffect(() => {
    let ativo = true;
    QRCode.toDataURL(url, {
      width: 640,
      margin: 4,
      errorCorrectionLevel: "M",
      color: { dark: "#063b46", light: "#ffffff" },
    })
      .then((imagem) => {
        if (ativo) setCodigo(imagem);
      })
      .catch(() => {
        if (ativo) setErro(true);
      });
    return () => {
      ativo = false;
    };
  }, [url, tentativa]);

  return (
    <section className="totem-qr" aria-labelledby="retirar-celular">
      <h2 id="retirar-celular">Prefere usar o celular?</h2>
      <div className="totem-qr_codigo">
        {codigo ? (
          <img
            src={codigo}
            alt="QR Code para retirar uma senha no celular"
            width="240"
            height="240"
          />
        ) : erro ? (
          <div role="alert">
            <p>Não foi possível gerar o QR Code.</p>
            <button
              className="botao botao--secundario"
              onClick={() => {
                setErro(false);
                setTentativa((n) => n + 1);
              }}
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <p role="status">Gerando QR Code…</p>
        )}
      </div>
      <p>Aponte a câmera para o QR Code.</p>
    </section>
  );
}
