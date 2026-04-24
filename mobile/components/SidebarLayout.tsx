import React, { useEffect } from "react";
import { View, StatusBar, Platform } from "react-native";
import { Slot, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserStore } from "../store/useUserStore";
import BottomNavigation from "./BottomNavigation";

interface SidebarLayoutProps {
  children?: React.ReactNode;
  hideBottomNav?: boolean;
}

export default function SidebarLayout({ children, hideBottomNav = false }: SidebarLayoutProps) {
  const userRole = useUserStore((s) => s.userRole);

  useEffect(() => {
    const checkAuth = async () => {
      const stored = await AsyncStorage.getItem("usuario");
      if (!userRole && !stored) {
        router.replace("/login");
      }
    };
    checkAuth();
  }, [userRole]);

  return (
    <View
      className="flex-1 bg-gray-50"
      style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      {/* Contenido principal */}
      <View className="flex-1">
        {children ?? <Slot />}
      </View>

      {/* Bottom Navigation */}
      {!hideBottomNav && <BottomNavigation />}
    </View>
  );
}
