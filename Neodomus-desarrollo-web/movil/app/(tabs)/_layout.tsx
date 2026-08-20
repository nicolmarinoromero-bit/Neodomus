import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useSession } from "@/contexts/SessionContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isLogged } = useSession();
  const tint = Colors[colorScheme ?? "light"].tint;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: tint,
        tabBarStyle: { backgroundColor: "#0b0b0d", borderTopColor: "rgba(212,165,75,0.28)" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Productos",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="shippingbox.fill" color={color} />
          ),
        }}
      />

      {isLogged ? (
        <Tabs.Screen
          name="tecnicos"
          options={{
            title: "Técnicos",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="wrench.fill" color={color} />
            ),
          }}
        />
      ) : null}

      {isLogged ? (
        <Tabs.Screen
          name="citas"
          options={{
            title: "Citas",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="calendar.fill" color={color} />
            ),
          }}
        />
      ) : null}

      {isLogged ? (
        <Tabs.Screen
          name="perfil"
          options={{
            title: "Mi perfil",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="person.fill" color={color} />
            ),
          }}
        />
      ) : (
        <Tabs.Screen
          name="ayuda"
          options={{
            title: "Ayuda",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="help.fill" color={color} />
            ),
          }}
        />
      )}
    </Tabs>
  );
}