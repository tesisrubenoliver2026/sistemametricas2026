import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ModalsCrearFacturador from './ModalsFacturador/ModalCrearFacturador';
import ModalEditarFacturador from './ModalsFacturador/ModalEditarFacturador';
import ModalReporteFacturadores from './ModalsFacturador/ModalReporteFacturadores';
import { fetchAllFacturadores, culminarFacturador, getReportListFacturador } from '../../../services/facturador';

interface ListarFacturadoresProps {
    onSelect?: (facturador: any) => void;
}

interface Facturador {
    idfacturador: number;
    nombre_fantasia: string;
    titular: string;
    ruc: string;
    timbrado_nro: string;
    actividades_economicas: any[];
    culminado: number;
}

export default function ListarFacturadores({ onSelect }: ListarFacturadoresProps) {
    const [facturadores, setFacturadores] = useState<Facturador[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [modalCrearFacturadorOpen, setModalCrearFacturadorOpen] = useState(false);
    const [modalEditarFacturadorOpen, setModalEditarFacturadorOpen] = useState(false);
    const [modalReporteOpen, setModalReporteOpen] = useState(false);
    const [idFacturador, setIdFacturador] = useState<number | string>('');
    const [datosReporte, setDatosReporte] = useState<any>(null);
    const [loadingReporte, setLoadingReporte] = useState(false);

    const fetchFacturadores = async () => {
        try {
            setLoading(true);
            const res = await fetchAllFacturadores(page, limit, search);
            setFacturadores(res.data.data);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Error al obtener facturadores:', error);
            Alert.alert('Error', 'No se pudieron cargar los facturadores');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: number) => {
        setIdFacturador(id);
        setModalEditarFacturadorOpen(true);
    };

    useEffect(() => {
        fetchFacturadores();
    }, [page, limit, search]);

    const handleCulminar = async (id: number, nombre: string) => {
        Alert.alert(
            'Confirmar culminación',
            `¿Estás seguro de que deseas culminar el facturador "${nombre}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Culminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await culminarFacturador(id);
                            Alert.alert('Éxito', 'Facturador culminado correctamente');
                            fetchFacturadores();
                        } catch (error) {
                            console.error('Error al culminar facturador:', error);
                            Alert.alert('Error', 'No se pudo culminar el facturador');
                        }
                    },
                },
            ]
        );
    };

    const handleGenerateReporteList = async () => {
        try {
            setLoadingReporte(true);
            const res = await getReportListFacturador(search, '');

            // Transformar la respuesta al formato esperado
            const facturadores = res.data.data || res.data;
            const estadisticas = res.data.estadisticas || {};

            // Calcular estadísticas
            const totalFacturadores = estadisticas.total_facturadores || facturadores.length;
            const facturadoresActivos = estadisticas.facturadores_activos || facturadores.filter((f: any) => f.culminado === 'Activo').length;
            const facturadoresCulminados = estadisticas.facturadores_culminados || facturadores.filter((f: any) => f.culminado === 'Culminado').length;

            // Crear estructura de datos esperada
            const reporteFormateado = {
                titulo: 'Reporte de Facturadores',
                total_facturadores: totalFacturadores,
                facturadores_activos: facturadoresActivos,
                facturadores_culminados: facturadoresCulminados,
                total_ventas_general: estadisticas.total_ventas_general || 0,
                monto_total_facturado: estadisticas.monto_total_facturado || '0',
                ganancia_total: estadisticas.ganancia_total || '0',
                facturas_utilizadas_total: estadisticas.facturas_utilizadas_total || 0,
                facturas_disponibles_total: estadisticas.facturas_disponibles_total || 0,
                facturadores: facturadores
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
                                <Ionicons name="receipt" size={24} color="#fff" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-2xl font-bold text-white">Facturadores</Text>
                                <Text className="text-sm text-blue-100">Datos de Facturación Legal</Text>
                            </View>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View className="relative">
                        <TextInput
                            placeholder="Buscar por nombre, titular, teléfono o RUC..."
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

                {/* Botones Crear Facturador y Reporte */}
                <View className="px-5 mt-4 gap-3">
                    <Pressable
                        onPress={() => setModalCrearFacturadorOpen(true)}
                        className="active:opacity-80"
                    >
                        <LinearGradient
                            colors={['#10b981', '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="rounded-xl p-4 flex-row items-center justify-center gap-2 shadow-lg"
                        >
                            <Ionicons name="add-circle" size={22} color="#fff" />
                            <Text className="text-white font-bold text-base">Crear Nuevo Facturador</Text>
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

                {/* Lista de Facturadores */}
                <View className="px-5 mt-4">
                    {loading ? (
                        <View className="py-20 items-center justify-center">
                            <ActivityIndicator size="large" color="#3b82f6" />
                            <Text className="text-gray-500 mt-4">Cargando facturadores...</Text>
                        </View>
                    ) : facturadores.length === 0 ? (
                        <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
                            <Ionicons name="receipt-outline" size={64} color="#cbd5e1" />
                            <Text className="text-gray-500 mt-4 text-center">
                                {search ? 'No se encontraron facturadores' : 'No hay facturadores registrados'}
                            </Text>
                        </View>
                    ) : (
                        <View className="gap-3">
                            {facturadores.map((fact: Facturador, idx: number) => (
                                <View
                                    key={fact.idfacturador}
                                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                                >
                                    {/* Info del facturador */}
                                    <View className="flex-row items-start justify-between mb-3">
                                        <View className="flex-1">
                                            <View className="flex-row items-center gap-2 mb-1">
                                                <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                    <Text className="text-blue-600 font-bold text-xs">
                                                        {(page - 1) * limit + idx + 1}
                                                    </Text>
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>
                                                        {fact.nombre_fantasia}
                                                    </Text>
                                                    <View className={`self-start px-2 py-0.5 rounded-full mt-1 ${fact.culminado === 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                        <Text className={`text-xs font-semibold ${fact.culminado === 0 ? 'text-green-700' : 'text-gray-700'}`}>
                                                            {fact.culminado === 0 ? 'HABILITADO' : 'CULMINADO'}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            <View className="gap-1.5 mt-2">
                                                <View className="flex-row items-center gap-2">
                                                    <Ionicons name="person-outline" size={16} color="#64748b" />
                                                    <Text className="text-gray-600 text-sm">Titular: {fact.titular}</Text>
                                                </View>
                                                <View className="flex-row items-center gap-2">
                                                    <Ionicons name="document-text-outline" size={16} color="#64748b" />
                                                    <Text className="text-gray-600 text-sm">RUC: {fact.ruc}</Text>
                                                </View>
                                                <View className="flex-row items-center gap-2">
                                                    <Ionicons name="barcode-outline" size={16} color="#64748b" />
                                                    <Text className="text-gray-600 text-sm">Timbrado: {fact.timbrado_nro}</Text>
                                                </View>
                                                <View className="flex-row items-center gap-2">
                                                    <Ionicons name="briefcase-outline" size={16} color="#64748b" />
                                                    <Text className="text-gray-600 text-sm" numberOfLines={2}>
                                                        {fact.actividades_economicas.length > 0
                                                            ? fact.actividades_economicas.map((a: any) => a.descripcion).join(', ')
                                                            : 'Sin actividades'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Botones de acción */}
                                    <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
                                        {onSelect ? (
                                            <Pressable
                                                onPress={() => onSelect(fact)}
                                                className="flex-1 active:opacity-70"
                                            >
                                                <View className="bg-blue-500 rounded-lg py-2.5 flex-row items-center justify-center gap-1.5">
                                                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                                                    <Text className="text-white font-semibold text-xs">Seleccionar</Text>
                                                </View>
                                            </Pressable>
                                        ) : (
                                            <>
                                                <Pressable
                                                    onPress={() => handleEdit(fact.idfacturador)}
                                                    className="flex-1 active:opacity-70"
                                                >
                                                    <View className="bg-amber-500 rounded-lg py-2.5 flex-row items-center justify-center gap-1.5">
                                                        <Ionicons name="create" size={16} color="#fff" />
                                                        <Text className="text-white font-semibold text-xs">Editar</Text>
                                                    </View>
                                                </Pressable>
                                                <Pressable
                                                    onPress={() => handleCulminar(fact.idfacturador, fact.nombre_fantasia)}
                                                    className="active:opacity-70"
                                                >
                                                    <View className="bg-red-500 rounded-lg py-2.5 px-3 flex-row items-center justify-center">
                                                        <Ionicons name="close-circle" size={16} color="#fff" />
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
                    {!loading && facturadores.length > 0 && (
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
            <ModalsCrearFacturador
                isOpen={modalCrearFacturadorOpen}
                onClose={() => setModalCrearFacturadorOpen(false)}
                onSuccess={fetchFacturadores}
            />
            <ModalEditarFacturador
                isOpen={modalEditarFacturadorOpen}
                onClose={() => setModalEditarFacturadorOpen(false)}
                id={idFacturador}
                onSuccess={fetchFacturadores}
            />
            {datosReporte && (
                <ModalReporteFacturadores
                    isOpen={modalReporteOpen}
                    onClose={() => setModalReporteOpen(false)}
                    reporte={datosReporte}
                />
            )}
        </View>
    );
}
