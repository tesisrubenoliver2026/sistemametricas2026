import React, { type FC } from 'react';
import { View, Text } from 'react-native';

interface DetallePago {
  idpago_deuda: number;
  monto_pagado: string;
  fecha_pago: string;
  observacion: string;
  idformapago: number;
  transferencia_banco_origen?: string | null;
  transferencia_numero_cuenta?: string | null;
  transferencia_tipo_cuenta?: string | null;
  transferencia_titular_cuenta?: string | null;
  transferencia_observacion?: string | null;
  tarjeta_tipo_tarjeta?: string | null;
  tarjeta_entidad?: string | null;
  tarjeta_monto?: string | null;
  tarjeta_observacion?: string | null;
  cheque_banco?: string | null;
  cheque_nro_cheque?: string | null;
  cheque_monto?: string | null;
  cheque_fecha_emision?: string | null;
  cheque_fecha_vencimiento?: string | null;
  cheque_titular?: string | null;
  cheque_estado?: string | null;
}

interface Props {
  pago: DetallePago;
}

const formaPagoTexto = (id: number) => {
  switch (id) {
    case 1: return "Efectivo 💵";
    case 2: return "Transferencia 🏦";
    case 3: return "Tarjeta 💳";
    case 4: return "Cheque 🧾";
    default: return "Desconocido ❓";
  }
};

const DetalleItem: FC<{ label: string; value: string | null | undefined; fullWidth?: boolean }> = ({ label, value, fullWidth = false }) => (
  <View className={`${fullWidth ? 'w-full' : 'w-1/2'} mb-2 px-1`}>
    <Text className="font-bold text-sm text-gray-800">{label}</Text>
    <Text className="text-sm text-gray-600">{value}</Text>
  </View>
);

const DetallePagoDeudas: FC<Props> = ({ pago }) => {
  const { idformapago } = pago;

  const renderDetalleMetodoPago = () => {
    switch (idformapago) {
      case 1:
        return (
          <Text className="text-green-700 font-medium text-center">Pago realizado en efectivo.</Text>
        );
      case 2:
        return (
          <View className="flex-row flex-wrap -mx-1">
            <DetalleItem label="Banco origen:" value={pago.transferencia_banco_origen} />
            <DetalleItem label="Nro. cuenta:" value={pago.transferencia_numero_cuenta} />
            <DetalleItem label="Tipo cuenta:" value={pago.transferencia_tipo_cuenta} />
            <DetalleItem label="Titular:" value={pago.transferencia_titular_cuenta} />
            <DetalleItem label="Observación:" value={pago.transferencia_observacion} fullWidth />
          </View>
        );
      case 3:
        return (
          <View className="flex-row flex-wrap -mx-1">
            <DetalleItem label="Tipo tarjeta:" value={pago.tarjeta_tipo_tarjeta} />
            <DetalleItem label="Entidad:" value={pago.tarjeta_entidad} />
            <DetalleItem label="Monto:" value={pago.tarjeta_monto} />
            <DetalleItem label="Observación:" value={pago.tarjeta_observacion} fullWidth />
          </View>
        );
      case 4:
        return (
          <View className="flex-row flex-wrap -mx-1">
            <DetalleItem label="Banco:" value={pago.cheque_banco} />
            <DetalleItem label="Nro. Cheque:" value={pago.cheque_nro_cheque} />
            <DetalleItem label="Monto:" value={pago.cheque_monto} />
            <DetalleItem label="Emisión:" value={pago.cheque_fecha_emision} />
            <DetalleItem label="Vencimiento:" value={pago.cheque_fecha_vencimiento} />
            <DetalleItem label="Titular:" value={pago.cheque_titular} />
            <DetalleItem label="Estado:" value={pago.cheque_estado} />
          </View>
        );
      default:
        return <Text className="text-gray-500 italic text-center">Sin detalle específico de la forma de pago.</Text>;
    }
  };

  return (
    <View className="bg-white rounded-xl p-4 my-2 border border-gray-200 shadow-md">
      <View className="mb-4 border-b border-gray-200 pb-2">
        <Text className="text-xl font-bold text-gray-800">
          🧾 Detalle del Pago #{pago.idpago_deuda}
        </Text>
      </View>

      <View className="flex-row flex-wrap mb-4 -mx-1">
        <DetalleItem label="Monto pagado:" value={`${pago.monto_pagado} Gs`} />
        <DetalleItem label="Fecha de pago:" value={new Date(pago.fecha_pago).toLocaleString()} />
        <DetalleItem label="Observación:" value={pago.observacion} />
        <View className="w-1/2 mb-2 px-1">
            <Text className="font-bold text-sm text-gray-800">Forma de pago:</Text>
            <View className="mt-1 self-start bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-blue-800 text-xs font-semibold">
                    {formaPagoTexto(pago.idformapago)}
                </Text>
            </View>
        </View>
      </View>

      <View className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <Text className="text-base font-bold text-gray-700 mb-2">Detalles Específicos</Text>
        {renderDetalleMetodoPago()}
      </View>
    </View>
  );
};

export default DetallePagoDeudas;
