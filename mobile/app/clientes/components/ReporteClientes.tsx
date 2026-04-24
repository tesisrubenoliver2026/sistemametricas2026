import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { formatPY } from '../../../utils/utils';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getReportClientesPDF } from '../../../services/cliente';

interface Cliente {
    idcliente: number;
    nombre: string;
    apellido: string;
    tipo: string;
    numDocumento: string;
    telefono: string;
    direccion: string;
    genero: string;
    estado: string;
    tipo_cliente: string;
    total_compras?: number;
}

interface ReporteData {
    clientes: Cliente[];
    estadisticas: {
        totalClientes: number;
        activos: number;
        inactivos: number;
        totalCompras: number;
    };
}

interface ReporteClientesProps {
    reporte: ReporteData;
    onClose: () => void;
}

export default function ReporteClientes({ reporte, onClose }: ReporteClientesProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('todos');
    const [filterTipo, setFilterTipo] = useState('todos');
    const [filterTipoCliente, setFilterTipoCliente] = useState('todos');
    const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
    const [sortBy, setSortBy] = useState<'nombre' | 'compras'>('nombre');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [loadingPDF, setLoadingPDF] = useState(false);

    // Asegurar que reporte.clientes existe y es un array
    const clientes = Array.isArray(reporte?.clientes) ? reporte.clientes : [];
    const estadisticas = reporte?.estadisticas || {
        totalClientes: 0,
        activos: 0,
        inactivos: 0,
        totalCompras: 0,
    };

    // Filtrar y ordenar clientes
    const filteredClientes = clientes
        .filter(cliente => {
            const matchSearch = searchTerm === '' ||
                cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cliente.numDocumento.includes(searchTerm);
            const matchEstado = filterEstado === 'todos' || cliente.estado === filterEstado;
            const matchTipo = filterTipo === 'todos' || cliente.tipo === filterTipo;
            const matchTipoCliente = filterTipoCliente === 'todos' || cliente.tipo_cliente === filterTipoCliente;
            return matchSearch && matchEstado && matchTipo && matchTipoCliente;
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
            const response = await getReportClientesPDF(
                searchTerm || undefined,
                filterTipoCliente !== 'todos' ? filterTipoCliente : undefined
            );

            // El backend devuelve base64 en response.data.reportePDFBase64
            const base64Data = response.data?.reportePDFBase64;

            if (!base64Data || typeof base64Data !== 'string') {
                Alert.alert('Error', 'No se recibió el PDF del servidor');
                return;
            }

            const fileUri = FileSystem.documentDirectory + `reporte_clientes_${Date.now()}.pdf`;

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

    const FilterButton = ({ active, onPress, label }: { active: boolean; onPress: () => void; label: string }) => (
        <Pressable
            onPress={onPress}
            className={`px-4 py-2 rounded-lg ${active ? 'bg-blue-600' : 'bg-gray-200'}`}
        >
            <Text className={`text-sm font-semibold ${active ? 'text-white' : 'text-gray-600'}`}>
                {label}
            </Text>
        </Pressable>
    );

    return (
 
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
            >
                {/* Header */}
                <View className="mb-6">
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center gap-3">
                            <View className="h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                                <Ionicons name="document-text" size={22} color="#9333ea" />
                            </View>
                            <Text className="text-2xl font-bold text-gray-800">Reporte de Clientes</Text>
                        </View>
                        <Pressable
                            onPress={onClose}
                            className="h-10 w-10 items-center justify-center rounded-xl bg-gray-200"
                        >
                            <Ionicons name="close" size={20} color="#64748b" />
                        </Pressable>
                    </View>
                    <Text className="text-gray-500 ml-1">
                        {filteredClientes.length} de {clientes.length} clientes
                    </Text>
                </View>

                {/* Estadísticas */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-gray-800 mb-3">Estadísticas</Text>
                    <View className="flex-row flex-wrap gap-3">
                        <View className="flex-1 min-w-[45%] bg-blue-50 rounded-xl p-4">
                            <View className="flex-row items-center gap-2 mb-1">
                                <Ionicons name="people" size={18} color="#3b82f6" />
                                <Text className="text-sm text-gray-600">Total Clientes</Text>
                            </View>
                            <Text className="text-2xl font-bold text-blue-600">
                                {estadisticas.totalClientes}
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

                        <View className="flex-1 min-w-[45%] bg-red-50 rounded-xl p-4">
                            <View className="flex-row items-center gap-2 mb-1">
                                <Ionicons name="close-circle" size={18} color="#ef4444" />
                                <Text className="text-sm text-gray-600">Inactivos</Text>
                            </View>
                            <Text className="text-2xl font-bold text-red-600">
                                {estadisticas.inactivos}
                            </Text>
                        </View>

                        <View className="flex-1 min-w-[45%] bg-purple-50 rounded-xl p-4">
                            <View className="flex-row items-center gap-2 mb-1">
                                <Ionicons name="cash" size={18} color="#9333ea" />
                                <Text className="text-sm text-gray-600">Total Compras</Text>
                            </View>
                            <Text className="text-2xl font-bold text-purple-600">
                                {formatPY(estadisticas.totalCompras)}
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
                            placeholder="Buscar por nombre, apellido o documento..."
                            placeholderTextColor="#94a3b8"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-12 py-3.5 text-gray-800"
                        />
                    </View>
                </View>

                {/* Filtros */}
                <View className="mb-4 gap-3">
                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Estado</Text>
                        <View className="flex-row gap-3">
                            <FilterButton active={filterEstado === 'todos'} onPress={() => setFilterEstado('todos')} label="Todos" />
                            <FilterButton active={filterEstado === 'activo'} onPress={() => setFilterEstado('activo')} label="Activos" />
                            <FilterButton active={filterEstado === 'inactivo'} onPress={() => setFilterEstado('inactivo')} label="Inactivos" />
                        </View>
                    </View>

                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Tipo de Persona</Text>
                        <View className="flex-row gap-3">
                            <FilterButton active={filterTipo === 'todos'} onPress={() => setFilterTipo('todos')} label="Todos" />
                            <FilterButton active={filterTipo === 'FISICA'} onPress={() => setFilterTipo('FISICA')} label="Física" />
                            <FilterButton active={filterTipo === 'JURIDICA'} onPress={() => setFilterTipo('JURIDICA')} label="Jurídica" />
                        </View>
                    </View>

                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Tipo de Cliente</Text>
                        <View className="flex-row gap-3">
                            <FilterButton active={filterTipoCliente === 'todos'} onPress={() => setFilterTipoCliente('todos')} label="Todos" />
                            <FilterButton active={filterTipoCliente === 'MAYORISTA'} onPress={() => setFilterTipoCliente('MAYORISTA')} label="Mayorista" />
                            <FilterButton active={filterTipoCliente === 'MINORISTA'} onPress={() => setFilterTipoCliente('MINORISTA')} label="Minorista" />
                        </View>
                    </View>
                </View>

                {/* Controles de vista */}
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row gap-2">
                        <Pressable
                            onPress={() => setViewMode('card')}
                            className={`px-4 py-2 rounded-lg ${viewMode === 'card' ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <Ionicons name="grid" size={18} color={viewMode === 'card' ? '#fff' : '#64748b'} />
                        </Pressable>
                        <Pressable
                            onPress={() => setViewMode('table')}
                            className={`px-4 py-2 rounded-lg ${viewMode === 'table' ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <Ionicons name="list" size={18} color={viewMode === 'table' ? '#fff' : '#64748b'} />
                        </Pressable>
                    </View>

                    <View className="flex-row gap-2">
                        <Pressable
                            onPress={() => toggleSort('nombre')}
                            className={`px-3 py-2 rounded-lg flex-row items-center gap-1 ${sortBy === 'nombre' ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <Text className={`text-sm font-semibold ${sortBy === 'nombre' ? 'text-white' : 'text-gray-600'}`}>
                                Nombre
                            </Text>
                            {sortBy === 'nombre' && (
                                <Ionicons name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} size={14} color="#fff" />
                            )}
                        </Pressable>
                        <Pressable
                            onPress={() => toggleSort('compras')}
                            className={`px-3 py-2 rounded-lg flex-row items-center gap-1 ${sortBy === 'compras' ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <Text className={`text-sm font-semibold ${sortBy === 'compras' ? 'text-white' : 'text-gray-600'}`}>
                                Compras
                            </Text>
                            {sortBy === 'compras' && (
                                <Ionicons name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} size={14} color="#fff" />
                            )}
                        </Pressable>
                    </View>
                </View>

                {/* Lista de clientes */}
                {viewMode === 'card' ? (
                    <View className="gap-3 mb-4">
                        {filteredClientes.map((cliente) => (
                            <View key={cliente.idcliente} className="bg-white border border-gray-200 rounded-xl p-4">
                                <View className="flex-row items-center justify-between mb-3">
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-gray-800">
                                            {cliente.nombre} {cliente.apellido}
                                        </Text>
                                        <Text className="text-sm text-gray-500">{cliente.numDocumento}</Text>
                                    </View>
                                    <View className={`px-3 py-1 rounded-full ${cliente.estado === 'activo' ? 'bg-green-100' : 'bg-red-100'}`}>
                                        <Text className={`text-xs font-semibold ${cliente.estado === 'activo' ? 'text-green-700' : 'text-red-700'}`}>
                                            {cliente.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                        </Text>
                                    </View>
                                </View>

                                <View className="gap-2">
                                    <View className="flex-row items-center gap-2">
                                        <Ionicons name="call-outline" size={16} color="#64748b" />
                                        <Text className="text-sm text-gray-600">{cliente.telefono || '--'}</Text>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                        <Ionicons name="location-outline" size={16} color="#64748b" />
                                        <Text className="text-sm text-gray-600">{cliente.direccion || '--'}</Text>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                        <Ionicons name="pricetag-outline" size={16} color="#64748b" />
                                        <Text className="text-sm text-gray-600">{cliente.tipo_cliente}</Text>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                        <Ionicons name="cash-outline" size={16} color="#64748b" />
                                        <Text className="text-sm font-semibold text-gray-700">
                                            Total compras: {formatPY(cliente.total_compras || 0)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View className="mb-4">
                        {filteredClientes.map((cliente, idx) => (
                            <View
                                key={cliente.idcliente}
                                className={`bg-white border-b border-gray-200 p-3 ${idx === 0 ? 'border-t rounded-t-xl' : ''} ${idx === filteredClientes.length - 1 ? 'rounded-b-xl' : ''}`}
                            >
                                <Text className="text-sm font-bold text-gray-800">{cliente.nombre} {cliente.apellido}</Text>
                                <View className="flex-row items-center justify-between mt-1">
                                    <Text className="text-xs text-gray-500">{cliente.numDocumento}</Text>
                                    <Text className="text-xs font-semibold text-gray-700">{formatPY(cliente.total_compras || 0)}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Sin resultados */}
                {filteredClientes.length === 0 && (
                    <View className="py-8 items-center">
                        <Ionicons name="search-outline" size={48} color="#94a3b8" />
                        <Text className="text-gray-500 mt-2">No se encontraron clientes</Text>
                    </View>
                )}

                {/* Botón de descarga PDF */}
                <View className="pt-4 pb-6">
                    <Pressable
                        onPress={handleDownloadPDF}
                        disabled={loadingPDF}
                        className="active:opacity-70"
                    >
                        <View

                            className=" py-3.5 flex-row items-center justify-center gap-2 bg-blue-600 rounded-xl"
                        >
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
