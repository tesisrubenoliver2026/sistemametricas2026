import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import EcommerceMetrics from "./components/EcommerceMetrics";
import MonthlySalesChart from "./components/MonthlySalesChart";
import RecentOrders from "./components/RecentOrders";
import GraficoGananciasSimple from "./components/GraficoGananciasSimple";
import GraficoEstadisticasVentas from "./components/GraficoEstadisticasVentas";

const { width } = Dimensions.get('window');
const isSmallScreen = width < 768;

type PaletteKey = "indigo" | "emerald" | "sky" | "amber" | "rose" | "violet" | "cyan";

const PALETTES = {
  indigo: ["#6366F1", "#0EA5E9"],
  emerald: ["#10B981", "#14B8A6"],
  sky: ["#0EA5E9", "#06B6D4"],
  amber: ["#F59E0B", "#F97316"],
  rose: ["#F43F5E", "#EC4899"],
  violet: ["#8B5CF6", "#A21CAF"],
  cyan: ["#06B6D4", "#14B8A6"],
} as const;

// Card de acceso rápido compacto para móvil
function QuickActionCard({
  label,
  iconName,
  href,
  color = "indigo",
}: {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  href: string;
  color?: PaletteKey;
}) {
  const colors = PALETTES[color];

  return (
    <Pressable
      onPress={() => router.push(href)}
      className="flex-1 min-w-[45%] active:opacity-80"
      style={{ maxWidth: isSmallScreen ? '48%' : '30%' }}
      
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-4 shadow-lg"
      >
        <View className="items-center gap-2">
          <View className="bg-white/20 rounded-full p-3">
            <Ionicons name={iconName} size={24} color="#fff" />
          </View>
          <Text className="text-white font-semibold text-center text-xs">
            {label}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default function DashboardRender() {
  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="bg-gradient-to-r from-blue-600 to-blue-400 px-4 pt-6 pb-8 rounded-b-3xl shadow-lg">
        <Text className="text-gray-500 text-2xl font-bold mb-1">Dashboard</Text>
        <Text className="text-gray-400 text-sm">Resumen de tu negocio</Text>
      </View>

      {/* Contenido principal */}
      <View className="px-4 -mt-4">
        {/* Métricas principales */}
        <View className="mb-4">
          <EcommerceMetrics />
        </View>

        {/* Gráficos de análisis */}
        <View className="mb-4">
          <GraficoGananciasSimple />
        </View>

        <View className="mb-4">
          <GraficoEstadisticasVentas />
        </View>

        {/* Resumen de cobros del mes */}
        <View className="mb-4">
          <MonthlySalesChart />
        </View>

        {/* Cobros del día */}
        <View className="mb-4">
          <RecentOrders />
        </View>

        {/* Accesos rápidos */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="flash" size={20} color="#3b82f6" />
            <Text className="text-lg font-bold text-gray-800">Accesos Rápidos</Text>
          </View>

          <View className="flex-row flex-wrap gap-3">
            <QuickActionCard
              label="Ventas Programadas"
              iconName="calendar-outline"
              href='/venta/ventaProgramada'
              color="indigo"
            />
            <QuickActionCard
              label="Cobros"
              iconName="cash-outline"
              href='/venta/cobrodeuda'
              color="emerald"
            />
            <QuickActionCard
              label="Ingresos"
              iconName="trending-up-outline"
              href="/movimiento/ingreso"
              color="sky"
            />
            <QuickActionCard
              label="Egresos"
              iconName="trending-down-outline"
              href='/movimiento/egreso'
              color="amber"
            />
            <QuickActionCard
              label="Cierre de Caja"
              iconName="wallet-outline"
              href='/movimiento/cierrecaja'
              color="rose"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
