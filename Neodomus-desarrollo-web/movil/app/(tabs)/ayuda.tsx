import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
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
import { Neo } from "@/constants/theme";
import { apiFetch } from "@/services/api";

const FAQ = [
  {
    pregunta: "¿Cómo agendo una cita técnica?",
    respuesta:
      "Inicia sesión, entra a la pestaña Citas y pulsa “Agendar cita”. Elige el técnico, el servicio, la fecha y la hora disponible, y confirma.",
  },
  {
    pregunta: "¿Qué servicios ofrece Neodomus?",
    respuesta:
      "Instalación, mantenimiento, reparación, revisión y soporte técnico de equipos y automatización del hogar.",
  },
  {
    pregunta: "¿Cómo realizo una compra?",
    respuesta:
      "Agrega productos al carrito desde el catálogo y continúa con la compra. Al finalizar se solicita iniciar sesión para confirmar el pedido.",
  },
  {
    pregunta: "¿Puedo cancelar una cita?",
    respuesta:
      "Sí. Desde la pestaña Citas puedes eliminar una cita pendiente; quedará registrada como cancelada.",
  },
];

const CATEGORIAS = [
  { valor: "consulta-general", etiqueta: "Consulta general" },
  { valor: "soporte-tecnico", etiqueta: "Soporte técnico" },
  { valor: "pedido", etiqueta: "Pedido" },
  { valor: "pago", etiqueta: "Pago" },
  { valor: "reembolso", etiqueta: "Reembolso" },
  { valor: "reclamo", etiqueta: "Reclamo" },
  { valor: "otro", etiqueta: "Otro" },
];

const CANALES = [
  { icono: "whatsapp", titulo: "WhatsApp Business", valor: "+57 300 123 4567" },
  { icono: "email", titulo: "Correo", valor: "neodomus29@gmail.com" },
  { icono: "language", titulo: "Redes sociales", valor: "@NeodomusOficial" },
];

export default function AyudaScreen() {
  const [faqAbierta, setFaqAbierta] = useState<number | null>(0);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [asunto, setAsunto] = useState("");
  const [categoria, setCategoria] = useState("consulta-general");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const puedeEnviar =
    nombre.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim()) &&
    asunto.trim().length >= 3 && mensaje.trim().length >= 5;

  const manejarEnvio = async () => {
    setError("");
    setExito("");
    if (!puedeEnviar) {
      setError("Completa todos los campos: nombre, correo válido, asunto y mensaje (mínimo 5 caracteres).");
      return;
    }
    setEnviando(true);
    try {
      await apiFetch("/contacto", {
        method: "POST",
        body: JSON.stringify({
          nombre: nombre.trim(),
          email: correo.trim(),
          asunto: asunto.trim(),
          mensaje: mensaje.trim(),
          categoria,
        }),
      });
      setExito("Consulta enviada. Te responderemos pronto.");
      setNombre("");
      setCorreo("");
      setAsunto("");
      setMensaje("");
      setCategoria("consulta-general");
    } catch (err: any) {
      setError(err?.friendly ?? "No pudimos enviar tu consulta. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.seguro} edges={["bottom"]}>
      <NeoHeader />
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>Ayuda y soporte</Text>
        <Text style={styles.subtitulo}>
          Encuentra respuestas, contáctanos o envíanos tu consulta.
        </Text>

        <Text style={styles.tituloSeccion}>Preguntas frecuentes</Text>
        {FAQ.map((item, i) => {
          const abierta = faqAbierta === i;
          return (
            <Pressable
              key={i}
              style={styles.faq}
              onPress={() => setFaqAbierta(abierta ? null : i)}
            >
              <View style={styles.faqFila}>
                <Text style={styles.faqPregunta}>{item.pregunta}</Text>
                <MaterialIcons
                  name={abierta ? "expand-less" : "expand-more"}
                  size={22}
                  color={Neo.oro}
                />
              </View>
              {abierta ? <Text style={styles.faqRespuesta}>{item.respuesta}</Text> : null}
            </Pressable>
          );
        })}

        <Text style={styles.tituloSeccion}>Canales de contacto</Text>
        <View style={styles.canales}>
          {CANALES.map((c) => (
            <View key={c.titulo} style={styles.canal}>
              <View style={styles.canalIcono}>
                <MaterialIcons name={c.icono as any} size={20} color={Neo.oroClaro} />
              </View>
              <View style={styles.canalTexto}>
                <Text style={styles.canalTitulo}>{c.titulo}</Text>
                <Text style={styles.canalValor}>{c.valor}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.tituloSeccion}>Enviar solicitud</Text>
        <View style={styles.formulario}>
          <Text style={styles.etiqueta}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Tu nombre"
            placeholderTextColor={Neo.textoTenue}
          />
          <Text style={styles.etiqueta}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            value={correo}
            onChangeText={setCorreo}
            placeholder="tucorreo@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={Neo.textoTenue}
          />
          <Text style={styles.etiqueta}>Categoría</Text>
          <View style={styles.chips}>
            {CATEGORIAS.map((c) => {
              const activa = categoria === c.valor;
              return (
                <Pressable
                  key={c.valor}
                  style={[styles.chip, activa && styles.chipActivo]}
                  onPress={() => setCategoria(c.valor)}
                >
                  <Text style={[styles.chipTexto, activa && styles.chipTextoActivo]}>
                    {c.etiqueta}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.etiqueta}>Asunto</Text>
          <TextInput
            style={styles.input}
            value={asunto}
            onChangeText={setAsunto}
            placeholder="¿En qué podemos ayudarte?"
            placeholderTextColor={Neo.textoTenue}
          />
          <Text style={styles.etiqueta}>Mensaje</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={mensaje}
            onChangeText={setMensaje}
            placeholder="Describe tu consulta, problema o sugerencia con el mayor detalle posible..."
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholderTextColor={Neo.textoTenue}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {exito ? <Text style={styles.exito}>{exito}</Text> : null}

          <NeoButton
            title="Enviar solicitud"
            onPress={manejarEnvio}
            loading={enviando}
            style={styles.margenTop}
          />
          {enviando ? (
            <ActivityIndicator size="small" color={Neo.oro} style={styles.cargando} />
          ) : null}
        </View>
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
  titulo: {
    color: Neo.texto,
    fontSize: 24,
    fontWeight: "800",
  },
  subtitulo: {
    color: Neo.textoSuave,
    fontSize: 13,
    marginTop: 2,
    marginBottom: 6,
  },
  tituloSeccion: {
    color: Neo.oroClaro,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 18,
    marginBottom: 10,
  },
  faq: {
    backgroundColor: Neo.tarjeta,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Neo.tarjetaBordeSuave,
    padding: 12,
    marginBottom: 8,
  },
  faqFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  faqPregunta: {
    color: Neo.texto,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  faqRespuesta: {
    color: Neo.textoSuave,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  canales: {
    gap: 8,
  },
  canal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Neo.tarjeta,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Neo.tarjetaBordeSuave,
    padding: 12,
  },
  canalIcono: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Neo.fondoSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  canalTexto: {
    flex: 1,
  },
  canalTitulo: {
    color: Neo.texto,
    fontSize: 13.5,
    fontWeight: "700",
  },
  canalValor: {
    color: Neo.textoSuave,
    fontSize: 13,
    marginTop: 1,
  },
  formulario: {
    backgroundColor: Neo.tarjeta,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Neo.tarjetaBordeSuave,
    padding: 14,
  },
  etiqueta: {
    color: Neo.textoSuave,
    fontSize: 12.5,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
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
  textArea: {
    minHeight: 110,
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
  error: {
    color: Neo.error,
    fontSize: 13,
    marginTop: 10,
    lineHeight: 19,
  },
  exito: {
    color: Neo.exito,
    fontSize: 13,
    marginTop: 10,
    lineHeight: 19,
  },
  margenTop: {
    marginTop: 14,
  },
  cargando: {
    marginTop: 8,
  },
});