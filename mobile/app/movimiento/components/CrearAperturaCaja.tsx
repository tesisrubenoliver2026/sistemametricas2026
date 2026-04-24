import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
import ModalAdvert from '../../../components/ModalAdvert';
import ModalError from '../../../components/ModalError';
import ModalSuccess from '../../../components/ModalSuccess';
import { abrirMovimientoCaja } from '../../../services/ingreso';

interface AbrirCajaProps {
  idusuarios: number;
  onSuccess?: () => void;
  onClose: () => void;
}

const AbrirCaja = ({ idusuarios, onSuccess, onClose }: AbrirCajaProps) => {
  const [numCaja, setNumCaja] = useState('');
  const [monto, setMonto] = useState('');
  const [advertOpen, setAdvertOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleAbrir = async () => {
    if (!numCaja.trim() || !monto.trim()) {
      setModalMessage('⚠️ Número de caja y monto son obligatorios.');
      setAdvertOpen(true);
      return;
    }

    const parsedMonto = parseFloat(monto);
    if (isNaN(parsedMonto) || parsedMonto <= 0) {
      setModalMessage('⚠️ El monto debe ser mayor que cero.');
      setAdvertOpen(true);
      return;
    }

    try {
      await abrirMovimientoCaja({
        idusuarios,
        num_caja: numCaja.trim(),
        fecha_apertura: new Date().toISOString(),
        monto_apertura: parsedMonto,
        estado: 'abierto',
      });
      
      setSuccessOpen(true);
      setNumCaja('');
      setMonto('');
      onSuccess?.();
      onClose?.();
    } catch (err: any) {
      console.error(err);
      setModalMessage(err.response?.data?.error || '❌ Error al abrir caja.');
      setErrorOpen(true);
    }
  };

  return (
    <View className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 max-w-md mx-auto">
      <Text className="text-2xl font-semibold text-gray-800 mb-4">🔓 Apertura de Caja</Text>

      <View className="mb-4">
        <Text className="block text-sm font-medium text-gray-700 mb-1">
          <Text>Número de Caja </Text>
          <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          value={numCaja}
          onChangeText={setNumCaja}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800"
          placeholder="Ej: 001"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View className="mb-6">
        <Text className="block text-sm font-medium text-gray-700 mb-1">
          <Text>Monto de Apertura </Text>
          <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          value={monto}
          onChangeText={setMonto}
          keyboardType="numeric"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800"
          placeholder="Ej: 500000"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <TouchableOpacity
        className="w-full bg-yellow-600 py-2 rounded-lg"
        onPress={handleAbrir}
      >
        <Text className="text-white font-medium text-center">Abrir Caja</Text>
      </TouchableOpacity>

      <ModalAdvert 
        isOpen={advertOpen} 
        onClose={() => setAdvertOpen(false)} 
        message={modalMessage} 
      />
      <ModalError 
        isOpen={errorOpen} 
        onClose={() => setErrorOpen(false)} 
        message={modalMessage} 
      />
      <ModalSuccess
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        message="✅ Caja abierta correctamente."
      />
    </View>
  );
};

export default AbrirCaja;