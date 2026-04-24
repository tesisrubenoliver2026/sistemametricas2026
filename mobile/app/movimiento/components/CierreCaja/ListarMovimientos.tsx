import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ModalResumenCaja from '../ModalMovimiento/CierreCaja/ModalResumenCaja';
import ModalCrearAperturaCaja from '../ModalMovimiento/AperturaCaja/ModalAperturaCaja';
import { getMovimientosCajaPaginated, getCajaAbierta } from '../../../../services/movimiento';
import { formatPY } from '../../../../utils/utils';
import ModalButtonFetch from './ButtonFetchReport';
import ModalError from '../../../../components/ModalError';

interface MovimientoCaja {
    idmovimiento: number;
    idusuarios: number;
    num_caja: string;
    fecha_apertura: string;
    fecha_cierre: string | null;
    monto_apertura: number;
    monto_cierre: number | null;
    credito: number | null;
    gastos: number | null;
    cobrado: number | null;
    contado: number | null;
    ingresos: number | null;
    compras: number | null;
    estado: string;
    login: string;
}

const ListarMovimientoCaja = () => {
    const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [isOpenApertura, setIsOpenApertura] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIdMovimiento, setSelectedIdMovimiento] = useState<number>(0);
    const [limit, setLimit] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [aperturaDesde, setAperturaDesde] = useState<string>('');
    const [aperturaHasta, setAperturaHasta] = useState<string>('');
    const [cierreDesde, setCierreDesde] = useState<string>('');
    const [cierreHasta, setCierreHasta] = useState<string>('');
    const [idMovimiento, setIdMovimiento] = useState(0)
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const fetchMovimientos = async () => {
        try {
            setLoading(true);
            const res = await getMovimientosCajaPaginated({
                page,
                limit,
                search,
                aperturaDesde,
                aperturaHasta,
                cierreDesde,
                cierreHasta,
            });
            setMovimientos(res.data.data);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error('Error al obtener movimientos:', err);
            setErrorMessage('❌ Error al obtener movimientos de caja.');
            setErrorModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovimientos();
    }, [page, limit, search, aperturaDesde, aperturaHasta, cierreDesde, cierreHasta]);

    const handleOpenModal = (idmovimiento: number) => {
        setSelectedIdMovimiento(idmovimiento);
        setIsOpen(true);
    }

    const handleOpenApertura = async () => {
        try {
            const res = await getCajaAbierta();
            if (res.data.abierta === false) { 
                setIsOpenApertura(true) 
            } else { 
                Alert.alert('Información', 'Ya existe una caja abierta');
            }
        } catch (err) {
            Alert.alert('Error', 'No se pudo verificar el estado de la caja');
        }
    };

    const DateFilterInput = ({
        label,
        value,
        onChange
    }: {
        label: string;
        value: string;
        onChange: (value: string) => void;
    }) => (
        <View className="mb-3">
            <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
            <View className="relative">
                <TextInput
                    className="bg-white rounded-xl px-4 py-3 border border-gray-200 text-gray-800"
                    value={value}
                    onChangeText={(text) => { onChange(text); setPage(1); }}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                />
                {value ? (
                    <Pressable
                        onPress={() => { onChange(''); setPage(1); }}
                        className="absolute right-3 top-3"
                    >
                        <Ionicons name="close-circle" size={20} color="#64748b" />
                    </Pressable>
                ) : (
                    <View className="absolute right-3 top-3">
                        <Ionicons name="calendar" size={20} color="#64748b" />
                    </View>
                )}
            </View>
        </View>
    );

    const getEstadoColor = (estado: string) => {
        return estado === 'cerrado' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';
    };

    const getEstadoIcon = (estado: string) => {
        return estado === 'cerrado' ? 'lock-closed' : 'lock-open';
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
                    colors={['#f59e0b', '#d97706']}
                    className="px-5 pt-6 pb-8 rounded-b-3xl shadow-lg"
                >
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-3">
                            <View className="h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                                <Ionicons name="cash" size={24} color="#fff" />
                            </View>
                            <Text className="text-2xl font-bold text-white">Movimientos de Caja</Text>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View className="relative mb-3">
                        <TextInput
                            placeholder="Buscar por número de caja, estado, usuario..."
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

                    {/* Botón Filtros */}
                    <Pressable
                        onPress={() => setShowFilters(!showFilters)}
                        className="bg-white/20 rounded-xl p-3 flex-row items-center justify-center gap-2"
                    >
                        <Ionicons name="filter" size={18} color="#fff" />
                        <Text className="text-white font-semibold">
                            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                        </Text>
                    </Pressable>
                </LinearGradient>

                {/* Filtros */}
                {showFilters && (
                    <View className="px-5 mt-4 bg-white mx-5 rounded-2xl p-4 shadow-sm">
                        <Text className="text-lg font-bold text-gray-800 mb-3">Filtros de Fecha</Text>
                        <View className="gap-3">
                            {[
                                { label: 'Apertura desde', value: aperturaDesde, setter: setAperturaDesde },
                                { label: 'Apertura hasta', value: aperturaHasta, setter: setAperturaHasta },
                                { label: 'Cierre desde', value: cierreDesde, setter: setCierreDesde },
                                { label: 'Cierre hasta', value: cierreHasta, setter: setCierreHasta },
                            ].map(({ label, value, setter }) => (
                                <DateFilterInput
                                    key={label}
                                    label={label}
                                    value={value}
                                    onChange={setter}
                                />
                            ))}
                        </View>
                    </View>
                )}

                {/* Botones de Acción */}
                <View className="px-5 mt-4 gap-3">
                    <Pressable
                        onPress={handleOpenApertura}
                        className="active:opacity-80"
                    >
                        <LinearGradient
                            colors={['#10b981', '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="rounded-xl p-4 flex-row items-center justify-center gap-2 shadow-lg"
                        >
                            <Ionicons name="add-circle" size={22} color="#fff" />
                            <Text className="text-white font-bold text-base">Abrir Caja</Text>
                        </LinearGradient>
                    </Pressable>

                    {/* Selector de límite */}
                    <View className="bg-white rounded-xl p-4 flex-row items-center justify-between">
                        <Text className="text-gray-700 font-medium">Mostrar</Text>
                        <View className="flex-row items-center gap-2">
                            <TextInput
                                className="bg-gray-100 rounded-lg px-3 py-2 text-center text-gray-800 w-16"
                                value={limit.toString()}
                                onChangeText={(text) => {
                                    const newLimit = parseInt(text) || 5;
                                    setLimit(newLimit);
                                    setPage(1);
                                }}
                                keyboardType="numeric"
                            />
                            <Text className="text-gray-600">por página</Text>
                        </View>
                    </View>
                </View>

                {/* Lista de Movimientos */}
                <View className="px-5 mt-4">
                    {loading ? (
                        <View className="py-20 items-center justify-center">
                            <ActivityIndicator size="large" color="#f59e0b" />
                            <Text className="text-gray-500 mt-4">Cargando movimientos...</Text>
                        </View>
                    ) : movimientos.length === 0 ? (
                        <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
                            <Ionicons name="cash-outline" size={64} color="#cbd5e1" />
                            <Text className="text-gray-500 mt-4 text-center">
                                {search ? 'No se encontraron movimientos' : 'No hay movimientos registrados'}
                            </Text>
                        </View>
                    ) : (
                        <View className="gap-3">
                            {movimientos.map((movimiento, idx) => (
                                <View
                                    key={movimiento.idmovimiento}
                                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                                >
                                    {/* Header con número y estado */}
                                    <View className="flex-row items-center justify-between mb-3">
                                        <View className="flex-row items-center gap-2">
                                            <View className="h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                                                <Text className="text-amber-600 font-bold text-xs">
                                                    {(page - 1) * limit + idx + 1}
                                                </Text>
                                            </View>
                                            <Text className="text-gray-900 font-bold text-lg">
                                                Caja {movimiento.num_caja}
                                            </Text>
                                        </View>
                                        <View className={`px-3 py-1 rounded-full ${getEstadoColor(movimiento.estado)}`}>
                                            <Text className="text-xs font-semibold">
                                                {movimiento.estado.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Información del movimiento */}
                                    <View className="gap-2">
                                        <View className="flex-row items-center gap-2">
                                            <Ionicons name="person" size={16} color="#64748b" />
                                            <Text className="text-gray-600 text-sm">{movimiento.login}</Text>
                                        </View>
                                        
                                        <View className="flex-row items-center gap-2">
                                            <Ionicons name="calendar" size={16} color="#64748b" />
                                            <Text className="text-gray-600 text-sm">
                                                Apertura: {new Date(movimiento.fecha_apertura).toLocaleString('es-ES')}
                                            </Text>
                                        </View>

                                        {movimiento.fecha_cierre && (
                                            <View className="flex-row items-center gap-2">
                                                <Ionicons name="calendar" size={16} color="#64748b" />
                                                <Text className="text-gray-600 text-sm">
                                                    Cierre: {new Date(movimiento.fecha_cierre).toLocaleString('es-ES')}
                                                </Text>
                                            </View>
                                        )}

                                        {/* Montos principales */}
                                        <View className="flex-row justify-between mt-2">
                                            <View className="flex-1">
                                                <Text className="text-xs text-gray-500">Apertura</Text>
                                                <Text className="text-sm font-semibold text-gray-800">
                                                    {formatPY(movimiento.monto_apertura)}
                                                </Text>
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-xs text-gray-500">Cierre</Text>
                                                <Text className="text-sm font-semibold text-gray-800">
                                                    {movimiento.monto_cierre ? formatPY(movimiento.monto_cierre) : '--'}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Resumen rápido */}
                                        <View className="flex-row flex-wrap gap-2 mt-2">
                                            <View className="bg-blue-50 px-2 py-1 rounded">
                                                <Text className="text-blue-700 text-xs">Contado: {formatPY(movimiento.contado)}</Text>
                                            </View>
                                            <View className="bg-green-50 px-2 py-1 rounded">
                                                <Text className="text-green-700 text-xs">Crédito: {formatPY(movimiento.credito)}</Text>
                                            </View>
                                            <View className="bg-red-50 px-2 py-1 rounded">
                                                <Text className="text-red-700 text-xs">Gastos: {formatPY(movimiento.gastos)}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Botones de acción */}
                                    <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
                                        <Pressable
                                            onPress={() => handleOpenModal(movimiento.idmovimiento)}
                                            className="flex-1 active:opacity-70"
                                        >
                                            <View className="bg-amber-500 rounded-lg py-2.5 flex-row items-center justify-center gap-1.5">
                                                <Ionicons name="eye" size={16} color="#fff" />
                                                <Text className="text-white font-semibold text-xs">Resumen</Text>
                                            </View>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => { setIdMovimiento(movimiento.idmovimiento) }}
                                            className="flex-1 active:opacity-70"
                                        >
                                            <View className="bg-purple-500 rounded-lg py-2.5 flex-row items-center justify-center gap-1.5">
                                                <Ionicons name="document-text" size={16} color="#fff" />
                                                <Text className="text-white font-semibold text-xs">Reportes</Text>
                                            </View>
                                        </Pressable>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Paginación */}
                    {!loading && movimientos.length > 0 && (
                        <View className="mt-6 mb-4">
                            <View className="flex-row items-center justify-between mb-3">
                                <Pressable
                                    onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={page === 1}
                                    className="flex-1 mr-2"
                                >
                                    <View className={`rounded-xl py-3 flex-row items-center justify-center gap-2 ${page === 1 ? 'bg-gray-200' : 'bg-amber-500'}`}>
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
                                    <View className={`rounded-xl py-3 flex-row items-center justify-center gap-2 ${page >= totalPages ? 'bg-gray-200' : 'bg-amber-500'}`}>
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
            <ModalButtonFetch isOpen={idMovimiento === 0 ? false : true} onClose={() => setIdMovimiento(0)} idMovimiento={idMovimiento} />
            <ModalError
                isOpen={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                message={errorMessage}
            />
            <ModalResumenCaja isOpen={isOpen} idmovimiento={selectedIdMovimiento} onClose={() => { setIsOpen(false) }} onSuccess={fetchMovimientos} />
            <ModalCrearAperturaCaja isOpen={isOpenApertura} onClose={() => setIsOpenApertura(false)} onSuccess={fetchMovimientos} />
        </View>
    );
};

export default ListarMovimientoCaja;