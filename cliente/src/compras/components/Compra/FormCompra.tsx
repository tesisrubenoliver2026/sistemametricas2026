'use client';
import type { FC } from "react";
import { useEffect, useState } from 'react';
import { getFormasPago } from "../../../services/formasPago";
import ModalSeleccionarDatosBancarios from "../../../datosbancarios/components/ModalsDatosBancarios/ModalSeleccionarDatosBancarios";
import ModalFormCheque from "../../../ventas/components/Cheques/ModalFormCheque";
import ModalFormTarjeta from "../../../ventas/components/Tarjetas/ModalFormTarjeta";
import { FaFileInvoice, FaCreditCard, FaStickyNote, FaTruck } from 'react-icons/fa';

interface Props {
  compra: any;
  setCompra: (data: any) => void;
  proveedorSeleccionado: any;
  openProveedorModal: () => void;
}

const FormCompra: FC<Props> = ({ compra, setCompra, proveedorSeleccionado, openProveedorModal }) => {
  const [formasPago, setFormasPago] = useState<any[]>([]);
  const [modalSeleccionarOpen, setModalSeleccionarOpen] = useState(false);

  const [modalChequeOpen, setModalChequeOpen] = useState(false);
  const [datosCheque, setDatosCheque] = useState<any>({});

  const [modalTarjetaOpen, setModalTarjetaOpen] = useState(false);
  const [datosTarjeta, setDatosTarjeta] = useState<any>({});

  useEffect(() => {
    const fetchFormasPago = async () => {
      try {
        const res = await getFormasPago();
        setFormasPago(res.data);
      } catch (err) {
        console.error("  Error al obtener formas de pago", err);
      }
    };
    fetchFormasPago();
  }, []);

  useEffect(() => {
    if (compra.tipo === 'credito') {
      setCompra((prev: any) => ({ ...prev, idformapago: null }));
    }
  }, [compra.tipo]);

  return (
    <div className="space-y-3 p-4 dark:bg-gray-950">
      <div className="flex flex-row gap-3">
        {/* Sección 1: Información del Proveedor */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-800 shadow-sm overflow-hidden">

          <div className="bg-gradient-to-r from-blue-500 dark:from-gray-700 dark:to-gray-800 to-blue-600 px-4 py-2 flex items-center gap-2">
            <FaTruck className="text-white" size={16} />
            <h3 className="text-sm font-bold text-white uppercase">Información del Proveedor</h3>
          </div>
          <div className="p-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1 font-bold">Proveedor</label>
              <button
                type="button"
                onClick={openProveedorModal}
                className="w-full border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg text-left bg-gray-50 dark:bg-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                {proveedorSeleccionado?.nombre || 'Seleccionar'}
              </button>
            </div>
          </div>
        </div>

        {/* Sección 2: Información de la Compra */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-gray-700 dark:to-gray-800 px-4 py-2 flex items-center gap-2">
            <FaFileInvoice className="text-white" size={16} />
            <h3 className="text-sm font-bold text-white uppercase">Información de la Compra</h3>
          </div>
          <div className="p-4">
            <div className="flex flex-col gap-3">

              <div className="flex flex-row gap-3">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1 font-bold">Nro. Factura</label>
                  <input
                    type="text"
                    required
                    value={compra.nro_factura}
                    onChange={e => setCompra((prev: any) => ({ ...prev, nro_factura: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1 font-bold">Fecha</label>
                  <input
                    type="date"
                    required
                    value={compra.fecha}
                    onChange={e => setCompra((prev: any) => ({ ...prev, fecha: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1 font-bold">Tipo de Compra</label>
                <select
                  value={compra.tipo}
                  onChange={e => setCompra((prev: any) => ({ ...prev, tipo: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="contado">Contado</option>
                  <option value="credito">Crédito</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Sección 3: Forma de Pago */}
      <div className="flex flex-row gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="dark:from-gray-700 dark:to-gray-800 bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 flex items-center gap-2">
            <FaCreditCard className="text-white" size={16} />
            <h3 className="text-sm font-bold text-white uppercase">Forma de Pago</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1 font-bold">Forma de Pago</label>
                <select
                  value={compra.idformapago || ''}
                  onChange={e =>
                    setCompra((prev: any) => ({
                      ...prev,
                      idformapago: Number(e.target.value),
                    }))
                  }
                  className="w-full border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  disabled={compra.tipo === 'credito'}
                  required={compra.tipo === 'contado'}
                >
                  <option value="">Seleccione (solo contado)</option>
                  {formasPago.map((forma) => (
                    <option key={forma.idformapago} value={forma.idformapago}>
                      {forma.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              {compra.idformapago === 2 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setModalSeleccionarOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
                  >
                    Seleccionar Datos Bancarios
                  </button>
                </div>
              )}

              {compra.idformapago === 3 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setModalChequeOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
                  >
                    Ingresar Datos del Cheque
                  </button>
                </div>
              )}

              {compra.idformapago === 4 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setModalTarjetaOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
                  >
                    Ingresar Datos Tarjeta C/D
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sección 4: Observaciones */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-blue-200  dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="dark:from-gray-700 dark:to-gray-800 bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 flex items-center gap-2">
            <FaStickyNote className="text-white" size={16} />
            <h3 className="text-sm font-bold text-white uppercase">Observaciones</h3>
          </div>
          <div className="p-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1 font-bold">Observación</label>
              <input
                type="text"
                placeholder="Observación (opcional)"
                value={compra.observacion}
                onChange={e => setCompra((prev: any) => ({ ...prev, observacion: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <ModalSeleccionarDatosBancarios
        isOpen={modalSeleccionarOpen}
        onClose={() => setModalSeleccionarOpen(false)}
        onSelect={(dato: any) => {
          setCompra((prev: any) => ({
            ...prev,
            detalle_transferencia_compra: dato
          }));
          setModalSeleccionarOpen(false);
        }}
      />

      <ModalFormCheque
        isOpen={modalChequeOpen}
        onClose={() => {
          setCompra((prev: any) => ({ ...prev, detalle_cheque: datosCheque }));
          setModalChequeOpen(false);
        }}
        datosCheque={datosCheque}
        setDatosCheque={setDatosCheque}
      />

      <ModalFormTarjeta
        isOpen={modalTarjetaOpen}
        onClose={() => {
          setCompra((prev: any) => ({ ...prev, detalle_tarjeta: datosTarjeta }));
          setModalTarjetaOpen(false);
        }}
        datosTarjeta={datosTarjeta}
        setDatosTarjeta={setDatosTarjeta}
      />
    </div>
  );
};

export default FormCompra;
