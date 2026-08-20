import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import NeoButton from "@/components/auth/NeoButton";
import NeoHeader from "@/components/NeoHeader";
import { imagenProducto } from "@/constants/product-images";
import { Neo } from "@/constants/theme";
import { useCommerce } from "@/contexts/CommerceContext";
import { apiFetch } from "@/services/api";

const formatearPrecio = (valor: number) =>
  `$${Number(valor || 0).toLocaleString("es-CO")}`;

export default function CheckoutScreen() {
  const { carrito, subtotal, vaciarCarrito } = useCommerce();
  const [metodos, setMetodos] = useState<Record<string, string>>({});
  const [bancos, setBancos] = useState<string[]>([]);
  const [modoSimulador, setModoSimulador] = useState(false);
  const [cargandoMetodos, setCargandoMetodos] = useState(true);

  const [metodo, setMetodo] = useState("");
  const [titular, setTitular] = useState("");
  const [numero, setNumero] = useState("");
  const [expiracion, setExpiracion] = useState("");
  const [cvv, setCvv] = useState("");
  const [banco, setBanco] = useState("");
  const [correoPaypal, setCorreoPaypal] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  useEffect(() => {
    let activo = true;
    (async () => {
      setCargandoMetodos(true);
      try {
        const data = await apiFetch("/pedidos/metodos-pago");
        if (!activo) return;
        setMetodos(data?.metodos ?? {});
        setBancos(Array.isArray(data?.bancos) ? data.bancos : []);
        setModoSimulador(data?.modo === "simulador");
      } catch (err: any) {
        if (activo) setError(err?.friendly ?? "No pudimos cargar los métodos de pago.");
      } finally {
        if (activo) setCargandoMetodos(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  const puedePagar =
    carrito.length > 0 && metodo && !enviando && cargandoMetodos === false;

  const manejarPago = async () => {
    setError("");
    if (!metodo) {
      setError("Selecciona un método de pago.");
      return;
    }
    const pago: Record<string, unknown> = { metodo };
    if (metodo === "tarjeta_debito" || metodo === "tarjeta_credito") {
      if (!titular.trim() || !numero.trim() || !expiracion.trim() || !cvv.trim()) {
        setError("Completa los datos de la tarjeta: titular, número, expiración y CVV.");
        return;
      }
      pago.titular = titular.trim();
      pago.numero = numero.trim();
      pago.expiracion = expiracion.trim();
      pago.cvv = cvv.trim();
    } else if (metodo === "pse") {
      if (!banco) {
        setError("Selecciona tu banco.");
        return;
      }
      pago.banco = banco;
    } else if (metodo === "paypal") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoPaypal.trim())) {
        setError("Ingresa un correo PayPal válido.");
        return;
      }
      pago.correo_paypal = correoPaypal.trim();
    }

    setEnviando(true);
    try {
      await apiFetch("/pedidos", {
        method: "POST",
        body: JSON.stringify({
          items: carrito.map((item) => ({
            id_producto: item.id_producto,
            cantidad: item.cantidad,
          })),
          servicios: [],
          pago,
        }),
      });
      vaciarCarrito();
      setExito(true);
    } catch (err: any) {
      setError(err?.friendly ?? "No pudimos procesar el pedido. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (exito) {
    return (
      <SafeAreaView style={styles.seguro} edges={["bottom"]}>
        <NeoHeader titulo="Pedido confirmado" mostrarAtras />
        <View style={styles.centro}>
          <View style={styles.iconoExito}>
            <MaterialIcons name="check" size={44} color={Neo.exito} />
          </View>
          <Text style={styles.centroTitulo}>¡Gracias por tu compra!</Text>
          <Text style={styles.centroTexto}>
            Tu pedido fue registrado correctamente y el pago se procesó
            {modoSimulador ? " en modo simulación" : ""}. Puedes seguir su estado en Mis pedidos.
          </Text>
          <NeoButton title="Ver mis pedidos" onPress={() => router.replace("/mis-pedidos")} style={styles.boton} />
        </View>
      </SafeAreaView>
    );
  }

  if (carrito.length === 0) {
    return (
      <SafeAreaView style={styles.seguro} edges={["bottom"]}>
        <NeoHeader titulo="Finalizar compra" mostrarAtras />
        <View style={styles.centro}>
          <Text style={styles.centroTexto}>Tu carrito está vacío.</Text>
          <NeoButton title="Ir al catálogo" onPress={() => router.replace("/(tabs)/explore")} style={styles.boton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.seguro} edges={["bottom"]}>
      <NeoHeader titulo="Finalizar compra" mostrarAtras />
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.tituloSeccion}>Resumen del pedido</Text>
        <View style={styles.tarjetaResumen}>
          {carrito.map((item) => {
            const fuente = imagenProducto({
              id_producto: item.id_producto,
              nombre_producto: item.nombre_producto,
              imagen_url: item.imagen_url,
            });
            return (
              <View key={item.id_producto} style={styles.filaResumen}>
                {fuente ? (
                  <Image source={fuente} style={styles.imagenMini} contentFit="cover" />
                ) : (
                  <View style={[styles.imagenMini, styles.imagenVacia]} />
                )}
                <View style={styles.resumenInfo}>
                  <Text style={styles.resumenNombre} numberOfLines={1}>
                    {item.nombre_producto}
                  </Text>
                  <Text style={styles.resumenDetalle}>
                    {item.cantidad} × {formatearPrecio(item.precio)}
                  </Text>
                </View>
                <Text style={styles.resumenSubtotal}>
                  {formatearPrecio(item.precio * item.cantidad)}
                </Text>
              </View>
            );
          })}
          <View style={styles.filaTotal}>
            <Text style={styles.totalEtiqueta}>Total a pagar</Text>
            <Text style={styles.totalValor}>{formatearPrecio(subtotal)}</Text>
          </View>
        </View>

        <Text style={styles.tituloSeccion}>Método de pago</Text>
        {cargandoMetodos ? (
          <ActivityIndicator size="small" color={Neo.oro} style={styles.cargando} />
        ) : (
          <>
            <View style={styles.chips}>
              {Object.entries(metodos).map(([codigo, etiqueta]) => {
                const activo = metodo === codigo;
                return (
                  <Pressable
                    key={codigo}
                    style={[styles.chip, activo && styles.chipActivo]}
                    onPress={() => setMetodo(codigo)}
                  >
                    <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>
                      {etiqueta}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {metodo === "tarjeta_debito" || metodo === "tarjeta_credito" ? (
              <View style={styles.datosPago}>
                <Text style={styles.etiqueta}>Titular</Text>
                <TextInput
                  style={styles.input}
                  value={titular}
                  onChangeText={setTitular}
                  placeholder="Nombre como aparece en la tarjeta"
                  placeholderTextColor={Neo.textoTenue}
                />
                <Text style={styles.etiqueta}>Número de tarjeta</Text>
                <TextInput
                  style={styles.input}
                  value={numero}
                  onChangeText={setNumero}
                  placeholder="0000 0000 0000 0000"
                  keyboardType="number-pad"
                  placeholderTextColor={Neo.textoTenue}
                />
                <View style={styles.filaDoble}>
                  <View style={styles.campoDoble}>
                    <Text style={styles.etiqueta}>Expiración</Text>
                    <TextInput
                      style={styles.input}
                      value={expiracion}
                      onChangeText={setExpiracion}
                      placeholder="MM/AA"
                      keyboardType="number-pad"
                      placeholderTextColor={Neo.textoTenue}
                    />
                  </View>
                  <View style={styles.campoDoble}>
                    <Text style={styles.etiqueta}>CVV</Text>
                    <TextInput
                      style={styles.input}
                      value={cvv}
                      onChangeText={setCvv}
                      placeholder="123"
                      keyboardType="number-pad"
                      secureTextEntry
                      placeholderTextColor={Neo.textoTenue}
                    />
                  </View>
                </View>
              </View>
            ) : null}

            {metodo === "pse" ? (
              <View style={styles.datosPago}>
                <Text style={styles.etiqueta}>Banco</Text>
                <View style={styles.chips}>
                  {bancos.map((b) => {
                    const activo = banco === b;
                    return (
                      <Pressable
                        key={b}
                        style={[styles.chip, activo && styles.chipActivo]}
                        onPress={() => setBanco(b)}
                      >
                        <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>{b}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {metodo === "paypal" ? (
              <View style={styles.datosPago}>
                <Text style={styles.etiqueta}>Correo PayPal</Text>
                <TextInput
                  style={styles.input}
                  value={correoPaypal}
                  onChangeText={setCorreoPaypal}
                  placeholder="tucorreo@correo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={Neo.textoTenue}
                />
              </View>
            ) : null}

            {modoSimulador ? (
              <Text style={styles.nota}>
                El sistema se encuentra en modo simulación de pagos; no se realizan cobros reales.
              </Text>
            ) : null}
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <NeoButton
          title={`Pagar ${formatearPrecio(subtotal)}`}
          onPress={manejarPago}
          loading={enviando}
          disabled={!puedePagar}
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
  centroTitulo: {
    color: Neo.texto,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  centroTexto: {
    color: Neo.textoSuave,
    fontSize: 13.5,
    textAlign: "center",
    lineHeight: 20,
  },
  iconoExito: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Neo.exitoFondo,
    borderWidth: 2,
    borderColor: Neo.exito,
    alignItems: "center",
    justifyContent: "center",
  },
  boton: {
    marginTop: 16,
  },
  tituloSeccion: {
    color: Neo.oroClaro,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 8,
  },
  tarjetaResumen: {
    backgroundColor: Neo.tarjeta,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Neo.tarjetaBordeSuave,
    padding: 12,
    gap: 10,
  },
  filaResumen: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  imagenMini: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: Neo.fondoSuave,
  },
  imagenVacia: {
    backgroundColor: Neo.fondoSuave,
  },
  resumenInfo: {
    flex: 1,
  },
  resumenNombre: {
    color: Neo.texto,
    fontSize: 13,
    fontWeight: "600",
  },
  resumenDetalle: {
    color: Neo.textoTenue,
    fontSize: 12,
    marginTop: 2,
  },
  resumenSubtotal: {
    color: Neo.oroClaro,
    fontSize: 13.5,
    fontWeight: "700",
  },
  filaTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Neo.tarjetaBordeSuave,
    paddingTop: 10,
    marginTop: 2,
  },
  totalEtiqueta: {
    color: Neo.texto,
    fontSize: 14,
    fontWeight: "700",
  },
  totalValor: {
    color: Neo.oroClaro,
    fontSize: 18,
    fontWeight: "900",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: Neo.inputBorde,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: Neo.inputFondo,
  },
  chipActivo: {
    borderColor: Neo.oro,
    backgroundColor: Neo.rosaSuave,
  },
  chipTexto: {
    color: Neo.textoSuave,
    fontSize: 12.5,
    fontWeight: "600",
  },
  chipTextoActivo: {
    color: Neo.oroClaro,
  },
  datosPago: {
    marginTop: 12,
  },
  etiqueta: {
    color: Neo.textoSuave,
    fontSize: 12.5,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: Neo.inputFondo,
    borderWidth: 1,
    borderColor: Neo.inputBorde,
    borderRadius: 12,
    color: Neo.texto,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  filaDoble: {
    flexDirection: "row",
    gap: 10,
  },
  campoDoble: {
    flex: 1,
  },
  cargando: {
    marginVertical: 12,
  },
  nota: {
    color: Neo.textoTenue,
    fontSize: 12,
    marginTop: 12,
    lineHeight: 17,
  },
  error: {
    color: Neo.error,
    fontSize: 13,
    marginTop: 12,
    lineHeight: 19,
  },
});