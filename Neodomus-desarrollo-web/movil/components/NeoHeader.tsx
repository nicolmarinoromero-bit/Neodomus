import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Neo } from "@/constants/theme";
import { useCommerce } from "@/contexts/CommerceContext";
import { useSession } from "@/contexts/SessionContext";

type Props = {
  titulo?: string;
  mostrarAtras?: boolean;
};

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeTexto}>{count > 99 ? "99+" : count}</Text>
    </View>
  );
}

export default function NeoHeader({ titulo, mostrarAtras }: Props) {
  const { isLogged, user, logout } = useSession();
  const { carritoCount, favoritos } = useCommerce();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const iniciales = (user?.nombre || user?.email || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const nombreCorto = (user?.nombre || "").split(" ")[0] || "Usuario";

  const cerrarSesion = async () => {
    setMenuAbierto(false);
    await logout();
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.seguro} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.izquierda}>
          {mostrarAtras ? (
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              style={styles.iconoBoton}
            >
              <MaterialIcons name="arrow-back" size={24} color={Neo.texto} />
            </Pressable>
          ) : null}
          <Pressable onPress={() => router.replace("/")} hitSlop={8}>
            <Text style={styles.logo}>
              NEO<Text style={styles.logoOro}>DOMUS</Text>
            </Text>
          </Pressable>
        </View>

        {titulo ? <Text style={styles.titulo} numberOfLines={1}>{titulo}</Text> : null}

        <View style={styles.derecha}>
          <Pressable onPress={() => router.push("/favoritos")} hitSlop={8} style={styles.iconoBoton}>
            <MaterialIcons name="favorite-border" size={26} color={Neo.oroClaro} />
            <Badge count={favoritos.length} />
          </Pressable>

          <Pressable onPress={() => router.push("/carrito")} hitSlop={8} style={styles.iconoBoton}>
            <MaterialIcons name="shopping-cart" size={26} color={Neo.oroClaro} />
            <Badge count={carritoCount} />
          </Pressable>

          {isLogged ? (
            <Pressable style={styles.usuario} onPress={() => setMenuAbierto((v) => !v)}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTexto}>{iniciales}</Text>
              </View>
              <Text style={styles.nombre} numberOfLines={1}>
                {nombreCorto}
              </Text>
              <MaterialIcons
                name={menuAbierto ? "expand-less" : "expand-more"}
                size={20}
                color={Neo.textoSuave}
              />
            </Pressable>
          ) : (
            <Pressable
              style={styles.ingresar}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.ingresarTexto}>Ingresar</Text>
            </Pressable>
          )}
        </View>
      </View>

      {menuAbierto && isLogged ? (
        <View style={styles.menuOverlay}>
          <Pressable style={styles.menuFondo} onPress={() => setMenuAbierto(false)} />
          <View style={styles.menu}>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuAbierto(false);
                router.push("/(tabs)/perfil");
              }}
            >
              <MaterialIcons name="person" size={20} color={Neo.oroClaro} />
              <Text style={styles.menuItemTexto}>Mi perfil</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuAbierto(false);
                router.push("/mis-pedidos");
              }}
            >
              <MaterialIcons name="receipt-long" size={20} color={Neo.oroClaro} />
              <Text style={styles.menuItemTexto}>Mis pedidos</Text>
            </Pressable>
            <View style={styles.menuDivisor} />
            <Pressable style={styles.menuItem} onPress={cerrarSesion}>
              <MaterialIcons name="logout" size={20} color={Neo.error} />
              <Text style={[styles.menuItemTexto, styles.menuItemPeligro]}>Cerrar sesión</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  seguro: {
    backgroundColor: "#0b0b0d",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212,165,75,0.25)",
    minHeight: 52,
  },
  izquierda: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    color: Neo.texto,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 1,
  },
  logoOro: {
    color: Neo.oro,
  },
  titulo: {
    color: Neo.texto,
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1,
    marginHorizontal: 8,
  },
  derecha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconoBoton: {
    position: "relative",
    padding: 2,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -8,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: Neo.oro,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeTexto: {
    color: "#1a140a",
    fontSize: 10,
    fontWeight: "800",
  },
  usuario: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: 140,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Neo.oro,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTexto: {
    color: "#1a140a",
    fontSize: 13,
    fontWeight: "800",
  },
  nombre: {
    color: Neo.texto,
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
  },
  ingresar: {
    borderWidth: 1,
    borderColor: Neo.oro,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  ingresarTexto: {
    color: Neo.oroClaro,
    fontSize: 13,
    fontWeight: "700",
  },
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  menuFondo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  menu: {
    position: "absolute",
    top: 54,
    right: 10,
    width: 210,
    backgroundColor: Neo.tarjeta,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Neo.tarjetaBordeSuave,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  menuItemTexto: {
    color: Neo.texto,
    fontSize: 14,
    fontWeight: "600",
  },
  menuItemPeligro: {
    color: Neo.error,
  },
  menuDivisor: {
    height: 1,
    backgroundColor: Neo.tarjetaBordeSuave,
    marginVertical: 2,
  },
});