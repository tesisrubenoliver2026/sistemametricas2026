import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { getCobrosMensuales } from "../../../services/ingreso";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface CobroMesActual {
  anio: number;
  mes: number;
  totalMensual: number;
}

export default function ResumenCobroMensual() {
  const [data, setData] = useState<CobroMesActual | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const fetchCobro = async () => {
      try {
        const res = await getCobrosMensuales();
        setData(res.data as CobroMesActual);
      } catch (e) {
        console.error(e);
        setErr("No se pudo obtener el cobro del mes");
      } finally {
        setLoading(false);
      }
    };
    fetchCobro();
  }, []);

  if (loading) return <SkeletonCard />;
  if (err) return <ErrorCard message={err} />;
  if (!data) return null;

  const { anio, mes, totalMensual } = data;
  const monthStr = new Intl.DateTimeFormat("es", { month: "long" }).format(
    new Date(anio, mes - 1)
  );
  const totalFmt = totalMensual.toLocaleString("es-PY");

  return (
    <View className="rounded-xl overflow-hidden bg-white shadow-lg border border-gray-200">
      <LinearGradient
        colors={["#6366F1", "#0EA5E9", "#10B981"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="h-1.5"
      />

      <View className="p-6 gap-4">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-indigo-100">
            <Ionicons name="cash-outline" size={24} color="#6366F1" />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-500">
              Cobros de {monthStr.charAt(0).toUpperCase() + monthStr.slice(1)}
            </Text>
            <Text className="text-xs text-gray-400">Año {anio}</Text>
          </View>
        </View>

        <Text className="text-3xl font-bold text-gray-800 text-center">
          {totalFmt} <Text className="text-lg font-semibold">Gs</Text>
        </Text>
      </View>
    </View>
  );
}

function SkeletonCard() {
  return (
    <View className="rounded-xl bg-white shadow-lg border border-gray-200 h-32 items-center justify-center">
      <ActivityIndicator size="large" />
    </View>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <View className="rounded-xl bg-white shadow-lg border border-red-500 p-6">
      <Text className="text-red-600">{message}</Text>
    </View>
  );
}
