import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { listarDeudasVenta } from "services/ventas";
import { formatPY } from "utils/utils";
// Modales (importa tus componentes actuales)
import ModalCobroDeuda from "../ModalsVenta/ModalCobroDeuda";
import ModalComprobantePago from "../ModalsVenta/ModalComprobantePago";
import ModalListarDetallesPagosDeuda from "../ModalsVenta/ModalListarDetallesPagosDeuda";

const optionsState = [
  { id: "", name: "Todos" },
  { id: "Pendiente", name: "Pendientes" },
  { id: "Pagado", name: "Pagados" },
];

export default function ListarClienteDVenta({
  nombreCliente,
  disableSearch,
  setEstadoCliente,
  generateReport,
}) {
  const [comprobante, setComprobante] = useState(null);
  const [showComprobante, setShowComprobante] = useState(false);

  const [deudas, setDeudas] = useState([]);
  const [selected, setSelected] = useState(optionsState[1]);

  const [idDeudaDetalle, setIdDeudaDetalle] = useState(0);
  const [showModalDetailPay, setShowModalDetailPay] = useState(false);

  const [showModalCobroDeuda, setShowModalCobroDeuda] = useState(false);
  const [iddeudaSeleccionada, setIddeudaSeleccionada] = useState(null);
  const [montoMaximo, setMontoMaximo] = useState(0);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (nombreCliente) {
      setSearch(nombreCliente);
      setPage(1);
    }
  }, [nombreCliente]);

  const fetchDeudas = useCallback(async () => {
    try {
      const res = await listarDeudasVenta({
        page,
        limit,
        search,
        estado: selected.id,
      });
      setDeudas(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.log("Error obteniendo deudas:", error);
    }
  }, [page, limit, search, selected]);

  useEffect(() => {
    fetchDeudas();
  }, [fetchDeudas]);

  useEffect(() => {
    if (setEstadoCliente) setEstadoCliente(selected.id);
  }, [selected]);

  const handleCobrar = (deuda) => {
    setIddeudaSeleccionada(deuda.iddeuda);
    setMontoMaximo(deuda.total_deuda - deuda.total_pagado);
    setShowModalCobroDeuda(true);
  };

  const showPayDetails = (id) => {
    setIdDeudaDetalle(id);
    setShowModalDetailPay(true);
  };

  // =============================
  // UI COMPONENTS INTERNOS
  // =============================

  const renderItem = ({ item, index }) => (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow border border-gray-200">

      <View className="flex-row justify-between mb-2">
        <Text className="text-lg font-semibold text-gray-800">
          💵 Deuda #{(page - 1) * limit + index + 1}
        </Text>

        <Text
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            item.estado === "Pagado"
              ? "bg-green-200 text-green-800"
              : "bg-yellow-200 text-yellow-800"
          }`}
        >
          {item.estado}
        </Text>
      </View>

      <Text className="text-gray-700">Cliente: {item.nombre_cliente}</Text>
      <Text className="text-gray-700">Documento: {item.numDocumento}</Text>

      <View className="mt-3">
        <Text className="text-gray-900 font-semibold">
          Total deuda: {formatPY(item.total_deuda)}
        </Text>
        <Text className="text-green-700 font-semibold">
          Total pagado: {formatPY(item.total_pagado)}
        </Text>
        <Text className="text-red-600 font-bold">
          Saldo: {formatPY(item.saldo)}
        </Text>
      </View>

      <View className="mt-3">
        <Text className="text-gray-600 text-sm">
          Fecha: {new Date(item.fecha_deuda).toLocaleDateString()}
        </Text>
        <Text className="text-gray-600 text-sm">
          Último pago:{" "}
          {item.ult_fecha_pago
            ? new Date(item.ult_fecha_pago).toLocaleDateString("es-PY")
            : "--"}
        </Text>
      </View>

      {/* BOTONES */}
      <View className="flex-row justify-between mt-4">
        <TouchableOpacity
          onPress={() => handleCobrar(item)}
          className="flex-row items-center gap-2 bg-blue-600 px-4 py-2 rounded-xl"
        >
          <Ionicons name="cash-outline" size={18} color="white" />
          <Text className="text-white font-semibold">Cobrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => showPayDetails(item.iddeuda)}
          className="flex-row items-center gap-2 bg-gray-600 px-4 py-2 rounded-xl"
        >
          <Ionicons name="eye-outline" size={18} color="white" />
          <Text className="text-white font-semibold">Ver Pagos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 p-4 bg-gray-100">

      {/* HEADER */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <Ionicons name="cash-outline" size={32} color="#16a34a" />
          <Text className="text-2xl font-bold text-gray-800">
            Deudas por Venta
          </Text>
        </View>

        {/* Límite por página */}
        <TouchableOpacity
          onPress={() => setLimit(limit === 5 ? 10 : limit === 10 ? 20 : 5)}
          className="px-4 py-2 rounded-xl border border-gray-300"
        >
          <Text className="text-gray-700 text-sm">
            {limit} / página
          </Text>
        </TouchableOpacity>
      </View>

      {/* BUSCADOR */}
      <View className="flex-row items-center bg-white px-4 py-2 rounded-xl border mb-3">
        <Ionicons name="search" size={20} color="gray" />
        <TextInput
          value={search}
          editable={!disableSearch}
          onChangeText={(t) => {
            setSearch(t);
            setPage(1);
          }}
          placeholder="Buscar por cliente o estado..."
          className="flex-1 ml-2 text-gray-700"
        />
      </View>

      {/* SELECT ESTADO */}
      <TouchableOpacity
        onPress={() =>
          setSelected(
            selected.id === "" ? optionsState[1] :
            selected.id === "Pendiente" ? optionsState[2] :
            optionsState[0]
          )
        }
        className="mb-4 bg-white px-4 py-3 rounded-xl border flex-row justify-between items-center"
      >
        <Text className="text-gray-700">{selected.name}</Text>
        <Ionicons name="chevron-down" size={20} color="gray" />
      </TouchableOpacity>

      {/* GENERAR REPORTE */}
      <TouchableOpacity
        onPress={() => generateReport && generateReport()}
        className="mb-4 bg-green-600 py-3 rounded-xl"
      >
        <Text className="text-center text-white font-semibold">
          Generar Reporte por Cliente
        </Text>
      </TouchableOpacity>

      {/* LISTA */}
      <FlatList
        data={deudas}
        keyExtractor={(item) => item.iddeuda.toString()}
        renderItem={renderItem}
        onEndReached={() => {
          if (page < totalPages) setPage(page + 1);
        }}
        onEndReachedThreshold={0.2}
      />

      {/* MODALES */}
      {showModalCobroDeuda && iddeudaSeleccionada && (
        <ModalCobroDeuda
          montoMaximo={montoMaximo}
          isOpen={showModalCobroDeuda}
          setComprobante={setComprobante}
          setShowComprobante={setShowComprobante}
          onClose={() => setShowModalCobroDeuda(false)}
          idDeuda={iddeudaSeleccionada}
          onSuccess={() => {
            fetchDeudas();
            setShowModalCobroDeuda(false);
          }}
        />
      )}

      {showComprobante && comprobante && (
        <ModalComprobantePago
          onClose={() => setShowComprobante(false)}
          comprobante={comprobante}
        />
      )}

      <ModalListarDetallesPagosDeuda
        iddeuda={idDeudaDetalle}
        isOpen={showModalDetailPay}
        onClose={() => setShowModalDetailPay(false)}
        onSuccess={() => fetchDeudas()}
      />
    </View>
  );
}
