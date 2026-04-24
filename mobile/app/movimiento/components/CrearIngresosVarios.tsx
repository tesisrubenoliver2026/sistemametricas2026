import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ModalListarTiposIngreso from './ModalMovimiento/ModalListarTiposIngreso';
import ModalAdvert from '../../../components/ModalAdvert';
import ModalError from '../../../components/ModalError';
import ModalSuccess from '../../../components/ModalSuccess';
import { registrarIngreso } from '../../../services/ingreso';

interface TipoIngreso {
  idtipo_ingreso: number;
  descripcion: string;
}

interface CrearIngresosVariosProps {
  onSuccess?: () => void;
  onClose: () => void;
}

const CrearIngresosVarios = ({ onSuccess, onClose }: CrearIngresosVariosProps) => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoIngreso | null>(null);
  const [modalSeleccionarOpen, setModalSeleccionarOpen] = useState(false);
  const [monto, setMonto] = useState('');
  const [concepto, setConcepto] = useState('');
  const [observacion, setObservacion] = useState('');
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const [advertOpen, setAdvertOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleCrear = async () => {
    if (!tipoSeleccionado || !monto.trim() || !concepto.trim()) {
      setModalMessage('Tipo, monto y concepto son obligatorios.');
      setAdvertOpen(true);
      return;
    }

    const parsedMonto = parseFloat(monto);
    if (isNaN(parsedMonto) || parsedMonto <= 0) {
      setModalMessage('El monto debe ser mayor que cero.');
      setAdvertOpen(true);
      return;
    }

    setLoading(true);
    try {
      await registrarIngreso({
        idtipo_ingreso: tipoSeleccionado.idtipo_ingreso,
        monto: parsedMonto,
        concepto: concepto.trim(),
        observacion: observacion.trim(),
        fecha,
      });

      setSuccessOpen(true);
      // No limpiar inmediatamente, esperar a que el usuario cierre el modal de éxito
    } catch (err: any) {
      console.error(err);
      setModalMessage(err.response?.data?.error || 'Error al registrar ingreso.');
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    // Limpiar formulario después de éxito
    setMonto('');
    setConcepto('');
    setObservacion('');
    setFecha(new Date().toISOString().split('T')[0]);
    setTipoSeleccionado(null);
    onSuccess?.();
    onClose?.();
  };

  const InputField = ({ 
    label, 
    required = false, 
    children 
  }: { 
    label: string; 
    required?: boolean; 
    children: React.ReactNode;
  }) => (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <Text className="text-red-500"> *</Text>}
      </Text>
      {children}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Header */}
        <LinearGradient
          colors={['#f59e0b', '#d97706']}
          className="px-5 pt-6 pb-6 rounded-b-3xl shadow-lg"
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Ionicons name="add-circle" size={24} color="#fff" />
              </View>
              <View>
                <Text className="text-2xl font-bold text-white">Registrar Ingreso</Text>
                <Text className="text-white/80 text-sm">Complete los datos del ingreso manual</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Formulario */}
        <View className="px-5 mt-6">
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            {/* Tipo de Ingreso */}
            <InputField label="Tipo de Ingreso" required>
              <Pressable
                onPress={() => setModalSeleccionarOpen(true)}
                className="active:opacity-70"
              >
                <View className="flex-row items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Ionicons 
                      name="pricetag" 
                      size={20} 
                      color={tipoSeleccionado ? "#f59e0b" : "#64748b"} 
                    />
                    <Text 
                      className={`flex-1 ${tipoSeleccionado ? 'text-gray-800' : 'text-gray-400'}`}
                      numberOfLines={1}
                    >
                      {tipoSeleccionado?.descripcion || 'Seleccione tipo de ingreso...'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#64748b" />
                </View>
              </Pressable>
            </InputField>

            {/* Monto */}
            <InputField label="Monto" required>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Ionicons name="cash" size={20} color="#64748b" />
                <TextInput
                  value={monto}
                  onChangeText={setMonto}
                  keyboardType="numeric"
                  placeholder="Ej: 100000"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-gray-800 text-base"
                />
                <Text className="text-gray-500 text-sm">Gs</Text>
              </View>
            </InputField>

            {/* Concepto */}
            <InputField label="Concepto" required>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Ionicons name="document-text" size={20} color="#64748b" />
                <TextInput
                  value={concepto}
                  onChangeText={setConcepto}
                  placeholder="Ej: Ingreso por venta contado ID 71"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-gray-800 text-base"
                />
              </View>
            </InputField>

            {/* Observación */}
            <InputField label="Observación (opcional)">
              <View className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 min-h-[80px]">
                <TextInput
                  value={observacion}
                  onChangeText={setObservacion}
                  multiline
                  placeholder="Ej: Venta al contado registrada con ID 71"
                  placeholderTextColor="#9CA3AF"
                  className="text-gray-800 text-base"
                  textAlignVertical="top"
                />
              </View>
            </InputField>

            {/* Fecha */}
            <InputField label="Fecha del Ingreso" required>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Ionicons name="calendar" size={20} color="#64748b" />
                <TextInput
                  value={fecha}
                  onChangeText={setFecha}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-gray-800 text-base"
                />
              </View>
            </InputField>

            {/* Botones de Acción */}
            <View className="flex-row gap-3 mt-6">
              <Pressable
                onPress={onClose}
                className="flex-1 active:opacity-70"
              >
                <View className="bg-gray-200 rounded-xl py-3.5 flex-row items-center justify-center">
                  <Ionicons name="close" size={18} color="#64748b" />
                  <Text className="text-gray-700 font-semibold ml-2">Cancelar</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={handleCrear}
                disabled={loading}
                className="flex-1 active:opacity-70"
              >
                <LinearGradient
                  colors={loading ? ['#94a3b8', '#64748b'] : ['#10b981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="rounded-xl py-3.5 flex-row items-center justify-center"
                >
                  {loading ? (
                    <Ionicons name="refresh" size={18} color="#fff" />
                  ) : (
                    <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  )}
                  <Text className="text-white font-semibold ml-2">
                    {loading ? 'Registrando...' : 'Registrar'}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modales */}
      <ModalListarTiposIngreso
        onSelect={(tipo) => {
          setTipoSeleccionado(tipo);
          setModalSeleccionarOpen(false);
        }}
        isOpen={modalSeleccionarOpen}
        onClose={() => setModalSeleccionarOpen(false)}
      />

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
        onClose={handleSuccessClose}
        message="Ingreso registrado correctamente"
      />
    </View>
  );
};

export default CrearIngresosVarios;