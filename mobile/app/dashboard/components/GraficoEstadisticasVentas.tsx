import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getEstadisticasVentas } from '../../../services/ventas';
import { Picker } from '@react-native-picker/picker';

interface EstadisticasData {
  ventas: number[];
  ganancias: number[];
}

export default function GraficoEstadisticasVentas() {
  const [data, setData] = useState<EstadisticasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [año, setAño] = useState(new Date().getFullYear());

  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        setLoading(true);
        const res = await getEstadisticasVentas(año);
        setData(res.data);
      } catch (e) {
        console.error('Error al cargar estadísticas:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchEstadisticas();
  }, [año]);

  if (loading) {
    return (
      <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, height: 350 }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ textAlign: 'center', color: '#6b7280', marginTop: 16 }}>
          Cargando estadísticas...
        </Text>
      </View>
    );
  }

  const chartData = data
    ? meses.map((mes, i) => ({
        mes,
        ventas: data.ventas[i] || 0,
        ganancias: data.ganancias[i] || 0
      }))
    : [];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-PY').format(value);

  // Obtener el valor máximo para escalar las barras
  const maxValue = Math.max(
    ...chartData.map(item => Math.max(item.ventas, item.ganancias))
  );

  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
          <Ionicons name="bar-chart" size={24} color="#3b82f6" />
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>
            Estadísticas {año}
          </Text>
        </View>

        {/* Selector de año */}
        <View style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, overflow: 'hidden', minWidth: 80 }}>
          <Picker
            selectedValue={año}
            onValueChange={(value) => setAño(value)}
            style={{ height: 40 }}
          >
            <Picker.Item label="2023" value={2023} />
            <Picker.Item label="2024" value={2024} />
            <Picker.Item label="2025" value={2025} />
          </Picker>
        </View>
      </View>

      {/* Gráfico de barras */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 180, gap: 8, paddingHorizontal: 8 }}>
          {chartData.map((item, index) => {
            const ventasHeight = maxValue > 0 ? (item.ventas / maxValue) * 140 : 0;
            const gananciasHeight = maxValue > 0 ? (item.ganancias / maxValue) * 140 : 0;

            return (
              <View key={index} style={{ alignItems: 'center', gap: 8 }}>
                {/* Barras */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 150 }}>
                  {/* Barra de Ventas */}
                  <View style={{ alignItems: 'center' }}>
                    {item.ventas > 0 && (
                      <Text style={{ fontSize: 8, color: '#3b82f6', marginBottom: 2, fontWeight: '600' }}>
                        {formatCurrency(item.ventas)}
                      </Text>
                    )}
                    <LinearGradient
                      colors={['#3b82f6', '#60a5fa']}
                      style={{ width: 14, height: Math.max(ventasHeight, 2), borderRadius: 3 }}
                    />
                  </View>

                  {/* Barra de Ganancias */}
                  <View style={{ alignItems: 'center' }}>
                    {item.ganancias > 0 && (
                      <Text style={{ fontSize: 8, color: '#10b981', marginBottom: 2, fontWeight: '600' }}>
                        {formatCurrency(item.ganancias)}
                      </Text>
                    )}
                    <LinearGradient
                      colors={['#10b981', '#34d399']}
                      style={{ width: 14, height: Math.max(gananciasHeight, 2), borderRadius: 3 }}
                    />
                  </View>
                </View>

                {/* Mes */}
                <Text style={{ fontSize: 10, color: '#6b7280', width: 32, textAlign: 'center' }}>
                  {item.mes}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Leyenda */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 12, height: 12, backgroundColor: '#3b82f6', borderRadius: 3 }} />
          <Text style={{ fontSize: 12, color: '#6b7280' }}>Ventas</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 12, height: 12, backgroundColor: '#10b981', borderRadius: 3 }} />
          <Text style={{ fontSize: 12, color: '#6b7280' }}>Ganancias</Text>
        </View>
      </View>
    </View>
  );
}
