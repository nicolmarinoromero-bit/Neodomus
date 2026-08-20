import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { CommerceProvider } from "@/contexts/CommerceContext";
import { SessionProvider, useSession } from "@/contexts/SessionContext";
import { Neo } from "@/constants/theme";

const RUTAS_PROTEGIDAS = ["/tecnico", "/admin-blocked"];

/** Redirige a /login si se intenta abrir una ruta protegida sin sesión. */
function GuardRutas() {
  const { isLogged, loading } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const protegida = RUTAS_PROTEGIDAS.some((ruta) => pathname.startsWith(ruta));
    if (protegida && !isLogged) {
      router.replace("/login");
    }
  }, [pathname, isLogged, loading, router]);

  return null;
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <CommerceProvider>
        <GuardRutas />
        <StatusBar style="light" backgroundColor={Neo.fondo} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Neo.fondo },
            animation: "fade",
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="verify-email" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="verify-code" />
          <Stack.Screen name="reset-password" />
          <Stack.Screen name="tecnico" />
          <Stack.Screen name="admin-blocked" />
          <Stack.Screen name="carrito" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="favoritos" />
          <Stack.Screen name="mis-pedidos" />
          <Stack.Screen name="nueva-cita" />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
      </CommerceProvider>
    </SessionProvider>
  );
}
