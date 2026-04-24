import { useState } from "react";

interface TipoDescuentoProps {
  onSelectionChange: (tipo: 'sin_descuento'|'descuento_producto' | 'descuento_total') => void;
  defaultValue?: 'sin_descuento'|'descuento_producto' | 'descuento_total';
  className?: string;
  setMontoDescuentoTotal: (value:string) => void;
}

export const TipoDescuentoSelect: React.FC<TipoDescuentoProps> = ({ 
  onSelectionChange, 
  defaultValue = 'sin_descuento',
  className = '',
  setMontoDescuentoTotal
}) => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tipo = e.target.value as 'sin_descuento'|'descuento_producto' | 'descuento_total';
    setTipoSeleccionado(tipo);
    onSelectionChange(tipo);
    setMontoDescuentoTotal("")
  };

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 p-2 m-2">
        Tipo de Descuento
      </label>
      <select
        value={tipoSeleccionado}
        onChange={handleChange}
        className="w-auto px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="sin_descuento">Sin Descuento</option>
        <option value="descuento_producto">Descuento por Producto</option>
        <option value="descuento_total">Descuento por Venta Total</option>
      </select>
    </div>
  );
};

export default TipoDescuentoSelect;