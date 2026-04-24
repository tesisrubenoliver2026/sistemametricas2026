import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CheckCircleIcon, XCircleIcon } from "react-native-heroicons/outline";
import { type CobroDeudaProps } from '../interface';
import { pagarDeudaVenta } from 'services/ventas';
import ModalFormTarjeta from '../Tarjetas/ModalFormTarjeta';
import ModalFormCheque from '../Cheques/ModalFormCheque';
import { getFormasPago } from 'services/formasPago';
import SelectInput from 'app/clientes/components/SelectInput';
import ModalError from 'components/ModalError';
import ModalSeleccionarDatosBancarios from 'app/datosbancarios/components/ModalsDatosBancarios/ModalSeleccionarDatosBancarios';

const CobroDeudaVenta: React.FC<CobroDeudaProps> = ({
  iddeuda,
  onClose,
  onSuccess,
  setComprobante,
  setShowComprobante,
  montoMaximo = 0
}) => {
  const [monto, setMonto] = useState('');
  const [observacion, setObservacion] = useState('---');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModalError, setShowModalError] = useState(false);

  const [idformapago, setIdformapago] = useState<number | null>(null);

  const [detalleTransferenciaCobro, setDetalleTransferenciaCobro] = useState<any>(null);
  const [modalSeleccionarOpen, setModalSeleccionarOpen] = useState(false);

  const [detalleTarjetaVentaCobro, setDetalleTarjetaVentaCobro] = useState<any>({
    tipo_tarjeta: '',
    entidad: '',
    monto: 0,
    observacion: ''
  });
  const [modalTarjetaOpen, setModalTarjetaOpen] = useState(false);

  const [detalleChequeVentaCobro, setDetalleChequeVentaCobro] = useState<any>({
    banco: '',
    nro_cheque: '',
    monto: 0,
    fecha_emision: '',
    fecha_vencimiento: '',
    titular: '',
    estado: 'pendiente'
  });
  const [modalChequeOpen, setModalChequeOpen] = useState(false);

  const [formasPago, setFormasPago] = useState<any[]>([]);

  useEffect(() => {
    const fetchFormasPago = async () => {
      try {
        const res = await getFormasPago();
        setFormasPago(res.data);
      } catch (err) {
        console.error("❌ Error al obtener formas de pago", err);
        Alert.alert("Error", "No se pudieron cargar las formas de pago");
      }
    };

    fetchFormasPago();
  }, []);

  const handlePago = async () => {
    const valor = parseFloat(monto);
    if (!monto || isNaN(valor) || valor <= 0) {
      setError('❌ Ingrese un monto válido.');
      return;
    }

    if (valor > montoMaximo) {
      setShowModalError(true);
      return;
    }

    if (!idformapago) {
      setError('❌ Debe seleccionar una forma de pago.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await pagarDeudaVenta({
        iddeuda,
        observacion,
        idformapago,
        monto: valor,
        detalle_transferencia: idformapago === 2 ? detalleTransferenciaCobro : null,
        detalle_tarjeta_venta_credito: idformapago === 4 ? detalleTarjetaVentaCobro : null,
        detalle_cheque_venta_cobro: idformapago === 3 ? detalleChequeVentaCobro : null
      });

      setMensaje(response.data.message);

      // En React Native, manejamos el PDF de manera diferente
      if (response.data?.comprobanteBase64) {
        console.log("Comprobante PDF generado:", response.data.comprobanteBase64);
        Alert.alert(
          "Pago Registrado",
          "El pago se ha registrado correctamente y el comprobante se ha generado.",
          [{ text: "OK" }]
        );
        // Aquí podrías usar react-native-print o react-native-blob-util para manejar el PDF
      }

      setMonto('');
      setComprobante && setComprobante(response.data.comprobante);
      setShowComprobante && setShowComprobante(true);
      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '❌ Error al registrar el pago.';
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View className="flex-1 bg-white rounded-2xl p-6 border border-gray-200 mx-4">
      <Text className="text-2xl font-bold text-gray-800 mb-4">Cobro de Deuda</Text>

      {/* Inputs de Monto y Observación */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-700 mb-1">Monto a pagar</Text>
          <TextInput
            value={monto}
            onChangeText={setMonto}
            placeholder={`Máximo: ${montoMaximo.toFixed(2)}`}
            keyboardType="decimal-pad"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
          />
        </View>

        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-700 mb-1">Observación</Text>
          <TextInput
            value={observacion}
            onChangeText={setObservacion}
            placeholder="N° de referencia de transacción o cheque"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-sm text-gray-600 mb-1">Forma de Pago</Text>

        <SelectInput
          name="idformapago"
          value={idformapago ? String(idformapago) : ""}
          placeholder="Seleccione una forma de pago"
          options={[
            { value: "", label: "-- Seleccione una forma de pago --" },
            ...formasPago.map((f) => ({
              value: String(f.idformapago),
              label: f.descripcion,
            })),
          ]}
          onChange={(name, value) => {
            const val = value === "" ? null : Number(value);
            setIdformapago(val);

            // Reiniciar detalles según tipo
            setDetalleTransferenciaCobro(null);
            setDetalleTarjetaVentaCobro({
              tipo_tarjeta: "",
              entidad: "",
              monto: 0,
              observacion: "",
            });
            setDetalleChequeVentaCobro({
              banco: "",
              nro_cheque: "",
              monto: 0,
              fecha_emision: "",
              fecha_vencimiento: "",
              titular: "",
              estado: "pendiente",
            });
          }}
        />
      </View>

      {/* Botones para Detalle */}
      {idformapago === 2 && (
        <View className="mt-4">
          <TouchableOpacity
            onPress={() => setModalSeleccionarOpen(true)}
            className="bg-blue-600 active:bg-blue-700 px-4 py-3 rounded-lg shadow"
          >
            <Text className="text-white text-center">Seleccionar Datos Bancarios</Text>
          </TouchableOpacity>
        </View>
      )}

      {idformapago === 4 && (
        <View className="mt-4">
          <TouchableOpacity
            onPress={() => setModalTarjetaOpen(true)}
            className="bg-green-600 active:bg-green-700 px-4 py-3 rounded-lg shadow"
          >
            <Text className="text-white text-center">Agregar Detalle de Tarjeta</Text>
          </TouchableOpacity>
        </View>
      )}

      {idformapago === 3 && (
        <View className="mt-4">
          <TouchableOpacity
            onPress={() => setModalChequeOpen(true)}
            className="bg-yellow-600 active:bg-yellow-700 px-4 py-3 rounded-lg shadow"
          >
            <Text className="text-white text-center">Agregar Detalle de Cheque</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botones de acción */}
      <View className="flex-row items-center justify-between mt-6">
        <TouchableOpacity onPress={onClose}>
          <Text className="text-sm text-gray-600 active:text-red-600">Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePago}
          disabled={loading}
          className={`px-5 py-3 rounded-lg shadow ${loading ? 'bg-blue-400' : 'bg-blue-600 active:bg-blue-700'
            }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-medium">Registrar Pago</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Mensajes */}
      {mensaje && (
        <View className="mt-4 flex-row items-center">
          <CheckCircleIcon size={20} color="#16a34a" />
          <Text className="text-green-600 text-sm ml-2">{mensaje}</Text>
        </View>
      )}

      {error && (
        <View className="mt-4 flex-row items-center">
          <XCircleIcon size={20} color="#dc2626" />
          <Text className="text-red-600 text-sm ml-2">{error}</Text>
        </View>
      )}

      {/* Modales */}
      <ModalError
        message={`El monto ingresado supera el permitido. Máximo: ${montoMaximo.toFixed(2)}.`}
        onClose={() => setShowModalError(false)}
        isOpen={showModalError}
      />

      <ModalSeleccionarDatosBancarios
        isOpen={modalSeleccionarOpen}
        onClose={() => setModalSeleccionarOpen(false)}
        onSelect={(dato: any) => {
          setDetalleTransferenciaCobro(dato);
          setModalSeleccionarOpen(false);
        }}
      />

      <ModalFormTarjeta
        isOpen={modalTarjetaOpen}
        onClose={() => setModalTarjetaOpen(false)}
        datosTarjeta={detalleTarjetaVentaCobro}
        setDatosTarjeta={setDetalleTarjetaVentaCobro}
      />

      <ModalFormCheque
        isOpen={modalChequeOpen}
        onClose={() => setModalChequeOpen(false)}
        datosCheque={detalleChequeVentaCobro}
        setDatosCheque={setDetalleChequeVentaCobro}
      />
    </View>
  );
};

export default CobroDeudaVenta;