import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';
import fondo2 from '@assets/images/Fondo2.png';
import sobreImg from '@assets/images/sobre.jpeg';
import '@styles/info_pages.css';

const AboutUs = () => {
  return (
    <>
      <Navbar />
      <main className="info-page" style={{ backgroundImage: `url(${fondo2})` }}>
        <div className="about-layout">
          <div className="about-image-container">
            <img src={sobreImg} alt="Ilustración Neodomus" />
          </div>
          <div className="about-text-block">
            <h1>Sobre Nosotros</h1>
            <p>
              En Neodomus ofrecemos soluciones innovadoras y confiables que generan valor real a nuestros clientes. Nos enfocamos en la calidad, la tecnología y la confianza, brindando servicios eficientes que se adaptan a cada necesidad.
            </p>
            <p>
              Nuestra misión es transformar ideas en resultados y nuestra visión, consolidarnos como un aliado estratégico que impulse el crecimiento y la evolución de quienes confían en nosotros.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AboutUs;