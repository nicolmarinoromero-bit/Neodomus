import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import NeoButton from "@/components/auth/NeoButton";
import NeoHeader from "@/components/NeoHeader";
import { Neo } from "@/constants/theme";
import { useSession } from "@/contexts/SessionContext";
import { apiFetch } from "@/services/api";

type CitaCliente = {
  id_cita: number;
  tipo_servicio: string;
  fecha: string;
  hora: string;
  estado: string;
  direccion: string;
  descripcion?: string | null;
  costo_cita?: number | null;
  tecnico_nombre?: string | null;
  nombre_tecnico?: string | null;
};

const formatearPrecio = (valor: number) =>
  `$${Number(valor || 0).toLocaleString("es-CO")}`;

export default function CitasScreen() {
  const { isLogged } = useSession();
  const [citas, setCitas] = useState<CitaCliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async (refresh = false) => {
    if (refresh) setRefrescando(true);
    else setCargando(true);
    setError("");
    try {
      const data = (await apiFetch("/citas/mis-citas")) as CitaCliente[];
      setCitas(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.friendly ?? "No pudimos cargar tus citas.");
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    if (isLogged) cargar();
  }, [isLogged, cargar]);

  const cancelarCita = async (idCita: number) => {
    setError("");
    try {
      await apiFetch(`/citas/${idCita}`, { method: "DELETE" });
      await cargar();
    } catch (err: any) {
      setError(err?.friendly ?? "No pudimos cancelar la cita.");
    }
  };

  if (!isLogged) {
    return (
      <SafeAreaView style={styles.seguro} edges={["bottom"]}>
        <NeoHeader />
        <View style={styles.centro}>
          <Text style={styles.titulo}>Citas</Text>
          <Text style={styles.centroTexto}>Inicia sesión para gestionar tus citas.</Text>
          <NeoButton title="Iniciar sesión" onPress={() => router.push("/login")} style={styles.boton} />
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: CitaCliente }) => (
    <View style={styles.tarjeta}>
      <View style={styles.filaHeader}>
        <Text style={styles.servicio}>{item.tipo_servicio}</Text>
        <Text
          style={[
            styles.estado,
            item.estado === "Realizada" && styles.estadoRealizada,
            item.estado === "Cancelada" && styles.estadoCancelada,
          ]}
        >
          {item.estado}
        </Text>
      </View>
      <Text style={styles.fecha}>
        {item.fecha} a las {item.hora}
      </Text>
      <Text style={styles.tecnico}>
        {item.tecnico_nombre || item.nombre_tecnico || "Técnico asignado"}
      </Text>
      <Text style={styles.direccion}>{item.direccion}</Text>
      {item.costo_cita != null ? (
        <Text style={styles.costo}>{formatearPrecio(item.costo_cita)}</Text>
      ) : null}
      {["Pendiente", "Confirmada"].includes(item.estado) ? (
        <Pressable
          style={({ pressed }) => [styles.botonCancelar, pressed && styles.presionado]}
          onPress={() => cancelarCita(item.id_cita)}
        >
          <Text style={styles.botonCancelarTexto}>Cancelar cita</Text>
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.seguro} edges={["bottom"]}>
      <NeoHeader />
      <View style={styles.header}>
        <Text style={styles.titulo}>Mis citas</Text>
        <Text style={styles.subtitulo}>Servicios técnicos agendados</Text>
      </View>

      {cargando && citas.length === 0 ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={Neo.oro} />
        </View>
      ) : error && citas.length === 0 ? (
        <View style={styles.centro}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={citas}
          keyExtractor={(item) => String(item.id_cita)}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={() => cargar(true)}
              tintColor={Neo.oro}
              colors={[Neo.oro]}
            />
          }
          ListEmptyComponent={
            !cargando && !error ? (
              <View style={styles.centro}>
                <Text style={styles.centroTexto}>Aún no tienes citas agendadas.</Text>
              </View>
            ) : null
          }
        />
      )}

      <View style={styles.pie}>
        {error && citas.length > 0 ? <Text style={styles.error}>{error}</Text> : null}
        <NeoButton title="Agendar cita" onPress={() => router.push("/nueva-cita")} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  seguro: {
    flex: 1,
    backgroundColor: Neo.fondo,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  titulo: {
    color: Neo.texto,
    fontSize: 24,
    fontWeight: "800",
  },
  subtitulo: {
    color: Neo.textoSuave,
    fontSize: 13,
    marginTop: 2,
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
  error: {
    color: Neo.error,
    fontSize: 13,
    textAlign: "center",
  },
  lista: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    gap: 10,
  },
  tarjeta: {
    backgroundColor: Neo.tarjeta,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Neo.tarjetaBordeSuave,
    padding: 14,
  },
  filaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  servicio: {
    color: Neo.oroClaro,
    fontSize: 15,
    fontWeight: "700",
    flexShrink: 1,
  },
  estado: {
    color: Neo.oro,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  estadoRealizada: {
    color: Neo.exito,
  },
  estadoCancelada: {
    color: Neo.error,
  },
  fecha: {
    color: Neo.texto,
    fontSize: 14,
    fontWeight: "600",
  },
  tecnico: {
    color: Neo.textoSuave,
    fontSize: 13,
    marginTop: 2,
  },
  direccion: {
    color: Neo.textoTenue,
    fontSize: 12.5,
    marginTop: 2,
  },
  costo: {
    color: Neo.texto,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 6,
  },
  botonCancelar: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: Neo.error,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: "center",
  },
  botonCancelarTexto: {
    color: Neo.error,
    fontSize: 13,
    fontWeight: "700",
  },
  presionado: {
    opacity: 0.8,
  },
  pie: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: Neo.tarjetaBordeSuave,
    gap: 8,
  },
  boton: {
    marginTop: 12,
  },
});