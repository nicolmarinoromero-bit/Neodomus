import { useRef } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { Neo } from "@/constants/theme";

interface CodeInputProps {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  error?: boolean;
}

/**
 * Input de código de 6 dígitos con casillas separadas:
 * avance automático, borrado hacia atrás y soporte de pegado.
 */
export default function CodeInput({
  value,
  onChange,
  length = 6,
  error,
}: CodeInputProps) {
  const refs = useRef<(TextInput | null)[]>([]);

  const digito = (i: number) => (value.length > i ? value[i] : "");

  const manejarCambio = (i: number, texto: string) => {
    const digitos = texto.replace(/\D/g, "");
    if (!digitos) return;
    if (digitos.length > 1) {
      // Pegado de un código completo
      const completo = (value.slice(0, i) + digitos).slice(0, length);
      onChange(completo);
      refs.current[Math.min(completo.length, length - 1)]?.focus();
      return;
    }
    const nuevo = (value.slice(0, i) + digitos + value.slice(i + 1)).slice(0, length);
    onChange(nuevo);
    if (i < length - 1) refs.current[i + 1]?.focus();
  };

  const manejarBorrar = (i: number) => {
    if (value.length === 0) return;
    const nuevo = value.slice(0, Math.max(0, i)) + value.slice(i + 1);
    onChange(nuevo);
    if (i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <View style={styles.fila}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={digito(i)}
          onChangeText={(t) => manejarCambio(i, t)}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === "Backspace" && digito(i) === "") {
              manejarBorrar(i);
            }
          }}
          keyboardType="number-pad"
          maxLength={6}
          selectTextOnFocus
          placeholder="•"
          placeholderTextColor={Neo.textoTenue}
          style={[styles.caja, error ? styles.cajaError : null]}
          aria-label={`Dígito ${i + 1}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  caja: {
    width: 46,
    height: 56,
    borderRadius: 13,
    backgroundColor: Neo.inputFondo,
    borderWidth: 1,
    borderColor: Neo.oro,
    color: Neo.texto,
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    padding: 0,
  },
  cajaError: {
    borderColor: Neo.error,
  },
});