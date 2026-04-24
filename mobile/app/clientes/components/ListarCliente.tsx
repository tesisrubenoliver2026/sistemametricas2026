import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../../lib/axiosConfig';
import ModalCrearCliente from './ModalsCliente/ModalCrearCliente';
import ModalEditarCliente from './ModalsCliente/ModalEditarCliente';
import ModalReporteClientes from './ModalsCliente/ModalReporteClientes';
import { getReportListClient } from '../../../services/cliente';

interface ListarClienteProps {
    onSelect?: (cliente: any) => void;
    isReportGenerated?: boolean;
    onReportGenerated?: (idcliente: number) => void;
}

interface Cliente {
    idcliente: number;
    nombre: string;
    apellido: string;
    numDocumento: string;
    telefono: string;
}

export default function ListarCliente({ onSelect, isReportGenerated, onReportGenerated }: ListarClienteProps) {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [modalCrearClienteOpen, setModalCrearClienteOpen] = useState(false);
    const [modalEditarClienteOpen, setModalEditarClienteOpen] = useState(false);
    const [modalReporteOpen, setModalReporteOpen] = useState(false);
    const [idCliente, setIdCliente] = useState<number | string>('');
    const [datosReporte, setDatosReporte] = useState<any>(null);
    const [loadingReporte, setLoadingReporte] = useState(false);

    const fetchClientes = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/clientes`, {
                params: { page, limit, search },
            });
            setClientes(res.data.data);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            Alert.alert('Error', 'No se pudieron cargar los clientes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, nombre: string) => {
        Alert.alert(
            'Confirmar eliminación',
            `¿Estás seguro de que deseas eliminar a ${nombre}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/clientes/${id}`);
                            Alert.alert('Éxito', 'Cliente eliminado correctamente');
                            fetchClientes();
                        } catch (error) {
                            console.error('Error al eliminar cliente:', error);
                            Alert.alert('Error', 'No se pudo eliminar el cliente');
                        }
                    },
                },
            ]
        );
    };

    useEffect(() => {
        fetchClientes();
    }, [page, limit, search]);

    const handleEdit = (id: number) => {
        setIdCliente(id);
        setModalEditarClienteOpen(true);
    };

    const handleGenerateReport = (idcliente: number) => {
        onReportGenerated && onReportGenerated(idcliente);
    }

    const handleGenerateReporteList = async () => {
        try {
            setLoadingReporte(true);
            const res = await getReportListClient(search || undefined);

            // Transformar la estructura del backend al formato esperado por el componente
            const reporteFormateado = {
                clientes: res.data.data || [],
                estadisticas: {
                    totalClientes: res.data.estadisticas?.total_clientes || 0,
                    activos: res.data.estadisticas?.clientes_activos || 0,
                    inactivos: res.data.estadisticas?.clientes_inactivos || 0,
                    totalCompras: res.data.estadisticas?.monto_total_vendido_raw || 0,
                }
            };

            setDatosReporte(reporteFormateado);
            setModalReporteOpen(true);
        } catch (error) {
            console.error('Error al generar reporte:', error);
            Alert.alert('Error', 'No se pudo generar el reporte');
        } finally {
            setLoadingReporte(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Header */}
                <LinearGradient
                    colors={['#3b82f6', '#2563eb']}
                    className="px-5 pt-6 pb-8 rounded-b-3xl shadow-lg"
                >
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-3">
                            <View className="h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                                <Ionicons name="people" size={24} color="#fff" />
                            </View>
                            <Text className="text-2xl font-bold text-white">Clientes</Text>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View className="relative">
                        <TextInput
                            placeholder="Buscar por nombre, documento, teléfono..."
                            placeholderTextColor="#94a3b8"
                            value={search}
                            onChangeText={(text) => {
                                setSearch(text);
                                setPage(1);
                            }}
                            className="bg-white rounded-xl px-12 py-3 text-gray-800"
                        />
                        <View className="absolute left-4 top-3.5">
                            <Ionicons name="search" size={20} color="#64748b" />
                        </View>
                        {search.length > 0 && (
                            <Pressable
                                onPress={() => setSearch('')}
                                className="absolute right-4 top-3.5"
                            >
                                <Ionicons name="close-circle" size={20} color="#64748b" />
                            </Pressable>
                        )}
                    </View>
                </LinearGradient>

                {/* Botones Crear Cliente y Reporte */}
                <View className="px-5 mt-4 gap-3">
                    <Pressable
                        onPress={() => setModalCrearClienteOpen(true)}
                        className="active:opacity-80"
                    >
                        <LinearGradient
                            colors={['#10b981', '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="rounded-xl p-4 flex-row items-center justify-center gap-2 shadow-lg"
                        >
                            <Ionicons name="add-circle" size={22} color="#fff" />
                            <Text className="text-white font-bold text-base">Crear Nuevo Cliente</Text>
                        </LinearGradient>
                    </Pressable>

                    <Pressable
                        onPress={handleGenerateReporteList}
                        disabled={loadingReporte}
                        className="active:opacity-80"
                    >
                        <LinearGradient
                            colors={loadingReporte ? ['#94a3b8', '#64748b'] : ['#9333ea', '#7e22ce']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="rounded-xl p-4 flex-row items-center justify-center gap-2 shadow-lg"
                        >
                            {loadingReporte ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Ionicons name="document-text" size={22} color="#fff" />
                            )}
                            <Text className="text-white font-bold text-base">
                                {loadingReporte ? 'Generando...' : 'Generar Reporte'}
                            </Text>
                        </LinearGradient>
                    </Pressable>
                </View>

                {/* Lista de Clientes */}
                <View className="px-5 mt-4">
                    {loading ? (
                        <View className="py-20 items-center justify-center">
                            <ActivityIndicator size="large" color="#3b82f6" />
                            <Text className="text-gray-500 mt-4">Cargando clientes...</Text>
                        </View>
                    ) : clientes.length === 0 ? (
                        <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
                            <Ionicons name="people-outline" size={64} color="#cbd5e1" />
                            <Text className="text-gray-500 mt-4 text-center">
                                {search ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                            </Text>
                        </View>
                    ) : (
                        <View className="gap-3">
                            {clientes.map((cliente: Cliente, idx: number) => (
                                <View
                                    key={cliente.idcliente}
                                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                                >
                                    {/* Info del cliente */}
                                    <View className="flex-row items-start justify-between mb-3">
                                        <View className="flex-1">
                                            <View className="flex-row items-center gap-2 mb-1">
                                                <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                    <Text className="text-blue-600 font-bold text-xs">
                                                        {(page - 1) * limit + idx + 1}
                                                    </Text>
                                                </View>
                                                <Text className="text-gray-900 font-bold text-base flex-1" numberOfLines={1}>
                                                    {cliente.nombre} {cliente.apellido}
                                                </Text>
                                            </View>

                                            <View className="gap-1.5 mt-2">
                                                <View className="flex-row items-center gap-2">
                                                    <Ionicons name="card-outline" size={16} color="#64748b" />
                                                    <Text className="text-gray-600 text-sm">{cliente.numDocumento}</Text>
                                                </View>
                                                <View className="flex-row items-center gap-2">
                                                    <Ionicons name="call-outline" size={16} color="#64748b" />
                                                    <Text className="text-gray-600 text-sm">{cliente.telefono}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Botones de acción */}
                                    <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
                                        {isReportGenerated ? (
                                            <Pressable
                                                onPress={() => handleGenerateReport(cliente.idcliente)}
                                                className="flex-1 active:opacity-70"
                                            >
                                                <LinearGradient
                                                    colors={['#10b981', '#059669']}
                                                    className="rounded-lg py-2.5 flex-row items-center justify-center gap-1.5"
                                                >
                                                    <Ionicons name="document-text" size={16} color="#fff" />
                                                    <Text className="text-white font-semibold text-xs">Generar Reporte</Text>
                                                </LinearGradient>
                                            </Pressable>
                                        ) : (
                                            <>
                                                {onSelect && (
                                                    <Pressable
                                                        onPress={() => onSelect(cliente)}
                                                        className="flex-1 active:opacity-70"
                                                    >
                                                        <View className="bg-blue-500 rounded-lg py-2.5 flex-row items-center justify-center gap-1.5">
                                                            <Ionicons name="checkmark-circle" size={16} color="#fff" />
                                                            <Text className="text-white font-semibold text-xs">Seleccionar</Text>
                                                        </View>
                                                    </Pressable>
                                                )}
                                                <Pressable
                                                    onPress={() => handleEdit(cliente.idcliente)}
                                                    className="flex-1 active:opacity-70"
                                                >
                                                    <View className="bg-amber-500 rounded-lg py-2.5 flex-row items-center justify-center gap-1.5">
                                                        <Ionicons name="create" size={16} color="#fff" />
                                                        <Text className="text-white font-semibold text-xs">Editar</Text>
                                                    </View>
                                                </Pressable>
                                                <Pressable
                                                    onPress={() => handleDelete(cliente.idcliente, cliente.nombre)}
                                                    className="active:opacity-70"
                                                >
                                                    <View className="bg-red-500 rounded-lg py-2.5 px-3 flex-row items-center justify-center">
                                                        <Ionicons name="trash" size={16} color="#fff" />
                                                    </View>
                                                </Pressable>
                                            </>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Paginación */}
                    {!loading && clientes.length > 0 && (
                        <View className="mt-6 mb-4">
                            <View className="flex-row items-center justify-between mb-3">
                                <Pressable
                                    onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={page === 1}
                                    className="flex-1 mr-2"
                                >
                                    <View className={`rounded-xl py-3 flex-row items-center justify-center gap-2 ${page === 1 ? 'bg-gray-200' : 'bg-blue-500'}`}>
                                        <Ionicons name="chevron-back" size={18} color={page === 1 ? '#9ca3af' : '#fff'} />
                                        <Text className={`font-semibold ${page === 1 ? 'text-gray-400' : 'text-white'}`}>Anterior</Text>
                                    </View>
                                </Pressable>

                                <View className="px-4">
                                    <Text className="text-gray-600 font-medium text-center">
                                        Página {page} de {totalPages}
                                    </Text>
                                </View>

                                <Pressable
                                    onPress={() => setPage((prev) => prev + 1)}
                                    disabled={page >= totalPages}
                                    className="flex-1 ml-2"
                                >
                                    <View className={`rounded-xl py-3 flex-row items-center justify-center gap-2 ${page >= totalPages ? 'bg-gray-200' : 'bg-blue-500'}`}>
                                        <Text className={`font-semibold ${page >= totalPages ? 'text-gray-400' : 'text-white'}`}>Siguiente</Text>
                                        <Ionicons name="chevron-forward" size={18} color={page >= totalPages ? '#9ca3af' : '#fff'} />
                                    </View>
                                </Pressable>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Modales */}
            <ModalCrearCliente
                isOpen={modalCrearClienteOpen}
                onClose={() => setModalCrearClienteOpen(false)}
                onSuccess={fetchClientes}
            />
            <ModalEditarCliente
                isOpen={modalEditarClienteOpen}
                onClose={() => setModalEditarClienteOpen(false)}
                id={idCliente}
                onSuccess={fetchClientes}
            />
            {datosReporte && (
                <ModalReporteClientes
                    isOpen={modalReporteOpen}
                    onClose={() => setModalReporteOpen(false)}
                    reporte={datosReporte}
                />
            )}
        </View>
    );
}
