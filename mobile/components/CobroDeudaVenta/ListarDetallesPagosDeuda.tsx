import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { 
  TrashIcon, 
  CreditCardIcon, 
  CalendarIcon,
  DocumentTextIcon,
  PrinterIcon
} from "react-native-heroicons/outline";
import { listarDetallePagosDeudaCompleto } from 'services/ventas';
import { listarDetallePagosDeudaVenta, anularPagoDeudaVenta, comprobantePagoDeudaDetalleId } from 'services/ventas';
import ModalDetallePagoDeuda from './components/ModalDetallePagoDeudas';
import ModalAdvert from 'components/ModalAdvert';
import ModalSuccess from 'components/ModalSuccess';
import SelectInput from 'app/clientes/components/SelectInput';
import DatePickerInput from 'components/DatePickerInput';
import { formatPY } from 'utils/utils';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface DetallePago {
  idpago_deuda: number;
  monto_pagado: string;
  fecha_pago: string;
  observacion: string;
  metodo_pago: string;
  creado_por: string;
}

interface Props {
  iddeuda: number;
  onSuccess?: () => void;
}

const ListarDetallesPagosDeuda: React.FC<Props> = ({ iddeuda, onSuccess }) => {
  const [detalles, setDetalles] = useState<DetallePago[]>([]);
  const [showAdvert, setShowAdvert] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [idPagoAAnular, setIdPagoAAnular] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loadingPdfId, setLoadingPdfId] = useState<number | null>(null);
  const [loadingReporte, setLoadingReporte] = useState(false);

  // Opciones para el SelectInput
  const limitOptions = [
    { value: '5', label: '5 por página' },
    { value: '10', label: '10 por página' },
    { value: '20', label: '20 por página' },
  ];

  // Función para formatear fecha segura para nombres de archivo
  const getFormattedDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  };

  const fetchDetalles = async () => {
    setLoading(true);
    try {
      const response = await listarDetallePagosDeudaVenta(iddeuda, {
        page,
        limit,
        search: "",
        fecha_inicio: fechaInicio || undefined,
        fecha_fin: fechaFin || undefined,
      });

      setDetalles(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error al cargar detalles de pagos:', error);
      Alert.alert("Error", "No se pudieron cargar los detalles de pagos");
    } finally {
      setLoading(false);
    }
  };

  const handleAnular = (idpago: number) => {
    setIdPagoAAnular(idpago);
    setShowAdvert(true);
  };

  const confirmarAnulacion = async () => {
    if (idPagoAAnular === null) return;

    try {
      await anularPagoDeudaVenta(idPagoAAnular);
      setSuccessModalOpen(true);
      fetchDetalles();
      onSuccess && onSuccess();
    } catch (error) {
      console.error('Error al anular el pago:', error);
      Alert.alert("Error", "❌ Error al anular el pago.");
    } finally {
      setShowAdvert(false);
      setIdPagoAAnular(null);
    }
  };

  const handleOpenDetalle = (pago: any) => {
    setPagoSeleccionado(pago);
    setModalOpen(true);
  };

  useEffect(() => {
    fetchDetalles();
  }, [page, limit, fechaInicio, fechaFin]);

  const handleReImprimir = async (idpago_deuda: number) => {
    setLoadingPdfId(idpago_deuda);
    try {
      const comprobante = await comprobantePagoDeudaDetalleId(idpago_deuda);

      if (comprobante.data?.comprobanteBase64) {
        console.log("PDF generado correctamente");
        await handleDownloadPDF(
          comprobante.data.comprobanteBase64,
          `Comprobante-Pago-${idpago_deuda}-${getFormattedDate()}`
        );
      } else {
        Alert.alert("Advertencia", "No se pudo generar el comprobante");
      }
    } catch (error) {
      console.error('Error al generar comprobante:', error);
      Alert.alert("Error", "No se pudo generar el comprobante");
    } finally {
      setLoadingPdfId(null);
    }
  };

  const handleGenerarReporte = async () => {
    setLoadingReporte(true);
    try {
      const response = await listarDetallePagosDeudaCompleto(iddeuda);

      const base64 = response.data.comprobanteBase64 || response.data.reporteBase64 || response.data.reportePDFBase64;

      if (!base64) {
        Alert.alert("Advertencia", "No se encontró el archivo PDF en la respuesta.");
        return;
      }

      console.log("Reporte PDF generado correctamente");
      await handleDownloadPDF(
        base64,
        `Reporte-Pagos-Deuda-${iddeuda}-${getFormattedDate()}`
      );
    } catch (error) {
      console.error("❌ Error al generar el reporte completo:", error);
      Alert.alert("Error", "❌ Error al generar el reporte.");
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleDownloadPDF = async (base64Data: string, fileName: string) => {
    try {
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${FileSystem.documentDirectory}${cleanFileName}.pdf`;
      
      console.log('Guardando archivo en:', filename);
      
      await FileSystem.writeAsStringAsync(filename, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (Platform.OS === "ios") {
        await Sharing.shareAsync(filename, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartir PDF'
        });
      } else {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        
        if (permissions.granted) {
          const androidFileName = `${cleanFileName}.pdf`;
          
          await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            androidFileName,
            'application/pdf'
          )
            .then(async (uri) => {
              await FileSystem.writeAsStringAsync(uri, base64Data, {
                encoding: FileSystem.EncodingType.Base64
              });
              Alert.alert('✅ Descarga Completa', `El archivo "${androidFileName}" se ha guardado en tus descargas.`);
            })
            .catch((e) => {
              console.error('Error al guardar archivo:', e);
              Alert.alert('Error', 'No se pudo guardar el archivo en descargas.');
            });
        } else {
          await Sharing.shareAsync(filename, {
            mimeType: 'application/pdf',
            dialogTitle: 'Compartir PDF'
          });
        }
      }
    } catch (err) {
      console.error('Error al descargar PDF:', err);
      Alert.alert('Error', `Ocurrió un error al procesar el PDF: ${err}`);
    }
  };

  const handleLimitChange = (name: string, value: string) => {
    setLimit(Number(value));
    setPage(1);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header con gradiente similar a ListarProductos */}
      <View className="bg-green-600 px-4 pt-16 pb-6 shadow-lg">
        {/* Título y descripción */}
        <View className="mb-4">
          <View className="flex-row items-center gap-3 mb-2">
            <View className="bg-white/20 p-2 rounded-xl">
              <CreditCardIcon size={28} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white">Historial de Pagos</Text>
              <Text className="text-green-100 text-sm mt-1">
                {detalles.length} registro{detalles.length !== 1 ? 's' : ''} encontrado{detalles.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Selector de límite */}
        <View className="mb-4">
          <Text className="text-white text-xs font-medium mb-2">Registros por página</Text>
          <SelectInput
            name="limit"
            value={String(limit)}
            onChange={handleLimitChange}
            options={limitOptions}
            placeholder="Límite"
          />
        </View>

        {/* Filtros de fecha */}
        <View className="flex-row flex-wrap gap-3 mb-4">
          <DatePickerInput
            label="Fecha inicio"
            value={fechaInicio}
            onChange={setFechaInicio}
            placeholder="Fecha inicio"
          />

          <DatePickerInput
            label="Fecha fin"
            value={fechaFin}
            onChange={setFechaFin}
            placeholder="Fecha fin"
          />
        </View>

        {/* Botón generar reporte */}
        <TouchableOpacity
          onPress={handleGenerarReporte}
          disabled={loadingReporte}
          className={`rounded-xl py-3 flex-row items-center justify-center gap-2 shadow-md ${
            loadingReporte ? 'bg-white/50' : 'bg-white'
          }`}
        >
          {loadingReporte ? (
            <>
              <ActivityIndicator size="small" color="#16a34a" />
              <Text className="text-green-700 font-semibold">Generando Reporte...</Text>
            </>
          ) : (
            <>
              <DocumentTextIcon size={20} color="#16a34a" />
              <Text className="text-green-700 font-semibold">Generar Reporte Completo</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Paginación compacta en el header */}
        <View className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 mt-4">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="flex-1 mr-2"
            >
              <View className={`rounded-lg py-2 flex-row items-center justify-center gap-1 ${
                page === 1 ? 'bg-white/10' : 'bg-white'
              }`}>
                <Text className={`text-xs font-semibold ${
                  page === 1 ? 'text-gray-300' : 'text-green-600'
                }`}>← Anterior</Text>
              </View>
            </TouchableOpacity>

            <View className="px-3">
              <Text className="text-white font-bold text-sm">
                {page} / {totalPages}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages}
              className="flex-1 ml-2"
            >
              <View className={`rounded-lg py-2 flex-row items-center justify-center gap-1 ${
                page >= totalPages ? 'bg-white/10' : 'bg-white'
              }`}>
                <Text className={`text-xs font-semibold ${
                  page >= totalPages ? 'text-gray-300' : 'text-green-600'
                }`}>Siguiente →</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Contenido con ScrollView */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
      >
        {/* Lista de Cards */}
        {loading ? (
          <View className="py-16 items-center bg-white rounded-2xl">
            <ActivityIndicator size="large" color="#16a34a" />
            <Text className="text-gray-500 mt-3 font-medium">Cargando pagos...</Text>
          </View>
        ) : detalles.length === 0 ? (
          <View className="bg-white rounded-2xl p-12 items-center">
            <View className="bg-gray-100 p-4 rounded-full mb-4">
              <CreditCardIcon size={48} color="#9ca3af" />
            </View>
            <Text className="text-gray-500 text-center text-base">
              No hay registros encontrados
            </Text>
            <Text className="text-gray-400 text-center text-sm mt-2">
              Intenta ajustar los filtros de búsqueda
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {detalles.map((item, idx) => (
              <View 
                key={item.idpago_deuda} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Header del Card */}
                <View className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 flex-row justify-between items-center border-b border-green-100">
                  <View className="flex-row items-center gap-2">
                    <View className="bg-green-600 px-2.5 py-1 rounded-full">
                      <Text className="text-white text-xs font-bold">
                        #{(page - 1) * limit + idx + 1}
                      </Text>
                    </View>
                    <Text className="text-2xl font-bold text-green-700">
                      {formatPY(item.monto_pagado)}
                    </Text>
                  </View>
                  <View className="bg-white px-3 py-1 rounded-full border border-green-200">
                    <Text className="text-xs font-medium text-green-700">
                      {item.metodo_pago || 'Efectivo'}
                    </Text>
                  </View>
                </View>

                {/* Contenido del Card */}
                <View className="p-4">
                  {/* Información del pago */}
                  <View className="flex-row items-center gap-2 mb-3">
                    <CalendarIcon size={18} color="#6b7280" />
                    <Text className="text-sm text-gray-600">
                      {new Date(item.fecha_pago).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>

                  {item.observacion && (
                    <View className="bg-gray-50 p-3 rounded-lg mb-3 border border-gray-200">
                      <Text className="text-xs font-medium text-gray-500 mb-1">Observación:</Text>
                      <Text className="text-sm text-gray-700">{item.observacion}</Text>
                    </View>
                  )}

                  <View className="flex-row items-center gap-2 mb-4">
                    <Text className="text-xs text-gray-500">Registrado por:</Text>
                    <Text className="text-xs font-medium text-gray-700">{item.creado_por}</Text>
                  </View>

                  {/* Botones de acción */}
                  <View className="flex-row flex-wrap gap-2">
                    <TouchableOpacity
                      onPress={() => handleOpenDetalle(item)}
                      className="flex-1 min-w-[100px] bg-blue-500 active:bg-blue-600 px-4 py-2.5 rounded-lg flex-row items-center justify-center gap-2"
                    >
                      <DocumentTextIcon size={16} color="white" />
                      <Text className="text-white text-sm font-semibold">Detalles</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleReImprimir(item.idpago_deuda)}
                      disabled={loadingPdfId === item.idpago_deuda}
                      className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-lg flex-row items-center justify-center gap-2 ${
                        loadingPdfId === item.idpago_deuda 
                          ? 'bg-green-300' 
                          : 'bg-green-500 active:bg-green-600'
                      }`}
                    >
                      {loadingPdfId === item.idpago_deuda ? (
                        <>
                          <ActivityIndicator size="small" color="white" />
                          <Text className="text-white text-sm font-semibold">Generando...</Text>
                        </>
                      ) : (
                        <>
                          <PrinterIcon size={16} color="white" />
                          <Text className="text-white text-sm font-semibold">Descargar</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleAnular(item.idpago_deuda)}
                      className="bg-red-500 active:bg-red-600 px-4 py-2.5 rounded-lg flex-row items-center justify-center gap-2"
                    >
                      <TrashIcon size={16} color="white" />
                      <Text className="text-white text-sm font-semibold">Anular</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modales */}
      <ModalAdvert
        isOpen={showAdvert}
        onClose={() => setShowAdvert(false)}
        onConfirm={confirmarAnulacion}
        message="¿Estás seguro de que deseas anular este pago? Esta acción actualizará la deuda."
        confirmButtonText="Sí, Anular"
      />

      <ModalSuccess
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        message="Anulación procesada con éxito"
      />

      <ModalDetallePagoDeuda
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        pago={pagoSeleccionado}
      />
    </View>
  );
};

export default ListarDetallesPagosDeuda;