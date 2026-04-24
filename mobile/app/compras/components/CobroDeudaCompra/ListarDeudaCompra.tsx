import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DollarSign, Eye, Banknote, Search } from 'lucide-react-native';
import { type ComprobantePago } from 'components/interface';
import ModalCobroDeuda from '../Modals/ModalCobroDeudaCompra';
import ModalComprobantePago from 'components/ModalsVenta/ModalComprobantePago';
import ModalListarDetallesPagosDeuda from '../Modals/ModalListarDetallesPagosDeuda';
import { formatPY } from 'utils/utils';
import { fetchDeudasCompra } from 'services/compras';

const ListarDeudasCompra = () => {
    const [comprobante, setComprobante] = useState<ComprobantePago | undefined>(undefined);
    const [showComprobante, setShowComprobante] = useState(false);
    const [deudas, setDeudas] = useState<any[]>([]);
    const [montoMaximo, setMontoMaximo] = useState(0);
    const [idDeudaDetalle, setIdDeudaDetalle] = useState(0);
    const [showModalDetailPay, setShowModalDetailPay] = useState(false);
    const [showModalCobroDeuda, setShowModalCobroDeuda] = useState(false);
    const [iddeudaSeleccionada, setIddeudaSeleccionada] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchDeudas = async () => {
        setLoading(true);
        try {
            const res = await fetchDeudasCompra(page, limit, search);
            setDeudas(res.data.data);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Error al obtener deudas:', error);
            Alert.alert('Error', 'No se pudieron cargar las deudas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeudas();
    }, [page, limit, search]);

    const handleCobrar = (deuda: any) => {
        setIddeudaSeleccionada(deuda.iddeuda_compra);
        setMontoMaximo(deuda.total_deuda - deuda.total_pagado);
        setShowModalCobroDeuda(true);
    };

    const showPayDetails = (idDeudaDetalle: number) => {
        setIdDeudaDetalle(idDeudaDetalle);
        setShowModalDetailPay(true);
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
                    colors={['#059669', '#047857']}
                    className="px-5 pt-16 pb-8 rounded-b-3xl shadow-lg"
                >
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-3">
                            <View className="h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                                <DollarSign size={24} color="#fff" />
                            </View>
                            <View>
                                <Text className="text-2xl font-bold text-white">Deudas por Compra</Text>
                                <Text className="text-green-100 text-sm mt-0.5">
                                    Gestiona tus cuentas por pagar
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View className="relative mb-3">
                        <TextInput
                            placeholder="Buscar por proveedor o estado..."
                            placeholderTextColor="#94a3b8"
                            value={search}
                            onChangeText={(text) => {
                                setSearch(text);
                                setPage(1);
                            }}
                            className="bg-white rounded-xl px-12 py-3 text-gray-800"
                        />
                        <View className="absolute left-4 top-3.5">
                            <Search size={20} color="#64748b" />
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

                    {/* Resumen rápido */}
                    <View className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-white text-xs font-medium">Total de deudas:</Text>
                            <Text className="text-white text-sm font-bold">{deudas.length}</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Lista de Deudas */}
                <View className="px-5 mt-4">
                    {loading ? (
                        <View className="py-20 items-center justify-center">
                            <ActivityIndicator size="large" color="#059669" />
                            <Text className="text-gray-500 mt-4">Cargando deudas...</Text>
                        </View>
                    ) : deudas.length === 0 ? (
                        <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
                            <View className="bg-gray-100 p-4 rounded-full mb-4">
                                <DollarSign size={64} color="#cbd5e1" />
                            </View>
                            <Text className="text-gray-500 mt-2 text-center text-base">
                                {search ? 'No se encontraron deudas' : 'No hay deudas registradas'}
                            </Text>
                            {search && (
                                <Text className="text-gray-400 text-center text-sm mt-2">
                                    Intenta con otro término de búsqueda
                                </Text>
                            )}
                        </View>
                    ) : (
                        <View className="gap-3">
                            {deudas.map((deuda: any, idx: number) => (
                                <View
                                    key={deuda.iddeuda_compra}
                                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                                >
                                    {/* Header con número y estado */}
                                    <View className="flex-row items-start justify-between mb-3">
                                        <View className="flex-1">
                                            <View className="flex-row items-center gap-2 mb-1">
                                                <View className="h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                                    <Text className="text-green-600 font-bold text-xs">
                                                        {(page - 1) * limit + idx + 1}
                                                    </Text>
                                                </View>
                                                <Text className="text-gray-900 font-bold text-base flex-1" numberOfLines={1}>
                                                    {deuda.nombre}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className={`px-3 py-1 rounded-full ${
                                            deuda.estado === 'pendiente' ? 'bg-red-100' : 'bg-green-100'
                                        }`}>
                                            <Text className={`text-xs font-medium ${
                                                deuda.estado === 'pendiente' ? 'text-red-800' : 'text-green-800'
                                            }`}>
                                                {deuda.estado.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Información financiera */}
                                    <View className="gap-2 mt-3">
                                        <View className="flex-row justify-between items-center">
                                            <View className="flex-row items-center gap-2">
                                                <Ionicons name="card-outline" size={16} color="#64748b" />
                                                <Text className="text-gray-600 text-sm">Total Deuda:</Text>
                                            </View>
                                            <Text className="text-gray-900 font-semibold">₲ {formatPY(deuda.total_deuda)}</Text>
                                        </View>
                                        <View className="flex-row justify-between items-center">
                                            <View className="flex-row items-center gap-2">
                                                <Ionicons name="checkmark-circle-outline" size={16} color="#64748b" />
                                                <Text className="text-gray-600 text-sm">Total Pagado:</Text>
                                            </View>
                                            <Text className="text-green-600 font-semibold">₲ {formatPY(deuda.total_pagado)}</Text>
                                        </View>
                                        <View className="flex-row justify-between items-center">
                                            <View className="flex-row items-center gap-2">
                                                <Ionicons name="alert-circle-outline" size={16} color="#64748b" />
                                                <Text className="text-gray-600 text-sm">Saldo:</Text>
                                            </View>
                                            <Text className="text-red-600 font-bold">₲ {formatPY(deuda.saldo)}</Text>
                                        </View>
                                        <View className="flex-row justify-between items-center">
                                            <View className="flex-row items-center gap-2">
                                                <Ionicons name="calendar-outline" size={16} color="#64748b" />
                                                <Text className="text-gray-600 text-sm">Fecha:</Text>
                                            </View>
                                            <Text className="text-gray-700 text-sm">
                                                {new Date(deuda.fecha_deuda).toLocaleDateString('es-PY')}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Botones de acción */}
                                    <View className="flex-row gap-2 mt-4 pt-3 border-t border-gray-100">
                                        <Pressable
                                            onPress={() => handleCobrar(deuda)}
                                            className="flex-1 active:opacity-70"
                                        >
                                            <View className="bg-blue-500 rounded-lg py-2.5 flex-row items-center justify-center gap-1.5">
                                                <Banknote size={16} color="#fff" />
                                                <Text className="text-white font-semibold text-xs">Pagar</Text>
                                            </View>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => showPayDetails(deuda.iddeuda_compra)}
                                            className="flex-1 active:opacity-70"
                                        >
                                            <View className="bg-gray-500 rounded-lg py-2.5 flex-row items-center justify-center gap-1.5">
                                                <Eye size={16} color="#fff" />
                                                <Text className="text-white font-semibold text-xs">Ver Pagos</Text>
                                            </View>
                                        </Pressable>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Paginación */}
                    {!loading && deudas.length > 0 && (
                        <View className="mt-6 mb-4">
                            <View className="flex-row items-center justify-between mb-3">
                                <Pressable
                                    onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={page === 1}
                                    className="flex-1 mr-2"
                                >
                                    <View className={`rounded-xl py-3 flex-row items-center justify-center gap-2 ${
                                        page === 1 ? 'bg-gray-200' : 'bg-green-500 active:bg-green-600'
                                    }`}>
                                        <Ionicons name="chevron-back" size={18} color={page === 1 ? '#9ca3af' : '#fff'} />
                                        <Text className={`font-semibold ${page === 1 ? 'text-gray-400' : 'text-white'}`}>
                                            Anterior
                                        </Text>
                                    </View>
                                </Pressable>

                                <View className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                                    <Text className="text-gray-600 font-medium text-center text-sm">
                                        Página <Text className="font-bold text-green-700">{page}</Text> de{' '}
                                        <Text className="font-bold text-green-700">{totalPages}</Text>
                                    </Text>
                                </View>

                                <Pressable
                                    onPress={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={page >= totalPages}
                                    className="flex-1 ml-2"
                                >
                                    <View className={`rounded-xl py-3 flex-row items-center justify-center gap-2 ${
                                        page >= totalPages ? 'bg-gray-200' : 'bg-green-500 active:bg-green-600'
                                    }`}>
                                        <Text className={`font-semibold ${page >= totalPages ? 'text-gray-400' : 'text-white'}`}>
                                            Siguiente
                                        </Text>
                                        <Ionicons name="chevron-forward" size={18} color={page >= totalPages ? '#9ca3af' : '#fff'} />
                                    </View>
                                </Pressable>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Modales */}
            <ModalCobroDeuda
                montoMaximo={montoMaximo}
                isOpen={showModalCobroDeuda}
                setComprobante={setComprobante}
                setShowComprobante={setShowComprobante}
                onClose={() => setShowModalCobroDeuda(false)}
                idDeuda={iddeudaSeleccionada ?? 0}
                onSuccess={() => {
                    fetchDeudas();
                    setShowModalCobroDeuda(false);
                }}
            />
            
            {/* Solo renderizar el modal si hay comprobante */}
            {comprobante && (
                <ModalComprobantePago
                   
                    onClose={() => {
                        setShowComprobante(false);
                        setComprobante(undefined);
                    }}
                    comprobante={comprobante}
                    isProviderPay={true}
                />
            )}
            
            <ModalListarDetallesPagosDeuda
                iddeuda={idDeudaDetalle}
                isOpen={showModalDetailPay}
                onClose={() => {
                    setShowModalDetailPay(false);
                    setIdDeudaDetalle(0);
                }}
                onSuccess={() => {
                    fetchDeudas();
                }}
            />
        </View>
    );
};

export default ListarDeudasCompra;