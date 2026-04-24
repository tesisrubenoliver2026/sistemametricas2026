import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getGanancias } from '../../../services/ventas';

const { width } = Dimensions.get('window');
const chartWidth = width - 64; // padding

interface GananciaPeriodo {
  periodo: string;
  total_ventas: number;
  ganancia_total: number;
  ganancia_promedio: number;
  ventas_total: number;
  iva_total: number;
}

export default function GraficoGananciasSimple() {
  const [data, setData] = useState<GananciaPeriodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarGanancias = async () => {
      try {
        const res = await getGanancias({
          tipo: 'dia',
          limit: 30
        });

        console.log('Respuesta del servidor:', res.data);
        const datos = res.data.data || res.data;

        if (Array.isArray(datos)) {
          setData(datos);
        } else {
          console.error('La respuesta no es un array:', res.data);
          setError('Formato de datos incorrecto');
          setData([]);
        }
      } catch (e) {
        console.error('Error al cargar ganancias:', e);
        setError('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    cargarGanancias();
  }, []);

  if (loading) {
    return (
      <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, height: 350 }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ textAlign: 'center', color: '#6b7280', marginTop: 16 }}>
          Cargando ganancias...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ backgroundColor: '#fef2f2', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#fecaca' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Ionicons name="alert-circle" size={24} color="#dc2626" />
          <Text style={{ color: '#dc2626', fontWeight: 'bold', fontSize: 16 }}>Error</Text>
        </View>
        <Text style={{ color: '#ef4444', fontSize: 14 }}>{error}</Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Ionicons name="trending-up" size={24} color="#3b82f6" />
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>
            Ganancias - Últimos 30 días
          </Text>
        </View>
        <Text style={{ color: '#6b7280', textAlign: 'center', paddingVertical: 32 }}>
          No hay datos disponibles para mostrar
        </Text>
      </View>
    );
  }

  // Calcular totales
  const totalVentas = data.reduce((sum, item) => sum + item.ventas_total, 0);
  const totalGanancias = data.reduce((sum, item) => sum + item.ganancia_total, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PY').format(value);
  };

  // Formatear fecha
  const formatFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-PY', { day: '2-digit', month: 'short' });
  };

  // Obtener el valor máximo para escalar las barras
  const maxValue = Math.max(
    ...data.map(item => Math.max(item.ventas_total, item.ganancia_total))
  );

  // Preparar datos (últimos 10 días para mejor visualización en móvil)
  const chartData = data.slice(0, 10).reverse();

  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Ionicons name="trending-up" size={24} color="#3b82f6" />
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', flex: 1 }}>
          Ganancias - Últimos 10 días
        </Text>
      </View>

      {/* Resumen */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
        <View style={{ flex: 1, backgroundColor: '#dbeafe', borderRadius: 12, padding: 12 }}>
          <Text style={{ fontSize: 12, color: '#2563eb', marginBottom: 4 }}>Total Ventas</Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1e40af' }} numberOfLines={1}>
            ₲ {formatCurrency(totalVentas)}
          </Text>
        </View>
        <View style={{ flex: 1, backgroundColor: totalGanancias >= 0 ? '#d1fae5' : '#fee2e2', borderRadius: 12, padding: 12 }}>
          <Text style={{ fontSize: 12, color: totalGanancias >= 0 ? '#059669' : '#dc2626', marginBottom: 4 }}>
            Total Ganancias
          </Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: totalGanancias >= 0 ? '#065f46' : '#991b1b' }} numberOfLines={1}>
            ₲ {formatCurrency(totalGanancias)}
          </Text>
        </View>
      </View>

      {/* Gráfico de barras simple */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 180, gap: 12, paddingHorizontal: 8 }}>
          {chartData.map((item, index) => {
            const ventasHeight = (item.ventas_total / maxValue) * 140;
            const gananciasHeight = (item.ganancia_total / maxValue) * 140;

            return (
              <View key={index} style={{ alignItems: 'center', gap: 8 }}>
                {/* Barras */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 150 }}>
                  {/* Barra de Ventas */}
                  <View style={{ alignItems: 'center' }}>
                    <LinearGradient
                      colors={['#3b82f6', '#60a5fa']}
                      style={{ width: 16, height: Math.max(ventasHeight, 4), borderRadius: 4 }}
                    />
                  </View>

                  {/* Barra de Ganancias */}
                  <View style={{ alignItems: 'center' }}>
                    <LinearGradient
                      colors={['#10b981', '#34d399']}
                      style={{ width: 16, height: Math.max(gananciasHeight, 4), borderRadius: 4 }}
                    />
                  </View>
                </View>

                {/* Fecha */}
                <Text style={{ fontSize: 10, color: '#6b7280', width: 40, textAlign: 'center' }}>
                  {formatFecha(item.periodo)}
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
