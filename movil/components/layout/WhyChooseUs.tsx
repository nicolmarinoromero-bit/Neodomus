// QUE HACE:
// Importa componentes de React Native.
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

// QUE HACE:
// Componente Por Qué Contratar NeoDomus.
//
// PARA QUE SIRVE:
// Mostrar las ventajas principales
// de contratar los servicios de NeoDomus.
export default function WhyChooseUs() {
  return (
    <View style={styles.container}>

      {/* QUE HACE:
          Contenedor del título */}
      <View style={styles.titleContainer}>

        {/* QUE HACE:
            Línea dorada detrás del título */}
        <View style={styles.goldLine} />

        <Text style={styles.title}>
          ¿Por qué contratar NEODOMUS?
        </Text>

      </View>

      {/* QUE HACE:
          Primera tarjeta */}
      <View style={styles.goldCard}>
        <Text style={styles.cardTextGold}>
          Confianza y seriedad:
          trabajamos con transparencia
          y compromiso en cada proyecto.
        </Text>
      </View>

      {/* QUE HACE:
          Segunda tarjeta */}
      <View style={styles.darkCard}>
        <Text style={styles.cardTextDark}>
          Innovación real:
          ofrecemos soluciones modernas
          que se adaptan a tus necesidades.
        </Text>
      </View>

      {/* QUE HACE:
          Tercera tarjeta */}
      <View style={styles.goldCard}>
        <Text style={styles.cardTextGold}>
          Calidad garantizada:
          resultados eficientes
          y duraderos que generan valor.
        </Text>
      </View>

    </View>
  );
}

// QUE HACE:
// Define los estilos visuales
// de la sección.
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,

    paddingTop: 20,

    paddingBottom: 30,
  },

  titleContainer: {
    position: "relative",

    marginBottom: 35,
  },

  title: {
    color: "#FFFFFF",

    fontSize: 30,

    fontWeight: "900",

    zIndex: 2,
  },

  goldLine: {
    position: "absolute",

    width: 230,

    height: 12,

    backgroundColor: "#CAA24D",

    left: -10,

    top: 28,

    zIndex: 1,
  },

  goldCard: {
    backgroundColor: "#CAA24D",

    borderRadius: 25,

    padding: 20,

    width: "75%",

    alignSelf: "flex-start",

    marginBottom: 25,
  },

  darkCard: {
    backgroundColor: "#000000",

    borderColor: "#CAA24D",

    borderWidth: 1,

    borderRadius: 25,

    padding: 20,

    width: "75%",

    alignSelf: "flex-end",

    marginBottom: 25,
  },

  cardTextGold: {
    color: "#FFFFFF",

    fontSize: 14,

    lineHeight: 22,
  },

  cardTextDark: {
    color: "#FFFFFF",

    fontSize: 14,

    lineHeight: 22,
  },
});