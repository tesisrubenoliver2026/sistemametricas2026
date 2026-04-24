import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '../../store/useUserStore';
import { getDataUser } from '../../services/usuarios';
import api from '../../lib/axiosConfig';

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  gradient: string[];
  path?: string;
  subItems?: { title: string; path: string; icon: keyof typeof Ionicons.glyphMap }[];
}

const menuItems: MenuItem[] = [
    {
    id: 'Administrativo',
    title: 'Administrativo',
    icon: 'person',
    color: '#6366f1',
    gradient: ['#6366f1', '#4f46e5'],
        subItems: [
      { title: 'Usuario', path: '/usuario', icon: 'person' },
      { title: 'Funcionarios', path: '/funcionarios', icon: 'person' },
    ],
  },
  {
    id: 'clientes',
    title: 'Clientes',
    icon: 'people',
    color: '#3b82f6',
    gradient: ['#3b82f6', '#2563eb'],
    path: '/clientes',
  },
  {
    id: 'compras',
    title: 'Compras',
    icon: 'basket',
    color: '#10b981',
    gradient: ['#10b981', '#059669'],
    subItems: [
      { title: 'Nueva Compra', path: '/compras', icon: 'add-circle' },
      { title: 'Cobro Deuda', path: '/compras/cobrodeuda', icon: 'cash' },
    ],
  },
    {
    id: 'ventas',
    title: 'Ventas',
    icon: 'basket',
    color: '#10b981',
    gradient: ['#10b981', '#059669'],
    subItems: [
      { title: 'Nueva Venta', path: '/venta', icon: 'add-circle' },
      { title: 'Cobro Deuda', path: '/venta/cobrodeuda', icon: 'cash' },
      { title: 'Ventas Programadas', path: '/venta/ventaProgramada', icon: 'cash' },
    ],
  },
  {
    id: 'movimientos',
    title: 'Movimientos',
    icon: 'swap-horizontal',
    color: '#f59e0b',
    gradient: ['#f59e0b', '#d97706'],
    subItems: [
      { title: 'Ingresos', path: '/movimiento/ingreso', icon: 'trending-up' },
      { title: 'Egresos', path: '/movimiento/egreso', icon: 'trending-down' },
      { title: 'Cierre Caja', path: '/movimiento/cierrecaja', icon: 'wallet' }
    ],
  },
  {
    id: 'proveedor',
    title: 'Proveedores',
    icon: 'business',
    color: '#8b5cf6',
    gradient: ['#8b5cf6', '#7c3aed'],
    path: '/proveedor',
  },
  {
    id: 'categoria',
    title: 'Categorías',
    icon: 'pricetags',
    color: '#ec4899',
    gradient: ['#ec4899', '#db2777'],
    path: '/categoria',
  },
  {
    id: 'facturador',
    title: 'Facturador',
    icon: 'receipt',
    color: '#06b6d4',
    gradient: ['#06b6d4', '#0891b2'],
    path: '/facturador',
  },
  {
    id: 'datosbancarios',
    title: 'Datos Bancarios',
    icon: 'card',
    color: '#14b8a6',
    gradient: ['#14b8a6', '#0d9488'],
    path: '/datosbancarios',
  },

    {
    id: 'productos',
    title: 'Productos',
    icon: 'person',
    color: '#6366f1',
    gradient: ['#6366f1', '#4f46e5'],
    path: '/producto',
  },
 {
  id: 'configuracion',
  title: 'Configuración',
  icon: 'settings',
  color: '#64748b',
  gradient: ['#64748b', '#475569'],
  subItems: [
    { title: 'Configuracion', path: '/configuracion', icon: 'options-outline' }, // o 'settings-outline', 'cog-outline'
    { title: 'Notificacion', path: '/notificacion', icon: 'notifications-outline' }, // o 'notifications', 'bell-outline'
  ],
},
];

export default function MenuPage() {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [userData, setUserData] = useState({ nombreUsuario: '', acceso: '' });
  const resetStore = useUserStore((s) => s.resetStore);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const hasUser = await AsyncStorage.getItem('usuario');
        if (!hasUser) return;
        const res = await getDataUser();
        setUserData(res?.data ?? { nombreUsuario: '', acceso: '' });
      } catch (e) {
        console.error(e);
      }
    };
    fetchUserData();
  }, []);

  const getInitials = (fullName = '') =>
    fullName
      .trim()
      .split(' ')
      .map((w) => w[0] || '')
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    await AsyncStorage.removeItem('usuario');
    await AsyncStorage.removeItem('auth_token');
    resetStore();
    router.replace('/login');
  };

  const handleSubItemPress = (path: string) => {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    router.push(cleanPath as any);
  };

  const handleMainItemPress = (item: MenuItem) => {
    if (item.subItems) {
      setExpandedItem(expandedItem === item.id ? null : item.id);
    } else if (item.path) {
      const cleanPath = item.path.startsWith('/') ? item.path.slice(1) : item.path;
      router.push(cleanPath as any);
    }
  };

  return (
    <View className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />

      {/* Header con degradado moderno */}
      <LinearGradient
        colors={['#3b82f6', '#2563eb', '#1d4ed8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pb-6 pt-4 px-5"
      >
        <View className="flex-row items-center justify-between mb-5">
          <Pressable
            onPress={() => router.push("/dashboard")}
            className="h-9 w-9 items-center justify-center rounded-xl bg-white/20 active:bg-white/30"
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>

          <Text className="text-xl font-bold text-white tracking-wide">Menú Principal</Text>

          <View className="h-9 w-9" />
        </View>

        {/* User Card rediseñado */}
        <View className="bg-white/15 rounded-2xl p-3.5 border border-white/20">
          <View className="flex-row items-center">
            <LinearGradient
              colors={['#818cf8', '#6366f1', '#4f46e5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="h-12 w-12 items-center justify-center rounded-full"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}
            >
              <Text className="text-base font-bold text-white">{getInitials(userData.nombreUsuario)}</Text>
            </LinearGradient>
            <View className="ml-3 flex-1">
              <Text className="text-white font-bold text-base" numberOfLines={1}>{userData.nombreUsuario || 'Usuario'}</Text>
              <View className="flex-row items-center mt-0.5">
                <View className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5" />
                <Text className="text-blue-100 text-xs font-medium">{userData.acceso || 'Rol no definido'}</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Menu Grid rediseñado */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
      >
        {/* Grid de módulos */}
        <View className="gap-3">
          {menuItems.map((item) => (
            <View key={item.id}>
              {/* Card principal */}
              <Pressable
                onPress={() => handleMainItemPress(item)}
                className="active:scale-98"
              >
                <LinearGradient
                  colors={[item.gradient[0], item.gradient[1]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-xl overflow-hidden"
                  style={{
                    shadowColor: item.color,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5
                  }}
                >
                  <View className="p-3.5 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View
                        className="h-11 w-11 items-center justify-center rounded-xl bg-white/25"
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 }}
                      >
                        <Ionicons name={item.icon} size={22} color="#fff" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-bold text-base">
                          {item.title}
                        </Text>
                        {item.subItems && (
                          <Text className="text-white/70 text-xs mt-0.5">
                            {item.subItems.length} opciones
                          </Text>
                        )}
                      </View>
                    </View>

                    {item.subItems ? (
                      <View className="h-7 w-7 items-center justify-center rounded-lg bg-white/20">
                        <Ionicons
                          name={expandedItem === item.id ? "chevron-up" : "chevron-down"}
                          size={18}
                          color="#fff"
                        />
                      </View>
                    ) : (
                      <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
                    )}
                  </View>
                </LinearGradient>
              </Pressable>

              {/* SubItems expandibles */}
              {item.subItems && expandedItem === item.id && (
                <View className="mt-2 ml-3 gap-2 bg-white rounded-xl p-2 shadow-sm">
                  {item.subItems.map((subItem, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => handleSubItemPress(subItem.path)}
                      className="flex-row items-center gap-3 bg-gray-50 rounded-lg p-3 active:bg-gray-100 border border-gray-100"
                    >
                      <View
                        className="h-8 w-8 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${item.color}15` }}
                      >
                        <Ionicons name={subItem.icon} size={18} color={item.color} />
                      </View>
                      <Text className="text-gray-700 font-semibold text-sm flex-1">{subItem.title}</Text>
                      <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Logout Button rediseñado */}
        <Pressable
          onPress={handleLogout}
          className="mt-6 mb-4 rounded-xl overflow-hidden active:opacity-90"
          style={{
            shadowColor: '#ef4444',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5
          }}
        >
          <LinearGradient
            colors={['#ef4444', '#dc2626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="p-4 flex-row items-center justify-center gap-2.5"
          >
            <Ionicons name="log-out-outline" size={22} color="#fff" />
            <Text className="text-white font-bold text-base">Cerrar Sesión</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}
