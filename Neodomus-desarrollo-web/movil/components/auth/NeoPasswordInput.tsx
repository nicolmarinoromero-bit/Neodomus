import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Neo } from "@/constants/theme";

interface NeoPasswordInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function NeoPasswordInput({
  label,
  error,
  style,
  ...props
}: NeoPasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.contenedor}>
      {label ? <Text style={styles.etiqueta}>{label}</Text> : null}
      <View style={[styles.caja, error ? styles.cajaError : null]}>
        <TextInput
          placeholderTextColor={Neo.inputPlaceholder}
          secureTextEntry={!visible}
          style={[styles.input, style]}
          {...props}
        />
        <Pressable
          onPress={() => setVisible((v) => !v)}
          hitSlop={8}
          accessibilityLabel={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          <Ionicons
            name={visible ? "eye-off-outline" : "eye-outline"}
            size={21}
            color={Neo.oro}
          />
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    marginBottom: 14,
  },
  etiqueta: {
    color: Neo.textoSuave,
    fontSize: 12.5,
    fontWeight: "500",
    marginBottom: 7,
    letterSpacing: 0.4,
  },
  caja: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Neo.inputFondo,
    borderWidth: 1,
    borderColor: Neo.inputBorde,
    borderRadius: 13,
    paddingHorizontal: 15,
  },
  cajaError: {
    borderColor: Neo.error,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    color: Neo.texto,
    fontSize: 15,
  },
  error: {
    color: Neo.error,
    fontSize: 12,
    marginTop: 6,
  },
});