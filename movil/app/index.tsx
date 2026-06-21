// QUE HACE:
// Importa los componentes principales de la Landing.
import HomeHeader from "@/components/layout/HomeHeader";
import HomeHero from "@/components/layout/HomeHero";
import AboutSection from "@/components/layout/AboutSection";
import WhyChooseUs from "@/components/layout/WhyChooseUs";
import BlogSection from "@/components/layout/BlogSection";
import HomeFooter from "@/components/layout/HomeFooter";

// QUE HACE:
// Importa componentes de React Native.
import {
  ImageBackground,
  StyleSheet,
  View,
  ScrollView,
} from "react-native";

// QUE HACE:
// Pantalla principal de NeoDomus.
//
// PARA QUE SIRVE:
// Mostrar la Landing inicial del aplicativo.
export default function Index() {
  return (
    <ImageBackground
      source={require("../assets/images/FONDO.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>

        {/* QUE HACE:
            Muestra el encabezado fijo.
        */}
        <HomeHeader />

        {/* QUE HACE:
            Contenedor central con scroll.

            PARA QUE SIRVE:
            Permitir desplazar únicamente
            el contenido principal.
        */}
        <View style={styles.content}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <HomeHero />

            <AboutSection />

            <WhyChooseUs />

            <BlogSection />
          </ScrollView>
        </View>

        {/* QUE HACE:
            Muestra el footer fijo.

            PARA QUE SIRVE:
            Mantener visibles los enlaces
            y derechos reservados.
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
// Mantener la identidad visual de NeoDomus.
const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  overlay: {
    flex: 1,

    backgroundColor: "rgba(0,0,0,0.30)",
  },

  content: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,

    paddingBottom: 20,
  },
});