'use client';

import { type FC } from 'react';
import TipoDescuentoSelect from '../TipoDescuento';

interface Props {
  tipoDescuento: 'sin_descuento' | 'descuento_producto' | 'descuento_total';
  setTipoDescuento: (tipo: 'sin_descuento' | 'descuento_producto' | 'descuento_total') => void;
  montoDescuentoTotal: string;
  setMontoDescuentoTotal: (value: string) => void;
}

const SeccionDescuentos: FC<Props> = ({ tipoDescuento, setTipoDescuento, montoDescuentoTotal, setMontoDescuentoTotal }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md overflow-hidden border-2 border-blue-100 dark:border-slate-700">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-slate-700 dark:to-slate-800 p-4">
        <h3 className="text-base font-bold text-white">Descuentos</h3>
        <p className="text-sm font-medium text-blue-100 dark:text-slate-300">Configure los descuentos aplicables</p>
      </div>
      <div className="">
        <TipoDescuentoSelect className='pb-3 pl-3' onSelectionChange={setTipoDescuento} setMontoDescuentoTotal={setMontoDescuentoTotal} />
        {tipoDescuento === "descuento_total" && (
          <div className="p-3">
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1 font-semibold">Ingrese Monto de descuento</label>
            <input
              type="text"
              placeholder="Ingrese monto de descuento"
              value={montoDescuentoTotal}
              onChange={e => setMontoDescuentoTotal(e.target.value)}
              className="w-auto border-2 border-blue-300 dark:border-slate-600 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 dark:text-gray-100 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SeccionDescuentos;
