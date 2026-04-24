import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { getCobrosDelDia } from "../../../services/ingreso";
import { Ionicons } from "@expo/vector-icons";

interface DetalleCobro {
  idingreso: number;
  monto: string;
  hora: string | null;
  concepto: string;
  idformapago: number;
}

interface CobrosDia {
  fecha: string;
  totalDia: string;
  detalle: DetalleCobro[];
}

export default function CobrosDelDiaCard() {
  const [data, setData] = useState<CobrosDia | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCobrosDelDia();
        setData(res.data as CobrosDia);
      } catch {
        setErr("No se pudieron obtener los cobros del día");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <SkeletonCard />;
  if (err) return <ErrorCard msg={err} />;
  if (!data || data.detalle.length === 0) return null;

  const fechaStr = new Date(data.fecha).toLocaleDateString("es-PY", {
    day: "2-digit",
    month: "long",
  });

  return (
    <View className="rounded-2xl bg-white shadow-sm">
      {/* Header */}
      <View className="p-4 flex-row items-center gap-3 border-b border-gray-100">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
          <Ionicons name="receipt-outline" size={20} color="#10B981" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800">
            Cobros de hoy
          </Text>
          <Text className="text-xs text-gray-500">{fechaStr}</Text>
        </View>
        <View className="bg-emerald-50 px-3 py-1 rounded-full">
          <Text className="text-emerald-700 font-bold text-sm">
            {parseFloat(data.totalDia).toLocaleString("es-PY")} Gs
          </Text>
        </View>
      </View>

      {/* Lista de cobros */}
      <View className="p-4">
        {data.detalle.slice(0, 5).map((cobro, idx) => (
          <View
            key={cobro.idingreso}
            className={`flex-row items-center justify-between py-3 ${
              idx !== data.detalle.length - 1 && idx !== 4 ? "border-b border-gray-100" : ""
            }`}
          >
            <View className="flex-1 pr-4">
              <Text className="text-sm text-gray-800" numberOfLines={2}>
                {cobro.concepto}
              </Text>
              {cobro.hora && (
                <Text className="text-xs text-gray-400 mt-1">
                  {cobro.hora}
                </Text>
              )}
            </View>
            <Text className="text-sm font-semibold text-gray-900">
              {parseFloat(cobro.monto).toLocaleString("es-PY")}
            </Text>
          </View>
        ))}

        {data.detalle.length > 5 && (
          <Text className="text-xs text-center text-gray-400 mt-2">
            +{data.detalle.length - 5} cobros más
          </Text>
        )}
      </View>
    </View>
  );
}

function SkeletonCard() {
  return (
    <View className="h-32 rounded-2xl bg-white shadow items-center justify-center">
      <ActivityIndicator size="large" color="#10B981" />
    </View>
  );
}

function ErrorCard({ msg }: { msg: string }) {
  return (
    <View className="rounded-2xl bg-white p-4 shadow border border-red-500">
      <View className="flex-row items-center gap-2">
        <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
        <Text className="text-red-600 flex-1">{msg}</Text>
      </View>
    </View>
  );
}
