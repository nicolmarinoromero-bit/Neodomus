// QUE HACE:
// Importa Tabs para la navegación inferior.
import { Tabs } from "expo-router";

// QUE HACE:
// Layout de pestañas.
//
// PARA QUE SIRVE:
// Mostrar Inicio y Productos.
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
    }}
    >
      <Tabs.Screen
        name="home"
        options={{
        title: "Inicio",
        }}
      />

      <Tabs.Screen
        name="productos"
        options={{
        title: "Productos",
        }}
      />
    </Tabs>
  );
}