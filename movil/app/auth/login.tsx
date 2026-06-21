// QUE HACE:
// Importa componentes de React Native.
//
// PARA QUE SIRVE:
// Construir la interfaz gráfica de la pantalla.
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import Checkbox from "expo-checkbox";

// QUE HACE:
// Importa router de Expo Router.
//
// PARA QUE SIRVE:
// Navegar entre pantallas de la aplicación.
import { router } from "expo-router";

// QUE HACE:
// Importa el encabezado personalizado.
//
// PARA QUE SIRVE:
// Mostrar la barra superior de NeoDomus.
import HomeHeader from "@/components/layout/HomeHeader";

// QUE HACE:
// Importa el footer personalizado.
//
// PARA QUE SIRVE:
// Mostrar la barra inferior de NeoDomus.
import HomeFooter from "@/components/layout/HomeFooter";

// QUE HACE:
// Pantalla de inicio de sesión.
//
// PARA QUE SIRVE:
// Permitir que el usuario acceda a NeoDomus.
export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <ImageBackground
      source={require("../../assets/images/Fondo2 - copia.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* QUE HACE:
            Muestra el encabezado de la aplicación.

            PARA QUE SIRVE:
            Mantener una navegación consistente. */}
        <HomeHeader />

        {/* QUE HACE:
            Contenedor desplazable.

            PARA QUE SIRVE:
            Permitir scroll en pantallas pequeñas. */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* QUE HACE:
              Tarjeta principal del formulario.

              PARA QUE SIRVE:
              Agrupar todos los elementos del login. */}
          <View style={styles.card}>
            {/* QUE HACE:
    Muestra el icono principal del usuario.

    PARA QUE SIRVE:
    Mantener la misma identidad visual
    utilizada en la pantalla de registro.
*/}
<View style={styles.iconContainer}>
  <Ionicons
    name="person-outline"
    size={40}
    color="#CAA24D"
  />
</View>

            {/* QUE HACE:
                Muestra el título principal.

                PARA QUE SIRVE:
                Indicar que el usuario está en inicio de sesión. */}
            <Text style={styles.title}>Iniciar sesión</Text>

            {/* QUE HACE:
                Muestra un mensaje de bienvenida.

                PARA QUE SIRVE:
                Dar contexto al usuario. */}
            <Text style={styles.subtitle}>
              Bienvenido de nuevo a <Text style={styles.brand}>NEODOMUS</Text>
            </Text>

            {/* QUE HACE:
                Campo para ingresar correo.

                PARA QUE SIRVE:
                Capturar el correo electrónico del usuario. */}
            <TextInput
              placeholder="Correo electrónico"
              placeholderTextColor="#7A7A7A"
              style={styles.input}
            />

            {/* QUE HACE:
                Campo para ingresar contraseña.

                PARA QUE SIRVE:
                Capturar la contraseña del usuario. */}
            
    
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor="#7A7A7A"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
              />

              {/* QUE HACE:
                Botón para mostrar u ocultar la contraseña.

                PARA QUE SIRVE:
                Permitir al usuario visualizar
                la contraseña ingresada. */}
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
              >
    <Ionicons
      name={showPassword ? "eye-outline" : "eye-off"}
      size={22}
      color="#CAA24D"
    />
  </TouchableOpacity>
</View>

            {/* QUE HACE:
              Botón de acceso.
              PARA QUE SIRVE:
              Permitir iniciar sesión y
              redirigir a productos. */}
          <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push("/auth/products")}
            >
            <Text style={styles.loginButtonText}>
              Ingresar
            </Text>
          </TouchableOpacity>

            {/* QUE HACE:
              Contenedor de opciones de acceso.

              PARA QUE SIRVE:
              Mostrar Recordarme y
              Recuperar contraseña. */}
            <View style={styles.optionsRow}>

            {/* QUE HACE:
              Casilla Recordarme.

              PARA QUE SIRVE:
              Mantener la sesión iniciada. */}
           <View style={styles.rememberContainer}>
            <Checkbox
              value={rememberMe}
              onValueChange={setRememberMe}
              color={rememberMe ? "#CAA24D" : undefined}
            />

          <Text style={styles.rememberText}>
            Recordarme
          </Text>
      </View>

          {/* QUE HACE:
            Enlace de recuperación.
            PARA QUE SIRVE:
            Llevar al usuario a recuperar
            su contraseña. */}
      <TouchableOpacity
          onPress={() => router.push("/auth/forgot-password")}
        >
        <Text style={styles.forgotPassword}>
          ¿Olvidaste tu contraseña?
        </Text>
      </TouchableOpacity>

</View>

            {/* QUE HACE:
                Línea divisora.

                PARA QUE SIRVE:
                Separar visualmente las opciones. */}
            <View style={styles.separatorContainer}>
              <View style={styles.separator} />

              <Text style={styles.separatorText}>o</Text>

              <View style={styles.separator} />
            </View>

            {/* QUE HACE:
                Texto informativo.

                PARA QUE SIRVE:
                Indicar que existe la opción de registro. */}
            <Text style={styles.noAccount}>
              ¿No tienes una cuenta?
            </Text>

            {/* QUE HACE:
                Enlace de registro.

                PARA QUE SIRVE:
                Redirigir a la pantalla de registro. */}
            <TouchableOpacity
              onPress={() => router.push("/auth/register")}
            >
              <Text style={styles.registerText}>
                Registrarse
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* QUE HACE:
            Muestra el footer de la aplicación.

            PARA QUE SIRVE:
            Mantener una navegación consistente. */}
        <HomeFooter />
      </View>
    </ImageBackground>
  );
}

// QUE HACE:
// Define todos los estilos visuales.
//
// PARA QUE SIRVE:
// Dar diseño a los componentes de la pantalla.
const styles = StyleSheet.create({
  background: {
    flex: 1,

    backgroundColor: "#000000",
  },

  overlay: {
    flex: 1,
  },


  // QUE HACE:
  // Contenedor interno del ScrollView.
  //
  // PARA QUE SIRVE:
  // Centrar el formulario y permitir
  // desplazamiento vertical.
scrollContent: {
  flexGrow: 1,

  paddingHorizontal: 20,

  paddingTop: 60,

  paddingBottom: 20,
},

  card: {
  backgroundColor: "#000000",

  borderWidth: 1.5,

  borderColor: "#CAA24D",

  borderRadius: 20,

  padding: 25,

  marginBottom: 20,
},

  iconContainer: {
  alignSelf: "center",
  width: 120,
  height: 120,
  borderRadius: 60,
  borderWidth: 2,
  borderColor: "#CAA24D",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 20,
},

  title: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 15,
    marginBottom: 25,
  },

  brand: {
    color: "#CAA24D",
    fontWeight: "700",
  },

  input: {
    height: 55,
    borderWidth: 1,
    borderColor: "#CAA24D",
    borderRadius: 10,
    backgroundColor: "#111111",
    color: "#FFFFFF",
    paddingHorizontal: 15,
    marginBottom: 15,
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

  loginButton: {
    backgroundColor: "#CAA24D",
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },

  loginButtonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "700",
  },

  forgotPassword: {
    color: "#CAA24D",
    textAlign: "center",
    marginTop: 20,
  },

  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },

  separator: {
    flex: 1,
    height: 1,
    backgroundColor: "#333333",
  },

  separatorText: {
    color: "#CAA24D",
    marginHorizontal: 10,
  },

  noAccount: {
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },

  registerText: {
    color: "#CAA24D",
    textAlign: "center",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  optionsRow: {
  flexDirection: "row",

  justifyContent: "space-between",

  alignItems: "center",

  marginTop: 15,

  marginBottom: 20,
},

rememberContainer: {
  flexDirection: "row",

  alignItems: "center",
},

rememberText: {
  color: "#FFFFFF",

  fontSize: 13,

  marginLeft: 8,
  },
});