// QUE HACE:
// Importa componentes de React Native.
//
// PARA QUE SIRVE:
// Construir la interfaz visual del footer.
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

// QUE HACE:
// Componente Footer.
//
// PARA QUE SIRVE:
// Mostrar enlaces informativos y
// derechos reservados de NeoDomus.
export default function HomeFooter() {
  return (
    <View style={styles.container}>
      {/* QUE HACE:
          Muestra una línea decorativa superior.

          PARA QUE SIRVE:
          Separar visualmente el contenido
          principal del footer. */}
      <View style={styles.topLine} />

      {/* QUE HACE:
          Agrupa los enlaces informativos.

          PARA QUE SIRVE:
          Organizar los enlaces en una sola fila. */}
      <View style={styles.linksContainer}>
        <TouchableOpacity>
          <Text style={styles.link}>
            Términos de uso
          </Text>
        </TouchableOpacity>

        <Text style={styles.separator}>|</Text>

        <TouchableOpacity>
          <Text style={styles.link}>
            Privacidad
          </Text>
        </TouchableOpacity>

        <Text style={styles.separator}>|</Text>

        <TouchableOpacity>
          <Text style={styles.link}>
            Cookies
          </Text>
        </TouchableOpacity>

        <Text style={styles.separator}>|</Text>

        <TouchableOpacity>
          <Text style={styles.link}>
            Contacto
          </Text>
        </TouchableOpacity>
      </View>

      {/* QUE HACE:
          Muestra el texto de copyright.

          PARA QUE SIRVE:
          Informar los derechos reservados. */}
      <Text style={styles.copyright}>
        © 2026 NEODOMUS. Todos los derechos reservados.
      </Text>
    </View>
  );
}

// QUE HACE:
// Define los estilos visuales del footer.
//
// PARA QUE SIRVE:
// Mantener una apariencia uniforme
// con la identidad visual de NeoDomus.
const styles = StyleSheet.create({
  // QUE HACE:
  // Contenedor principal del footer.
  //
  // PARA QUE SIRVE:
  // Agrupar todos los elementos
  // y evitar espacios visuales.
  container: {
    backgroundColor: "#000000",

    paddingTop: 10,

    paddingBottom: 15,

    paddingHorizontal: 10,

    marginTop: 0,
  },

  // QUE HACE:
  // Línea decorativa superior.
  //
  // PARA QUE SIRVE:
  // Separar el footer del contenido.
  topLine: {
    height: 2,

    backgroundColor: "#CAA24D",

    marginBottom: 15,
  },

  // QUE HACE:
  // Contenedor de enlaces.
  //
  // PARA QUE SIRVE:
  // Organizar los enlaces horizontalmente.
  linksContainer: {
    flexDirection: "row",

    flexWrap: "wrap",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 10,
  },

  // QUE HACE:
  // Estilo de los enlaces.
  //
  // PARA QUE SIRVE:
  // Mostrar los enlaces con el diseño corporativo.
  link: {
    color: "#FFFFFF",

    fontSize: 11,

    marginHorizontal: 4,
  },

  // QUE HACE:
  // Separador visual entre enlaces.
  //
  // PARA QUE SIRVE:
  // Mejorar la legibilidad.
  separator: {
    color: "#CAA24D",

    marginHorizontal: 4,

    fontWeight: "bold",
  },

  // QUE HACE:
  // Texto de copyright.
  //
  // PARA QUE SIRVE:
  // Mostrar información legal.
  copyright: {
    color: "#BDBDBD",

    fontSize: 10,

    textAlign: "center",
  },
});