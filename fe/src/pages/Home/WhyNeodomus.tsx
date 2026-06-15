import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';
import fondo2 from '@assets/images/Fondo2.png';
import '@styles/info_pages.css';

const WhyNeodomus = () => {
  return (
    <>
      <Navbar />
      <main className="info-page" style={{ backgroundImage: `url(${fondo2})` }}>
        <div className="why-title-container">
          <h1>Porque contratar NEODOMUS</h1>
        </div>
        <div className="why-custom-grid">
          <div className="card-gold-base card-gold-style">
            Confianza y seriedad: trabajamos con transparencia y compromiso en cada proyecto.
          </div>
          <div className="card-gold-base card-dark-style">
            Innovación real: ofrecemos soluciones modernas que se adaptan a tus necesidades.
          </div>
          <div className="card-gold-base card-gold-style">
            Calidad garantizada: resultados eficientes y duraderos que generan valor.
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default WhyNeodomus;