import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import NeoHeader from "@/components/NeoHeader";
import { Neo } from "@/constants/theme";
import { useSession } from "@/contexts/SessionContext";

const PORQUE_NEODOMUS = [
  {
    titulo: "Confianza y seriedad",
    descripcion:
      "Trabajamos con transparencia y compromiso en cada proyecto.",
  },
  {
    titulo: "Innovación real",
    descripcion:
      "Ofrecemos soluciones modernas que se adaptan a tus necesidades.",
  },
  {
    titulo: "Calidad garantizada",
    descripcion:
      "Resultados eficientes y duraderos que generan valor.",
  },
];

const BLOG = [
  "La automatización del hogar ya no es cosa del futuro: en Neodomus hacemos posible que vivas en una casa inteligente hoy mismo.",
  "Confort, seguridad y ahorro de energía en un solo lugar. Así es la experiencia que solo Neodomus puede ofrecerte.",
  "Neodomus es pionera en llevar la domótica a los hogares de Colombia, convirtiéndose en referente de innovación y tecnología.",
];

export default function HomeScreen() {
  const { isLogged } = useSession();
  const [inicio, setInicio] = useState(true);

  if (inicio) {
    return (
      <ImageBackground
        source={require("../../assets/images/FONDO.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.titleContainer}>
            <View style={styles.goldLine} />
            <Text style={styles.title}>NEODOMUS</Text>
          </View>

          <Text style={styles.slogan}>
            {"\u201CNEODOMUS más que tecnología, una evolución.\u201D"}
          </Text>

          <Text style={styles.description}>
            En NEODOMUS ofrecemos soluciones integrales en tecnología,
            innovación y gestión de servicios, diseñadas para mejorar
            la seguridad, eficiencia y confianza de nuestros clientes.
          </Text>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => setInicio(false)}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.arrow}>{">"}</Text>
            </View>
            <Text style={styles.buttonText}>CONTINUAR</Text>
          </Pressable>
        </View>
      </ImageBackground>
    );
  }

  return (
    <SafeAreaView style={styles.seguro} edges={["bottom"]}>
      <NeoHeader />
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.tituloSeccion}>Sobre nosotros</Text>
        <Text style={styles.parrafo}>
          En Neodomus ofrecemos soluciones innovadoras y confiables que generan
          valor real a nuestros clientes. Nos enfocamos en la calidad, la
          tecnología y la confianza, brindando servicios eficientes que se
          adaptan a cada necesidad.
        </Text>
        <Text style={styles.parrafo}>
          Nuestra misión es transformar ideas en resultados y nuestra visión,
          consolidarnos como un aliado estratégico que impulse el crecimiento y
          la evolución de quienes confían en nosotros.
        </Text>

        <Text style={styles.tituloSeccion}>Porque contratar NEODOMUS</Text>
        {PORQUE_NEODOMUS.map((item, i) => (
          <View key={item.titulo} style={styles.tarjeta}>
            <Text style={styles.tarjetaIndice}>{String(i + 1).padStart(2, "0")}</Text>
            <View style={styles.tarjetaTexto}>
              <Text style={styles.tarjetaTitulo}>{item.titulo}</Text>
              <Text style={styles.tarjetaDescripcion}>{item.descripcion}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.tituloSeccion}>Blog</Text>
        {BLOG.map((texto, i) => (
          <View key={i} style={[styles.tarjeta, styles.tarjetaBlog]}>
            <Text style={styles.tarjetaBlogTexto}>{texto}</Text>
          </View>
        ))}

        <Text style={styles.tituloSeccion}>Explora</Text>
        <View style={styles.acciones}>
          <Pressable
            style={({ pressed }) => [styles.accion, pressed && styles.presionado]}
            onPress={() => router.push("/(tabs)/explore")}
          >
            <MaterialIcons name="inventory-2" size={22} color={Neo.oroClaro} />
            <Text style={styles.accionTexto}>Ver productos</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.accion, pressed && styles.presionado]}
            onPress={() => router.push(isLogged ? "/(tabs)/citas" : "/(tabs)/ayuda")}
          >
            <MaterialIcons
              name={isLogged ? "event" : "help"}
              size={22}
              color={Neo.oroClaro}
            />
            <Text style={styles.accionTexto}>
              {isLogged ? "Agendar cita" : "Ayuda y soporte"}
            </Text>
          </Pressable>
          {!isLogged ? (
            <Pressable
              style={({ pressed }) => [styles.accion, styles.accionLogin, pressed && styles.presionado]}
              onPress={() => router.push("/login")}
            >
              <MaterialIcons name="login" size={22} color="#1a140a" />
              <Text style={[styles.accionTexto, styles.accionLoginTexto]}>
                Iniciar sesión
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "rgba(0,0,0,0.60)",
  },
  titleContainer: {
    position: "relative",
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -1,
    zIndex: 1,
  },
  goldLine: {
    position: "absolute",
    left: 0,
    bottom: 8,
    width: 175,
    height: 18,
    backgroundColor: "#CAA24D",
    zIndex: 0,
  },
  slogan: {
    color: "#CAA24D",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    lineHeight: 28,
  },
  description: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 28,
    marginBottom: 35,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 2,
    borderColor: "#FFF",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 4,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  arrow: {
    color: "#FFF",
    fontWeight: "bold",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2,
  },
  seguro: {
    flex: 1,
    backgroundColor: Neo.fondo,
  },
  contenido: {
    padding: 16,
    paddingBottom: 32,
  },
  tituloSeccion: {
    color: Neo.oroClaro,
    fontSize: 19,
    fontWeight: "800",
    marginTop: 18,
    marginBottom: 10,
  },
  parrafo: {
    color: Neo.textoSuave,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 8,
  },
  tarjeta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Neo.tarjeta,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Neo.tarjetaBordeSuave,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  tarjetaIndice: {
    color: Neo.oro,
    fontSize: 22,
    fontWeight: "900",
    opacity: 0.85,
  },
  tarjetaTexto: {
    flex: 1,
  },
  tarjetaTitulo: {
    color: Neo.texto,
    fontSize: 14.5,
    fontWeight: "700",
    marginBottom: 2,
  },
  tarjetaDescripcion: {
    color: Neo.textoSuave,
    fontSize: 13,
    lineHeight: 19,
  },
  tarjetaBlog: {
    alignItems: "flex-start",
  },
  tarjetaBlogTexto: {
    color: Neo.textoSuave,
    fontSize: 13,
    lineHeight: 19,
  },
  acciones: {
    gap: 8,
  },
  accion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: Neo.oro,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  accionLogin: {
    backgroundColor: Neo.oro,
  },
  presionado: {
    opacity: 0.8,
  },
  accionTexto: {
    color: Neo.oroClaro,
    fontSize: 14.5,
    fontWeight: "700",
  },
  accionLoginTexto: {
    color: "#1a140a",
  },
});