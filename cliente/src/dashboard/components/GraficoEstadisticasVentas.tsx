"use client";
import { useEffect, useState } from "react";
import { getEstadisticasVentas } from "../../services/ventas";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from "recharts";
import { ChartBarIcon } from "@heroicons/react/24/solid";

interface EstadisticasData {
  ventas: number[];
  ganancias: number[];
}

export default function GraficoEstadisticasSimple() {
  const [data, setData] = useState<EstadisticasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [año, setAño] = useState(new Date().getFullYear());

  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        const res = await getEstadisticasVentas(año);
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEstadisticas();
  }, [año]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 h-96 animate-pulse" />
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

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg ring-1 ring-gray-200 dark:ring-gray-800 p-6 h-[90%]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ChartBarIcon className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Estadísticas {año}
          </h2>
        </div>
        
        <select
          value={año}
          onChange={(e) => setAño(Number(e.target.value))}
          className="px-3 py-1.5 border rounded-lg text-sm"
        >
          {[2023, 2024, 2025].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="ventas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="ganancias" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="mes" stroke="#6b7280" />
          <YAxis 
            stroke="#6b7280" 
            tickFormatter={(v) => `₲${formatCurrency(v)}`}
          />
          <Tooltip 
            formatter={(value: number) => `₲ ${formatCurrency(value)}`}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="ventas" 
            stroke="#3b82f6" 
            fill="url(#ventas)"
            name="Ventas"
          />
          <Area 
            type="monotone" 
            dataKey="ganancias" 
            stroke="#10b981" 
            fill="url(#ganancias)"
            name="Ganancias"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}