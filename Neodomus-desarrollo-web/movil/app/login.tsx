import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import AuthScreen from "@/components/auth/AuthScreen";
import FormCard from "@/components/auth/FormCard";
import NeoButton from "@/components/auth/NeoButton";
import NeoInput from "@/components/auth/NeoInput";
import NeoLogo from "@/components/auth/NeoLogo";
import NeoPasswordInput from "@/components/auth/NeoPasswordInput";
import { Neo } from "@/constants/theme";
import { useSession } from "@/contexts/SessionContext";
import {
  esRolAdmin,
  guardarSesion,
  login,
  solicitarHabilitacion,
  VALIDAR_EMAIL,
} from "@/services/auth.services";

export default function LoginScreen() {
  const { login: setSesion } = useSession();
  const { origen } = useLocalSearchParams<{ origen?: string }>();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [inhabilitada, setInhabilitada] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [solicitando, setSolicitando] = useState(false);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);

  const puedeEnviar = correo.trim() !== "" && password !== "" && !cargando;

  const redirigirPorRol = (rol?: string | null) => {
    if (esRolAdmin(rol)) {
      router.replace("/admin-blocked");
    } else if (/tecnic|emplead/i.test(rol ?? "")) {
      router.replace("/tecnico");
    } else {
      router.replace("/(tabs)");
    }
  };

  const manejarLogin = async () => {
    setError("");
    setInhabilitada(false);
    setSolicitudEnviada(false);

    if (!VALIDAR_EMAIL.test(correo.trim())) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }
    if (password.length === 0) {
      setError("Ingresa tu contraseña.");
      return;
    }

    setCargando(true);
    try {
      const data = await login(correo, password);
      const usuario = await guardarSesion(data, correo);
      setSesion(usuario);
      if (origen === "carrito" && usuario.rol && !/tecnic|emplead|admin/i.test(usuario.rol)) {
        router.replace("/carrito");
      } else {
        redirigirPorRol(usuario.rol ?? data.rol);
      }
    } catch (err: any) {
      const mensaje = err?.friendly ?? "No pudimos iniciar sesión. Inténtalo de nuevo.";
      if (/(inhabilitad|deshabilitad|bloquead)/i.test(mensaje)) {
        setInhabilitada(true);
      }
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  const manejarSolicitud = async () => {
    setSolicitando(true);
    setError("");
    setSolicitudEnviada(false);
    try {
      await solicitarHabilitacion(correo.trim(), password);
      setSolicitudEnviada(true);
    } catch (err: any) {
      setError(err?.friendly ?? "No pudimos enviar la solicitud. Inténtalo de nuevo.");
    } finally {
      setSolicitando(false);
    }
  };

  return (
    <AuthScreen>
      <NeoLogo />
      <FormCard>
        <Text style={styles.titulo}>Iniciar sesión</Text>
        <Text style={styles.subtitulo}>
          Accede a tu cuenta para continuar con tus servicios.
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
        <NeoPasswordInput
          label="Contraseña"
          placeholder="Ingresa tu contraseña"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            setError("");
          }}
          editable={!cargando}
          onSubmitEditing={() => puedeEnviar && manejarLogin()}
          returnKeyType="done"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {inhabilitada && !solicitudEnviada && (
          <NeoButton
            title="Enviar solicitud de habilitación"
            variant="fantasma"
            onPress={manejarSolicitud}
            loading={solicitando}
            style={styles.margenTop}
          />
        )}

        {solicitudEnviada && (
          <Text style={styles.exito}>
            Solicitud enviada. Nuestro equipo revisará tu caso y te notificará.
          </Text>
        )}

        <NeoButton
          title="Iniciar sesión"
          onPress={manejarLogin}
          loading={cargando}
          disabled={!puedeEnviar}
          style={styles.margenTop}
        />

        <View style={styles.enlaces}>
          <Text
            style={styles.enlace}
            onPress={() => router.push("/forgot-password")}
          >
            ¿Olvidaste tu contraseña?
          </Text>
          <Text
            style={styles.enlace}
            onPress={() => router.push("/register")}
          >
            ¿No tienes cuenta? Regístrate
          </Text>
        </View>
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
    marginTop: 12,
    lineHeight: 19,
  },
  margenTop: {
    marginTop: 12,
  },
  enlaces: {
    marginTop: 18,
    alignItems: "center",
    gap: 10,
  },
  enlace: {
    color: Neo.oroClaro,
    fontSize: 13.5,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});