import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { CheckCircle, XCircle } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import ModalError from 'components/ModalError';
import ModalSeleccionarDatosBancarios from '../../../datosbancarios/components/ModalsDatosBancarios/ModalSeleccionarDatosBancarios';
import ModalFormTarjeta from 'components/Tarjetas/ModalFormTarjeta';
import ModalFormCheque from 'components/Cheques/ModalFormCheque';
import { getFormasPago } from 'services/formasPago';
import { pagarDeudaCompra } from 'services/compras';
import { CobroDeudaProps } from 'components/interface';

const CobroDeudaCompra: React.FC<CobroDeudaProps> = ({
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

  const [detalleTransferenciaPago, setDetalleTransferenciaPago] = useState<any>(null);
  const [modalSeleccionarOpen, setModalSeleccionarOpen] = useState(false);

  const [detalleTarjetaCompra, setDetalleTarjetaCompra] = useState<any>({
    tipo_tarjeta: '',
    entidad: '',
    monto: 0,
    observacion: ''
  });
  const [modalTarjetaOpen, setModalTarjetaOpen] = useState(false);

  const [detalleChequeCompra, setDetalleChequeCompra] = useState<any>({
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

    setError('');
    setLoading(true);

    try {
      const response = await pagarDeudaCompra({
        iddeuda,
        observacion,
        idformapago,
        monto: valor,
        detalle_transferencia_pago: idformapago === 2 ? detalleTransferenciaPago : null,
        detalle_tarjeta_compra_pago: idformapago === 4 ? detalleTarjetaCompra : null,
        detalle_cheque_compra_pago: idformapago === 3 ? detalleChequeCompra : null
      });

      setMensaje(response.data.message);
      setMonto('');
      setComprobante && setComprobante(response.data.comprobante);
      setShowComprobante && setShowComprobante(true);
      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      setError(error.response?.data?.error || '❌ Error al registrar el pago.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="">
      <View className="w-full max-w-[600px] mx-auto bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <Text className="text-2xl font-bold text-gray-800 mb-4">💸 Pago de Deuda de Compra</Text>

        <View className="gap-3">
          {/* Monto a pagar */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Monto a pagar</Text>
            <TextInput
              keyboardType="numeric"
              value={monto}
              onChangeText={setMonto}
              placeholder={`Máximo permitido: ${montoMaximo.toFixed(2)}`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Observación */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Observación</Text>
            <TextInput
              value={observacion}
              onChangeText={setObservacion}
              placeholder="N° de referencia de transacción o cheque"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Forma de Pago */}
          <View>
            <Text className="text-sm text-gray-600 mb-1">Forma de Pago</Text>
            <View className="border border-gray-300 rounded-lg bg-white">
              <Picker
                selectedValue={idformapago || ''}
                onValueChange={(value) => {
                  setIdformapago(value ? Number(value) : null);
                  setDetalleTransferenciaPago(null);
                  setDetalleTarjetaCompra({
                    tipo_tarjeta: '',
                    entidad: '',
                    monto: 0,
                    observacion: ''
                  });
                  setDetalleChequeCompra({
                    banco: '',
                    nro_cheque: '',
                    monto: 0,
                    fecha_emision: '',
                    fecha_vencimiento: '',
                    titular: '',
                    estado: 'pendiente'
                  });
                }}
              >
                <Picker.Item label="-- Seleccione una forma de pago --" value="" />
                {formasPago.map((forma) => (
                  <Picker.Item key={forma.idformapago} label={forma.descripcion} value={forma.idformapago} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Botón Datos Bancarios (idformapago === 2) */}
          {idformapago === 2 && (
            <TouchableOpacity
              onPress={() => setModalSeleccionarOpen(true)}
              className="bg-blue-600 px-4 py-3 rounded-lg shadow"
            >
              <Text className="text-white text-center font-medium">Seleccionar Datos Bancarios</Text>
            </TouchableOpacity>
          )}

          {/* Botón Datos Tarjeta (idformapago === 4) */}
          {idformapago === 4 && (
            <TouchableOpacity
              onPress={() => setModalTarjetaOpen(true)}
              className="bg-green-600 px-4 py-3 rounded-lg shadow"
            >
              <Text className="text-white text-center font-medium">Agregar Detalle de Tarjeta</Text>
            </TouchableOpacity>
          )}

          {/* Botón Datos Cheque (idformapago === 3) */}
          {idformapago === 3 && (
            <TouchableOpacity
              onPress={() => setModalChequeOpen(true)}
              className="bg-yellow-600 px-4 py-3 rounded-lg shadow"
            >
              <Text className="text-white text-center font-medium">Agregar Detalle de Cheque</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Botones de acción */}
        <View className="flex-row items-center justify-between mt-6">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-sm text-gray-600">Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePago}
            disabled={loading}
            className={`bg-blue-600 px-5 py-3 rounded-lg shadow ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-medium">Registrar Pago</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Mensaje de éxito */}
        {mensaje ? (
          <View className="mt-4 flex-row items-center">
            <CheckCircle size={20} color="#059669" />
            <Text className="ml-2 text-green-600 text-sm">{mensaje}</Text>
          </View>
        ) : null}

        {/* Mensaje de error */}
        {error ? (
          <View className="mt-4 flex-row items-center">
            <XCircle size={20} color="#dc2626" />
            <Text className="ml-2 text-red-600 text-sm">{error}</Text>
          </View>
        ) : null}
      </View>

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
          setDetalleTransferenciaPago(dato);
          setModalSeleccionarOpen(false);
        }}
      />

      <ModalFormTarjeta
        isOpen={modalTarjetaOpen}
        onClose={() => setModalTarjetaOpen(false)}
        datosTarjeta={detalleTarjetaCompra}
        setDatosTarjeta={setDetalleTarjetaCompra}
      />

      <ModalFormCheque
        isOpen={modalChequeOpen}
        onClose={() => setModalChequeOpen(false)}
        datosCheque={detalleChequeCompra}
        setDatosCheque={setDetalleChequeCompra}
      />
    </ScrollView>
  );
};

export default CobroDeudaCompra;
