import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { imagenProducto } from "@/constants/product-images";
import { Neo } from "@/constants/theme";
import { useCommerce } from "@/contexts/CommerceContext";

export type ProductoCardData = {
  id_producto: number;
  nombre_producto: string;
  marca?: string | null;
  precio_venta_producto: number;
  precio_final?: number | null;
  descuento_activo?: number | null;
  stock_estado?: string;
  imagen_url?: string | null;
};

const formatearPrecio = (valor: number) =>
  `$${Number(valor || 0).toLocaleString("es-CO")}`;

export default function ProductCard({ producto }: { producto: ProductoCardData }) {
  const { agregarAlCarrito, cambiarCantidad, esFavorito, toggleFavorito, carrito } = useCommerce();

  const fuente = imagenProducto(producto);
  const favorito = esFavorito(producto.id_producto);
  const enCarrito = carrito.find((i) => i.id_producto === producto.id_producto);
  const precio = producto.precio_final ?? producto.precio_venta_producto;
  const agotado = producto.stock_estado === "agotado";

  return (
    <View style={styles.tarjeta}>
      <View style={styles.imagenContenedor}>
        {fuente ? (
          <Image source={fuente} style={styles.imagen} contentFit="cover" transition={200} />
        ) : (
          <View style={[styles.imagen, styles.imagenVacia]}>
            <Text style={styles.imagenVaciaTexto}>Sin imagen</Text>
          </View>
        )}
        <Pressable
          style={[styles.corazon, favorito && styles.corazonActivo]}
          hitSlop={6}
          onPress={() =>
            toggleFavorito({
              id_producto: producto.id_producto,
              nombre_producto: producto.nombre_producto,
              precio,
              imagen_url: producto.imagen_url,
            })
          }
        >
          <MaterialIcons
            name={favorito ? "favorite" : "favorite-border"}
            size={20}
            color={favorito ? "#ff5a6e" : Neo.texto}
          />
        </Pressable>
      </View>

      <View style={styles.info}>
        <Text style={styles.nombre} numberOfLines={2}>
          {producto.nombre_producto}
        </Text>
        {producto.marca ? <Text style={styles.marca}>{producto.marca}</Text> : null}

        <View style={styles.filaPrecio}>
          <Text style={styles.precio}>{formatearPrecio(precio)}</Text>
          {producto.descuento_activo ? (
            <Text style={styles.descuento}>-{producto.descuento_activo}%</Text>
          ) : null}
        </View>

        <Text
          style={[
            styles.stock,
            producto.stock_estado === "bajo" && styles.stockBajo,
            agotado && styles.stockAgotado,
          ]}
        >
          {agotado
            ? "Agotado"
            : producto.stock_estado === "bajo"
              ? "Pocas unidades"
              : "Disponible"}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.botonCarrito,
            enCarrito && styles.botonCarritoActivo,
            agotado && styles.botonCarritoInactivo,
            pressed && !agotado && styles.botonPresionado,
          ]}
          disabled={agotado}
          onPress={() => {
            if (enCarrito) {
              cambiarCantidad(producto.id_producto, enCarrito.cantidad + 1);
            } else {
              agregarAlCarrito({
                id_producto: producto.id_producto,
                nombre_producto: producto.nombre_producto,
                precio,
                imagen_url: producto.imagen_url,
              });
            }
          }}
        >
          <MaterialIcons
            name={enCarrito ? "check" : "add-shopping-cart"}
            size={16}
            color={enCarrito ? "#1a140a" : Neo.oroClaro}
          />
          <Text style={[styles.botonCarritoTexto, enCarrito && styles.botonCarritoTextoActivo]}>
            {agotado ? "Sin stock" : enCarrito ? `En carrito (${enCarrito.cantidad})` : "Agregar"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flex: 1,
    backgroundColor: Neo.tarjeta,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Neo.tarjetaBordeSuave,
    overflow: "hidden",
    marginBottom: 10,
  },
  imagenContenedor: {
    position: "relative",
  },
  imagen: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: Neo.fondoSuave,
  },
  imagenVacia: {
    alignItems: "center",
    justifyContent: "center",
  },
  imagenVaciaTexto: {
    color: Neo.textoTenue,
    fontSize: 12,
  },
  corazon: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(11,11,13,0.75)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(212,165,75,0.35)",
  },
  corazonActivo: {
    borderColor: "#ff5a6e",
  },
  info: {
    padding: 10,
  },
  nombre: {
    color: Neo.texto,
    fontSize: 13,
    fontWeight: "600",
    minHeight: 34,
  },
  marca: {
    color: Neo.textoTenue,
    fontSize: 11,
    marginTop: 2,
  },
  filaPrecio: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  precio: {
    color: Neo.oroClaro,
    fontSize: 15,
    fontWeight: "800",
  },
  descuento: {
    color: Neo.exito,
    fontSize: 11,
    fontWeight: "700",
  },
  stock: {
    color: Neo.exito,
    fontSize: 11,
    marginTop: 4,
  },
  stockBajo: {
    color: Neo.oro,
  },
  stockAgotado: {
    color: Neo.error,
  },
  botonCarrito: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Neo.oro,
    paddingVertical: 9,
    minHeight: 38,
  },
  botonCarritoActivo: {
    backgroundColor: Neo.oro,
  },
  botonCarritoInactivo: {
    borderColor: Neo.tarjetaBordeSuave,
    opacity: 0.55,
  },
  botonPresionado: {
    opacity: 0.8,
  },
  botonCarritoTexto: {
    color: Neo.oroClaro,
    fontSize: 12.5,
    fontWeight: "700",
  },
  botonCarritoTextoActivo: {
    color: "#1a140a",
  },
});