// CrearVentaProgramada.tsx (React Native / Expo + NativeWind)
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { createVentaProgramada } from "../../../../services/ventas";
import ModalSeleccionarCliente from "../../../../components/ModalsVenta/ModalSeleccionarCliente";
import ModalSeleccionarProducto from "../../../compras/components/Modals/ModalSeleccionarProducto";
import ModalError from "../../../../components/ModalError";
import ModalSuccess from "../../../../components/ModalSuccess";

interface CrearVentaProgramadaProps {
  onSuccess?: () => void;
  onClose: () => void;
}

const fecha = new Date().toISOString().split("T")[0];

const initialForm = {
  idcliente: "",
  idproducto: "",
  nombre_producto: "",
  cantidad: 1,           // mantenemos número; lo convertimos a string al mostrar
  fecha_inicio: fecha,
  dia_programado: "",
  observacion: "",
};

const CrearVentaProgramada = ({ onSuccess, onClose }: CrearVentaProgramadaProps) => {
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState(initialForm);

  const [showProductoModal, setShowProductoModal] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);

  // En RN no hay event.target; usamos onChangeText(name, value)
  const handleChange = (name: keyof typeof initialForm, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const cantidadStr = useMemo(() => String(formData.cantidad ?? ""), [formData.cantidad]);

  const handleSubmit = async () => {
    const { idcliente, idproducto, fecha_inicio, dia_programado } = formData;

    if (!idcliente || !idproducto || !fecha_inicio || !dia_programado) {
      setErrorMessage("❌ Completa todos los campos obligatorios.");
      setErrorModalOpen(true);
      return;
    }

    try {
      await createVentaProgramada({
        idcliente: Number(idcliente),
        idproducto: Number(idproducto),
        cantidad: Number(formData.cantidad),
        fecha_inicio,
        dia_programado: Number(dia_programado),
        estado: "activa",
        observacion: formData.observacion,
      });

      onSuccess && onSuccess();
      onClose();
      setSuccessModalOpen(true);
      setFormData(initialForm);
      setClienteSeleccionado(null);
    } catch (error: any) {
      setErrorMessage("❌ " + (error?.response?.data?.error || "Error al crear venta programada"));
      setErrorModalOpen(true);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="bg-white rounded-2xl shadow p-8">
          <Text className="text-2xl font-semibold text-blue-700 text-center">
            📅 Crear Venta Programada
          </Text>

          {/* Cliente */}
          <View className="mt-6">
            <Text className="text-sm font-bold text-gray-700 mb-2">Cliente</Text>

            <View className="flex-row gap-2">
              <TextInput
                keyboardType="numeric"
                value={formData.idcliente}
                onChangeText={(t) => handleChange("idcliente", t)}
                placeholder="ID Cliente"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              />
              <Pressable
                onPress={() => setShowClienteModal(true)}
                className="px-4 py-2 rounded-lg bg-blue-600 active:opacity-80"
              >
                <Text className="text-white font-semibold">Seleccionar</Text>
              </Pressable>
            </View>

            {!!clienteSeleccionado && (
              <Text className="text-green-600 font-bold text-sm mt-2">
                Cliente: {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
              </Text>
            )}
          </View>

          {/* Producto */}
          <View className="mt-5">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Producto</Text>

            <View className="flex-row gap-2">
              <TextInput
                keyboardType="numeric"
                value={formData.idproducto}
                onChangeText={(t) => handleChange("idproducto", t)}
                placeholder="ID Producto"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              />
              <Pressable
                onPress={() => setShowProductoModal(true)}
                className="px-4 py-2 rounded-lg bg-blue-600 active:opacity-80"
              >
                <Text className="text-white font-semibold">Seleccionar</Text>
              </Pressable>
            </View>

            {!!formData.nombre_producto && (
              <Text className="text-sm text-green-600 font-bold mt-2">
                Producto: {formData.nombre_producto}
              </Text>
            )}
          </View>

          {/* Campos: fecha / día / observación / cantidad */}
          <View className="mt-5">
            {/* Fecha de inicio */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Fecha de inicio</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                value={formData.fecha_inicio}
                onChangeText={(t) => handleChange("fecha_inicio", t)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </View>

            {/* Día programado */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Día programado</Text>
              <TextInput
                placeholder="Ej: 15"
                keyboardType="numeric"
                value={formData.dia_programado}
                onChangeText={(t) => handleChange("dia_programado", t)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </View>

            {/* Observación */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Observación</Text>
              <TextInput
                placeholder="Observaciones..."
                value={formData.observacion}
                onChangeText={(t) => handleChange("observacion", t)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </View>

            {/* Cantidad */}
            <View className="mb-2">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Cantidad</Text>
              <TextInput
                placeholder="Cantidad"
                keyboardType="numeric"
                value={cantidadStr}
                onChangeText={(t) =>
                  setFormData((prev) => ({
                    ...prev,
                    cantidad: Number(t.replace(/[^0-9]/g, "")) || 0,
                  }))
                }
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </View>
          </View>

          {/* Botón guardar */}
          <Pressable
            onPress={handleSubmit}
            className="mt-6 w-full bg-green-600 rounded-lg py-3 active:opacity-90"
          >
            <Text className="text-white text-center font-semibold">
              Guardar Venta Programada
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Modales (tus componentes existentes, sin cambios) */}
      <ModalSuccess
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        message="✅ Venta programada creada con éxito"
      />
      <ModalError
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        message={errorMessage}
      />
      <ModalSeleccionarProducto
        isOpen={showProductoModal}
        detalles={[]}
        configVentaPorLote={false}
        cantidadProducto={0}
        stockVerify={false}
        setCantidadMaximo={() => {}}
        setCantidadProducto={() => {}}
        onClose={() => setShowProductoModal(false)}
        onSelect={(producto) => {
          setFormData((prev) => ({
            ...prev,
            idproducto: producto.idproducto.toString(),
            nombre_producto: producto.nombre_producto,
          }));
          setShowProductoModal(false);
        }}
      />
      <ModalSeleccionarCliente
        isOpen={showClienteModal}
        onClose={() => setShowClienteModal(false)}
        onSelect={(cliente) => {
          setClienteSeleccionado(cliente);
          setFormData((prev) => ({
            ...prev,
            idcliente: cliente.idcliente.toString(),
          }));
          setShowClienteModal(false);
        }}
      />
    </KeyboardAvoidingView>
  );
};

export default CrearVentaProgramada;
