import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import AuthScreen from "@/components/auth/AuthScreen";
import CodeInput from "@/components/auth/CodeInput";
import FormCard from "@/components/auth/FormCard";
import NeoButton from "@/components/auth/NeoButton";
import NeoLogo from "@/components/auth/NeoLogo";
import { Neo } from "@/constants/theme";
import {
  enmascararCorreo,
  resendVerification,
  verifyEmail,
} from "@/services/auth.services";

const REINTENTO_SEGUNDOS = 60;

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const correo = (email || "").trim();

  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [verificado, setVerificado] = useState(false);
  const [cuenta, setCuenta] = useState(REINTENTO_SEGUNDOS);
  const temporizador = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!correo) {
      router.replace("/login");
      return;
    }
    temporizador.current = setInterval(() => {
      setCuenta((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => {
      if (temporizador.current) clearInterval(temporizador.current);
    };
  }, [correo]);

  const manejarVerificar = async () => {
    setError("");
    if (codigo.length !== 6) {
      setError("Ingresa el código de 6 dígitos.");
      return;
    }
    setVerificando(true);
    try {
      await verifyEmail(codigo);
      setVerificado(true);
    } catch (err: any) {
      setError(err?.friendly ?? "Código inválido o expirado.");
    } finally {
      setVerificando(false);
    }
  };

  const manejarReenvio = async () => {
    if (cuenta > 0 || reenviando) return;
    setError("");
    setReenviando(true);
    try {
      await resendVerification(correo);
      setCuenta(REINTENTO_SEGUNDOS);
    } catch (err: any) {
      setError(err?.friendly ?? "No pudimos reenviar el código. Inténtalo de nuevo.");
    } finally {
      setReenviando(false);
    }
  };

  return (
    <AuthScreen>
      <NeoLogo slogan={false} />
      <FormCard>
        {verificado ? (
          <>
            <Text style={styles.titulo}>¡Cuenta verificada!</Text>
            <Text style={styles.subtitulo}>
              Tu cuenta fue activada correctamente. Ahora puedes iniciar sesión.
            </Text>
            <NeoButton
              title="Iniciar sesión"
              onPress={() => router.replace("/login")}
              style={styles.margenTop}
            />
          </>
        ) : (
          <>
            <Text style={styles.titulo}>Verifica tu correo</Text>
            <Text style={styles.subtitulo}>
              Enviamos un código de 6 dígitos a{" "}
              <Text style={styles.correo}>{enmascararCorreo(correo)}</Text>. Ingrésalo
              para activar tu cuenta.
            </Text>

            <CodeInput
              value={codigo}
              onChange={(c) => {
                setCodigo(c);
                setError("");
              }}
              error={!!error}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <NeoButton
              title="Verificar código"
              onPress={manejarVerificar}
              loading={verificando}
              disabled={codigo.length !== 6}
              style={styles.margenTop}
            />

            <View style={styles.reenvio}>
              <Text style={styles.reenvioTexto}>¿No recibiste el código?</Text>
              {cuenta > 0 ? (
                <Text style={styles.reenvioTemporizador}>
                  Reenviar en {cuenta}s
                </Text>
              ) : (
                <Text
                  style={styles.reenvioEnlace}
                  onPress={manejarReenvio}
                >
                  {reenviando ? "Enviando..." : "Reenviar código"}
                </Text>
              )}
            </View>

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
  correo: {
    color: Neo.oroClaro,
    fontWeight: "600",
  },
  error: {
    color: Neo.error,
    fontSize: 13,
    marginTop: 10,
    lineHeight: 19,
  },
  margenTop: {
    marginTop: 14,
  },
  reenvio: {
    marginTop: 16,
    alignItems: "center",
    gap: 4,
  },
  reenvioTexto: {
    color: Neo.textoSuave,
    fontSize: 13,
  },
  reenvioTemporizador: {
    color: Neo.textoTenue,
    fontSize: 13,
  },
  reenvioEnlace: {
    color: Neo.oroClaro,
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
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