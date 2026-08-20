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
import ProductCard, { ProductoCardData } from "@/components/ProductCard";
import { Neo } from "@/constants/theme";
import { apiFetch } from "@/services/api";

type ProductoResponse = ProductoCardData & {
  id_categoria?: number;
  nombre_categoria?: string | null;
  stock_producto?: number;
  descripcion_producto?: string | null;
  variantes?: { id: number; nombre: string; imagen_url?: string | null }[];
};

export default function CatalogoScreen() {
  const [productos, setProductos] = useState<ProductoResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const cargar = useCallback(async (pag: number, refresh = false) => {
    if (refresh) setRefrescando(true);
    else if (pag === 1) setCargando(true);
    setError("");
    try {
      const res = await apiFetch(`/productos/?page=${pag}&limit=20`);
      const lista = (res?.data ?? []) as ProductoResponse[];
      setProductos((prev) => (pag === 1 ? lista : [...prev, ...lista]));
      setTotalPaginas(res?.total_pages ?? 1);
      setPagina(pag);
    } catch (err: any) {
      setError(err?.friendly ?? "No pudimos cargar los productos.");
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    cargar(1);
  }, [cargar]);

  const cargarMas = () => {
    if (pagina < totalPaginas && !cargando) cargar(pagina + 1);
  };

  return (
    <SafeAreaView style={styles.seguro} edges={["bottom"]}>
      <NeoHeader />
      <View style={styles.header}>
        <Text style={styles.titulo}>Catálogo de productos</Text>
        <Text style={styles.subtitulo}>Tecnología para tu hogar</Text>
      </View>

      {cargando && productos.length === 0 ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={Neo.oro} />
          <Text style={styles.centroTexto}>Cargando productos...</Text>
        </View>
      ) : error && productos.length === 0 ? (
        <View style={styles.centro}>
          <Text style={styles.error}>{error}</Text>
          <NeoButton title="Reintentar" onPress={() => cargar(1)} style={styles.botonReintentar} />
        </View>
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(item) => String(item.id_producto)}
          renderItem={({ item }) => <ProductCard producto={item} />}
          numColumns={2}
          contentContainerStyle={styles.lista}
          columnWrapperStyle={styles.fila}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={() => cargar(1, true)}
              tintColor={Neo.oro}
              colors={[Neo.oro]}
            />
          }
          onEndReached={cargarMas}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            pagina < totalPaginas ? (
              <ActivityIndicator style={styles.pieCarga} color={Neo.oro} />
            ) : null
          }
          ListEmptyComponent={
            !cargando && !error ? (
              <Text style={styles.sinResultados}>No hay productos disponibles.</Text>
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
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  fila: {
    gap: 10,
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
  pieCarga: {
    marginVertical: 16,
  },
});