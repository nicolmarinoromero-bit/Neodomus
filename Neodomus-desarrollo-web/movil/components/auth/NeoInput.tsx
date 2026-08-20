import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { Neo } from "@/constants/theme";

interface NeoInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function NeoInput({ label, error, style, ...props }: NeoInputProps) {
  return (
    <View style={styles.contenedor}>
      {label ? <Text style={styles.etiqueta}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={Neo.inputPlaceholder}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...props}
      />
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
  input: {
    backgroundColor: Neo.inputFondo,
    borderWidth: 1,
    borderColor: Neo.inputBorde,
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 13,
    color: Neo.texto,
    fontSize: 15,
  },
  inputError: {
    borderColor: Neo.error,
  },
  error: {
    color: Neo.error,
    fontSize: 12,
    marginTop: 6,
  },
});