import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import NeoButton from "@/components/auth/NeoButton";
import NeoHeader from "@/components/NeoHeader";
import ProductCard from "@/components/ProductCard";
import { Neo } from "@/constants/theme";
import { useCommerce } from "@/contexts/CommerceContext";

export default function FavoritosScreen() {
  const { favoritos } = useCommerce();

  if (favoritos.length === 0) {
    return (
      <SafeAreaView style={styles.seguro} edges={["bottom"]}>
        <NeoHeader titulo="Favoritos" mostrarAtras />
        <View style={styles.centro}>
          <MaterialIcons name="favorite-border" size={56} color={Neo.textoTenue} />
          <Text style={styles.centroTitulo}>Sin favoritos aún</Text>
          <Text style={styles.centroTexto}>
            Toca el corazón en un producto para guardarlo aquí.
          </Text>
          <NeoButton title="Ver productos" onPress={() => router.replace("/(tabs)/explore")} style={styles.boton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.seguro} edges={["bottom"]}>
      <NeoHeader titulo="Favoritos" mostrarAtras />
      <FlatList
        data={favoritos}
        keyExtractor={(item) => String(item.id_producto)}
        numColumns={2}
        contentContainerStyle={styles.lista}
        columnWrapperStyle={styles.fila}
        renderItem={({ item }) => (
          <ProductCard
            producto={{
              id_producto: item.id_producto,
              nombre_producto: item.nombre_producto,
              precio_venta_producto: item.precio,
              imagen_url: item.imagen_url,
              stock_estado: "disponible",
            }}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  seguro: {
    flex: 1,
    backgroundColor: Neo.fondo,
  },
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  centroTitulo: {
    color: Neo.texto,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 8,
  },
  centroTexto: {
    color: Neo.textoSuave,
    fontSize: 13.5,
    textAlign: "center",
    lineHeight: 19,
  },
  boton: {
    marginTop: 12,
  },
  lista: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  fila: {
    gap: 10,
  },
});