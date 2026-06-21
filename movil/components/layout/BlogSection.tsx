// QUE HACE:
// Importa componentes de React Native.
import {
  View,
  Text,
  StyleSheet,
  Image,
} from "react-native";

// QUE HACE:
// Componente Blog.
//
// PARA QUE SIRVE:
// Mostrar información y artículos
// destacados de NeoDomus.
export default function BlogSection() {
  return (
    <View style={styles.container}>

      {/* QUE HACE:
          Contenedor del título */}
      <View style={styles.titleContainer}>

        {/* QUE HACE:
            Línea dorada detrás del título */}
        <View style={styles.goldLine} />

        <Text style={styles.title}>
          Blog
        </Text>

      </View>

      {/* QUE HACE:
          Primer artículo */}
      <View style={styles.blogRow}>

        <Image
          source={require("../../assets/images/blog1 - copia.jpeg")}
          style={styles.image}
        />

        <View style={styles.textContainer}>
          <Text style={styles.description}>
            La automatización del hogar ya no es cosa
            del futuro. En Neodomus hacemos posible
            que vivas en una casa inteligente y moderna.
          </Text>
        </View>

      </View>

      {/* QUE HACE:
          Segundo artículo */}
      <View style={styles.blogRow}>

        <View style={styles.textContainer}>
          <Text style={styles.description}>
            Confort, seguridad y ahorro de energía
            en un solo lugar. Así es la experiencia
            que Neodomus puede ofrecerte.
          </Text>
        </View>

        <Image
          source={require("../../assets/images/blog2 - copia.jpeg")}
          style={styles.image}
        />

      </View>

      {/* QUE HACE:
          Tercer artículo */}
      <View style={styles.blogRow}>

        <Image
          source={require("../../assets/images/blog3 - copia.jpeg")}
          style={styles.image}
        />

        <View style={styles.textContainer}>
          <Text style={styles.description}>
            ¿Sabías que Neodomus se enfoca en llevar
            la domótica a los hogares de Colombia,
            combinando innovación y tecnología?
          </Text>
        </View>

      </View>

    </View>
  );
}

// QUE HACE:
// Define estilos visuales
// de la sección Blog.
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,

    paddingTop: 20,

    paddingBottom: 30,
  },

  titleContainer: {
    position: "relative",

    marginBottom: 30,
  },

  goldLine: {
    position: "absolute",

    width: 150,

    height: 12,

    backgroundColor: "#CAA24D",

    left: -10,

    top: 28,

    zIndex: 1,
  },

  title: {
    color: "#FFFFFF",

    fontSize: 34,

    fontWeight: "900",

    zIndex: 2,
  },

  blogRow: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 25,
  },

  image: {
    width: 120,

    height: 120,

    borderRadius: 15,
  },

  textContainer: {
    flex: 1,

    backgroundColor: "#000000",

    borderColor: "#CAA24D",

    borderWidth: 1,

    borderRadius: 15,

    padding: 12,

    marginHorizontal: 10,
  },

  description: {
    color: "#FFFFFF",

    fontSize: 12,

    lineHeight: 20,

    textAlign: "justify",
  },
});