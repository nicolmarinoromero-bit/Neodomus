// QUE HACE:
// Importa componentes de React Native.
//
// PARA QUE SIRVE:
// Construir la interfaz gráfica.
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
import { useState } from "react";
import { router } from "expo-router";

// QUE HACE:
// Importa Header y Footer.
//
// PARA QUE SIRVE:
// Mantener la identidad visual de NeoDomus.
import HomeHeader from "@/components/layout/HomeHeader";
import HomeFooter from "@/components/layout/HomeFooter";

// QUE HACE:
// Pantalla Nueva Contraseña.
//
// PARA QUE SIRVE:
// Permitir al usuario establecer
// una nueva contraseña.
export default function ResetPassword() {
  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword,
    setShowConfirmPassword] =
    useState(false);

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
                  Representar seguridad y
                  actualización de contraseña.
              */}
              <View style={styles.iconContainer}>
                <Ionicons
                  name="lock-closed"
                  size={40}
                  color="#CAA24D"
                />
              </View>

              <Text style={styles.title}>
                Nueva contraseña
              </Text>

              <Text style={styles.description}>
                Crea una nueva contraseña segura
                para acceder nuevamente a tu cuenta.
              </Text>

              {/* NUEVA CONTRASEÑA */}
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Nueva contraseña"
                  placeholderTextColor="#777"
                  secureTextEntry={!showPassword}
                  style={styles.passwordInput}
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  <Ionicons
                    name={
                      showPassword
                        ? "eye-outline"
                        : "eye-off-outline"
                    }
                    size={22}
                    color="#CAA24D"
                  />
                </TouchableOpacity>
              </View>

              {/* CONFIRMAR CONTRASEÑA */}
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Confirmar contraseña"
                  placeholderTextColor="#777"
                  secureTextEntry={
                    !showConfirmPassword
                  }
                  style={styles.passwordInput}
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  <Ionicons
                    name={
                      showConfirmPassword
                        ? "eye-outline"
                        : "eye-off-outline"
                    }
                    size={22}
                    color="#CAA24D"
                  />
                </TouchableOpacity>
              </View>

              {/* BOTÓN */}
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  router.push("/auth/login")
                }
              >
                <Text style={styles.buttonText}>
                  Restablecer contraseña
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
    marginBottom: 15,
  },

  description: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 25,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",

    height: 55,

    borderWidth: 1,
    borderColor: "#CAA24D",

    borderRadius: 10,

    backgroundColor: "#111111",

    paddingHorizontal: 15,

    marginBottom: 15,
  },

  passwordInput: {
    flex: 1,
    color: "#FFFFFF",
  },

  button: {
    backgroundColor: "#CAA24D",

    height: 55,

    borderRadius: 10,

    justifyContent: "center",
    alignItems: "center",

    marginTop: 10,
  },

  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },
});