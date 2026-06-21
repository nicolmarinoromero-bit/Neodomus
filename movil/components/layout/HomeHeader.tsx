// QUE HACE:
// Importa componentes de React Native.
import {
  View,
  Image,
  StyleSheet,
} from "react-native";

// QUE HACE:
// Componente del encabezado principal.
//
// PARA QUE SIRVE:
// Mostrar únicamente el logo de Neodomus
// en la Landing principal.
export default function HomeHeader() {
  return (
    <View style={styles.container}>

      {/* QUE HACE:
          Muestra el logo de Neodomus */}
      <Image
        source={require("../../assets/images/Logo.jpg")}
        style={styles.logo}
      />

    </View>
  );
}

// QUE HACE:
// Define los estilos visuales del encabezado.
const styles = StyleSheet.create({
  container: {
    height: 70,

    backgroundColor: "#CAA24D",

    justifyContent: "center",

    alignItems: "center",
  },

  logo: {
    width: 65,

    height: 65,

    borderRadius: 32,
  },
});