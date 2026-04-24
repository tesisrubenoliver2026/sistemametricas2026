import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatPY } from '../../../utils/utils';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getReportProveedoresPDF } from '../../../services/proveedor';

interface Proveedor {
    idproveedor: number;
    nombre: string;
    telefono: string;
    email: string;
    ruc: string;
    razon: string;
    total_compras: number;
}

interface ReporteData {
    proveedores: Proveedor[];
    estadisticas: {
        total_proveedores: number;
        total_compras_monto: number;
    };
}

interface ReporteProveedoresProps {
    reporte: ReporteData;
    onClose: () => void;
}

export default function ReporteProveedor({ reporte, onClose }: ReporteProveedoresProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
    const [sortBy, setSortBy] = useState<'nombre' | 'compras'>('nombre');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [loadingPDF, setLoadingPDF] = useState(false);

    const proveedores = Array.isArray(reporte?.proveedores) ? reporte.proveedores : [];
    const estadisticas = reporte?.estadisticas || {
        total_proveedores: 0,
        total_compras_monto: 0,
    };

    const filteredProveedores = proveedores
        .filter(proveedor => {
            const matchSearch = searchTerm === '' ||
                proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                proveedor.ruc.includes(searchTerm) ||
                proveedor.razon.toLowerCase().includes(searchTerm.toLowerCase());
            return matchSearch;
        })
        .sort((a, b) => {
            if (sortBy === 'nombre') {
                const comparison = a.nombre.localeCompare(b.nombre);
                return sortOrder === 'asc' ? comparison : -comparison;
            } else {
                const comparison = (a.total_compras || 0) - (b.total_compras || 0);
                return sortOrder === 'asc' ? comparison : -comparison;
            }
        });

    const handleDownloadPDF = async () => {
        try {
            setLoadingPDF(true);
            const response = await getReportProveedoresPDF(searchTerm || undefined);

            const base64Data = response.data?.reportePDFBase64;

            if (!base64Data || typeof base64Data !== 'string') {
                Alert.alert('Error', 'No se recibió el PDF del servidor');
                return;
            }

            const fileUri = FileSystem.documentDirectory + `reporte_proveedores_${Date.now()}.pdf`;

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

    const toggleSort = (field: 'nombre' | 'compras') => {
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
                        <Text className="text-2xl font-bold text-gray-800">Reporte de Proveedores</Text>
                    </View>
                    <Pressable onPress={onClose} className="h-10 w-10 items-center justify-center rounded-xl bg-gray-200">
                        <Ionicons name="close" size={20} color="#64748b" />
                    </Pressable>
                </View>
                <Text className="text-gray-500 ml-1">
                    {filteredProveedores.length} de {proveedores.length} proveedores
                </Text>
            </View>

            {/* Estadísticas */}
            <View className="mb-6">
                <Text className="text-lg font-bold text-gray-800 mb-3">Estadísticas</Text>
                <View className="flex-row flex-wrap gap-3">
                    <View className="flex-1 min-w-[45%] bg-blue-50 rounded-xl p-4">
                        <View className="flex-row items-center gap-2 mb-1">
                            <Ionicons name="business" size={18} color="#3b82f6" />
                            <Text className="text-sm text-gray-600">Total Proveedores</Text>
                        </View>
                        <Text className="text-2xl font-bold text-blue-600">
                            {estadisticas.total_proveedores}
                        </Text>
                    </View>

                    <View className="flex-1 min-w-[45%] bg-purple-50 rounded-xl p-4">
                        <View className="flex-row items-center gap-2 mb-1">
                            <Ionicons name="cash" size={18} color="#9333ea" />
                            <Text className="text-sm text-gray-600">Total Compras</Text>
                        </View>
                        <Text className="text-2xl font-bold text-purple-600">
                            {formatPY(estadisticas.total_compras_monto)}
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
                        placeholder="Buscar por nombre, RUC o razón social..."
                        placeholderTextColor="#94a3b8"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-12 py-3.5 text-gray-800"
                    />
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
                    <Pressable onPress={() => toggleSort('compras')} className={`px-3 py-2 rounded-lg flex-row items-center gap-1 ${sortBy === 'compras' ? 'bg-blue-600' : 'bg-gray-200'}`}>
                        <Text className={`text-sm font-semibold ${sortBy === 'compras' ? 'text-white' : 'text-gray-600'}`}>
                            Compras
                        </Text>
                        {sortBy === 'compras' && (
                            <Ionicons name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} size={14} color="#fff" />
                        )}
                    </Pressable>
                </View>
            </View>

            {/* Lista de proveedores */}
            {viewMode === 'card' ? (
                <View className="gap-3 mb-4">
                    {filteredProveedores.map((proveedor) => (
                        <View key={proveedor.idproveedor} className="bg-white border border-gray-200 rounded-xl p-4">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-gray-800">
                                        {proveedor.nombre}
                                    </Text>
                                    <Text className="text-sm text-gray-500">{proveedor.ruc}</Text>
                                </View>
                            </View>

                            <View className="gap-2">
                                <View className="flex-row items-center gap-2">
                                    <Ionicons name="call-outline" size={16} color="#64748b" />
                                    <Text className="text-sm text-gray-600">{proveedor.telefono || '--'}</Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <Ionicons name="mail-outline" size={16} color="#64748b" />
                                    <Text className="text-sm text-gray-600">{proveedor.email || '--'}</Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <Ionicons name="briefcase-outline" size={16} color="#64748b" />
                                    <Text className="text-sm text-gray-600">{proveedor.razon || '--'}</Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <Ionicons name="cash-outline" size={16} color="#64748b" />
                                    <Text className="text-sm font-semibold text-gray-700">
                                        Total compras: {formatPY(proveedor.total_compras || 0)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            ) : (
                <View className="mb-4">
                    {filteredProveedores.map((proveedor, idx) => (
                        <View
                            key={proveedor.idproveedor}
                            className={`bg-white border-b border-gray-200 p-3 ${idx === 0 ? 'border-t rounded-t-xl' : ''} ${idx === filteredProveedores.length - 1 ? 'rounded-b-xl' : ''}`}
                        >
                            <Text className="text-sm font-bold text-gray-800">{proveedor.nombre}</Text>
                            <View className="flex-row items-center justify-between mt-1">
                                <Text className="text-xs text-gray-500">{proveedor.ruc}</Text>
                                <Text className="text-xs font-semibold text-gray-700">{formatPY(proveedor.total_compras || 0)}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Sin resultados */}
            {filteredProveedores.length === 0 && (
                <View className="py-8 items-center">
                    <Ionicons name="search-outline" size={48} color="#94a3b8" />
                    <Text className="text-gray-500 mt-2">No se encontraron proveedores</Text>
                </View>
            )}

            {/* Botón de descarga PDF */}
            <View className="pt-4 pb-6">
                <Pressable
                    onPress={handleDownloadPDF}
                    disabled={loadingPDF}
                    className="active:opacity-70"
                >
                    <View className=" py-3.5 flex-row items-center justify-center gap-2 bg-blue-600 rounded-xl">
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
