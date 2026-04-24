import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { listarDeudasVentaAgrupadasPorClienteSinPaginar } from "../../../services/ventas";

interface Totals {
  itemsPendientes: number;
  totalDeuda: number;
  saldo: number;
}

const fmt = new Intl.NumberFormat("es-PY", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const fmtMoney = (v: number | string) =>
  new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    minimumFractionDigits: 0,
  }).format(+v);

// Card mejorado para móvil con gradiente y icono
function MetricCard({
  title,
  value,
  icon,
  colors,
}: {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  colors: string[];
}) {
  return (
    <View className="flex-1 min-w-[45%]">
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-4 shadow-lg"
      >
        <View className="flex-row items-center justify-between mb-2">
          <Ionicons name={icon} size={24} color="rgba(255,255,255,0.9)" />
        </View>
        <Text className="text-white/80 text-xs mb-1">{title}</Text>
        <Text className="text-white text-lg font-bold">{value}</Text>
      </LinearGradient>
    </View>
  );
}

export default function EcommerceMetrics() {
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await listarDeudasVentaAgrupadasPorClienteSinPaginar();
      setTotals(res.data.totals);
    } catch (e) {
      console.error(e);
      setErr("No se pudieron cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <View className="bg-white rounded-2xl p-6 shadow-sm">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (err) {
    return (
      <View className="bg-red-50 rounded-2xl p-4 border border-red-200">
        <Text className="text-red-600 text-sm">{err}</Text>
      </View>
    );
  }

  if (!totals) return null;

  return (
    <View className="gap-4">
      {/* Cards de métricas */}
      <View className="flex-row flex-wrap gap-3">
        <MetricCard
          title="Ítems pendientes"
          value={fmt.format(totals.itemsPendientes)}
          icon="list-outline"
          colors={["#6366F1", "#8B5CF6"]}
        />
        <MetricCard
          title="Total deuda"
          value={fmtMoney(totals.totalDeuda)}
          icon="cash-outline"
          colors={["#EF4444", "#F97316"]}
        />
        <MetricCard
          title="Saldo pendiente"
          value={fmtMoney(totals.saldo)}
          icon="wallet-outline"
          colors={["#10B981", "#14B8A6"]}
        />
      </View>
    </View>
  );
}
