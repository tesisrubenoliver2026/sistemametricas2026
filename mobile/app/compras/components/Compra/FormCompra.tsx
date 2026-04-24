import type { FC } from "react";
import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getFormasPago } from "services/formasPago";
import ModalSeleccionarDatosBancarios from "../../../datosbancarios/components/ModalsDatosBancarios/ModalSeleccionarDatosBancarios";
import ModalFormCheque from "components/Cheques/ModalFormCheque";
import ModalFormTarjeta from "components/Tarjetas/ModalFormTarjeta";

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
        console.error("❌ Error al obtener formas de pago", err);
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
    <View className="gap-3">
      {/* Proveedor */}
      <View>
        <Text className="text-sm text-gray-600 mb-1">Proveedor</Text>
        <TouchableOpacity
          onPress={openProveedorModal}
          className="border border-gray-300 px-4 py-3 rounded-lg bg-gray-50"
        >
          <Text className={proveedorSeleccionado?.nombre ? "text-gray-800" : "text-gray-400"}>
            {proveedorSeleccionado?.nombre || '-- Seleccionar proveedor --'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Nro. Factura */}
      <View>
        <Text className="text-sm text-gray-600 mb-1">Nro. Factura</Text>
        <TextInput
          value={compra.nro_factura}
          onChangeText={(text) => setCompra((prev: any) => ({ ...prev, nro_factura: text }))}
          className="border border-gray-300 px-4 py-3 rounded-lg bg-white"
          placeholder="Ingrese número de factura"
        />
      </View>

      {/* Fecha */}
      <View>
        <Text className="text-sm text-gray-600 mb-1">Fecha</Text>
        <TextInput
          value={compra.fecha}
          onChangeText={(text) => setCompra((prev: any) => ({ ...prev, fecha: text }))}
          className="border border-gray-300 px-4 py-3 rounded-lg bg-white"
          placeholder="YYYY-MM-DD"
        />
      </View>

      {/* Tipo de Compra */}
      <View>
        <Text className="text-sm text-gray-600 mb-1">Tipo de Compra</Text>
        <View className="border border-gray-300 rounded-lg bg-white">
          <Picker
            selectedValue={compra.tipo}
            onValueChange={(value) => setCompra((prev: any) => ({ ...prev, tipo: value }))}
          >
            <Picker.Item label="Contado" value="contado" />
            <Picker.Item label="Crédito" value="credito" />
          </Picker>
        </View>
      </View>

      {/* Forma de Pago */}
      <View>
        <Text className="text-sm text-gray-600 mb-1">Forma de Pago</Text>
        <View className={`border border-gray-300 rounded-lg ${compra.tipo === 'credito' ? 'bg-gray-100' : 'bg-white'}`}>
          <Picker
            enabled={compra.tipo !== 'credito'}
            selectedValue={compra.idformapago || ''}
            onValueChange={(value) =>
              setCompra((prev: any) => ({
                ...prev,
                idformapago: value ? Number(value) : null,
              }))
            }
          >
            <Picker.Item label="-- Seleccione una forma de pago (solo contado)--" value="" />
            {formasPago.map((forma) => (
              <Picker.Item key={forma.idformapago} label={forma.descripcion} value={forma.idformapago} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Botón Datos Bancarios (idformapago === 2) */}
      {compra.idformapago === 2 && (
        <View>
          <TouchableOpacity
            onPress={() => setModalSeleccionarOpen(true)}
            className="bg-blue-600 px-4 py-3 rounded-lg shadow"
          >
            <Text className="text-white text-center font-medium">Seleccionar Datos Bancarios</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botón Datos Cheque (idformapago === 3) */}
      {compra.idformapago === 3 && (
        <View>
          <TouchableOpacity
            onPress={() => setModalChequeOpen(true)}
            className="bg-blue-600 px-4 py-3 rounded-lg shadow"
          >
            <Text className="text-white text-center font-medium">Ingresar Datos del Cheque</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botón Datos Tarjeta (idformapago === 4) */}
      {compra.idformapago === 4 && (
        <View>
          <TouchableOpacity
            onPress={() => setModalTarjetaOpen(true)}
            className="bg-blue-600 px-4 py-3 rounded-lg shadow"
          >
            <Text className="text-white text-center font-medium">Ingresar Datos Tarjeta C/D</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Observación */}
      <View>
        <Text className="text-sm text-gray-600 mb-1">Observación</Text>
        <TextInput
          placeholder="Observación (opcional)"
          value={compra.observacion}
          onChangeText={(text) => setCompra((prev: any) => ({ ...prev, observacion: text }))}
          className="border border-gray-300 px-4 py-3 rounded-lg bg-white"
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Modales */}
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
    </View>
  );
};

export default FormCompra;
