import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { Neo } from "@/constants/theme";

interface NeoButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primario" | "fantasma" | "peligro";
  style?: ViewStyle;
}

export default function NeoButton({
  title,
  onPress,
  loading,
  disabled,
  variant = "primario",
  style,
}: NeoButtonProps) {
  const inactivo = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [
        styles.base,
        variant === "primario" && styles.primario,
        variant === "fantasma" && styles.fantasma,
        variant === "peligro" && styles.peligro,
        pressed && !inactivo && styles.presionado,
        inactivo && styles.inactivo,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "fantasma" ? Neo.oro : "#1a140a"} size="small" />
      ) : (
        <Text
          style={[
            styles.texto,
            variant === "primario" && styles.textoPrimario,
            variant === "fantasma" && styles.textoFantasma,
            variant === "peligro" && styles.textoPeligro,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  primario: {
    backgroundColor: Neo.oro,
  },
  fantasma: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Neo.oro,
  },
  peligro: {
    backgroundColor: Neo.error,
  },
  presionado: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  inactivo: {
    opacity: 0.55,
  },
  texto: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  textoPrimario: {
    color: "#1a140a",
  },
  textoFantasma: {
    color: Neo.oroClaro,
  },
  textoPeligro: {
    color: "#ffffff",
  },
});