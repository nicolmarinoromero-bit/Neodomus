// QUE HACE:
// Importa componentes de React Native.
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

// QUE HACE:
// Define las propiedades del botón.
//
// PARA QUE SIRVE:
// Permitir reutilizar el mismo botón
// en todas las pantallas.
interface CustomButtonProps {
  title: string;

  onPress: () => void;

  disabled?: boolean;
}

// QUE HACE:
// Componente reutilizable para botones.
//
// PARA QUE SIRVE:
// Mantener el diseño uniforme.
export default function CustomButton({
  title,
  onPress,
  disabled = false,
}: CustomButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.9}
    >
      <Text style={styles.text}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

// QUE HACE:
// Define los estilos visuales del botón.
const styles = StyleSheet.create({
  button: {
    height: 55,

    borderRadius: 10,

    backgroundColor: "#CAA24D",

    justifyContent: "center",

    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.5,
  },

  text: {
    color: "#000000",

    fontSize: 16,

    fontWeight: "700",
  },
});