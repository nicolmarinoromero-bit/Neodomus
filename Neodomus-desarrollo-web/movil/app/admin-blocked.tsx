import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Neo } from "@/constants/theme";
import { useSession } from "@/contexts/SessionContext";
import NeoButton from "@/components/auth/NeoButton";
import NeoLogo from "@/components/auth/NeoLogo";

export default function AdminBlockedScreen() {
  const { logout } = useSession();

  const salir = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.seguro} edges={["top", "bottom"]}>
      <View style={styles.contenido}>
        <NeoLogo slogan={false} />
        <Text style={styles.titulo}>Acceso restringido</Text>
        <Text style={styles.descripcion}>
          Tu cuenta pertenece al perfil de administrador. La administración del
          sistema se gestiona exclusivamente desde la plataforma web de NeoDomus.
        </Text>
        <Text style={styles.detalle}>
          Por favor, inicia sesión en el navegador de tu computador para acceder
          al panel administrativo.
        </Text>

        <NeoButton title="Cerrar sesión" variant="fantasma" onPress={salir} style={styles.boton} />
        <NeoButton title="Volver al inicio" onPress={() => router.replace("/")} style={styles.boton} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  seguro: {
    flex: 1,
    backgroundColor: Neo.fondo,
  },
  contenido: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  titulo: {
    color: Neo.texto,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  descripcion: {
    color: Neo.textoSuave,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  detalle: {
    color: Neo.textoTenue,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 10,
  },
  boton: {
    marginTop: 12,
  },
});