import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ShoppingCartIcon,
  ReceiptRefundIcon,
  CreditCardIcon
} from 'react-native-heroicons/solid';
import CrearArqueoCaja from '../Arqueo/CrearArqueoCaja';
import { cerrarCaja, registrarArqueo, getResumenMovimiento } from '../../../../services/movimiento';
import { getArqueoFindByMovement } from '../../../../services/arqueo';
import ModalError from '../../../../components/ModalError';
import ModalSuccess from '../../../../components/ModalSuccess';
import ModalAdvert from '../../../../components/ModalAdvert';

interface ResumenCaja {
  ingresos: number;
  egresos: number;
  contado: number;
  cobrado: number;
  compras: number;
  gastos: number;
  credito: number;
  monto_cierre: number;
  monto_apertura: number;
  estado: string;
}

export interface ArqueoCaja {
    idarqueo: number,
    a50: number,
    a100: number,
    a500: number,
    a1000: number,
    a2000: number,
    a5000: number,
    a10000: number,
    a20000: number,
    a50000: number,
    a100000: number,
    total: string,
    detalle1: string,
    monto1: string,
    detalle2: string,
    monto2: string,
    detalle3: string,
    monto3: string,
    detalle4: string,
    monto4: string,
    detalle5: string,
    monto5: string,
    idmovimiento: number
}

const resumenInicial: ResumenCaja = {
  ingresos: 0,
  egresos: 0,
  contado: 0,
  cobrado: 0,
  compras: 0,
  gastos: 0,
  credito: 0,
  monto_cierre: 0,
  monto_apertura: 0,
  estado: '',
};

const arqueoInicial: ArqueoCaja = {
    idarqueo: 0,
    a50: 0,
    a100: 0,
    a500: 0,
    a1000: 0,
    a2000: 0,
    a5000: 0,
    a10000: 0,
    a20000: 0,
    a50000: 0,
    a100000: 0,
    total: "",
    detalle1: "",
    monto1: "",
    detalle2: "",
    monto2: "",
    detalle3: "",
    monto3: "",
    detalle4: "",
    monto4: "",
    detalle5: "",
    monto5: "",
    idmovimiento: 0
} 

interface CajaResumenProps {
  idmovimiento: number;
  onSuccess?: () => void;
  onClose?: () => void;
}

const CajaResumen = ({ idmovimiento, onSuccess, onClose }: CajaResumenProps) => {
  type ArqueoRef = {
    getArqueoData: () => {
      total: number;
      payload: Record<string, any>;
    };
  };

  const arqueoRef = useRef<ArqueoRef>(null);
  const [resumen, setResumen] = useState<ResumenCaja>(resumenInicial);
  const [arqueo, setArqueo] = useState<ArqueoCaja>(arqueoInicial)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [advertOpen, setAdvertOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const fetchResumen = async () => {
    try {
      const res = await getResumenMovimiento(idmovimiento);
      const isStatusClose = res.data.estado === "cerrado"
      const resArqueo = isStatusClose && await getArqueoFindByMovement(idmovimiento);

      resArqueo && setArqueo(resArqueo.data) 
      setResumen(res.data);

    } catch (err: any) {
      console.error(err);
      setError('❌ Error al obtener resumen de caja');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumen();
  }, [idmovimiento]);

  const handleCerrarCaja = async () => {
    const arqueoData = arqueoRef.current?.getArqueoData();
    if (!arqueoData) return;

    const { total, payload } = arqueoData;

    const diferencia = Math.abs(total - resumen.monto_cierre);
    if (resumen && diferencia > 0.01) {
     console.log("Datos de cierre", resumen)
      const tipo = total > resumen.monto_cierre ? 'EXCESO' : 'FALTANTE';
      setModalMessage(
        `⚠️ El total del arqueo no coincide con el total en caja.\n` +
        `💵 Total en Caja: ${resumen.monto_cierre.toLocaleString()} Gs\n` +
        `🧾 Total Arqueado: ${total.toLocaleString()} Gs\n` +
        `🔍 Diferencia (${tipo}): ${diferencia.toLocaleString()} Gs`
      );
      setErrorOpen(true);
      setAdvertOpen(false);
      return;
    }

    try {
      // 1. Guardar Arqueo
      await registrarArqueo(payload);
      // 2. Cerrar caja
      const res = await cerrarCaja(idmovimiento);
      setModalMessage(res.data.message || '✅ Caja cerrada correctamente');
      setSuccessOpen(true);
      fetchResumen();
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      setModalMessage('❌ No se pudo completar el cierre de caja');
      setErrorOpen(true);
    } finally {
      setAdvertOpen(false);
    }
  };

  if (loading) return (
    <View className="p-4">
      <Text className="text-gray-600">Cargando resumen...</Text>
    </View>
  );
  
  if (error) return (
    <View className="p-4">
      <Text className="text-red-600">{error}</Text>
    </View>
  );
  
  if (!resumen) return null;

  const ResumenItem = ({ icon: Icon, label, value, color = "text-gray-700" }: { 
    icon: React.ComponentType<any>, 
    label: string, 
    value: number, 
    color?: string 
  }) => (
    <View className="flex-row items-center gap-2">
      <Icon size={16} color="#6B7280" />
      <Text className={`text-sm ${color}`}>
        <Text className="font-semibold">{label}: </Text>
        <Text>{value.toLocaleString()} Gs</Text>
      </Text>
    </View>
  );

  return (
    <ScrollView className="bg-white shadow-lg rounded-xl p-6 mx-auto my-4 border border-gray-200">
      <View className="flex-col md:flex-row gap-6">
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-gray-800">Resumen del Cierre de Caja</Text>
            {resumen.estado && (
              <View className={`px-3 py-1 rounded-full shadow ${
                resumen.estado === 'cerrado' ? 'bg-red-100' : 'bg-green-100'
              }`}>
                <Text className={`text-xs font-semibold ${
                  resumen.estado === 'cerrado' ? 'text-red-700' : 'text-green-700'
                }`}>
                  {resumen.estado.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View className="gap-3">
            <ResumenItem icon={ArrowUpIcon} label="Ingresos" value={resumen.ingresos} />
            <ResumenItem icon={CurrencyDollarIcon} label="Monto Apertura" value={resumen.monto_apertura} />
            <ResumenItem icon={ArrowDownIcon} label="Egresos" value={resumen.egresos} />
            <ResumenItem icon={ShoppingCartIcon} label="Compras" value={resumen.compras} />
            <ResumenItem icon={ReceiptRefundIcon} label="Gastos/Ajustes" value={resumen.gastos} />
            <ResumenItem icon={ReceiptRefundIcon} label="Ventas Contado" value={resumen.contado} />
            <ResumenItem icon={CreditCardIcon} label="Cobros Deuda" value={resumen.cobrado} />
            <ResumenItem icon={CurrencyDollarIcon} label="Ventas Crédito" value={resumen.credito} />
          </View>

          <View className="mt-6 border-t pt-4">
            <View className="flex-row items-center gap-2">
              <CurrencyDollarIcon size={20} color="#059669" />
              <Text className="text-lg font-semibold text-green-700">
                Total en Caja: {resumen.monto_cierre.toLocaleString()} Gs
              </Text>
            </View>
          </View>

          <View className="flex-col sm:flex-row sm:justify-between items-center gap-3 mt-6">
            {resumen.estado === 'abierto' && (
              <TouchableOpacity
                className="bg-red-600 py-2 px-6 rounded-md shadow w-full sm:w-auto"
                onPress={() => setAdvertOpen(true)}
              >
                <View className="flex-row items-center gap-2 justify-center">
                  <XCircleIcon size={16} color="white" />
                  <Text className="text-white font-semibold">Cerrar Caja</Text>
                </View>
              </TouchableOpacity>
            )}
            {onClose && (
              <TouchableOpacity
                className="border border-gray-300 py-2 px-6 rounded-md w-full sm:w-auto"
                onPress={onClose}
              >
                <Text className="text-gray-700 text-center">Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View className="flex-1">
          <CrearArqueoCaja 
            ref={arqueoRef} 
            idmovimiento={idmovimiento} 
            estadoMovimiento={resumen.estado === "cerrado"} 
            arqueoCerrado={arqueo}  
          />
        </View>
      </View>

      {/* Modales */}
      <ModalAdvert
        isOpen={advertOpen}
        onClose={() => setAdvertOpen(false)}
        onConfirm={handleCerrarCaja}
        message="¿Estás seguro de que deseas cerrar la caja?"
        confirmButtonText="Sí, cerrar"
      />

      <ModalSuccess
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        message={modalMessage}
      />

      <ModalError
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        message={modalMessage}
      />
    </ScrollView>
  );
};

export default CajaResumen;