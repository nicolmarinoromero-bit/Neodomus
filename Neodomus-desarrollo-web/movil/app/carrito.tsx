import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Image } from "expo-image";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import NeoButton from "@/components/auth/NeoButton";
import NeoHeader from "@/components/NeoHeader";
import { imagenProducto } from "@/constants/product-images";
import { Neo } from "@/constants/theme";
import { useCommerce } from "@/contexts/CommerceContext";
import { useSession } from "@/contexts/SessionContext";

const formatearPrecio = (valor: number) =>
  `$${Number(valor || 0).toLocaleString("es-CO")}`;

export default function CarritoScreen() {
  const { carrito, cambiarCantidad, quitarDelCarrito, subtotal } = useCommerce();
  const { isLogged } = useSession();

  const irAlPago = () => {
    if (isLogged) {
      router.push("/checkout");
    } else {
      router.push("/login?origen=carrito");
    }
  };

  if (carrito.length === 0) {
    return (
      <SafeAreaView style={styles.seguro} edges={["bottom"]}>
        <NeoHeader titulo="Carrito" mostrarAtras />
        <View style={styles.centro}>
          <MaterialIcons name="remove-shopping-cart" size={56} color={Neo.textoTenue} />
          <Text style={styles.centroTitulo}>Tu carrito está vacío</Text>
          <Text style={styles.centroTexto}>
            Explora el catálogo y agrega productos para tu hogar.
          </Text>
          <NeoButton title="Ver productos" onPress={() => router.replace("/(tabs)/explore")} style={styles.boton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.seguro} edges={["bottom"]}>
      <NeoHeader titulo="Carrito" mostrarAtras />
      <FlatList
        data={carrito}
        keyExtractor={(item) => String(item.id_producto)}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => {
          const fuente = imagenProducto({
            id_producto: item.id_producto,
            nombre_producto: item.nombre_producto,
            imagen_url: item.imagen_url,
          });
          return (
            <View style={styles.tarjeta}>
              {fuente ? (
                <Image source={fuente} style={styles.imagen} contentFit="cover" />
              ) : (
                <View style={[styles.imagen, styles.imagenVacia]} />
              )}
              <View style={styles.info}>
                <Text style={styles.nombre} numberOfLines={2}>
                  {item.nombre_producto}
                </Text>
                <Text style={styles.precio}>{formatearPrecio(item.precio)}</Text>
                <View style={styles.controles}>
                  <View style={styles.cantidadBox}>
                    <Pressable
                      style={styles.botonCantidad}
                      hitSlop={4}
                      onPress={() => cambiarCantidad(item.id_producto, item.cantidad - 1)}
                    >
                      <MaterialIcons name="remove" size={18} color={Neo.oroClaro} />
                    </Pressable>
                    <Text style={styles.cantidad}>{item.cantidad}</Text>
                    <Pressable
                      style={styles.botonCantidad}
                      hitSlop={4}
                      onPress={() => cambiarCantidad(item.id_producto, item.cantidad + 1)}
                    >
                      <MaterialIcons name="add" size={18} color={Neo.oroClaro} />
                    </Pressable>
                  </View>
                  <Pressable
                    style={styles.botonQuitar}
                    hitSlop={6}
                    onPress={() => quitarDelCarrito(item.id_producto)}
                  >
                    <MaterialIcons name="delete-outline" size={20} color={Neo.error} />
                  </Pressable>
                </View>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.pie}>
        <View style={styles.filaTotal}>
          <Text style={styles.totalEtiqueta}>Subtotal</Text>
          <Text style={styles.totalValor}>{formatearPrecio(subtotal)}</Text>
        </View>
        <NeoButton title={isLogged ? "Continuar al pago" : "Iniciar sesión y continuar"} onPress={irAlPago} />
        {!isLogged ? (
          <Text style={styles.nota}>
            Necesitas iniciar sesión para confirmar tu pedido. Tu carrito se conserva.
          </Text>
        ) : null}
      </View>
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
    padding: 14,
    gap: 10,
    paddingBottom: 16,
  },
  tarjeta: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: Neo.tarjeta,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Neo.tarjetaBordeSuave,
    padding: 10,
  },
  imagen: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: Neo.fondoSuave,
  },
  imagenVacia: {
    backgroundColor: Neo.fondoSuave,
  },
  info: {
    flex: 1,
    justifyContent: "space-between",
  },
  nombre: {
    color: Neo.texto,
    fontSize: 13.5,
    fontWeight: "600",
  },
  precio: {
    color: Neo.oroClaro,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
  },
  controles: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  cantidadBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    borderWidth: 1,
    borderColor: Neo.inputBorde,
    borderRadius: 10,
    overflow: "hidden",
  },
  botonCantidad: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cantidad: {
    color: Neo.texto,
    fontSize: 14,
    fontWeight: "700",
    minWidth: 22,
    textAlign: "center",
  },
  botonQuitar: {
    padding: 4,
  },
  pie: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: Neo.tarjetaBordeSuave,
    gap: 10,
  },
  filaTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalEtiqueta: {
    color: Neo.textoSuave,
    fontSize: 14,
    fontWeight: "600",
  },
  totalValor: {
    color: Neo.oroClaro,
    fontSize: 20,
    fontWeight: "900",
  },
  nota: {
    color: Neo.textoTenue,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 17,
  },
});