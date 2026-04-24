import React, { type FC, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { getFormasPago } from 'services/formasPago';
import ModalSeleccionarDatosBancarios from 'app/datosbancarios/components/ModalsDatosBancarios/ModalSeleccionarDatosBancarios';
import ModalFormCheque from '../Cheques/ModalFormCheque';
import TipoDescuentoSelect from './TipoDescuento';
import ModalFormTarjeta from '../Tarjetas/ModalFormTarjeta';

interface Props {
  venta: any;
  setVenta: (data: any) => void;
  clienteSeleccionado: any;
  setTipoDescuento: (tipo: 'sin_descuento' | 'descuento_producto' | 'descuento_total') => void;
  tipoDescuento: 'sin_descuento' | 'descuento_producto' | 'descuento_total';
  setMontoDescuentoTotal: (value: string) => void;
  montoDescuentoTotal: string;
  openClienteModal: () => void;
}

const FormVenta: FC<Props> = ({ 
  setMontoDescuentoTotal, 
  montoDescuentoTotal, 
  venta, 
  setVenta, 
  clienteSeleccionado, 
  openClienteModal, 
  setTipoDescuento, 
  tipoDescuento = "sin_descuento" 
}) => {
  const [formasPago, setFormasPago] = useState<any[]>([]);
  const [modalSeleccionarOpen, setModalSeleccionarOpen] = useState(false);
  const [modalChequeOpen, setModalChequeOpen] = useState(false);
  const [datosCheque, setDatosCheque] = useState({});
  const [modalTarjetaOpen, setModalTarjetaOpen] = useState(false);
  const [datosTarjeta, setDatosTarjeta] = useState({});
  const [activeField, setActiveField] = useState<string | null>(null);

  useEffect(() => {
    const fetchFormasPago = async () => {
      try {
        const formasPago = await getFormasPago();
        setFormasPago(formasPago.data);
      } catch (error) {
        console.error('❌ Error al cargar formas de pago', error);
        Alert.alert('Error', 'No se pudieron cargar las formas de pago');
      }
    }
    fetchFormasPago();
  }, []);

  useEffect(() => {
    if (venta.tipo === 'credito') {
      setVenta((prev: any) => ({ ...prev, idformapago: null }));
    }
  }, [venta.tipo]);

  // Componente para selectores móviles
  const MobileSelect = ({ 
    value, 
    onValueChange, 
    options, 
    disabled, 
    placeholder, 
    label,
    required = false 
  }: any) => (
    <View className="mb-4">
      <Text className="text-sm text-gray-600 mb-2 font-medium">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        className="max-h-14"
      >
        <View className="flex-row gap-2">
          {options.map((option: any) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => !disabled && onValueChange(option.value)}
              className={`px-4 py-3 rounded-xl min-w-[120px] ${
                value === option.value 
                  ? 'bg-blue-500 border-2 border-blue-600' 
                  : 'bg-gray-50 border border-gray-200'
              } ${disabled ? 'opacity-50' : 'active:bg-gray-100'}`}
              disabled={disabled}
            >
              <Text className={`text-center font-medium ${
                value === option.value ? 'text-white' : 'text-gray-700'
              }`}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {disabled && placeholder && (
        <Text className="text-xs text-gray-500 mt-1">{placeholder}</Text>
      )}
    </View>
  );

  // Input mejorado para mobile
  const MobileInput = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    multiline = false, 
    required = false,
    keyboardType = 'default'
  }: any) => (
    <View className="">
      <Text className="text-sm text-gray-600  font-medium">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        className={`w-full border-2 ${activeField === label ? 'border-blue-500' : 'border-gray-300'} px-4 py-3 rounded-xl bg-white`}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        onFocus={() => setActiveField(label)}
        onBlur={() => setActiveField(null)}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );

  // Selector de cliente mejorado
  const ClientSelector = () => (
    <View className="mb-4">
      <Text className="text-sm text-gray-600 mb-2 font-medium">Cliente</Text>
      <TouchableOpacity
        onPress={openClienteModal}
        className={`w-full border-2 ${activeField === 'cliente' ? 'border-blue-500' : 'border-gray-300'} px-4 py-4 rounded-xl bg-white active:bg-gray-50`}
        onPressIn={() => setActiveField('cliente')}
        onPressOut={() => setActiveField(null)}
      >
        <Text className={`text-base ${clienteSeleccionado?.nombre ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
          {clienteSeleccionado?.nombre 
            ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}` 
            : '👉 Toca para seleccionar cliente'
          }
        </Text>
        {clienteSeleccionado?.nombre && (
          <Text className="text-xs text-green-600 mt-1">✓ Cliente seleccionado</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // Botones de acciones específicas
  const ActionButton = ({ onPress, title }: any) => (
    <TouchableOpacity
      onPress={onPress}
      className="w-full py-4 bg-blue-500 rounded-xl shadow-sm mb-3 active:bg-blue-600"
    >
      <Text className="text-white text-center font-semibold text-base">
        {title}
      </Text>
    </TouchableOpacity>
  );

  const formasPagoOptions = formasPago.map((forma) => ({
    value: forma.idformapago,
    label: forma.descripcion,
  }));

  return (
    <View className="px-4 pt-4">
      {/* Información del cliente */}
        <ClientSelector />

        {/* Fecha de Venta */}
        <MobileInput
          label="Fecha de Venta"
          value={venta.fecha}
          onChangeText={(text: string) => setVenta((prev: any) => ({ ...prev, fecha: text }))}
          placeholder="YYYY-MM-DD"
          required={true}
        />

        {/* Tipo de Venta */}
        <MobileSelect
          label="Tipo de Venta"
          value={venta.tipo}
          onValueChange={(value: string) => setVenta((prev: any) => ({ ...prev, tipo: value }))}
          options={[
            { value: 'contado', label: 'Contado' },
            { value: 'credito', label: 'Crédito' },
          ]}
          placeholder="Seleccionar tipo"
        />

        {/* Tipo de Descuento */}
        <TipoDescuentoSelect 
          onSelectionChange={setTipoDescuento} 
          setMontoDescuentoTotal={setMontoDescuentoTotal}
          defaultValue={tipoDescuento}
        />

        {/* Monto de descuento total */}
        {tipoDescuento === "descuento_total" && (
          <MobileInput
            label="Monto de Descuento"
            value={montoDescuentoTotal}
            onChangeText={setMontoDescuentoTotal}
            placeholder="Ingrese monto de descuento"
            keyboardType="numeric"
          />
        )}

        {/* Tipo de Comprobante */}
        <MobileSelect
          label="Tipo de Comprobante"
          value={venta.tipo_comprobante}
          onValueChange={(value: string) => setVenta((prev: any) => ({ ...prev, tipo_comprobante: value }))}
          options={[
            { value: 'F', label: 'Factura' },
            { value: 'T', label: 'Ticket' },
          ]}
          placeholder="Seleccionar comprobante"
          required={true}
        />

        {/* Forma de Pago */}
        <MobileSelect
          label="Forma de Pago"
          value={venta.idformapago || ''}
          onValueChange={(value: number) => setVenta((prev: any) => ({ ...prev, idformapago: value }))}
          options={formasPagoOptions}
          disabled={venta.tipo === 'credito'}
          placeholder="Solo disponible para ventas de contado"
          required={venta.tipo === 'contado'}
        />

        {/* Botones de acciones según forma de pago */}
        {venta.idformapago === 2 && (
          <ActionButton
            onPress={() => setModalSeleccionarOpen(true)}
            title="🏦 Seleccionar Datos Bancarios"
          />
        )}

        {venta.idformapago === 3 && (
          <ActionButton
            onPress={() => setModalChequeOpen(true)}
            title="📄 Ingresar Datos del Cheque"
          />
        )}

        {venta.idformapago === 4 && (
          <ActionButton
            onPress={() => setModalTarjetaOpen(true)}
            title="💳 Ingresar Datos Tarjeta"
          />
        )}

        {/* Observación */}
        <MobileInput
          label="Observación (opcional)"
          value={venta.observacion}
          onChangeText={(text: string) => setVenta((prev: any) => ({ ...prev, observacion: text }))}
          placeholder="Agregar observaciones adicionales..."
          multiline={true}
        />
      
      <ModalSeleccionarDatosBancarios
        isOpen={modalSeleccionarOpen}
        onClose={() => setModalSeleccionarOpen(false)}
        onSelect={(dato: any) => {
          console.log('Dato bancario seleccionado:', dato);
          setVenta((prev: any) => ({
            ...prev,
            datos_bancarios: dato,
          }));
          setModalSeleccionarOpen(false);
        }}
      />

      <ModalFormCheque
        isOpen={modalChequeOpen}
        onClose={() => {
          setVenta((prev: any) => ({ ...prev, detalle_cheque: datosCheque }));
          setModalChequeOpen(false);
        }}
        datosCheque={datosCheque}
        setDatosCheque={setDatosCheque}
      />

      <ModalFormTarjeta
        isOpen={modalTarjetaOpen}
        onClose={() => {
          setVenta((prev: any) => ({ ...prev, detalle_tarjeta: datosTarjeta }));
          setModalTarjetaOpen(false);
        }}
        datosTarjeta={datosTarjeta}
        setDatosTarjeta={setDatosTarjeta}
      />
    </View>
  );
};

export default FormVenta;