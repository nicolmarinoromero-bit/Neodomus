import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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
import { SafeAreaView } from "react-native-safe-area-context";

import NeoButton from "@/components/auth/NeoButton";
import NeoHeader from "@/components/NeoHeader";
import { Neo } from "@/constants/theme";
import { apiFetch } from "@/services/api";

type DetallePedido = {
  id_detalle: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  es_servicio: boolean;
  fecha_servicio?: string | null;
  hora_servicio?: string | null;
};

type PagoPedido = {
  metodo_pago?: string;
  estado?: string;
  numero_transaccion?: string;
};

type Pedido = {
  id_pedido: number;
  fecha?: string | null;
  total: number;
  estado: string;
  fecha_entrega?: string | null;
  hora_entrega?: string | null;
  nombre_tecnico_entrega?: string | null;
  estado_entrega?: string | null;
  detalles?: DetallePedido[];
  pago?: PagoPedido | null;
};

const formatearPrecio = (valor: number) =>
  `$${Number(valor || 0).toLocaleString("es-CO")}`;

const formatearFecha = (fecha?: string | null) => {
  if (!fecha) return "";
  const [anio, mes, dia] = fecha.slice(0, 10).split("-");
  if (!anio || !mes || !dia) return fecha;
  return `${dia}/${mes}/${anio}`;
};

const colorEstado = (estado: string) => {
  const e = (estado || "").toLowerCase();
  if (/(cancel|anul|rechaz)/.test(e)) return Neo.error;
  if (/(pag|complet|realiz|entreg)/.test(e)) return Neo.exito;
  if (/(pend|proces|prepar)/.test(e)) return Neo.oro;
  return Neo.textoSuave;
};

export default function MisPedidosScreen() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState("");
  const [expandidos, setExpandidos] = useState<number[]>([]);

  const cargar = useCallback(async (refresh = false) => {
    if (refresh) setRefrescando(true);
    else setCargando(true);
    setError("");
    try {
      const data = (await apiFetch("/pedidos/mis-pedidos")) as Pedido[];
      setPedidos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.friendly ?? "No pudimos cargar tus pedidos.");
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const alternarDetalle = (idPedido: number) => {
    setExpandidos((prev) =>
      prev.includes(idPedido) ? prev.filter((id) => id !== idPedido) : [...prev, idPedido]
    );
  };

  const renderItem = ({ item }: { item: Pedido }) => {
    const expandido = expandidos.includes(item.id_pedido);
    const conEntrega = item.nombre_tecnico_entrega || item.fecha_entrega;
    return (
      <Pressable style={styles.tarjeta} onPress={() => alternarDetalle(item.id_pedido)}>
        <View style={styles.filaHeader}>
          <View>
            <Text style={styles.numero}>Pedido #{item.id_pedido}</Text>
            <Text style={styles.fecha}>{formatearFecha(item.fecha)}</Text>
          </View>
          <Text style={[styles.estado, { color: colorEstado(item.estado) }]}>{item.estado}</Text>
        </View>

        <View style={styles.filaTotal}>
          <Text style={styles.totalEtiqueta}>Total</Text>
          <Text style={styles.totalValor}>{formatearPrecio(item.total)}</Text>
        </View>

        {item.pago ? (
          <Text style={styles.pago}>
            Pago: {item.pago.metodo_pago || "—"} · {item.pago.estado || "—"}
          </Text>
        ) : null}

        {conEntrega ? (
          <Text style={styles.entrega}>
            Entrega{item.estado_entrega ? ` (${item.estado_entrega})` : ""}:{" "}
            {item.nombre_tecnico_entrega || "Técnico asignado"}
            {item.fecha_entrega ? ` · ${formatearFecha(item.fecha_entrega)}${item.hora_entrega ? ` ${item.hora_entrega}` : ""}` : ""}
          </Text>
        ) : null}

        <View style={styles.filaExpandir}>
          <Text style={styles.expandirTexto}>
            {expandido ? "Ocultar productos" : "Ver productos"}
          </Text>
          <MaterialIcons
            name={expandido ? "expand-less" : "expand-more"}
            size={20}
            color={Neo.oroClaro}
          />
        </View>

        {expandido && item.detalles?.length ? (
          <View style={styles.detalles}>
            {item.detalles.map((det) => (
              <View key={det.id_detalle} style={styles.filaDetalle}>
                <View style={styles.detalleInfo}>
                  <Text style={styles.detalleNombre} numberOfLines={2}>
                    {det.es_servicio ? `Servicio · ${det.nombre}` : det.nombre}
                  </Text>
                  {det.es_servicio && det.fecha_servicio ? (
                    <Text style={styles.detalleFecha}>
                      {formatearFecha(det.fecha_servicio)}
                      {det.hora_servicio ? ` ${det.hora_servicio}` : ""}
                    </Text>
                  ) : (
                    <Text style={styles.detalleFecha}>
                      {det.cantidad} × {formatearPrecio(det.precio_unitario)}
                    </Text>
                  )}
                </View>
                <Text style={styles.detalleSubtotal}>{formatearPrecio(det.subtotal)}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.seguro} edges={["bottom"]}>
      <NeoHeader titulo="Mis pedidos" mostrarAtras />
      {cargando && pedidos.length === 0 ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={Neo.oro} />
        </View>
      ) : error && pedidos.length === 0 ? (
        <View style={styles.centro}>
          <Text style={styles.error}>{error}</Text>
          <NeoButton title="Reintentar" onPress={() => cargar()} style={styles.boton} />
        </View>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => String(item.id_pedido)}
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
                <MaterialIcons name="receipt-long" size={52} color={Neo.textoTenue} />
                <Text style={styles.centroTexto}>Aún no tienes pedidos.</Text>
              </View>
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
    fontSize: 14,
    textAlign: "center",
  },
  boton: {
    marginTop: 8,
  },
  lista: {
    padding: 14,
    gap: 10,
    paddingBottom: 24,
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
    alignItems: "flex-start",
  },
  numero: {
    color: Neo.texto,
    fontSize: 15,
    fontWeight: "800",
  },
  fecha: {
    color: Neo.textoTenue,
    fontSize: 12,
    marginTop: 2,
  },
  estado: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  filaTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  totalEtiqueta: {
    color: Neo.textoSuave,
    fontSize: 13.5,
    fontWeight: "600",
  },
  totalValor: {
    color: Neo.oroClaro,
    fontSize: 17,
    fontWeight: "900",
  },
  pago: {
    color: Neo.textoSuave,
    fontSize: 12.5,
    marginTop: 6,
  },
  entrega: {
    color: Neo.textoTenue,
    fontSize: 12.5,
    marginTop: 4,
    lineHeight: 18,
  },
  filaExpandir: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
  expandirTexto: {
    color: Neo.oroClaro,
    fontSize: 13,
    fontWeight: "700",
  },
  detalles: {
    borderTopWidth: 1,
    borderTopColor: Neo.tarjetaBordeSuave,
    marginTop: 10,
    paddingTop: 10,
    gap: 8,
  },
  filaDetalle: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  detalleInfo: {
    flex: 1,
  },
  detalleNombre: {
    color: Neo.texto,
    fontSize: 13,
    fontWeight: "600",
  },
  detalleFecha: {
    color: Neo.textoTenue,
    fontSize: 12,
    marginTop: 1,
  },
  detalleSubtotal: {
    color: Neo.oroClaro,
    fontSize: 13.5,
    fontWeight: "700",
  },
});