import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Link } from 'react-router-dom';
import IconeTotem from './IconeTotem';

export default function QrCodeTotem({ caminho }) {
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const url = new URL(caminho, window.location.origin).href;

  useEffect(() => {
    let ativo = true;
    QRCode.toDataURL(url, { width: 640, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#063b46', light: '#ffffff' } })
      .then((imagem) => { if (ativo) setCodigo(imagem); })
      .catch(() => { if (ativo) setErro(true); });
    return () => { ativo = false; };
  }, [url, tentativa]);

  return <div className="totem-qr">
    <span className="totem-qr__rotulo"><IconeTotem nome="celular" tamanho={19} /> RETIRE SUA SENHA PELO CELULAR</span>
    <div className="totem-qr__moldura">
      {codigo ? <img src={codigo} alt="QR Code para abrir a emissão de senha do Totem 01 no celular" width="300" height="300" /> : erro ? <div role="alert" className="totem-qr__mensagem"><p>Não foi possível gerar o QR Code.</p><button className="botao botao--secundario" onClick={() => { setErro(false); setTentativa((n) => n + 1); }}>Tentar novamente</button></div> : <p role="status">Gerando QR Code…</p>}
    </div>
    <p>Abra a câmera do celular e aponte para o código.</p>
    <Link className="totem-link" to={caminho}>Abrir neste dispositivo <IconeTotem nome="seta" tamanho={18} /></Link>
    <span className="totem-qr__acesso"><IconeTotem nome="escudo" tamanho={15} /> Não precisa instalar um aplicativo</span>
  </div>;
}
