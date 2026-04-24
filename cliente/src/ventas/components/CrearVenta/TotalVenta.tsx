import { type FC, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { FaMoneyBillWave, FaTag, FaCheckCircle, FaCreditCard, FaMoneyBill, FaExclamationTriangle, FaCheck } from 'react-icons/fa';

interface TotalVentaProps {
  total: number;
  descuento_total: number;
}

const TotalVenta: FC<TotalVentaProps> = ({ total, descuento_total }) => {
  const [montoCliente, setMontoCliente] = useState<number>(0);

  const totalConDescuento = total - descuento_total;
  const vuelto = Math.max(0, montoCliente - totalConDescuento);
  const tieneDescuento = descuento_total > 0;
  const pagoCompleto = montoCliente >= totalConDescuento && montoCliente > 0;

  return (
    <div className="w-full bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 border-b-2 border-blue-200 dark:border-slate-700 shadow-md">
      {/* Layout horizontal principal */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4">

        {/* Icono y título */}
        <div className="flex items-center gap-2 min-w-fit">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-1.5 sm:p-2 shadow-md">
            <FaMoneyBillWave size={16} className="sm:w-5 sm:h-5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-gray-200 hidden lg:block">Resumen</span>
        </div>

        {/* Separador vertical */}
        <div className="hidden sm:block h-8 w-px bg-slate-300 dark:bg-slate-600"></div>

        {/* Subtotal (si hay descuento) o Total */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white dark:bg-slate-800 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 border border-slate-200 dark:border-slate-600 shadow-sm min-w-fit">
          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
            {tieneDescuento ? "Subtotal" : "Total"}
          </span>
          <span className="text-sm sm:text-base md:text-lg font-bold text-slate-800 dark:text-gray-100">
            {total.toLocaleString("es-PY")}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">Gs.</span>
        </div>

        {/* Descuento - solo si hay */}
        {tieneDescuento && (
          <>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-red-50 dark:bg-red-900/30 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 border border-red-200 dark:border-red-700 shadow-sm min-w-fit">
              <FaTag className="text-red-500 dark:text-red-400" size={12} />
              <span className="text-[10px] sm:text-xs text-red-600 dark:text-red-400 font-medium hidden md:block">Desc.</span>
              <span className="text-sm sm:text-base font-bold text-red-600 dark:text-red-400">
                -{descuento_total.toLocaleString("es-PY")}
              </span>
              <span className="text-[10px] sm:text-xs text-red-500 dark:text-red-400">Gs.</span>
            </div>

            {/* Total con descuento */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 border-2 border-green-300 dark:border-green-700 shadow-sm min-w-fit">
              <FaCheckCircle className="text-green-600 dark:text-green-400" size={14} />
              <span className="text-[10px] sm:text-xs text-green-700 dark:text-green-400 font-medium hidden md:block">Total</span>
              <span className="text-sm sm:text-base md:text-lg font-bold text-green-700 dark:text-green-400">
                {totalConDescuento.toLocaleString("es-PY")}
              </span>
              <span className="text-[10px] sm:text-xs text-green-600 dark:text-green-400">Gs.</span>
            </div>
          </>
        )}

        {/* Separador vertical */}
        <div className="hidden md:block h-8 w-px bg-slate-300 dark:bg-slate-600"></div>

        {/* Monto del cliente */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 border-2 border-blue-300 dark:border-blue-700 shadow-sm min-w-fit">
          <FaCreditCard className="text-blue-600 dark:text-blue-400" size={14} />
          <span className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-400 font-medium hidden lg:block">Recibido:</span>
          <NumericFormat
            value={montoCliente}
            thousandSeparator="."
            decimalSeparator=","
            decimalScale={0}
            fixedDecimalScale={false}
            allowNegative={false}
            onValueChange={(values) => {
              setMontoCliente(values.floatValue || 0);
            }}
            className="w-20 sm:w-24 md:w-28 px-2 py-1 text-right text-xs sm:text-sm font-bold border-2 border-blue-300 dark:border-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 dark:text-gray-100 shadow-sm"
            placeholder="0"
          />
          <span className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 font-medium">Gs.</span>
        </div>

        {/* Vuelto o Estado - solo si hay monto */}
        {montoCliente > 0 && (
          <>
            {/* Separador vertical */}
            <div className="hidden sm:block h-8 w-px bg-slate-300 dark:bg-slate-600"></div>

            {/* Vuelto */}
            {vuelto > 0 ? (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 border-2 border-yellow-400 dark:border-yellow-600 shadow-sm min-w-fit animate-pulse">
                <FaMoneyBill className="text-yellow-600 dark:text-yellow-400" size={14} />
                <span className="text-[10px] sm:text-xs text-yellow-700 dark:text-yellow-400 font-medium hidden md:block">Vuelto:</span>
                <span className="text-sm sm:text-base md:text-lg font-bold text-yellow-700 dark:text-yellow-400">
                  {vuelto.toLocaleString("es-PY")}
                </span>
                <span className="text-[10px] sm:text-xs text-yellow-600 dark:text-yellow-400">Gs.</span>
              </div>
            ) : pagoCompleto ? (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 border-2 border-green-400 dark:border-green-600 shadow-sm min-w-fit">
                <FaCheckCircle className="text-green-600 dark:text-green-400" size={14} />
                <span className="text-xs sm:text-sm font-bold text-green-700 dark:text-green-400">Pago Exacto</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 border-2 border-red-400 dark:border-red-600 shadow-sm min-w-fit">
                <FaExclamationTriangle className="text-red-500 dark:text-red-400" size={14} />
                <span className="text-[10px] sm:text-xs text-red-600 dark:text-red-400 font-medium hidden md:block">Faltan:</span>
                <span className="text-sm sm:text-base font-bold text-red-600 dark:text-red-400">
                  {(totalConDescuento - montoCliente).toLocaleString("es-PY")}
                </span>
                <span className="text-[10px] sm:text-xs text-red-500 dark:text-red-400">Gs.</span>
              </div>
            )}

            {/* Badge de estado */}
            <div className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide shadow-md min-w-fit ${
              pagoCompleto
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
            }`}>
              {pagoCompleto ? (
                <>
                  <FaCheck size={10} />
                  <span className="hidden sm:inline">Aprobado</span>
                </>
              ) : (
                <>
                  <FaExclamationTriangle size={10} />
                  <span className="hidden sm:inline">Pendiente</span>
                </>
              )}
            </div>

            {/* Barra de progreso compacta */}
            <div className="hidden xl:flex items-center gap-2 min-w-[120px]">
              <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 shadow-inner overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ease-out ${
                    pagoCompleto
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : 'bg-gradient-to-r from-red-500 to-rose-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (montoCliente / totalConDescuento) * 100)}%`
                  }}
                ></div>
              </div>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 min-w-[35px]">
                {Math.min(100, Math.round((montoCliente / totalConDescuento) * 100))}%
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TotalVenta;
