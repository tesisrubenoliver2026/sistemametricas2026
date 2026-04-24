import React from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface NavItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  path: string;
  color: string;
}

const mainNavItems: NavItem[] = [

  { label: 'Más', icon: 'grid', path: '/menu', color: '#8b5cf6' },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/' || pathname.startsWith('/dashboard');
    if (path === '/menu') return false; // El menú no se marca como activo
    return pathname.startsWith(path);
  };

  const handlePress = (path: string) => {
    // Remover el slash inicial para rutas de Expo Router
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    router.push(cleanPath as any);
  };

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl">
      {/* Decoración superior */}
      <View className="absolute -top-1 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <View className="flex-row items-center justify-around px-2 py-2 pb-safe">
        {mainNavItems.map((item) => {
          const active = isActive(item.path);

          return (
            <Pressable
              key={item.path}
              onPress={() => handlePress(item.path)}
              className="flex-1 items-center justify-center py-2 active:opacity-70"
            >
              <View className={`relative items-center ${active ? '-mt-2' : ''}`}>
                {/* Background activo con gradiente */}


                {/* Icono */}
                <View
                  className={`items-center justify-center rounded-2xl ${
                    active ? 'bg-white shadow-lg' : ''
                  }`}
                  style={active ? { width: 56, height: 56 } : { width: 40, height: 40 }}
                >
                  <Ionicons
                    name={active ? item.icon : `${item.icon}-outline` as any}
                    size={active ? 26 : 24}
                    color={active ? item.color : '#6b7280'}
                  />
                </View>

                {/* Label */}
                <Text
                  className={`mt-1 text-xs font-medium ${
                    active ? 'text-gray-800' : 'text-gray-500'
                  }`}
                  style={active ? { color: item.color } : {}}
                >
                  {item.label}
                </Text>

                {/* Indicador de activo */}
                {active && (
                  <View
                    className="mt-1 h-1 w-8 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
