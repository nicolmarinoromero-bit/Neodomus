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
import { useEffect, useState } from "react";

// QUE HACE:
// Importa Header y Footer.
//
// PARA QUE SIRVE:
// Mantener la identidad visual de NeoDomus.
import HomeHeader from "@/components/layout/HomeHeader";
import HomeFooter from "@/components/layout/HomeFooter";

// QUE HACE:
// Pantalla Código de Seguridad.
//
// PARA QUE SIRVE:
// Permitir al usuario ingresar
// el código enviado al correo.
export default function VerifyCode() {
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

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
                  Representar la validación
                  mediante correo.
              */}
              <View style={styles.iconContainer}>
                <Ionicons
                  name="mail-outline"
                  size={40}
                  color="#CAA24D"
                />
              </View>

              <Text style={styles.title}>
                Código de seguridad
              </Text>

              <Text style={styles.description}>
                Ingresa el código de 6 dígitos enviado a
              </Text>

              <Text style={styles.emailText}>
                correo@ejemplo.com
              </Text>

              <Text style={styles.warningText}>
                Por seguridad, este código solo puede utilizarse una vez.
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
                  Muestra el temporizador.

                  PARA QUE SIRVE:
                  Indicar el tiempo restante.
              */}
              <View style={styles.timerContainer}>
                <Ionicons
                  name="time-outline"
                  size={18}
                  color="#CAA24D"
                />

                <Text style={styles.timerText}>
                  El código expirará en{" "}
                  <Text style={styles.timerGold}>
                    {String(minutes).padStart(2, "0")}:
                    {String(seconds).padStart(2, "0")}
                  </Text>
                </Text>
              </View>

              {/* QUE HACE:
                  Botón confirmar código.

                  PARA QUE SIRVE:
                  Redirigir a nueva contraseña.
              */}
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  router.push("/auth/reset-password")
                }
              >
                <Text style={styles.buttonText}>
                  Confirmar código
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
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
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
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },

  description: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 14,
  },

  emailText: {
    color: "#CAA24D",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 5,
    marginBottom: 20,
  },

  warningText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 25,
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
    borderColor: "#CAA24D",
    borderRadius: 10,
    backgroundColor: "#111111",
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
  },

  timerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111111",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },

  timerText: {
    color: "#FFFFFF",
    marginLeft: 8,
  },

  timerGold: {
    color: "#CAA24D",
    fontWeight: "700",
  },

  button: {
    backgroundColor: "#CAA24D",
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },

  separator: {
    height: 1,
    backgroundColor: "#333333",
    marginVertical: 20,
  },

  notReceived: {
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },

  resendText: {
    color: "#CAA24D",
    textAlign: "center",
    fontWeight: "700",
  },

  backText: {
    color: "#CAA24D",
    textAlign: "center",
    fontWeight: "700",
  },
});