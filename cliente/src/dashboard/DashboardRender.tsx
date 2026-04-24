"use client";
import { useNavigate } from "react-router-dom";
import {
  ArrowRightCircleIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";
import EcommerceMetrics   from "./components/EcommerceMetrics";
import MonthlySalesChart  from "./components/MonthlySalesChart";
import RecentOrders       from "./components/RecentOrders";
import GraficoEstadisticasSimple from "./components/GraficoEstadisticasVentas";
import GraficoGananciasSimple from "./components/GraficoGananciasSimple";
import ChatMetricasModal from "./components/ChatMetricasModal";
import { useState } from "react";
export default function DashboardRender() {
  const router = useNavigate();
  const [chatMetricasVisible, setChatMetricasVisible] = useState(false);
  const NavButton = ({
    label,
    icon: Icon,
    href,
    color,
  }: {
    label: string;
    icon: typeof ArrowRightCircleIcon;
    href: string;
    color:
      | "indigo"
      | "emerald"
      | "sky"
      | "amber"
      | "rose"
      | "violet"
      | "cyan";
  }) => {
    const palette: Record<string, string> = {
      indigo:  "from-indigo-500   to-sky-500    hover:to-indigo-600 focus:ring-indigo-500",
      emerald: "from-emerald-500  to-teal-500   hover:to-emerald-600 focus:ring-emerald-500",
      sky:     "from-sky-500      to-cyan-500   hover:to-sky-600    focus:ring-sky-500",
      amber:   "from-amber-500    to-orange-500 hover:to-amber-600  focus:ring-amber-500",
      rose:    "from-rose-500     to-pink-500   hover:to-rose-600   focus:ring-rose-500",
      violet:  "from-violet-500   to-fuchsia-500 hover:to-violet-600 focus:ring-violet-500",
      cyan:    "from-cyan-500     to-teal-400   hover:to-cyan-600   focus:ring-cyan-500",
    };

    return (
      <button
        onClick={() => router(href)}
        className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${palette[color]}
                    px-5 py-2.5 text-sm font-semibold text-white shadow-lg
                    transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`}
      >
        <Icon className="h-5 w-5" />
        {label}
      </button>
    );
  };

  

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12"><EcommerceMetrics /></div>

      <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <GraficoGananciasSimple/>
        <GraficoEstadisticasSimple/>
        <MonthlySalesChart />
        <RecentOrders />
        <div className="flex flex-wrap gap-4">
          <NavButton
            label="Ventas"
            icon={CalendarDaysIcon}
            href="/ventas"
            color="indigo"
          />
          <NavButton
            label="Compras"
            icon={CalendarDaysIcon}
            href="/compras"
            color="indigo"
          />
          <NavButton
            label="Productos"
            icon={CalendarDaysIcon}
            href="/productos"
            color="indigo"
          />
          <NavButton
            label="Cobros"
            icon={BanknotesIcon}
            href="/ventas/cobrodeuda"
            color="emerald"
          />
          <NavButton
            label="Ingresos"
            icon={BanknotesIcon}
            href="/movimiento/ingreso"
            color="sky"
          />
          <NavButton
            label="Egresos"
            icon={BanknotesIcon}
            href="/movimiento/egreso"
            color="amber"
          />
          <NavButton
            label="Movimientos"
            icon={ArrowRightCircleIcon}
            href="/movimiento/cierrecaja"
            color="rose"
          />

          <button
            onClick={() => setChatMetricasVisible(true)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:to-violet-600
                       px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
          >
            <ChartBarIcon className="h-5 w-5" />
            Chat IA Métricas
          </button>
        </div>
      </div>

      <ChatMetricasModal
        visible={chatMetricasVisible}
        onClose={() => setChatMetricasVisible(false)}
      />
    </div>
  );
}
