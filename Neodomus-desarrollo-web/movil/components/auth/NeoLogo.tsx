import { Image, StyleSheet, Text, View } from "react-native";

import { Neo } from "@/constants/theme";

export default function NeoLogo({ slogan = true }: { slogan?: boolean }) {
  return (
    <View style={styles.contenedor}>
      <View style={styles.circulo}>
        <Image
          source={require("@/assets/images/logo-neodomus.jpg")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.nombre}>NEODOMUS</Text>
      {slogan && (
        <Text style={styles.eslogan}>Soluciones Domóticas Inteligentes</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: "center",
    marginBottom: 26,
  },
  circulo: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1.5,
    borderColor: Neo.oro,
    backgroundColor: Neo.tarjeta,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  logo: {
    width: 64,
    height: 64,
  },
  nombre: {
    color: Neo.oroClaro,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 6,
  },
  eslogan: {
    color: Neo.textoSuave,
    fontSize: 12,
    letterSpacing: 1.5,
    marginTop: 4,
    textAlign: "center",
  },
});