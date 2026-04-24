import type { FC } from 'react';
import { FaMoneyBillWave } from 'react-icons/fa';

const TotalCompra: FC<{ total: number }> = ({ total }) => {
  return (
    <div className="w-auto bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-lg">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
          <span className="bg-blue-600 dark:bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
            <FaMoneyBillWave size={16} />
          </span>
          Resumen de Compra
        </h3>
      </div>

      {/* Contenido principal */}
      <div className="space-y-4">

        {/* Total de la compra */}
        <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-slate-800 rounded-lg shadow-sm border-2 border-blue-200 dark:border-slate-700">
          <span className="text-blue-700 dark:text-slate-300 font-semibold">
            Total de Compra
          </span>
          <span className="text-2xl font-bold text-blue-700 dark:text-slate-100">
            {total.toLocaleString("es-PY")} Gs.
          </span>
        </div>

        {/* Información adicional */}
        <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs text-gray-600 dark:text-slate-400 space-y-1">
            <p className="flex justify-between">
              <span>Tipo de operación:</span>
              <span className="font-semibold text-gray-800 dark:text-slate-200">
                Compra de productos
              </span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TotalCompra;
