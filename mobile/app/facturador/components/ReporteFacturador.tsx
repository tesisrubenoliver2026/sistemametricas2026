import { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getReportFacturadoresPDF } from '../../../services/facturador';
import { formatPY } from '../../../utils/utils';

interface Facturador {
    idfacturador: number;
    nombre_fantasia: string;
    titular: string;
    ruc: string;
    timbrado_nro: string;
    telefono: string;
    ciudad: string;
    fecha_inicio_vigente: string;
    fecha_fin_vigente: string;
    culminado: string;
    total_ventas: number;
    monto_total_facturado: string;
    monto_total_facturado_raw: number;
    facturas_utilizadas: number;
    total_facturas_habilitadas: number;
    porcentaje_uso: string;
}

interface ReporteData {
    titulo: string;
    total_facturadores: number;
    facturadores_activos: number;
    facturadores_culminados: number;
    total_ventas_general: number;
    monto_total_facturado: string;
    facturadores: Facturador[];
}

interface ReporteFacturadorProps {
    reporte: ReporteData;
    onClose: () => void;
}

export default function ReporteFacturador({ reporte, onClose }: ReporteFacturadorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
    const [estadoFiltro, setEstadoFiltro] = useState<string>('todos');
    const [sortBy, setSortBy] = useState<'nombre' | 'ventas'>('nombre');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [loadingPDF, setLoadingPDF] = useState(false);

    const facturadores = Array.isArray(reporte?.facturadores) ? reporte.facturadores : [];

    const filteredFacturadores = facturadores
        .filter(facturador => {
            const matchSearch = searchTerm === '' ||
                facturador.nombre_fantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
                facturador.ruc.includes(searchTerm) ||
                facturador.titular.toLowerCase().includes(searchTerm.toLowerCase()) ||
                facturador.timbrado_nro.includes(searchTerm);

            const matchEstado = estadoFiltro === 'todos' ||
                (estadoFiltro === 'activo' && facturador.culminado === 'Activo') ||
                (estadoFiltro === 'culminado' && facturador.culminado === 'Culminado');

            return matchSearch && matchEstado;
        })
        .sort((a, b) => {
            if (sortBy === 'nombre') {
                const comparison = a.nombre_fantasia.localeCompare(b.nombre_fantasia);
                return sortOrder === 'asc' ? comparison : -comparison;
            } else {
                const comparison = (a.total_ventas || 0) - (b.total_ventas || 0);
                return sortOrder === 'asc' ? comparison : -comparison;
            }
        });

    const estadisticas = useMemo(() => {
        const totalFacturadores = filteredFacturadores.length;
        const activos = filteredFacturadores.filter((f) => f.culminado === 'Activo').length;
        const culminados = filteredFacturadores.filter((f) => f.culminado === 'Culminado').length;
        const totalVentas = filteredFacturadores.reduce((acc, f) => acc + (f.total_ventas || 0), 0);

        return { totalFacturadores, activos, culminados, totalVentas };
    }, [filteredFacturadores]);

    const handleDownloadPDF = async () => {
        try {
            setLoadingPDF(true);
            const response = await getReportFacturadoresPDF(searchTerm || undefined, estadoFiltro !== 'todos' ? estadoFiltro : undefined);

            const base64Data = response.data?.reportePDFBase64;

            if (!base64Data || typeof base64Data !== 'string') {
                Alert.alert('Error', 'No se recibió el PDF del servidor');
                return;
            }

            const fileUri = FileSystem.documentDirectory + `reporte_facturadores_${Date.now()}.pdf`;

            await FileSystem.writeAsStringAsync(fileUri, base64Data, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert('Error', 'No se puede compartir archivos en este dispositivo');
            }
        } catch (error: any) {
            console.error('Error al descargar PDF:', error);
            Alert.alert('Error', error.message || 'No se pudo generar el PDF');
        } finally {
            setLoadingPDF(false);
        }
    };

    const toggleSort = (field: 'nombre' | 'ventas') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    return (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {/* Header */}
            <View className="mb-6">
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-3">
                        <View className="h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                            <Ionicons name="document-text" size={22} color="#9333ea" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-800">{reporte.titulo || 'Reporte de Facturadores'}</Text>
                    </View>
                    <Pressable onPress={onClose} className="h-10 w-10 items-center justify-center rounded-xl bg-gray-200">
                        <Ionicons name="close" size={20} color="#64748b" />
                    </Pressable>
                </View>
                <Text className="text-gray-500 ml-1">
                    {filteredFacturadores.length} de {facturadores.length} facturadores
                </Text>
            </View>

            {/* Estadísticas */}
            <View className="mb-6">
                <Text className="text-lg font-bold text-gray-800 mb-3">Estadísticas</Text>
                <View className="flex-row flex-wrap gap-3">
                    <View className="flex-1 min-w-[45%] bg-blue-50 rounded-xl p-4">
                        <View className="flex-row items-center gap-2 mb-1">
                            <Ionicons name="business" size={18} color="#3b82f6" />
                            <Text className="text-sm text-gray-600">Total Facturadores</Text>
                        </View>
                        <Text className="text-2xl font-bold text-blue-600">
                            {estadisticas.totalFacturadores}
                        </Text>
                    </View>

                    <View className="flex-1 min-w-[45%] bg-green-50 rounded-xl p-4">
                        <View className="flex-row items-center gap-2 mb-1">
                            <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                            <Text className="text-sm text-gray-600">Activos</Text>
                        </View>
                        <Text className="text-2xl font-bold text-green-600">
                            {estadisticas.activos}
                        </Text>
                    </View>

                    <View className="flex-1 min-w-[45%] bg-gray-50 rounded-xl p-4">
                        <View className="flex-row items-center gap-2 mb-1">
                            <Ionicons name="close-circle" size={18} color="#6b7280" />
                            <Text className="text-sm text-gray-600">Culminados</Text>
                        </View>
                        <Text className="text-2xl font-bold text-gray-600">
                            {estadisticas.culminados}
                        </Text>
                    </View>

                    <View className="flex-1 min-w-[45%] bg-purple-50 rounded-xl p-4">
                        <View className="flex-row items-center gap-2 mb-1">
                            <Ionicons name="trending-up" size={18} color="#9333ea" />
                            <Text className="text-sm text-gray-600">Total Ventas</Text>
                        </View>
                        <Text className="text-2xl font-bold text-purple-600">
                            {estadisticas.totalVentas}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Búsqueda */}
            <View className="mb-4">
                <View className="relative">
                    <View className="absolute left-4 top-3.5 z-10">
                        <Ionicons name="search" size={20} color="#64748b" />
                    </View>
                    <TextInput
                        placeholder="Buscar por nombre, RUC, timbrado..."
                        placeholderTextColor="#94a3b8"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-12 py-3.5 text-gray-800"
                    />
                </View>
            </View>

            {/* Filtro de estado */}
            <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Filtrar por estado</Text>
                <View className="flex-row gap-2">
                    <Pressable
                        onPress={() => setEstadoFiltro('todos')}
                        className={`flex-1 px-4 py-2 rounded-lg ${estadoFiltro === 'todos' ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                        <Text className={`text-center font-semibold ${estadoFiltro === 'todos' ? 'text-white' : 'text-gray-600'}`}>
                            Todos
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setEstadoFiltro('activo')}
                        className={`flex-1 px-4 py-2 rounded-lg ${estadoFiltro === 'activo' ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                        <Text className={`text-center font-semibold ${estadoFiltro === 'activo' ? 'text-white' : 'text-gray-600'}`}>
                            Activos
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setEstadoFiltro('culminado')}
                        className={`flex-1 px-4 py-2 rounded-lg ${estadoFiltro === 'culminado' ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                        <Text className={`text-center font-semibold ${estadoFiltro === 'culminado' ? 'text-white' : 'text-gray-600'}`}>
                            Culminados
                        </Text>
                    </Pressable>
                </View>
            </View>

            {/* Controles de vista */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row gap-2">
                    <Pressable onPress={() => setViewMode('card')} className={`px-4 py-2 rounded-lg ${viewMode === 'card' ? 'bg-blue-600' : 'bg-gray-200'}`}>
                        <Ionicons name="grid" size={18} color={viewMode === 'card' ? '#fff' : '#64748b'} />
                    </Pressable>
                    <Pressable onPress={() => setViewMode('table')} className={`px-4 py-2 rounded-lg ${viewMode === 'table' ? 'bg-blue-600' : 'bg-gray-200'}`}>
                        <Ionicons name="list" size={18} color={viewMode === 'table' ? '#fff' : '#64748b'} />
                    </Pressable>
                </View>

                <View className="flex-row gap-2">
                    <Pressable onPress={() => toggleSort('nombre')} className={`px-3 py-2 rounded-lg flex-row items-center gap-1 ${sortBy === 'nombre' ? 'bg-blue-600' : 'bg-gray-200'}`}>
                        <Text className={`text-sm font-semibold ${sortBy === 'nombre' ? 'text-white' : 'text-gray-600'}`}>
                            Nombre
                        </Text>
                        {sortBy === 'nombre' && (
                            <Ionicons name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} size={14} color="#fff" />
                        )}
                    </Pressable>
                    <Pressable onPress={() => toggleSort('ventas')} className={`px-3 py-2 rounded-lg flex-row items-center gap-1 ${sortBy === 'ventas' ? 'bg-blue-600' : 'bg-gray-200'}`}>
                        <Text className={`text-sm font-semibold ${sortBy === 'ventas' ? 'text-white' : 'text-gray-600'}`}>
                            Ventas
                        </Text>
                        {sortBy === 'ventas' && (
                            <Ionicons name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} size={14} color="#fff" />
                        )}
                    </Pressable>
                </View>
            </View>

            {/* Lista de facturadores */}
            {viewMode === 'card' ? (
                <View className="gap-3 mb-4">
                    {filteredFacturadores.map((facturador) => (
                        <View key={facturador.idfacturador} className="bg-white border border-gray-200 rounded-xl p-4">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-gray-800">
                                        {facturador.nombre_fantasia}
                                    </Text>
                                    <Text className="text-sm text-gray-500">{facturador.titular}</Text>
                                </View>
                                <View className={`px-3 py-1 rounded-full ${facturador.culminado === 'Activo' ? 'bg-green-100' : 'bg-gray-100'}`}>
                                    <Text className={`text-xs font-semibold ${facturador.culminado === 'Activo' ? 'text-green-700' : 'text-gray-700'}`}>
                                        {facturador.culminado}
                                    </Text>
                                </View>
                            </View>

                            <View className="gap-2">
                                <View className="flex-row items-center gap-2">
                                    <Ionicons name="document-text-outline" size={16} color="#64748b" />
                                    <Text className="text-sm text-gray-600">RUC: {facturador.ruc}</Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <Ionicons name="barcode-outline" size={16} color="#64748b" />
                                    <Text className="text-sm text-gray-600">Timbrado: {facturador.timbrado_nro}</Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <Ionicons name="call-outline" size={16} color="#64748b" />
                                    <Text className="text-sm text-gray-600">{facturador.telefono || '--'}</Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <Ionicons name="location-outline" size={16} color="#64748b" />
                                    <Text className="text-sm text-gray-600">{facturador.ciudad || '--'}</Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <Ionicons name="calendar-outline" size={16} color="#64748b" />
                                    <Text className="text-sm text-gray-600">
                                        {facturador.fecha_inicio_vigente} - {facturador.fecha_fin_vigente}
                                    </Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <Ionicons name="trending-up-outline" size={16} color="#64748b" />
                                    <Text className="text-sm font-semibold text-gray-700">
                                        Ventas: {facturador.total_ventas} ({facturador.monto_total_facturado})
                                    </Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <Ionicons name="receipt-outline" size={16} color="#64748b" />
                                    <Text className="text-sm font-semibold text-gray-700">
                                        Facturas: {facturador.facturas_utilizadas}/{facturador.total_facturas_habilitadas} ({facturador.porcentaje_uso}%)
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            ) : (
                <View className="mb-4">
                    {filteredFacturadores.map((facturador, idx) => (
                        <View
                            key={facturador.idfacturador}
                            className={`bg-white border-b border-gray-200 p-3 ${idx === 0 ? 'border-t rounded-t-xl' : ''} ${idx === filteredFacturadores.length - 1 ? 'rounded-b-xl' : ''}`}
                        >
                            <Text className="text-sm font-bold text-gray-800">{facturador.nombre_fantasia}</Text>
                            <View className="flex-row items-center justify-between mt-1">
                                <Text className="text-xs text-gray-500">{facturador.ruc}</Text>
                                <Text className="text-xs font-semibold text-gray-700">{facturador.total_ventas} ventas</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Sin resultados */}
            {filteredFacturadores.length === 0 && (
                <View className="py-8 items-center">
                    <Ionicons name="search-outline" size={48} color="#94a3b8" />
                    <Text className="text-gray-500 mt-2">No se encontraron facturadores</Text>
                </View>
            )}

            {/* Botón de descarga PDF */}
            <View className="pt-4 pb-6">
                <Pressable
                    onPress={handleDownloadPDF}
                    disabled={loadingPDF}
                    className="active:opacity-70"
                >
                    <View className="bg-blue-600 py-3.5 flex-row items-center justify-center gap-2 rounded-xl">
                        {loadingPDF ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Ionicons name="download" size={20} color="#fff" />
                        )}
                        <Text className="text-white font-bold">
                            {loadingPDF ? 'Generando PDF...' : 'Descargar PDF'}
                        </Text>
                    </View>
                </Pressable>
            </View>
        </ScrollView>
    );
}
