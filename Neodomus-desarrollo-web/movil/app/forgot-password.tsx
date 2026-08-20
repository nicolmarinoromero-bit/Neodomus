import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { router } from "expo-router";

import AuthScreen from "@/components/auth/AuthScreen";
import FormCard from "@/components/auth/FormCard";
import NeoButton from "@/components/auth/NeoButton";
import NeoInput from "@/components/auth/NeoInput";
import NeoLogo from "@/components/auth/NeoLogo";
import { Neo } from "@/constants/theme";
import { forgotPassword, VALIDAR_EMAIL } from "@/services/auth.services";

export default function ForgotPasswordScreen() {
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarEnviar = async () => {
    setError("");
    setExito("");
    if (!VALIDAR_EMAIL.test(correo.trim())) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }
    setCargando(true);
    try {
      await forgotPassword(correo);
      setExito("Si el correo está registrado, recibirás un código de recuperación.");
      router.replace({ pathname: "/verify-code", params: { email: correo.trim() } });
    } catch (err: any) {
      setError(err?.friendly ?? "No pudimos enviar el código. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <AuthScreen>
      <NeoLogo slogan={false} />
      <FormCard>
        <Text style={styles.titulo}>Recuperar contraseña</Text>
        <Text style={styles.subtitulo}>
          Ingresa el correo de tu cuenta y te enviaremos un código para restablecer
          tu contraseña.
        </Text>

        <NeoInput
          label="Correo electrónico"
          placeholder="tucorreo@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={correo}
          onChangeText={(t) => {
            setCorreo(t);
            setError("");
          }}
          editable={!cargando}
        />

        {exito ? <Text style={styles.exito}>{exito}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <NeoButton
          title="Enviar código"
          onPress={manejarEnviar}
          loading={cargando}
          disabled={!correo.trim()}
          style={styles.margenTop}
        />

        <Text
          style={styles.enlace}
          onPress={() => router.replace("/login")}
        >
          Volver al inicio de sesión
        </Text>
      </FormCard>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  titulo: {
    color: Neo.texto,
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitulo: {
    color: Neo.textoSuave,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 18,
  },
  error: {
    color: Neo.error,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 19,
  },
  exito: {
    color: Neo.exito,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 19,
  },
  margenTop: {
    marginTop: 12,
  },
  enlace: {
    color: Neo.oroClaro,
    fontSize: 13.5,
    fontWeight: "600",
    textDecorationLine: "underline",
    textAlign: "center",
    marginTop: 18,
  },
});