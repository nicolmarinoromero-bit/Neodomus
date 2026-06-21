// QUE HACE:
// Importa Stack de Expo Router.
//
// PARA QUE SIRVE:
// Gestionar la navegación entre pantallas.
import { Stack } from "expo-router";

// QUE HACE:
// Layout principal de la aplicación.
//
// PARA QUE SIRVE:
// Registrar todas las rutas del proyecto.
  export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );}