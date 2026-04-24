import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { Link, router, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getDataUser } from "../services/usuarios";
import api from "../lib/axiosConfig";
import { useUserStore } from "../store/useUserStore";

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 70;

type IconProps = { size?: number; color?: string };

interface SubItem {
  name: string;
  path: string;
  pro?: boolean;
  new?: boolean;
}

interface NavItem {
  name: string;
  icon: React.ComponentType<IconProps>;
  path?: string;
  subItems?: SubItem[];
}

interface UserData {
  acceso: string;
  nombreUsuario: string;
}

const InitialUserData: UserData = { acceso: "", nombreUsuario: "" };

export interface AppSidebarProps {
  navItems: NavItem[];
  isOpen: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  onCollapse: () => void;
  onClose: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({
  navItems,
  isOpen,
  isCollapsed,
  onToggle,
  onCollapse,
  onClose,
}) => {
  const pathname = usePathname();
  const resetStore = useUserStore((s) => s.resetStore);

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [userData, setUserData] = useState<UserData>(InitialUserData);
  const [slideAnim] = useState(new Animated.Value(-DRAWER_WIDTH));

  const isActive = useCallback((path: string) => pathname === path, [pathname]);

  // Animar apertura/cierre del drawer
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -DRAWER_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  useEffect(() => {
    navItems.forEach((nav, idx) => {
      if (!nav.subItems) return;
      if (nav.subItems.some((s) => isActive(s.path))) {
        setOpenSubmenu(idx);
      }
    });
  }, [pathname, navItems, isActive]);

  const handleSubmenuToggle = (idx: number) => {
    if (isCollapsed) {
      onCollapse(); // Expandir si está colapsado
      setTimeout(() => setOpenSubmenu(idx), 100);
    } else {
      setOpenSubmenu((prev) => (prev === idx ? null : idx));
    }
  };

  const handleUserData = async () => {
    try {
      const hasUser = await AsyncStorage.getItem("usuario");
      if (!hasUser) return;
      const res = await getDataUser();
      setUserData(res?.data ?? InitialUserData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    handleUserData();
  }, []);

  const getInitials = (fullName = "") =>
    fullName
      .trim()
      .split(" ")
      .map((w) => w[0] || "")
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const initials = getInitials(userData.nombreUsuario);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    await AsyncStorage.removeItem("usuario");
    await AsyncStorage.removeItem("auth_token");
    resetStore();
    setUserData(InitialUserData);
    router.replace("/login");
  };

  const currentWidth = isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <>
      {/* Overlay oscuro cuando está abierto */}
      {isOpen && (
        <Pressable
          onPress={onClose}
          className="absolute inset-0 z-40 bg-black/50"
        />
      )}

      {/* Drawer lateral */}
      <Animated.View
        style={{
          transform: [{ translateX: slideAnim }],
          width: currentWidth,
        }}
        className="absolute left-0 top-0 z-50 h-full bg-white shadow-2xl"
      >
        <View className="flex-1">
          {/* Header con botones */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            {!isCollapsed && (
              <Text className="text-xl font-bold text-gray-800">Panel</Text>
            )}
            <View className="flex-row gap-2">
              {/* Botón collapse/expand */}
              <Pressable
                onPress={onCollapse}
                className="h-10 w-10 items-center justify-center rounded-lg bg-gray-100 active:bg-gray-200"
              >
                <Ionicons
                  name={isCollapsed ? "chevron-forward" : "chevron-back"}
                  size={20}
                  color="#374151"
                />
              </Pressable>

              {/* Botón cerrar (solo visible cuando no está colapsado) */}
              {!isCollapsed && (
                <Pressable
                  onPress={onClose}
                  className="h-10 w-10 items-center justify-center rounded-lg bg-gray-100 active:bg-gray-200"
                >
                  <Ionicons name="close" size={20} color="#374151" />
                </Pressable>
              )}
            </View>
          </View>

          {/* User card */}
          {!isCollapsed && (
            <View className="m-4 flex-row items-center gap-3 rounded-xl bg-blue-50 p-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                <Text className="text-sm font-bold text-white">{initials}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500">Bienvenido</Text>
                <Text className="font-semibold text-gray-800" numberOfLines={1}>
                  {userData.nombreUsuario}
                </Text>
              </View>
            </View>
          )}

          {isCollapsed && (
            <View className="items-center py-4">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                <Text className="text-sm font-bold text-white">{initials}</Text>
              </View>
            </View>
          )}

          {/* Navigation Items */}
          <ScrollView className="flex-1 px-2" showsVerticalScrollIndicator={false}>
            {navItems.map((nav, idx) => {
              const Icon = nav.icon;
              const hasSubmenu = !!nav.subItems;
              const isSubmenuOpen = openSubmenu === idx;

              return (
                <View key={nav.name} className="mb-1">
                  {hasSubmenu ? (
                    <>
                      {/* Item con submenu */}
                      <Pressable
                        onPress={() => handleSubmenuToggle(idx)}
                        className={`flex-row items-center rounded-lg p-3 ${
                          isSubmenuOpen ? "bg-blue-50" : ""
                        }`}
                      >
                        <Icon size={22} color={isSubmenuOpen ? "#2563eb" : "#374151"} />
                        {!isCollapsed && (
                          <>
                            <Text
                              className={`ml-3 flex-1 font-medium ${
                                isSubmenuOpen ? "text-blue-600" : "text-gray-700"
                              }`}
                            >
                              {nav.name}
                            </Text>
                            <Ionicons
                              name="chevron-down"
                              size={18}
                              color="#9ca3af"
                              style={{
                                transform: [{ rotate: isSubmenuOpen ? "180deg" : "0deg" }],
                              }}
                            />
                          </>
                        )}
                      </Pressable>

                      {/* Submenu items */}
                      {!isCollapsed && isSubmenuOpen && nav.subItems && (
                        <View className="ml-8 mt-1">
                          {nav.subItems.map((subItem) => {
                            const isSubActive = isActive(subItem.path);
                            return (
                              <Link key={subItem.name} href={subItem.path} asChild>
                                <Pressable
                                  onPress={onClose}
                                  className={`rounded-md py-2.5 px-3 ${
                                    isSubActive ? "bg-blue-100" : ""
                                  }`}
                                >
                                  <Text
                                    className={`text-sm ${
                                      isSubActive
                                        ? "font-semibold text-blue-600"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {subItem.name}
                                  </Text>
                                </Pressable>
                              </Link>
                            );
                          })}
                        </View>
                      )}
                    </>
                  ) : nav.path ? (
                    /* Item simple con link */
                    <Link href={nav.path} asChild>
                      <Pressable
                        onPress={onClose}
                        className={`flex-row items-center rounded-lg p-3 ${
                          isActive(nav.path) ? "bg-blue-600" : ""
                        }`}
                      >
                        <Icon size={22} color={isActive(nav.path) ? "#fff" : "#374151"} />
                        {!isCollapsed && (
                          <Text
                            className={`ml-3 font-medium ${
                              isActive(nav.path) ? "text-white" : "text-gray-700"
                            }`}
                          >
                            {nav.name}
                          </Text>
                        )}
                      </Pressable>
                    </Link>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>

          {/* Logout button */}
          <View className="p-4 border-t border-gray-200">
            <Pressable
              onPress={handleLogout}
              className="flex-row items-center rounded-lg bg-red-500 p-3 active:bg-red-600"
            >
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              {!isCollapsed && (
                <Text className="ml-3 font-semibold text-white">Cerrar sesión</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </>
  );
};

export default AppSidebar;
