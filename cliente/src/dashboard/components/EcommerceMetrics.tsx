"use client";
import { useEffect, useState } from "react";
import { getVentasMensuales, listarDeudasVentaAgrupadasPorClienteSinPaginar } from "../../services/ventas";
import { getComprasMonth } from "../../services/compras";

interface DeudaCliente {
  idcliente: number;
  nombre_cliente: string;
  numDocumento: string;
  items_pendientes: number;
  items_pagados: number;
  total_deuda: string;
  total_pagado: string;
  saldo: string;
  fecha_deuda: string;
  created_at: string;
}

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

function Card({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border p-3 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.04]">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <h3 className=" text-sm font-semibold text-gray-900 dark:text-white">
        {value}
      </h3>
    </div>
  );
}

export default function DeudasClientes() {
  const [_rows, setRows] = useState<DeudaCliente[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [ventasMensuales, setVentasMensuales] = useState<number[]>([]);
  const [comprasMensuales, setComprasMensuales] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await listarDeudasVentaAgrupadasPorClienteSinPaginar();
      setRows(res.data.data);
      setTotals(res.data.totals);
    } catch (e) {
      console.error(e);
      setErr("No se pudieron cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const cargarVentasMensuales = async () => {
    try {
      const fechaActual = new Date();
      const añoActual = fechaActual.getFullYear();

      const res = await getVentasMensuales(añoActual);
      console.log('Ventas mensuales:', res.data);
      const datos = res.data.data || res.data;
      if (Array.isArray(datos)) {
        setVentasMensuales(datos);
      }
    } catch (e) {
      console.error('Error al cargar ventas mensuales:', e);
    }
  };

  const cargarComprasMensuales = async () => {
    try {
      const fechaActual = new Date();
      const añoActual = fechaActual.getFullYear();
      const res = await getComprasMonth(añoActual);
      console.log("Compras por Mes =", res.data);

      const datos = res.data.data || res.data;
      if (Array.isArray(datos)) {
        setComprasMensuales(datos);
      }
    } catch (e) {
      console.error('Error al cargar compras mensuales:', e);
    }
  };

  useEffect(() => {
    fetchData();
    cargarVentasMensuales();
    cargarComprasMensuales();
  }, []);

  const obtenerUltimos3Meses = (datos: number[]) => {
    const mesActual = new Date().getMonth(); // 0-11
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const ultimos3 = [];

    // Obtener los 3 meses más recientes
    for (let i = 2; i >= 0; i--) {
      const indice = mesActual - i;
      if (indice >= 0) {
        ultimos3.push({
          nombre: meses[indice],
          valor: datos[indice] || 0
        });
      } else {
        // Si el índice es negativo, es del año anterior
        const indiceAñoPasado = 12 + indice;
        ultimos3.push({
          nombre: meses[indiceAñoPasado],
          valor: 0 // No tenemos datos del año pasado
        });
      }
    }

    return ultimos3;
  };

  const ultimos3MesesVentas = obtenerUltimos3Meses(ventasMensuales);
  const ultimos3MesesCompras = obtenerUltimos3Meses(comprasMensuales);

  if (loading) return <p>Cargando…</p>;
  if (err) return <p className="text-red-600">{err}</p>;
  if (!totals) return null;

  return (
    <div className="space-y-4 mr-3">
      {/* Resumen de Deudas */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Resumen de Deudas
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <Card title="Ítems pendientes" value={fmt.format(totals.itemsPendientes)} />
          <Card title="Total deuda" value={fmtMoney(totals.totalDeuda)} />
          <Card title="Saldo pendiente" value={fmtMoney(totals.saldo)} />
        </div>
      </div>

      {/* Ventas Últimos 3 Meses */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Ventas Últimos 3 Meses
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {ultimos3MesesVentas.map((mes, index) => (
            <Card
              key={index}
              title={mes.nombre}
              value={fmtMoney(mes.valor)}
            />
          ))}
        </div>
      </div>

      {/* Compras Últimos 3 Meses */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Compras Últimos 3 Meses
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {ultimos3MesesCompras.map((mes, index) => (
            <Card
              key={index}
              title={mes.nombre}
              value={fmtMoney(mes.valor)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}