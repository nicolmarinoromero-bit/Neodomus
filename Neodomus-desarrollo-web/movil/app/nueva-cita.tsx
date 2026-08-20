import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import NeoButton from "@/components/auth/NeoButton";
import NeoHeader from "@/components/NeoHeader";
import { Neo } from "@/constants/theme";
import { apiFetch } from "@/services/api";

type Tecnico = {
  id_tecnico: number;
  first_name: string;
  last_name: string;
  certificacion_t?: string | null;
  cargo_t?: string | null;
  calificacion?: number | null;
};

type Tarifa = {
  tipo_servicio: string;
  costo: number;
  descripcion: string;
};

const formatearPrecio = (valor: number) =>
  `$${Number(valor || 0).toLocaleString("es-CO")}`;

export default function NuevaCitaScreen() {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [metodos, setMetodos] = useState<Record<string, string>>({});
  const [horas, setHoras] = useState<string[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  const [idTecnico, setIdTecnico] = useState<number | null>(null);
  const [tipoServicio, setTipoServicio] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [direccion, setDireccion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [metodoPago, setMetodoPago] = useState("");

  const [cargandoHoras, setCargandoHoras] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  const cargarDatos = useCallback(async () => {
    setCargandoDatos(true);
    setError("");
    try {
      const [tec, tar, met] = await Promise.all([
        apiFetch("/tecnicos/publicos"),
        apiFetch("/tarifas"),
        apiFetch("/pedidos/metodos-pago"),
      ]);
      setTecnicos(Array.isArray(tec) ? tec : []);
      setTarifas(Array.isArray(tar) ? tar : []);
      setMetodos(met?.metodos ?? {});
    } catch (err: any) {
      setError(err?.friendly ?? "No pudimos cargar la información necesaria.");
    } finally {
      setCargandoDatos(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const cargarHoras = useCallback(async (fechaSel: string) => {
    setCargandoHoras(true);
    setHora("");
    setError("");
    try {
      const data = (await apiFetch(
        `/citas/horas-disponibles?fecha=${encodeURIComponent(fechaSel)}`
      )) as string[];
      setHoras(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setHoras([]);
      setError(err?.friendly ?? "No pudimos consultar las horas disponibles.");
    } finally {
      setCargandoHoras(false);
    }
  }, []);

  const puedeEnviar =
    idTecnico != null && tipoServicio && fecha && hora && direccion.trim() && metodoPago && !enviando;

  const manejarEnvio = async () => {
    setError("");
    setExito(false);
    if (!puedeEnviar) {
      setError("Completa el técnico, servicio, fecha, hora, dirección y método de pago.");
      return;
    }
    setEnviando(true);
    try {
      await apiFetch("/citas", {
        method: "POST",
        body: JSON.stringify({
          id_tecnico: idTecnico,
          tipo_servicio: tipoServicio,
          fecha,
          hora,
          direccion: direccion.trim(),
          descripcion: descripcion.trim() || null,
          metodo_pago: metodoPago,
        }),
      });
      setExito(true);
    } catch (err: any) {
      setError(err?.friendly ?? "No pudimos agendar la cita. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (exito) {
    return (
      <SafeAreaView style={styles.seguro} edges={["bottom"]}>
        <NeoHeader mostrarAtras />
        <View style={styles.centro}>
          <Text style={styles.titulo}>¡Cita agendada!</Text>
          <Text style={styles.centroTexto}>
            Tu cita fue registrada correctamente. Puedes verla en la pestaña Citas.
          </Text>
          <NeoButton
            title="Ver mis citas"
            onPress={() => router.replace("/(tabs)/citas")}
            style={styles.boton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.seguro} edges={["bottom"]}>
      <NeoHeader titulo="Agendar cita" mostrarAtras />
      <ScrollView contentContainerStyle={styles.contenido}>
        {cargandoDatos ? (
          <View style={styles.centro}>
            <ActivityIndicator size="large" color={Neo.oro} />
          </View>
        ) : (
          <>
            <Text style={styles.tituloSeccion}>1. Técnico</Text>
            <View style={styles.chips}>
              {tecnicos.map((t) => {
                const activo = idTecnico === t.id_tecnico;
                return (
                  <Pressable
                    key={t.id_tecnico}
                    style={[styles.chip, activo && styles.chipActivo]}
                    onPress={() => setIdTecnico(t.id_tecnico)}
                  >
                    <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>
                      {t.first_name} {t.last_name}
                      {t.calificacion != null ? ` (${t.calificacion.toFixed(1)}★)` : ""}
                    </Text>
                  </Pressable>
                );
              })}
              {tecnicos.length === 0 ? (
                <Text style={styles.sinDatos}>No hay técnicos disponibles.</Text>
              ) : null}
            </View>

            <Text style={styles.tituloSeccion}>2. Servicio</Text>
            <View style={styles.chips}>
              {tarifas.map((t) => {
                const activo = tipoServicio === t.tipo_servicio;
                return (
                  <Pressable
                    key={t.tipo_servicio}
                    style={[styles.chip, activo && styles.chipActivo]}
                    onPress={() => setTipoServicio(t.tipo_servicio)}
                  >
                    <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>
                      {t.tipo_servicio} · {formatearPrecio(t.costo)}
                    </Text>
                  </Pressable>
                );
              })}
              {tarifas.length === 0 ? (
                <Text style={styles.sinDatos}>No hay servicios disponibles.</Text>
              ) : null}
            </View>

            <Text style={styles.tituloSeccion}>3. Fecha y hora</Text>
            <Text style={styles.etiqueta}>Fecha (AAAA-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={fecha}
              onChangeText={(t) => {
                setFecha(t);
                setHora("");
                if (/^\d{4}-\d{2}-\d{2}$/.test(t)) cargarHoras(t);
              }}
              placeholder="2026-09-01"
              placeholderTextColor={Neo.textoTenue}
              autoCapitalize="none"
            />
            {cargandoHoras ? (
              <ActivityIndicator size="small" color={Neo.oro} style={styles.cargando} />
            ) : horas.length > 0 ? (
              <View style={styles.chips}>
                {horas.map((h) => {
                  const activo = hora === h;
                  return (
                    <Pressable
                      key={h}
                      style={[styles.chip, activo && styles.chipActivo]}
                      onPress={() => setHora(h)}
                    >
                      <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>{h}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            <Text style={styles.tituloSeccion}>4. Ubicación</Text>
            <Text style={styles.etiqueta}>Dirección</Text>
            <TextInput
              style={styles.input}
              value={direccion}
              onChangeText={setDireccion}
              placeholder="Calle, número, barrio, ciudad..."
              placeholderTextColor={Neo.textoTenue}
            />
            <Text style={styles.etiqueta}>Descripción (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Describe el problema, la instalación o el mantenimiento requerido..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={Neo.textoTenue}
            />

            <Text style={styles.tituloSeccion}>5. Método de pago</Text>
            <View style={styles.chips}>
              {Object.entries(metodos).map(([codigo, etiqueta]) => {
                const activo = metodoPago === codigo;
                return (
                  <Pressable
                    key={codigo}
                    style={[styles.chip, activo && styles.chipActivo]}
                    onPress={() => setMetodoPago(codigo)}
                  >
                    <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>
                      {etiqueta}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <NeoButton
              title="Confirmar cita"
              onPress={manejarEnvio}
              loading={enviando}
              disabled={!puedeEnviar}
              style={styles.boton}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  seguro: {
    flex: 1,
    backgroundColor: Neo.fondo,
  },
  contenido: {
    padding: 16,
    paddingBottom: 32,
  },
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  centroTexto: {
    color: Neo.textoSuave,
    fontSize: 14,
    textAlign: "center",
  },
  titulo: {
    color: Neo.texto,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  tituloSeccion: {
    color: Neo.oroClaro,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 8,
  },
  etiqueta: {
    color: Neo.textoSuave,
    fontSize: 12.5,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: Neo.inputFondo,
    borderWidth: 1,
    borderColor: Neo.inputBorde,
    borderRadius: 12,
    color: Neo.texto,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 10,
  },
  textArea: {
    minHeight: 90,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: Neo.inputBorde,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: Neo.inputFondo,
  },
  chipActivo: {
    borderColor: Neo.oro,
    backgroundColor: Neo.rosaSuave,
  },
  chipTexto: {
    color: Neo.textoSuave,
    fontSize: 12.5,
    fontWeight: "600",
  },
  chipTextoActivo: {
    color: Neo.oroClaro,
  },
  sinDatos: {
    color: Neo.textoTenue,
    fontSize: 13,
  },
  cargando: {
    marginVertical: 10,
  },
  error: {
    color: Neo.error,
    fontSize: 13,
    marginTop: 12,
    lineHeight: 19,
  },
  boton: {
    marginTop: 16,
  },
});