// QUE HACE:
// Importa componentes de React Native.
//
// PARA QUE SIRVE:
// Construir la interfaz gráfica.
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  TextInput,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// QUE HACE:
// Importa Header y Footer.
//
// PARA QUE SIRVE:
// Mantener la identidad visual de NeoDomus.
import HomeHeader from "@/components/layout/HomeHeader";
import HomeFooter from "@/components/layout/HomeFooter";

// QUE HACE:
// Pantalla Verificación de Cuenta.
//
// PARA QUE SIRVE:
// Permitir al usuario verificar
// el correo registrado.
export default function VerifyEmail() {
  return (
    <ImageBackground
      source={require("../../assets/images/FONDO.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <HomeHeader />

        <View style={styles.content}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.card}>
              {/* QUE HACE:
                  Muestra el icono principal.

                  PARA QUE SIRVE:
                  Representar la verificación
                  del correo electrónico.
              */}
              <View style={styles.iconContainer}>
                <Ionicons
                  name="mail-outline"
                  size={40}
                  color="#CAA24D"
                />
              </View>

              <Text style={styles.title}>
                Verificación de cuenta
              </Text>

              <View style={styles.goldLine} />

              <Text style={styles.description}>
                Ingresa el código de 6 dígitos
                que enviamos a
              </Text>

              <Text style={styles.emailText}>
                correo@ejemplo.com
              </Text>

              {/* QUE HACE:
                  Casillas del código.

                  PARA QUE SIRVE:
                  Permitir ingresar los 6 dígitos.
              */}
              <View style={styles.codeContainer}>
                <TextInput
                  style={styles.codeInput}
                  maxLength={1}
                  keyboardType="numeric"
                />

                <TextInput
                  style={styles.codeInput}
                  maxLength={1}
                  keyboardType="numeric"
                />

                <TextInput
                  style={styles.codeInput}
                  maxLength={1}
                  keyboardType="numeric"
                />

                <TextInput
                  style={styles.codeInput}
                  maxLength={1}
                  keyboardType="numeric"
                />

                <TextInput
                  style={styles.codeInput}
                  maxLength={1}
                  keyboardType="numeric"
                />

                <TextInput
                  style={styles.codeInput}
                  maxLength={1}
                  keyboardType="numeric"
                />
              </View>

              {/* QUE HACE:
                  Muestra información de expiración.

                  PARA QUE SIRVE:
                  Informar cuánto tiempo tiene
                  el usuario para verificar.
              */}
              <View style={styles.expireContainer}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color="#CAA24D"
                />

                <Text style={styles.expireText}>
                  El código expirará en 24 horas
                </Text>
              </View>

              {/* QUE HACE:
                  Botón verificar cuenta.

                  PARA QUE SIRVE:
                  Confirmar el código ingresado.
              */}
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  router.push("/auth/login")
                }
              >
                <Text style={styles.buttonText}>
                  VERIFICAR CUENTA
                </Text>
              </TouchableOpacity>

              <View style={styles.separator} />

              <Text style={styles.notReceived}>
                ¿No recibiste el código?
              </Text>

              <TouchableOpacity>
                <Text style={styles.resendText}>
                  ↻ Reenviar código
                </Text>
              </TouchableOpacity>

              <View style={styles.separator} />

              <TouchableOpacity
                onPress={() =>
                  router.push("/auth/login")
                }
              >
                <Text style={styles.backText}>
                  ← Volver al inicio de sesión
                </Text>
              </TouchableOpacity>

            </View>
          </ScrollView>
        </View>

        <HomeFooter />
      </View>
    </ImageBackground>
  );
}

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
  backgroundColor: "transparent",
},

  scrollContent: {
  flexGrow: 1,
  justifyContent: "center",
  padding: 20,
  backgroundColor: "transparent",
},

  card: {
    backgroundColor: "#000000",
    borderWidth: 2,
    borderColor: "#CAA24D",
    borderRadius: 20,
    padding: 25,
  },

  iconContainer: {
    alignSelf: "center",

    width: 100,
    height: 100,

    borderRadius: 50,

    borderWidth: 2,
    borderColor: "#CAA24D",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 20,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
  },

  goldLine: {
    width: 80,
    height: 3,
    backgroundColor: "#CAA24D",
    alignSelf: "center",
    marginTop: 15,
    marginBottom: 25,
  },

  description: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 14,
  },

  emailText: {
    color: "#CAA24D",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 30,
  },

  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  codeInput: {
    width: 45,
    height: 55,

    borderWidth: 1,
    borderColor: "#333333",

    borderRadius: 10,

    backgroundColor: "#111111",

    color: "#FFFFFF",

    textAlign: "center",

    fontSize: 20,

    fontWeight: "700",
  },

  expireContainer: {
    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "#111111",

    borderRadius: 10,

    padding: 14,

    marginBottom: 25,
  },

  expireText: {
    color: "#FFFFFF",

    marginLeft: 10,
  },

  button: {
    backgroundColor: "#CAA24D",

    height: 55,

    borderRadius: 10,

    justifyContent: "center",

    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",

    fontSize: 16,

    fontWeight: "700",
  },

  separator: {
    height: 1,

    backgroundColor: "#333333",

    marginVertical: 20,
  },

  notReceived: {
    color: "#BDBDBD",

    textAlign: "center",

    marginBottom: 10,
  },

  resendText: {
    color: "#CAA24D",

    textAlign: "center",

    fontWeight: "700",
  },

  backText: {
    color: "#BDBDBD",

    textAlign: "center",

    fontSize: 14,
  },
});