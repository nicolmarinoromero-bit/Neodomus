// QUE HACE:
// Importa componentes de React Native para construir
// la sección principal de la Landing.
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

// QUE HACE:
// Importa el router de Expo.
//
// PARA QUE SIRVE:
// Permite navegar entre pantallas.
import { router } from "expo-router";

// QUE HACE:
// Componente principal de bienvenida.
//
// PARA QUE SIRVE:
// Mostrar la información principal de NeoDomus
// y dirigir al usuario al inicio de sesión.
export default function HomeHero() {
  return (
    <View style={styles.container}>

      {/* QUE HACE:
          Agrupa el título y la línea dorada */}
      <View style={styles.titleContainer}>

        {/* QUE HACE:
            Línea dorada detrás del texto */}
        <View style={styles.goldLine} />

        <Text style={styles.title}>
          NEODOMUS
        </Text>

      </View>

      {/* QUE HACE:
          Muestra el eslogan */}
      <Text style={styles.slogan}>
        "NEODOMUS más que tecnología, una evolución."
      </Text>

      {/* QUE HACE:
          Muestra la descripción */}
      <Text style={styles.description}>
        En NEODOMUS ofrecemos soluciones integrales en
        tecnología, innovación y gestión de servicios,
        diseñadas para mejorar la seguridad, eficiencia
        y confianza de nuestros clientes.
      </Text>

      {/* QUE HACE:
          Navega a la pantalla de inicio de sesión */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/auth/login")}
      >
        <Text style={styles.buttonText}>
          CONTINUAR
        </Text>
      </TouchableOpacity>

      {/* QUE HACE:
          Línea separadora */}
      <View style={styles.separator} />

    </View>
  );
}

// QUE HACE:
// Define todos los estilos visuales
// de la sección principal.
const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingHorizontal: 20,

    paddingTop: 60,
  },

  titleContainer: {
    position: "relative",

    marginBottom: 15,
  },

  goldLine: {
    position: "absolute",

    width: 150,

    height: 12,

    backgroundColor: "#CAA24D",

    left: -12,

    top: 39,

    zIndex: 1,
  },

  title: {
    fontSize: 38,

    fontWeight: "900",

    color: "#FFFFFF",

    zIndex: 2,
  },

  slogan: {
    color: "#CAA24D",

    fontSize: 14,

    fontWeight: "700",

    marginBottom: 20,

    lineHeight: 22,
  },

  description: {
    color: "#FFFFFF",

    fontSize: 14,

    lineHeight: 28,

    marginBottom: 25,

    textAlign: "justify",
  },

  button: {
    alignSelf: "flex-start",

    borderWidth: 2,

    borderColor: "#FFFFFF",

    paddingHorizontal: 16,

    paddingVertical: 10,

    marginBottom: 20,
  },

  buttonText: {
    color: "#FFFFFF",

    fontSize: 15,

    fontWeight: "700",
  },

  separator: {
    height: 2,

    backgroundColor: "#FFFFFF",

    marginTop: 10,

    marginBottom: 10,
  },
});