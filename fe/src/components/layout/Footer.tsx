import { Link } from "react-router-dom";
import "../../styles/footer.css";

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-links">
        <Link to="/terminos">Términos de uso</Link>

        <span className="separator">|</span>

        <Link to="/privacidad">Política de privacidad</Link>

        <span className="separator">|</span>

        <Link to="/cookies">Política de cookies</Link>

        <span className="separator">|</span>

        <Link to="/contacto">Contacto</Link>
      </div>

      <p className="footer-copy">
        © 2026 NEODOMUS. Todos los derechos reservados.
      </p>
    </footer>
  );
}
