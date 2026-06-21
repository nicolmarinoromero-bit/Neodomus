// QUE HACE:
// Importa componentes de React Native.
//
// PARA QUE SIRVE:
// Construir la interfaz gráfica de la pantalla.
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
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
// Pantalla Recuperar Contraseña.
//
// PARA QUE SIRVE:
// Permitir al usuario solicitar
// un código de recuperación.
export default function ForgotPassword() {
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
                  Representar el envío del correo
                  de recuperación.
              */}
              <View style={styles.iconContainer}>
                <Ionicons
                  name="mail-outline"
                  size={40}
                  color="#CAA24D"
                />
              </View>

              {/* QUE HACE:
                  Muestra el título.

                  PARA QUE SIRVE:
                  Informar la función de la pantalla.
              */}
              <Text style={styles.title}>
                Recuperar contraseña
              </Text>

              {/* QUE HACE:
                  Muestra una descripción.

                  PARA QUE SIRVE:
                  Explicar el proceso al usuario.
              */}
              <Text style={styles.description}>
                Ingresa tu correo electrónico y te
                enviaremos un{" "}
              <Text style={styles.goldText}>código</Text>
                {" "}para restablecer tu contraseña.
              </Text>

              {/* QUE HACE:
                  Campo correo.

                  PARA QUE SIRVE:
                  Capturar el correo del usuario.
              */}
              <TextInput
                style={styles.input}
                placeholder="Tu correo electrónico"
                placeholderTextColor="#777"
              />

              {/* QUE HACE:
                  Botón enviar código.

                  PARA QUE SIRVE:
                  Redirigir a la validación del código.
              */}
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  router.push("/auth/verify-code")
                }
              >
                <Text style={styles.buttonText}>
                  Enviar código
                </Text>
              </TouchableOpacity>

              <Text style={styles.infoText}>
                 Te enviaremos un{" "}
              <Text style={styles.goldText}>código seguro</Text>
                  {" "}a tu correo.
              </Text>

              <View style={styles.separator} />

              {/* QUE HACE:
                  Volver al login.

                  PARA QUE SIRVE:
                  Regresar a la pantalla de inicio
                  de sesión.
              */}
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

// QUE HACE:
// Define todos los estilos visuales.
//
// PARA QUE SIRVE:
// Mantener la identidad visual de NeoDomus.
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
    marginBottom: 15,
  },

  description: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 25,
  },

  input: {
    height: 55,
    borderWidth: 1,
    borderColor: "#CAA24D",
    borderRadius: 10,
    backgroundColor: "#111111",
    color: "#FFFFFF",
    paddingHorizontal: 15,
    marginBottom: 20,
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

  infoText: {
    color: "#BDBDBD",
    textAlign: "center",
    fontSize: 12,
    marginTop: 15,
  },

  separator: {
    height: 1,
    backgroundColor: "#333333",
    marginVertical: 25,
  },

  backText: {
    color: "#CAA24D",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
  },
  goldText: {
  color: "#CAA24D",
  fontWeight: "700",
},
});