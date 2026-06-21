// QUE HACE:
// Importa las secciones de la pantalla Sobre Nosotros.
import HomeHeader from "@/components/layout/HomeHeader";
import AboutSection from "@/components/layout/AboutSection";
import WhyChooseUs from "@/components/layout/WhyChooseUs";
import BlogSection from "@/components/layout/BlogSection";
import HomeFooter from "@/components/layout/HomeFooter";

// QUE HACE:
// Importa componentes de React Native.
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

// QUE HACE:
// Pantalla Sobre Nosotros.
//
// PARA QUE SIRVE:
// Mostrar información institucional,
// beneficios de NeoDomus y sección Blog.
export default function SobreNosotros() {
  return (
    <ImageBackground
      source={require("../assets/images/FONDO.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* QUE HACE:
            Muestra el encabezado fijo.

            PARA QUE SIRVE:
            Mantener la navegación visible.
        */}
        <HomeHeader />

        {/* QUE HACE:
            Contenedor con scroll.

            PARA QUE SIRVE:
            Permitir desplazamiento del contenido.
        */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <AboutSection />

          <WhyChooseUs />

          <BlogSection />
        </ScrollView>

        {/* QUE HACE:
            Muestra el footer fijo.

            PARA QUE SIRVE:
            Mantener visible el footer igual
            que en Login y Registro.
        */}
        <HomeFooter />
      </View>
    </ImageBackground>
  );
}

// QUE HACE:
// Define los estilos visuales de la pantalla.
//
// PARA QUE SIRVE:
// Dar diseño a la vista Sobre Nosotros.
const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.30)",
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});