import { StyleSheet, View, ViewStyle } from "react-native";

import { Neo } from "@/constants/theme";

export default function FormCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.tarjeta, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  tarjeta: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    backgroundColor: Neo.tarjeta,
    borderWidth: 1,
    borderColor: Neo.tarjetaBorde,
    borderRadius: 22,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
});