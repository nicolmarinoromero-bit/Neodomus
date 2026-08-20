import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import NeoButton from "@/components/auth/NeoButton";
import NeoHeader from "@/components/NeoHeader";
import { Neo } from "@/constants/theme";
import { useSession } from "@/contexts/SessionContext";
import { obtenerPerfil } from "@/services/auth.services";

type Perfil = {
  id_cliente?: number;
  id_usuario?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  telefono_cliente?: number | string;
  telefono_usuario?: number | string;
  documento_cliente?: number | string;
  documento_usuario?: number | string;
  address?: string | null;
  certificacion_t?: string | null;
  cargo_t?: string | null;
  [key: string]: unknown;
};

type Opcion = {
  icono: string;
  titulo: string;
  descripcion: string;
  onPress: () => void;
};

export default function PerfilScreen() {
  const { user, isLogged, loading, logout, isAdmin, isTecnico } = useSession();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(false);

  const cargarPerfil = useCallback(async () => {
    if (!user?.user_type) return;
    setCargandoPerfil(true);
    try {
      const data = (await obtenerPerfil(user.user_type)) as Perfil;
      setPerfil(data);
    } catch {
      // El perfil del backend no siempre está disponible; usamos la sesión local.
    } finally {
      setCargandoPerfil(false);
    }
  }, [user?.user_type]);

  useEffect(() => {
    if (isLogged) cargarPerfil();
  }, [isLogged, cargarPerfil]);

  if (loading) {
    return (
      <SafeAreaView style={styles.seguro} edges={["bottom"]}>
        <NeoHeader />
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={Neo.oro} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isLogged) {
    return (
      <SafeAreaView style={styles.seguro} edges={["bottom"]}>
        <NeoHeader />
        <View style={styles.centro}>
          <Text style={styles.titulo}>Mi perfil</Text>
          <Text style={styles.centroTexto}>Inicia sesión para ver tu perfil.</Text>
          <NeoButton title="Iniciar sesión" onPress={() => router.push("/login")} style={styles.boton} />
        </View>
      </SafeAreaView>
    );
  }

  const nombre = `${perfil?.first_name || user?.nombre || ""} ${perfil?.last_name || ""}`.trim();
  const correo = perfil?.email || user?.email || "";
  const telefono =
    perfil?.telefono_cliente != null
      ? String(perfil.telefono_cliente)
      : perfil?.telefono_usuario != null
        ? String(perfil.telefono_usuario)
        : "";
  const documento =
    perfil?.documento_cliente != null
      ? String(perfil.documento_cliente)
      : perfil?.documento_usuario != null
        ? String(perfil.documento_usuario)
        : "";

  const iniciales = (nombre || correo || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const rolTexto = isAdmin ? "Administrador" : isTecnico ? "Técnico" : "Cliente";

  const opciones: Opcion[] = [
    {
      icono: "event",
      titulo: "Mis citas",
      descripcion: "Agenda y consulta tus servicios técnicos",
      onPress: () => router.push("/(tabs)/citas"),
    },
    {
      icono: "receipt-long",
      titulo: "Mis pedidos",
      descripcion: "Consulta el estado de tus compras",
      onPress: () => router.push("/mis-pedidos"),
    },
    {
      icono: "help",
      titulo: "Ayuda y soporte",
      descripcion: "Preguntas frecuentes y envío de solicitudes",
      onPress: () => router.push("/(tabs)/ayuda"),
    },
  ];

  if (isTecnico) {
    opciones.unshift({
      icono: "build",
      titulo: "Panel del técnico",
      descripcion: "Citas asignadas y entregas",
      onPress: () => router.push("/tecnico"),
    });
  }

  return (
    <SafeAreaView style={styles.seguro} edges={["bottom"]}>
      <NeoHeader />
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.tarjetaPerfil}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{iniciales}</Text>
          </View>
          <Text style={styles.nombre}>{nombre || "Usuario"}</Text>
          <View style={styles.chipRol}>
            <Text style={styles.chipRolTexto}>{rolTexto}</Text>
          </View>
          {isAdmin ? (
            <Text style={styles.notaAdmin}>
              La administración se realiza desde la plataforma web.
            </Text>
          ) : null}
        </View>

        <View style={styles.tarjetaInfo}>
          <Text style={styles.infoTitulo}>Información de la cuenta</Text>
          {correo ? (
            <View style={styles.filaDato}>
              <MaterialIcons name="email" size={18} color={Neo.oro} />
              <Text style={styles.datoTexto}>{correo}</Text>
            </View>
          ) : null}
          {telefono ? (
            <View style={styles.filaDato}>
              <MaterialIcons name="phone" size={18} color={Neo.oro} />
              <Text style={styles.datoTexto}>{telefono}</Text>
            </View>
          ) : null}
          {documento ? (
            <View style={styles.filaDato}>
              <MaterialIcons name="badge" size={18} color={Neo.oro} />
              <Text style={styles.datoTexto}>{documento}</Text>
            </View>
          ) : null}
          {perfil?.address ? (
            <View style={styles.filaDato}>
              <MaterialIcons name="place" size={18} color={Neo.oro} />
              <Text style={styles.datoTexto}>{String(perfil.address)}</Text>
            </View>
          ) : null}
          {cargandoPerfil ? (
            <ActivityIndicator style={styles.cargando} size="small" color={Neo.oro} />
          ) : null}
        </View>

        <Text style={styles.tituloOpciones}>Opciones de cuenta</Text>
        <View style={styles.tarjetaOpciones}>
          {opciones.map((opcion, i) => (
            <Pressable
              key={opcion.titulo}
              style={({ pressed }) => [
                styles.opcion,
                i < opciones.length - 1 && styles.opcionBorde,
                pressed && styles.presionado,
              ]}
              onPress={opcion.onPress}
            >
              <MaterialIcons name={opcion.icono as any} size={22} color={Neo.oroClaro} />
              <View style={styles.opcionTexto}>
                <Text style={styles.opcionTitulo}>{opcion.titulo}</Text>
                <Text style={styles.opcionDescripcion}>{opcion.descripcion}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={Neo.textoTenue} />
            </Pressable>
          ))}
        </View>

        <NeoButton
          title="Cerrar sesión"
          variant="peligro"
          onPress={async () => {
            await logout();
            router.replace("/");
          }}
          style={styles.boton}
        />
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
    fontSize: 24,
    fontWeight: "800",
  },
  tarjetaPerfil: {
    alignItems: "center",
    backgroundColor: Neo.tarjeta,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Neo.tarjetaBordeSuave,
    paddingVertical: 22,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Neo.oro,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Neo.oroClaro,
  },
  avatarTexto: {
    color: "#1a140a",
    fontSize: 30,
    fontWeight: "900",
  },
  nombre: {
    color: Neo.texto,
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center",
  },
  chipRol: {
    marginTop: 8,
    backgroundColor: Neo.rosaSuave,
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Neo.oro,
  },
  chipRolTexto: {
    color: Neo.oroClaro,
    fontSize: 12.5,
    fontWeight: "700",
  },
  notaAdmin: {
    color: Neo.textoTenue,
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  tarjetaInfo: {
    backgroundColor: Neo.tarjeta,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Neo.tarjetaBordeSuave,
    padding: 14,
    marginTop: 12,
    gap: 10,
  },
  infoTitulo: {
    color: Neo.oroClaro,
    fontSize: 13.5,
    fontWeight: "700",
    marginBottom: 2,
  },
  filaDato: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  datoTexto: {
    color: Neo.texto,
    fontSize: 14,
    flexShrink: 1,
  },
  cargando: {
    marginTop: 4,
  },
  tituloOpciones: {
    color: Neo.oroClaro,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 18,
    marginBottom: 8,
  },
  tarjetaOpciones: {
    backgroundColor: Neo.tarjeta,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Neo.tarjetaBordeSuave,
    overflow: "hidden",
  },
  opcion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  opcionBorde: {
    borderBottomWidth: 1,
    borderBottomColor: Neo.tarjetaBordeSuave,
  },
  presionado: {
    opacity: 0.75,
  },
  opcionTexto: {
    flex: 1,
  },
  opcionTitulo: {
    color: Neo.texto,
    fontSize: 14.5,
    fontWeight: "700",
  },
  opcionDescripcion: {
    color: Neo.textoTenue,
    fontSize: 12,
    marginTop: 1,
  },
  boton: {
    marginTop: 18,
  },
});