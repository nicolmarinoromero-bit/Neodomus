import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import NeoButton from "@/components/auth/NeoButton";
import NeoHeader from "@/components/NeoHeader";
import { resolveMediaUrl } from "@/constants/api";
import { Neo } from "@/constants/theme";
import { apiFetch } from "@/services/api";

type Tecnico = {
  id_tecnico: number;
  first_name: string;
  last_name: string;
  certificacion_t?: string | null;
  cargo_t?: string | null;
  disponible: boolean;
  telefono?: number | null;
  foto_url?: string | null;
  calificacion?: number | null;
};

export default function TecnicosScreen() {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async (refresh = false) => {
    if (refresh) setRefrescando(true);
    else setCargando(true);
    setError("");
    try {
      const data = (await apiFetch("/tecnicos/publicos")) as Tecnico[];
      setTecnicos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.friendly ?? "No pudimos cargar los técnicos.");
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const renderItem = ({ item }: { item: Tecnico }) => {
    const foto = resolveMediaUrl(item.foto_url);
    const nombre = `${item.first_name} ${item.last_name}`.trim();
    return (
      <View style={styles.tarjeta}>
        {foto ? (
          <Image source={{ uri: foto }} style={styles.foto} contentFit="cover" />
        ) : (
          <View style={[styles.foto, styles.fotoVacia]}>
            <Text style={styles.fotoInicial}>{(nombre[0] || "T").toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.nombre}>{nombre}</Text>
          <Text style={styles.especialidad}>
            {item.cargo_t || item.certificacion_t || "Técnico certificado"}
          </Text>
          <View style={styles.detalles}>
            {item.calificacion != null ? (
              <View style={styles.detalle}>
                <MaterialIcons name="star" size={14} color={Neo.oro} />
                <Text style={styles.detalleTexto}>{item.calificacion.toFixed(1)}</Text>
              </View>
            ) : null}
            {item.telefono ? (
              <View style={styles.detalle}>
                <MaterialIcons name="phone" size={14} color={Neo.textoSuave} />
                <Text style={styles.detalleTexto}>{String(item.telefono)}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={[styles.estado, item.disponible ? styles.disponible : styles.ocupado]}>
          <Text style={styles.estadoTexto}>
            {item.disponible ? "Disponible" : "Ocupado"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.seguro} edges={["bottom"]}>
      <NeoHeader />
      <View style={styles.header}>
        <Text style={styles.titulo}>Nuestros técnicos</Text>
        <Text style={styles.subtitulo}>Profesionales certificados de Neodomus</Text>
      </View>

      {cargando && tecnicos.length === 0 ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={Neo.oro} />
        </View>
      ) : error && tecnicos.length === 0 ? (
        <View style={styles.centro}>
          <Text style={styles.error}>{error}</Text>
          <NeoButton title="Reintentar" onPress={() => cargar()} style={styles.botonReintentar} />
        </View>
      ) : (
        <FlatList
          data={tecnicos}
          keyExtractor={(item) => String(item.id_tecnico)}
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
              <Text style={styles.sinResultados}>No hay técnicos disponibles.</Text>
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
  lista: {
    paddingHorizontal: 14,
    paddingBottom: 24,
    gap: 10,
  },
  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Neo.tarjeta,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Neo.tarjetaBordeSuave,
    padding: 12,
    gap: 12,
  },
  foto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Neo.fondoSuave,
  },
  fotoVacia: {
    alignItems: "center",
    justifyContent: "center",
  },
  fotoInicial: {
    color: Neo.oroClaro,
    fontSize: 22,
    fontWeight: "800",
  },
  info: {
    flex: 1,
  },
  nombre: {
    color: Neo.texto,
    fontSize: 15,
    fontWeight: "700",
  },
  especialidad: {
    color: Neo.textoSuave,
    fontSize: 12.5,
    marginTop: 1,
  },
  detalles: {
    flexDirection: "row",
    gap: 14,
    marginTop: 6,
  },
  detalle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detalleTexto: {
    color: Neo.textoTenue,
    fontSize: 12.5,
  },
  estado: {
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  disponible: {
    backgroundColor: "rgba(60,179,113,0.15)",
  },
  ocupado: {
    backgroundColor: "rgba(255,90,110,0.15)",
  },
  estadoTexto: {
    fontSize: 11,
    fontWeight: "700",
    color: Neo.exito,
  },
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
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
  botonReintentar: {
    marginTop: 8,
    alignSelf: "center",
  },
});