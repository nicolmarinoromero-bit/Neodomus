// app/auth/register.tsx

// ======================================================
// QUE HACE:
// Pantalla de registro de usuarios NeoDomus.
//
// PARA QUE SIRVE:
// Permite registrar nuevos usuarios validando:
// - Datos personales
// - Correo
// - Contraseña
// - Aceptación de políticas
// ======================================================

// QUE HACE:
// Importa el router de Expo Router.
//
// PARA QUE SIRVE:
// Permite navegar entre pantallas.

import React, { useMemo, useState } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HomeHeader from "@/components/layout/HomeHeader";
import HomeFooter from "@/components/layout/HomeFooter";
// QUE HACE:
// Importa el componente Picker.
//
// PARA QUE SIRVE:
// Mostrar listas desplegables para seleccionar opciones.
import { Picker } from "@react-native-picker/picker";

export default function RegisterScreen() {
  // ======================================================
  // QUE HACE:
  // Estados de los campos.
  //
  // PARA QUE SIRVE:
  // Almacenar la información ingresada por el usuario.
  // ======================================================

  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [documento, setDocumento] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [confirmCorreo, setConfirmCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptCookies, setAcceptCookies] = useState(false);

  // ======================================================
  // VALIDACIONES CONTRASEÑA
  // ======================================================

  const validations = useMemo(
    () => ({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password]
  );

  // ======================================================
  // HABILITAR BOTÓN REGISTRO
  // ======================================================

  const canRegister =
    acceptTerms &&
    acceptPrivacy &&
    acceptCookies &&
    nombres &&
    apellidos &&
    documento &&
    ciudad &&
    municipio &&
    direccion &&
    telefono &&
    correo &&
    confirmCorreo &&
    password &&
    confirmPassword;

  // ======================================================
  // CHECKBOX PERSONALIZADO
  // ======================================================

  const Checkbox = ({
    value,
    onPress,
  }: {
    value: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.checkbox, value && styles.checkboxActive]}
      onPress={onPress}
    >
      {value && <Ionicons name="checkmark" size={14} color="#000" />}
    </TouchableOpacity>
  );

  const ValidationItem = ({
    valid,
    label,
  }: {
    valid: boolean;
    label: string;
  }) => (
    <Text style={[styles.validationText, valid && styles.validationSuccess]}>
      {valid ? "✓" : "✕"} {label}
    </Text>
  );

  return (
    <View style={styles.container}>
      <HomeHeader />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* ÍCONO */}
          <View style={styles.iconContainer}>
            <Ionicons name="person-outline" size={40} color="#D4AF37" />
          </View>

          {/* TÍTULO */}
          <Text style={styles.title}>Crear cuenta</Text>

          {/* FORMULARIO */}
          <View style={styles.formGrid}>
            {/* NOMBRES */}
            <View style={styles.field}>
              <Text style={styles.label}>Nombres</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresa tus nombres"
                placeholderTextColor="#777"
                value={nombres}
                onChangeText={setNombres}
              />
            </View>

            {/* APELLIDOS */}
            <View style={styles.field}>
              <Text style={styles.label}>Apellidos</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresa tus apellidos"
                placeholderTextColor="#777"
                value={apellidos}
                onChangeText={setApellidos}
              />
            </View>

            {/* TIPO DOC */}

{/* QUE HACE:
    Muestra una lista desplegable de tipos de documento.

    PARA QUE SIRVE:
    Permite seleccionar un tipo de documento válido.
*/}
<View style={styles.field}>
  <Text style={styles.label}>Tipo documento</Text>

<TouchableOpacity
  style={styles.input}
  onPress={() => setTipoDocumento("CC")}
>
  <Text
    style={{
      color: tipoDocumento ? "#FFF" : "#777",
      marginTop: 13,
      marginLeft: 12,
    }}
  >
    {tipoDocumento ||"Seleccionar CC"}
  </Text>
</TouchableOpacity>
</View>

            {/* DOCUMENTO */}
            <View style={styles.field}>
              <Text style={styles.label}>Documento</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu número de documento"
                placeholderTextColor="#777"
                value={documento}
                onChangeText={setDocumento}
              />
            </View>

            {/* CIUDAD */}

{/* QUE HACE:
    Campo seleccionable para la ciudad.
    PARA QUE SIRVE:
    Permite seleccionar Bogotá y mantiene
    el mismo diseño visual de los demás campos.
*/}
<View style={styles.field}>
  <Text style={styles.label}>Ciudad</Text>

  <TouchableOpacity
    style={styles.input}
    onPress={() => setCiudad("Bogotá")}
  >
    <Text
      style={{
        color: ciudad ? "#FFF" : "#777",
        marginTop: 13,
        marginLeft: 12,
      }}
    >
      {ciudad ||"Seleccionar Bogotá"}
    </Text>
  </TouchableOpacity>
</View>

            {/* MUNICIPIO */}

{/* QUE HACE:
    Campo seleccionable para el municipio.

    PARA QUE SIRVE:
    Permite seleccionar Bogotá y mantiene
    el mismo diseño visual de los demás campos.
*/}
<View style={styles.field}>
  <Text style={styles.label}>Municipio</Text>

  <TouchableOpacity
    style={styles.input}
    onPress={() => setMunicipio("Distrito Capital")}
  >
    <Text
      style={{
        color: municipio ? "#FFF" : "#777",
        marginTop: 13,
        marginLeft: 12,
      }}
    >
      {municipio ||"Seleccionar Distrito Capital"}
    </Text>
  </TouchableOpacity>
</View>

            {/* DIRECCIÓN */}
            <View style={styles.field}>
              <Text style={styles.label}>Dirección</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu dirección"
                placeholderTextColor="#777"
                value={direccion}
                onChangeText={setDireccion}
              />
            </View>

            {/* TELÉFONO */}
            <View style={styles.field}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu número telefónico"
                placeholderTextColor="#777"
                value={telefono}
                onChangeText={setTelefono}
              />
            </View>

            {/* CORREO */}
            <View style={styles.field}>
              <Text style={styles.label}>Correo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu correo"
                placeholderTextColor="#777"
                value={correo}
                onChangeText={setCorreo}
              />
            </View>

            {/* CONFIRMAR CORREO */}
            <View style={styles.field}>
              <Text style={styles.label}>Confirmación correo</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirma tu correo"
                placeholderTextColor="#777"
                value={confirmCorreo}
                onChangeText={setConfirmCorreo}
              />
            </View>

            {/* PASSWORD */}
            <View style={styles.field}>
              <Text style={styles.label}>Contraseña</Text>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Ingresa tu contraseña"
                  placeholderTextColor="#777"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />

                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off"}
                    size={22}
                    color="#D4AF37"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* CONFIRM PASSWORD */}
            <View style={styles.field}>
              <Text style={styles.label}>Confirmar contraseña</Text>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirma tu contraseña"
                  placeholderTextColor="#777"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  <Ionicons
                    name={
                      showConfirmPassword
                        ? "eye-outline"
                        : "eye-off"
                    }
                    size={22}
                    color="#D4AF37"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* VALIDACIONES */}
          <View style={styles.validationBox}>
            <ValidationItem
              valid={validations.length}
              label="8 caracteres"
            />
            <ValidationItem
              valid={validations.uppercase}
              label="Una mayúscula"
            />
            <ValidationItem
              valid={validations.lowercase}
              label="Una minúscula"
            />
            <ValidationItem
              valid={validations.number}
              label="Un número"
            />
            <ValidationItem
              valid={validations.special}
              label="Carácter especial"
            />
          </View>

          {/* CHECKBOXES */}
          <View style={styles.checkboxRow}>
            <Checkbox
              value={acceptTerms}
              onPress={() => setAcceptTerms(!acceptTerms)}
            />
            <Text style={styles.checkboxText}>
              Acepto los Términos de uso
            </Text>
          </View>

          <View style={styles.checkboxRow}>
            <Checkbox
              value={acceptPrivacy}
              onPress={() => setAcceptPrivacy(!acceptPrivacy)}
            />
            <Text style={styles.checkboxText}>
              Acepto la Política de privacidad
            </Text>
          </View>

          <View style={styles.checkboxRow}>
            <Checkbox
              value={acceptCookies}
              onPress={() => setAcceptCookies(!acceptCookies)}
            />
            <Text style={styles.checkboxText}>
              Acepto la Política de cookies
            </Text>
          </View>

          {/* BOTÓN */}
        <TouchableOpacity
            disabled={!canRegister}
            onPress={() => router.push("/auth/verify-email")}
            style={[
            styles.registerButton,
            !canRegister && styles.disabledButton,
            ]}
          >
          <Text style={styles.registerButtonText}>
            Registrarse
          </Text>
        </TouchableOpacity>

          <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            ¿Ya tienes una cuenta?
          </Text>

  {/* ======================================================
    QUE HACE:
    Botón para iniciar sesión.

    PARA QUE SIRVE:
    Redirigir al usuario a la pantalla de login.
====================================================== */}

<TouchableOpacity
  onPress={() => router.push("/auth/login")}

>
    <Text style={styles.loginLink}>
      Iniciar sesión
    </Text>
  </TouchableOpacity>
</View>
        </View>
      </ScrollView>

      <HomeFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  scrollContent: {
    padding: 20,
    alignItems: "center",
  },

  card: {
    width: "100%",
    maxWidth: 900,
    backgroundColor: "#050505",
    borderWidth: 2,
    borderColor: "#D4AF37",
    borderRadius: 18,
    padding: 20,
  },

  iconContainer: {
    alignSelf: "center",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  title: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 25,
  },

  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  field: {
    width: "48%",
    marginBottom: 15,
  },

  label: {
    color: "#FFF",
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#0D0D0D",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 8,
    color: "#FFF",
    paddingHorizontal: 12,
    height: 48,
  },

  passwordContainer: {
    backgroundColor: "#0D0D0D",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
  },

  passwordInput: {
    flex: 1,
    color: "#FFF",
  },

  validationBox: {
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    marginBottom: 20,
  },

  validationText: {
    color: "#FF6B6B",
    marginBottom: 4,
    fontSize: 13,
  },

  validationSuccess: {
    color: "#4ADE80",
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#D4AF37",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  checkboxActive: {
    backgroundColor: "#D4AF37",
  },

  checkboxText: {
    color: "#FFF",
    fontSize: 13,
  },

  registerButton: {
    backgroundColor: "#D4AF37",
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },

  disabledButton: {
    opacity: 0.4,
  },

  registerButtonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },

  loginContainer: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginTop: 20,
},

loginText: {
  color: "#FFFFFF",
  fontSize: 16,
},

loginLink: {
  color: "#D4AF37",
  fontSize: 16,
  fontWeight: "700",
  marginLeft: 5,
  },
pickerContainer: {
  backgroundColor: "#0D0D0D",
  borderWidth: 1,
  borderColor: "#222",
  borderRadius: 8,
  height: 60,
},
picker: {
  color: "#D4AF37",
  height: 60,
},
});