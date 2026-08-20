import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import AuthScreen from "@/components/auth/AuthScreen";
import FormCard from "@/components/auth/FormCard";
import NeoButton from "@/components/auth/NeoButton";
import NeoLogo from "@/components/auth/NeoLogo";
import NeoPasswordInput from "@/components/auth/NeoPasswordInput";
import { Neo } from "@/constants/theme";
import { resetPassword, VALIDAR_PASSWORD } from "@/services/auth.services";

export default function ResetPasswordScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const token = (code || "").trim();

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [completado, setCompletado] = useState(false);

  const manejarRestablecer = async () => {
    setError("");
    const problema = VALIDAR_PASSWORD(password);
    if (problema) {
      setError(problema);
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!token) {
      setError("El código de verificación es inválido. Solicita uno nuevo.");
      return;
    }
    setCargando(true);
    try {
      await resetPassword(token, password);
      setCompletado(true);
    } catch (err: any) {
      setError(err?.friendly ?? "No pudimos restablecer tu contraseña. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <AuthScreen>
      <NeoLogo slogan={false} />
      <FormCard>
        {completado ? (
          <>
            <Text style={styles.titulo}>¡Contraseña actualizada!</Text>
            <Text style={styles.subtitulo}>
              Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesión
              con tu nueva contraseña.
            </Text>
            <NeoButton
              title="Iniciar sesión"
              onPress={() => router.replace("/login")}
              style={styles.margenTop}
            />
          </>
        ) : (
          <>
            <Text style={styles.titulo}>Nueva contraseña</Text>
            <Text style={styles.subtitulo}>
              Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres, incluir
              mayúsculas, minúsculas y números.
            </Text>

            <NeoPasswordInput
              label="Nueva contraseña"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError("");
              }}
              editable={!cargando}
            />
            <NeoPasswordInput
              label="Confirmar contraseña"
              placeholder="Repite tu nueva contraseña"
              value={confirmar}
              onChangeText={(t) => {
                setConfirmar(t);
                setError("");
              }}
              editable={!cargando}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <NeoButton
              title="Actualizar contraseña"
              onPress={manejarRestablecer}
              loading={cargando}
              disabled={!password || !confirmar}
              style={styles.margenTop}
            />

            <Text
              style={styles.enlace}
              onPress={() => router.replace("/login")}
            >
              Volver al inicio de sesión
            </Text>
          </>
        )}
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