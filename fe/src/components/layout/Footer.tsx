import footerImage from '@assets/images/FOOTER.jpeg';

const Footer = () => {
  return (
    <footer className="main-footer">
      {/* Gráfico decorativo alineado a la esquina superior izquierda */}
      <div className="footer-left-graphic">
        <img src={footerImage} alt="Circuito Neodomus" />
      </div>

      <div className="footer-top">
        {/* Columna Izquierda: Teléfonos */}
        <div className="footer-item left">
          <div className="footer-phones">
            <span className="footer-icon">📞</span>
            <span className="phone-number">+57 3150548392</span>
            <span className="phone-number">+57 3225681611</span>
          </div>
        </div>

        {/* Columna Central: Ubicación y Copyright */}
        <div className="footer-item center">
          <div className="footer-address">
            <span className="footer-icon">📍</span>
            <span>CR 100 C # 100 N</span>
          </div>
          <div className="footer-copyright">
            Copyright © 2025 NEODOMUS
          </div>
        </div>

        {/* Columna Derecha: Email y Términos */}
        <div className="footer-item right">
          <div className="footer-email">
            <span className="footer-icon">✉️</span>
            <span>neodomus29@gmail.com</span>
          </div>
          <a href="#terminos" className="footer-terms">
            Terminos y condiciones
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;