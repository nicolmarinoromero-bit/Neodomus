// QUE HACE:
// Importa componentes de React Native.
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

// QUE HACE:
// Importa iconos de Expo.
//
// PARA QUE SIRVE:
// Mostrar iconos en los inputs.
import { Ionicons } from "@expo/vector-icons";

// QUE HACE:
// Define las propiedades del componente.
//
// PARA QUE SIRVE:
// Permitir reutilizar el input
// en toda la aplicación.
interface CustomInputProps {
  placeholder: string;

  value: string;

  onChangeText: (text: string) => void;

  secureTextEntry?: boolean;

  leftIcon?: keyof typeof Ionicons.glyphMap;

  rightIcon?: keyof typeof Ionicons.glyphMap;

  onRightIconPress?: () => void;
}

// QUE HACE:
// Componente reutilizable para inputs.
//
// PARA QUE SIRVE:
// Mantener el mismo diseño visual.
export default function CustomInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
}: CustomInputProps) {
  return (
    <View style={styles.container}>

      {leftIcon && (
        <Ionicons
          name={leftIcon}
          size={20}
          color="#CAA24D"
          style={styles.leftIcon}
        />
      )}

      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#7A7A7A"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        style={styles.input}
      />

      {rightIcon && (
        <TouchableOpacity
          onPress={onRightIconPress}
        >
          <Ionicons
            name={rightIcon}
            size={20}
            color="#CAA24D"
          />
        </TouchableOpacity>
      )}

    </View>
  );
}

// QUE HACE:
// Define los estilos visuales.
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    alignItems: "center",

    borderWidth: 1,

    borderColor: "#CAA24D",

    borderRadius: 10,

    backgroundColor: "rgba(0,0,0,0.65)",

    paddingHorizontal: 15,

    marginBottom: 15,

    height: 58,
  },

  leftIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,

    color: "#FFFFFF",

    fontSize: 15,
  },
});