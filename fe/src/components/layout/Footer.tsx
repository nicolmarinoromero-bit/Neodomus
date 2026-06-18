import "../../styles/footer.css";

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-links">
        <a href="/terminos">Términos de uso</a>

        <span className="separator">|</span>

        <a href="/privacidad">Política de privacidad</a>

        <span className="separator">|</span>

        <a href="/cookies">Política de cookies</a>

        <span className="separator">|</span>

        <a href="/contacto">Contacto</a>
      </div>

      <p className="footer-copy">
        © 2026 NEODOMUS. Todos los derechos reservados.
      </p>
    </footer>
  );
}