"use client";
import { useEffect, useState } from "react";
import { getGanancias } from "../../services/ventas";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
    return <div className="bg-white rounded-lg shadow p-6 h-96 animate-pulse" />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600 font-semibold">Error</p>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center py-8">
          No hay datos disponibles para mostrar
        </p>
      </div>
    );
  }

  // Formatear fecha
  const formatFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-PY', { day: '2-digit', month: 'short' });
  };

  // Datos para el gráfico
  const chartData = data
    .slice()
    .reverse() 
    .map(item => ({
      fecha: formatFecha(item.periodo),
      Ventas: item.ventas_total,
      Ganancias: item.ganancia_total
    }));

  // Calcular totales
  const totalVentas = data.reduce((sum, item) => sum + item.ventas_total, 0);
  const totalGanancias = data.reduce((sum, item) => sum + item.ganancia_total, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PY').format(value);
  };
  console.log("Datos del chart", chartData)

  return (
    <div className="bg-white rounded-lg shadow-lg pt-3 pb-9 pl-3 pr-3 h-[90%]">
      <div className="mb-1">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Ganancias - Últimos 30 días
        </h2>
        
        {/* Resumen */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 mb-1">Total Ventas</p>
            <p className="text-2xl font-bold text-blue-900">
              ₲ {formatCurrency(totalVentas)}
            </p>
          </div>
          <div className={`rounded-lg p-4 ${totalGanancias >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`text-sm mb-1 ${totalGanancias >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Total Ganancias
            </p>
            <p className={`text-2xl font-bold ${totalGanancias >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              ₲ {formatCurrency(totalGanancias)}
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorGanancias" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fecha" style={{ fontSize: '12px' }} />
          <YAxis 
            tickFormatter={(value) => `₲${formatCurrency(value)}`}
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            formatter={(value: number) => `₲ ${formatCurrency(value)}`}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="Ventas" 
            stroke="#3b82f6" 
            fill="url(#colorVentas)"
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="Ganancias" 
            stroke="#10b981" 
            fill="url(#colorGanancias)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}