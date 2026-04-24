import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Package, Download } from 'lucide-react-native';
import ModalDetalleCompra from "./Modals/ModalDetalleCompra";
import ModalCrearCompra from './Modals/ModalCrearCompra';
import ModalError from '../../../components/ModalError';
import { deleteCompra, fetchComprasPaginate, getComprasMonth, getReportListCompra, getReportComprasPDF } from '../../../services/compras';
import { ReporteCompras } from './ReporteCompras';
import type { ReporteComprasResponse } from '../../../types/reporte.types';
import SelectInput from '../../clientes/components/SelectInput';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const ListarCompras = () => {
    const [errorMessage, setErrorMessage] = useState("");
    const [compras, setCompras] = useState<any[]>([]);
    const [modalCrearCompraOpen, setModalCrearCompraOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCompra, setSelectedCompra] = useState<any | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [datosReporte, setDatosReporte] = useState<ReporteComprasResponse | null>(null);
    const [mostrarReporte, setMostrarReporte] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchCompras = async () => {
        try {
            setLoading(true);
            const res = await fetchComprasPaginate(page, limit, search);
            setCompras(res.data.data);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Error al obtener compras:', error);
        } finally {
            setLoading(false);
        }
    };

       const fetchCompras2 = async () => {
        try {
            const res = await getComprasMonth(2025);
            console.log(res)
        } catch (error) {
            console.error('Error al obtener compras:', error);
        }
    };

    const handleDelete = async (id: number) => {
        Alert.alert(
            'Confirmar anulación',
            '¿Estás seguro de que deseas anular esta compra?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Anular',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteCompra(id);
                            fetchCompras();
                        } catch (error) {
                            setErrorMessage('❌ No se pudo anular la compra');
                        }
                    }
                }
            ]
        );
    };


    useEffect(() => {
        fetchCompras();
        fetchCompras2();
    }, [page, limit, search]);

    const handleGenerateReporteList = async () => {
        try {
            // Calcular fechas por defecto (año actual)
            const fechaInicio = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
            const fechaFin = new Date().toISOString().split('T')[0];

            const res = await getReportListCompra(search, fechaInicio, fechaFin, '');
            console.log("📊 Respuesta del servidor:", res.data);

            // Transformar la respuesta al formato esperado
            const compras = res.data.data || res.data;
            const filtros = res.data.filtros || {};
            const estadisticas = res.data.estadisticas || {};

            // Calcular estadísticas
            const totalCompras = estadisticas.total_compras || compras.length;
            const comprasContado = estadisticas.compras_contado || compras.filter((c: any) => c.tipo.toLowerCase() === 'contado').length;
            const comprasCredito = estadisticas.compras_credito || compras.filter((c: any) => c.tipo.toLowerCase() === 'credito').length;

            // Crear estructura de datos esperada
            const reporteTransformado: ReporteComprasResponse = {
                message: '✅ Reporte de compras generado correctamente',
                datosReporte: {
                    empresa: {
                        nombre_fantasia: '',
                        ruc: '',
                        timbrado_nro: '',
                        fecha_inicio_vigente: '',
                        fecha_fin_vigente: '',
                        fecha_emision: new Date().toLocaleDateString('es-PY')
                    },
                    reporte: {
                        titulo: 'Reporte de Compras',
                        fecha_inicio: filtros.fecha_inicio,
                        fecha_fin: filtros.fecha_fin,
                        total_compras: totalCompras,
                        compras_contado: comprasContado,
                        compras_credito: comprasCredito,
                        monto_total_compras: estadisticas.monto_total_compras || '0',
                        monto_total_descuentos: estadisticas.monto_total_descuentos || '0',
                        cantidad_total_productos: estadisticas.cantidad_total_productos || 0,
                        compras: compras
                    }
                }
            };

            setDatosReporte(reporteTransformado);
            setMostrarReporte(true);
        } catch (error) {
            console.error("❌ Error al generar reporte de compras:", error);
            setErrorMessage("❌ Error al generar el reporte");
        }
    };

    const handleDownloadPDF = async (tipoFiltro: string) => {
        try {
            // Calcular fechas por defecto (año actual)
            const fechaInicio = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
            const fechaFin = new Date().toISOString().split('T')[0];

            const res = await getReportComprasPDF(search, fechaInicio, fechaFin, tipoFiltro);
            const base64PDF = res.data.reportePDFBase64;

            const filename = FileSystem.documentDirectory + `Reporte-Compras-${new Date().toLocaleDateString()}.pdf`;
            await FileSystem.writeAsStringAsync(filename, base64PDF, {
                encoding: FileSystem.EncodingType.Base64,
            });

            if (Platform.OS === "ios") {
                await Sharing.shareAsync(filename);
            } else {
                const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                if (permissions.granted) {
                    await FileSystem.StorageAccessFramework.createFileAsync(
                        permissions.directoryUri,
                        `Reporte-Compras-${new Date().toLocaleDateString()}.pdf`,
                        'application/pdf'
                    )
                        .then(async (uri) => {
                            await FileSystem.writeAsStringAsync(uri, base64PDF, {
                                encoding: FileSystem.EncodingType.Base64
                            });
                            Alert.alert('Descarga Completa', 'El reporte se ha guardado en tus descargas.');
                        })
                        .catch((e) => {
                            console.log(e);
                            Alert.alert('Error', 'No se pudo guardar el archivo.');
                        });
                } else {
                    Alert.alert('Permiso denegado', 'No se puede guardar el archivo sin permiso.');
                }
            }
        } catch (error) {
            console.error("❌ Error al generar PDF de compras:", error);
            setErrorMessage("❌ Error al generar el PDF");
        }
    };

    const optionsLimit = [5, 10, 20, 50, 100].map((num) => ({
        label: `${num} por página`,
        value: num.toString(),
    }));

    const renderCompraItem = ({ item: compra, index }: { item: any; index: number }) => {
        const totalProductos = compra.detalles?.length || 0;
        const cantidadTotal = compra.detalles?.reduce((sum: number, d: any) => sum + parseFloat(d.cantidad || 0), 0) || 0;
        const esCompraVacia = parseFloat(compra.total || 0) === 0;
        const esInventarioInicial = compra.observacion?.toLowerCase() === 'inventario inicial';

        return (
            <View className="bg-white rounded-lg border border-gray-200 p-4 mb-3 mx-2 shadow-sm">
                {/* Header del card */}
                <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 pr-2">
                        <View className="flex-row items-center mb-1">
                            <Text className="text-xs font-semibold text-gray-500">#{(page - 1) * limit + index + 1}</Text>
                            <Text className="text-base font-bold text-gray-900 ml-2">{compra.nombre}</Text>
                        </View>
                        {esInventarioInicial && (
                            <View className="bg-yellow-100 px-2 py-0.5 rounded-full self-start">
                                <Text className="text-xs text-yellow-700">Inv. Inicial</Text>
                            </View>
                        )}
                        <View className="bg-gray-100 px-2 py-1 rounded mt-1 self-start">
                            <Text className="text-xs font-mono">{compra.nro_factura}</Text>
                        </View>
                    </View>
                </View>

                {/* Badges de tipo y estado */}
                <View className="flex-row gap-2 mb-3">
                    <View className={`px-3 py-1 rounded-full ${
                        compra.tipo.toLowerCase() === 'contado' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                        <Text className={`text-xs font-semibold ${
                            compra.tipo.toLowerCase() === 'contado' ? 'text-green-800' : 'text-yellow-800'
                        }`}>
                            {compra.tipo === 'contado' ? 'Contado' : 'Crédito'}
                        </Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full ${
                        compra.estado === 'pagado' ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                        <Text className={`text-xs font-semibold ${
                            compra.estado === 'pagado' ? 'text-emerald-800' : 'text-red-800'
                        }`}>
                            {compra.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
                        </Text>
                    </View>
                </View>

                {/* Información de productos */}
                <View className="bg-blue-50 rounded-lg p-3 mb-3">
                    <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                            <Text className="text-xs text-gray-600 mb-1">Productos</Text>
                            <Text className="text-sm font-bold text-blue-700">{totalProductos} item{totalProductos !== 1 ? 's' : ''}</Text>
                        </View>
                        <View className="w-px h-10 bg-gray-300 mx-3" />
                        <View className="flex-1">
                            <Text className="text-xs text-gray-600 mb-1">Cantidad Total</Text>
                            <Text className="text-sm font-bold text-gray-700">{cantidadTotal.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* Cajero y Fecha */}
                <View className="flex-row justify-between mb-3">
                    <View className="flex-1">
                        <Text className="text-xs text-gray-500">Cajero</Text>
                        <Text className="text-sm text-gray-700">{compra.cajero_nombre || 'N/A'}</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs text-gray-500 text-right">Fecha</Text>
                        <Text className="text-sm text-gray-700 text-right">
                            {new Date(compra.fecha).toLocaleDateString('es-PY')}
                        </Text>
                    </View>
                </View>

                {/* Total y acciones */}
                <View className="flex-row justify-between items-center pt-3 border-t border-gray-200">
                    <View>
                        <Text className="text-xs text-gray-500">Total</Text>
                        <Text className={`text-lg font-bold ${esCompraVacia ? 'text-gray-400' : 'text-gray-800'}`}>
                            ₲ {parseInt(compra.total).toLocaleString("es-PY")}
                        </Text>
                        {esCompraVacia && (
                            <Text className="text-xs text-gray-400">Sin movimiento</Text>
                        )}
                    </View>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => {
                                setSelectedCompra(compra);
                                setShowModal(true);
                            }}
                            className="bg-blue-500 px-4 py-2 rounded-lg shadow-sm"
                        >
                            <Text className="text-white text-xs font-semibold">Ver</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleDelete(compra.idcompra)}
                            className="bg-red-500 px-3 py-2 rounded-lg shadow-sm"
                        >
                            <Ionicons name="trash" size={16} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header con gradiente */}
            <View className="bg-green-600 px-4 pt-16 pb-6 shadow-lg">
                {/* Título y selector */}
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center gap-3 flex-1">
                        <View className="bg-white/20 p-2 rounded-xl">
                            <Package size={28} color="#ffffff" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-3xl font-bold text-white">Compras</Text>
                            <Text className="text-green-100 text-sm">Gestiona tus compras</Text>
                        </View>
                    </View>
                    <View className="ml-2">
                        <SelectInput
                            name="limitfiltro"
                            value={String(limit)}
                            onChange={(name, value) => {
                                setLimit(Number(value));
                                setPage(1);
                            }}
                            placeholder="Límite"
                            options={optionsLimit}
                        />
                    </View>
                </View>

                {/* Buscador */}
                <View className="relative mb-3">
                    <View className="absolute left-3 top-3.5 z-10">
                        <Ionicons name="search" size={20} color="#9CA3AF" />
                    </View>
                    <TextInput
                        placeholder="Buscar por proveedor o factura..."
                        value={search}
                        onChangeText={(text) => {
                            setSearch(text);
                            setPage(1);
                        }}
                        className="w-full pl-11 pr-4 py-3 border-2 border-white/30 rounded-xl bg-white shadow-md text-gray-800"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                {/* Botones de acción */}
                <View className="flex-row gap-2 mb-3">
                    <TouchableOpacity
                        onPress={() => setModalCrearCompraOpen(true)}
                        className="flex-1 bg-white rounded-xl py-3 flex-row items-center justify-center gap-2 shadow-md"
                    >
                        <Ionicons name="add-circle" size={20} color="#10b981" />
                        <Text className="text-green-600 font-semibold">Crear Compra</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleGenerateReporteList}
                        className="flex-1 bg-white rounded-xl py-3 flex-row items-center justify-center gap-2 shadow-md"
                    >
                        <Download size={18} color="#059669" />
                        <Text className="text-emerald-600 font-semibold">Reporte</Text>
                    </TouchableOpacity>
                </View>

                {/* Paginación compacta en el header */}
                <View className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5">
                    <View className="flex-row items-center justify-between">
                        <Pressable
                            onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                            className="flex-1 mr-2"
                        >
                            <View className={`rounded-lg py-2 flex-row items-center justify-center gap-1 ${page === 1 ? 'bg-white/10' : 'bg-white'}`}>
                                <Ionicons name="chevron-back" size={16} color={page === 1 ? '#9ca3af' : '#059669'} />
                                <Text className={`text-xs font-semibold ${page === 1 ? 'text-gray-300' : 'text-emerald-600'}`}>Anterior</Text>
                            </View>
                        </Pressable>

                        <View className="px-3">
                            <Text className="text-white font-bold text-sm">
                                {page} / {totalPages}
                            </Text>
                        </View>

                        <Pressable
                            onPress={() => setPage((prev) => prev + 1)}
                            disabled={page >= totalPages}
                            className="flex-1 ml-2"
                        >
                            <View className={`rounded-lg py-2 flex-row items-center justify-center gap-1 ${page >= totalPages ? 'bg-white/10' : 'bg-white'}`}>
                                <Text className={`text-xs font-semibold ${page >= totalPages ? 'text-gray-300' : 'text-emerald-600'}`}>Siguiente</Text>
                                <Ionicons name="chevron-forward" size={16} color={page >= totalPages ? '#9ca3af' : '#059669'} />
                            </View>
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* Lista de compras */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
            ) : (
                <FlatList
                    data={compras}
                    renderItem={renderCompraItem}
                    keyExtractor={(item) => item.idcompra.toString()}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center p-8">
                            <Text className="text-gray-500">No se encontraron compras</Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 80 }}
                />
            )}

            {/* Modales */}
            <ModalDetalleCompra
                isOpen={showModal}
                compra={selectedCompra}
                onClose={() => {
                    setShowModal(false);
                    setSelectedCompra(null);
                }}
            />
            <ModalCrearCompra
                isOpen={modalCrearCompraOpen}
                onClose={() => setModalCrearCompraOpen(false)}
                onSuccess={() => {
                    fetchCompras();
                }}
            />
            <ModalError isOpen={!!errorMessage} message={errorMessage} onClose={() => setErrorMessage("")} />

            {/* Modal de Reporte de Compras */}
            {mostrarReporte && datosReporte && datosReporte.datosReporte && datosReporte.datosReporte.reporte && (
                <ReporteCompras
                    reporte={datosReporte.datosReporte.reporte}
                    onClose={() => setMostrarReporte(false)}
                    onDownloadPDF={handleDownloadPDF}
                />
            )}
        </View>
    );
};

export default ListarCompras;
