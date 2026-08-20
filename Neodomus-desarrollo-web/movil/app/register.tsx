import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import AuthScreen from "@/components/auth/AuthScreen";
import FormCard from "@/components/auth/FormCard";
import NeoButton from "@/components/auth/NeoButton";
import NeoInput from "@/components/auth/NeoInput";
import NeoPasswordInput from "@/components/auth/NeoPasswordInput";
import { Neo } from "@/constants/theme";
import {
  registerClient,
  VALIDAR_EMAIL,
  VALIDAR_PASSWORD,
} from "@/services/auth.services";

const TIPOS_DOCUMENTO = [
  { id: 1, nombre: "CC" },
  { id: 2, nombre: "CE" },
];

export default function RegisterScreen() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState(1);
  const [documento, setDocumento] = useState("");
  const [correo, setCorreo] = useState("");
  const [confirmarCorreo, setConfirmarCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [direccion, setDireccion] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarRegistro = async () => {
    setError("");

    if (!nombre.trim() || !apellido.trim()) {
      setError("Ingresa tu nombre y apellido.");
      return;
    }
    if (nombre.trim().length < 2 || apellido.trim().length < 2) {
      setError("El nombre y el apellido deben tener al menos 2 caracteres.");
      return;
    }
    if (!documento.trim()) {
      setError("Ingresa tu número de documento.");
      return;
    }
    if (!VALIDAR_EMAIL.test(correo.trim())) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }
    if (correo.trim() !== confirmarCorreo.trim()) {
      setError("Los correos electrónicos no coinciden.");
      return;
    }
    if (!/^\d{10}$/.test(telefono.trim())) {
      setError("Ingresa un teléfono válido de 10 dígitos.");
      return;
    }
    if (!ciudad.trim()) {
      setError("Selecciona tu municipio.");
      return;
    }
    if (!direccion.trim()) {
      setError("Ingresa tu dirección.");
      return;
    }
    const problemaPassword = VALIDAR_PASSWORD(password);
    if (problemaPassword) {
      setError(problemaPassword);
      return;
    }
    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!aceptaTerminos) {
      setError("Debes aceptar los términos y condiciones.");
      return;
    }

    setCargando(true);
    try {
      await registerClient({
        first_name: nombre.trim().toUpperCase(),
        last_name: apellido.trim().toUpperCase(),
        id_tipo_documento_c: tipoDocumento,
        documento_cliente: parseInt(documento, 10),
        email: correo.trim().toLowerCase(),
        telefono_cliente: parseInt(telefono, 10),
        city: ciudad.trim(),
        address: direccion.trim(),
        password,
      });
      router.replace({ pathname: "/verify-email", params: { email: correo.trim() } });
    } catch (err: any) {
      setError(err?.friendly ?? "No pudimos crear tu cuenta. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <AuthScreen>
      <FormCard>
        <Text style={styles.titulo}>Crear cuenta</Text>
        <Text style={styles.subtitulo}>
          Regístrate para acceder a los servicios de NEODOMUS.
        </Text>

        <View style={styles.fila}>
          <View style={styles.flex}>
            <NeoInput
              label="Nombre"
              placeholder="Juan"
              autoCapitalize="words"
              value={nombre}
              onChangeText={setNombre}
              editable={!cargando}
            />
          </View>
          <View style={styles.flex}>
            <NeoInput
              label="Apellido"
              placeholder="Pérez"
              autoCapitalize="words"
              value={apellido}
              onChangeText={setApellido}
              editable={!cargando}
            />
          </View>
        </View>

        <Text style={styles.etiqueta}>Tipo de documento</Text>
        <View style={styles.selectorFila}>
          {TIPOS_DOCUMENTO.map((tipo) => {
            const activo = tipoDocumento === tipo.id;
            return (
              <Pressable
                key={tipo.id}
                onPress={() => setTipoDocumento(tipo.id)}
                disabled={cargando}
                style={[styles.selector, activo && styles.selectorActivo]}
              >
                <Text style={[styles.selectorTexto, activo && styles.selectorTextoActivo]}>
                  {tipo.nombre}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <NeoInput
          label="Número de documento"
          placeholder="123456789"
          keyboardType="number-pad"
          value={documento}
          onChangeText={(t) => setDocumento(t.replace(/\D/g, ""))}
          editable={!cargando}
        />
        <NeoInput
          label="Correo electrónico"
          placeholder="tucorreo@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={correo}
          onChangeText={setCorreo}
          editable={!cargando}
        />
        <NeoInput
          label="Confirmar correo electrónico"
          placeholder="tucorreo@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={confirmarCorreo}
          onChangeText={setConfirmarCorreo}
          editable={!cargando}
        />
        <NeoInput
          label="Teléfono"
          placeholder="3000000000"
          keyboardType="phone-pad"
          maxLength={10}
          value={telefono}
          onChangeText={(t) => setTelefono(t.replace(/\D/g, ""))}
          editable={!cargando}
        />
        <NeoInput
          label="Municipio"
          placeholder="Bogotá"
          autoCapitalize="words"
          value={ciudad}
          onChangeText={setCiudad}
          editable={!cargando}
        />
        <NeoInput
          label="Dirección"
          placeholder="Calle 123 # 45-67"
          value={direccion}
          onChangeText={setDireccion}
          editable={!cargando}
        />
        <NeoPasswordInput
          label="Contraseña"
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChangeText={setPassword}
          editable={!cargando}
        />
        <NeoPasswordInput
          label="Confirmar contraseña"
          placeholder="Repite tu contraseña"
          value={confirmarPassword}
          onChangeText={setConfirmarPassword}
          editable={!cargando}
        />

        <Pressable
          style={styles.terminosFila}
          onPress={() => setAceptaTerminos((v) => !v)}
          disabled={cargando}
        >
          <View style={[styles.checkbox, aceptaTerminos && styles.checkboxActivo]}>
            {aceptaTerminos ? <Text style={styles.checkMark}>✓</Text> : null}
          </View>
          <Text style={styles.terminosTexto}>
            Acepto los <Text style={styles.terminosEnlace}>términos y condiciones</Text>.
          </Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <NeoButton
          title="Crear cuenta"
          onPress={manejarRegistro}
          loading={cargando}
          style={styles.margenTop}
        />

        <View style={styles.enlaces}>
          <Text
            style={styles.enlace}
            onPress={() => router.replace("/login")}
          >
            ¿Ya tienes cuenta? Inicia sesión
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
  fila: {
    flexDirection: "row",
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  etiqueta: {
    color: Neo.textoSuave,
    fontSize: 12.5,
    fontWeight: "500",
    marginBottom: 7,
    letterSpacing: 0.4,
  },
  selectorFila: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  selector: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: Neo.inputBorde,
    backgroundColor: Neo.inputFondo,
    alignItems: "center",
  },
  selectorActivo: {
    borderColor: Neo.oro,
    backgroundColor: Neo.rosaSuave,
  },
  selectorTexto: {
    color: Neo.textoSuave,
    fontSize: 14,
    fontWeight: "600",
  },
  selectorTextoActivo: {
    color: Neo.oroClaro,
  },
  terminosFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 2,
    marginBottom: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Neo.oro,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActivo: {
    backgroundColor: Neo.oro,
  },
  checkMark: {
    color: "#1a140a",
    fontSize: 14,
    fontWeight: "800",
  },
  terminosTexto: {
    color: Neo.textoSuave,
    fontSize: 13,
    flex: 1,
  },
  terminosEnlace: {
    color: Neo.oroClaro,
    fontWeight: "600",
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
  enlaces: {
    marginTop: 18,
    alignItems: "center",
  },
  enlace: {
    color: Neo.oroClaro,
    fontSize: 13.5,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});