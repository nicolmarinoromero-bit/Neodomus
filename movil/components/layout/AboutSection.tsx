// QUE HACE:
// Importa componentes de React Native.
import {
  View,
 Text,
  StyleSheet,
  Image,
} from "react-native";

// QUE HACE:
// Sección Sobre Nosotros.
//
// PARA QUE SIRVE:
// Mostrar información institucional
// de NeoDomus.
export default function AboutSection() {
  return (
    <View style={styles.container}>

      <Image
        source={require("../../assets/images/sobre.jpeg")}
        style={styles.image}
      />

      {/* QUE HACE:
          Contenedor del título */}
      <View style={styles.titleContainer}>

        {/* QUE HACE:
            Línea dorada detrás del título */}
        <View style={styles.goldLine} />

        <Text style={styles.title}>
          Sobre Nosotros
        </Text>

      </View>

      <Text style={styles.description}>
        En JNV Neodomus ofrecemos soluciones
        innovadoras y confiables que generan
        valor real a nuestros clientes.
      </Text>

      <Text style={styles.description}>
        Nos enfocamos en la calidad, la
        tecnología y la confianza,
        brindando servicios eficientes
        que se adaptan a cada necesidad.
      </Text>

      <Text style={styles.description}>
        Nuestra misión es transformar ideas
        en resultados y construir relaciones
        duraderas basadas en la innovación,
        la confianza y la excelencia.
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,

    paddingTop: 30,

    paddingBottom: 30,
  },

  image: {
    width: "100%",

    height: 260,

    borderRadius: 18,

    marginBottom: 25,
  },

  titleContainer: {
    position: "relative",

    marginBottom: 25,
  },

  title: {
    color: "#FFFFFF",

    fontSize: 34,

    fontWeight: "900",

    zIndex: 2,
  },

  goldLine: {
    position: "absolute",

    width: 170,

    height: 12,

    backgroundColor: "#CAA24D",

    left: -10,

    top: 30,

    zIndex: 1,
  },

  description: {
    color: "#FFFFFF",

    fontSize: 15,

    lineHeight: 28,

    marginBottom: 18,

    textAlign: "justify",
  },
});