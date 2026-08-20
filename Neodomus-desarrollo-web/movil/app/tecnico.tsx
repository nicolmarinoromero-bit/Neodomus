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

import { Neo } from "@/constants/theme";
import { useSession } from "@/contexts/SessionContext";
import { apiFetch } from "@/services/api";
import NeoButton from "@/components/auth/NeoButton";

type CitaTecnico = {
  id_cita: number;
  fecha: string;
  hora: string;
  estado: string;
  tipo_servicio: string;
  cliente: string;
  direccion: string;
  telefono?: number | null;
  descripcion?: string | null;
  costo_cita?: number | null;
  comision_valor?: number | null;
};

const ESTADOS_ACCION = ["Pendiente", "En camino", "En sitio"];

export default function TecnicoScreen() {
  const { user, isTecnico, isLogged, isAdmin } = useSession();
  const [citas, setCitas] = useState<CitaTecnico[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState("");
  const [actualizandoId, setActualizandoId] = useState<number | null>(null);

  const cargarCitas = useCallback(async (refresh = false) => {
    if (refresh) setRefrescando(true);
    else setCargando(true);
    setError("");
    try {
      const data = (await apiFetch("/tecnicos/mis-citas")) as CitaTecnico[];
      setCitas(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.friendly ?? "No pudimos cargar tus citas.");
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    if (isLogged && isTecnico) cargarCitas();
  }, [isLogged, isTecnico, cargarCitas]);

  const cambiarEstado = async (cita: CitaTecnico, nuevoEstado: string) => {
    setActualizandoId(cita.id_cita);
    setError("");
    try {
      await apiFetch(`/tecnicos/citas/${cita.id_cita}/estado`, {
        method: "PUT",
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      await cargarCitas();
    } catch (err: any) {
      setError(err?.friendly ?? "No pudimos actualizar la cita.");
    } finally {
      setActualizandoId(null);
    }
  };

  const renderItem = ({ item }: { item: CitaTecnico }) => (
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

      <Text style={styles.cliente}>{item.cliente}</Text>
      <Text style={styles.fecha}>
        {item.fecha} a las {item.hora}
      </Text>
      <Text style={styles.direccion}>{item.direccion}</Text>

      {item.costo_cita != null ? (
        <Text style={styles.costo}>
          Valor: ${Number(item.costo_cita).toLocaleString("es-CO")}
        </Text>
      ) : null}

      {ESTADOS_ACCION.includes(item.estado) ? (
        <Pressable
          style={({ pressed }) => [
            styles.botonAccion,
            pressed && styles.botonAccionPresionado,
          ]}
          onPress={() => cambiarEstado(item, "Realizada")}
          disabled={actualizandoId === item.id_cita}
        >
          {actualizandoId === item.id_cita ? (
            <ActivityIndicator size="small" color="#1a140a" />
          ) : (
            <Text style={styles.botonAccionTexto}>Marcar como realizada</Text>
          )}
        </Pressable>
      ) : null}
    </View>
  );

  if (!isLogged) {
    return (
      <SafeAreaView style={styles.seguro} edges={["top"]}>
        <View style={styles.centro}>
          <Text style={styles.titulo}>Área del técnico</Text>
          <Text style={styles.centroTexto}>Inicia sesión para acceder.</Text>
          <NeoButton title="Iniciar sesión" onPress={() => router.push("/login")} style={styles.boton} />
        </View>
      </SafeAreaView>
    );
  }

  if (isAdmin) {
    return (
      <SafeAreaView style={styles.seguro} edges={["top"]}>
        <View style={styles.centro}>
          <Text style={styles.titulo}>Acceso restringido</Text>
          <Text style={styles.centroTexto}>
            Tu cuenta es de administrador. La administración se realiza en la
            plataforma web.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.seguro} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Mis citas asignadas</Text>
        <Text style={styles.subtitulo}>
          {user?.nombre ? `Hola, ${user.nombre}` : "Bienvenido"}
        </Text>
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
              onRefresh={() => cargarCitas(true)}
              tintColor={Neo.oro}
              colors={[Neo.oro]}
            />
          }
          ListEmptyComponent={
            !cargando && !error ? (
              <Text style={styles.sinResultados}>No tienes citas asignadas.</Text>
            ) : null
          }
        />
      )}
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
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
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
  centroTexto: {
    color: Neo.textoSuave,
    fontSize: 14,
    textAlign: "center",
  },
  error: {
    color: Neo.error,
    fontSize: 14,
    textAlign: "center",
  },
  sinResultados: {
    color: Neo.textoSuave,
    textAlign: "center",
    marginTop: 40,
  },
  lista: {
    paddingHorizontal: 14,
    paddingBottom: 24,
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
  cliente: {
    color: Neo.texto,
    fontSize: 15,
    fontWeight: "600",
  },
  fecha: {
    color: Neo.textoSuave,
    fontSize: 13,
    marginTop: 2,
  },
  direccion: {
    color: Neo.textoTenue,
    fontSize: 12,
    marginTop: 2,
  },
  costo: {
    color: Neo.texto,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
  },
  botonAccion: {
    marginTop: 12,
    backgroundColor: Neo.oro,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  botonAccionPresionado: {
    opacity: 0.8,
  },
  botonAccionTexto: {
    color: "#1a140a",
    fontSize: 14,
    fontWeight: "700",
  },
  boton: {
    marginTop: 12,
  },
});