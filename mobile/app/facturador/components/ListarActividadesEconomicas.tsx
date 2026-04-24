import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ModalsCrearActividadesEconomicas from './ModalsActivEcon/ModalsCrearActividadesEconomicas';
import ModalsEditarActividadesEconomicas from './ModalsActivEcon/ModalsEditarActividadesEconomicas';
import { fetchActividadesEconomicas, deleteActividadEconomica } from '../../../services/facturador';

interface ListarActividadesEconomicasProps {
    onSelect?: (selectedActivities: any[]) => void;
}

export default function ListarActividadesEconomicas({ onSelect }: ListarActividadesEconomicasProps) {
    const [actividades, setActividades] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const [modalCrearActividadOpen, setModalCrearActividadOpen] = useState(false);
    const [modalEditarActividadOpen, setModalEditarActividadOpen] = useState(false);
    const [idActividadEditar, setIdActividadEditar] = useState<number | string>('');

    const [selectedActivities, setSelectedActivities] = useState<any[]>([]);

    const fetchActividades = async () => {
        try {
            setLoading(true);
            const res = await fetchActividadesEconomicas(page, limit, search);
            setActividades(res.data.data);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Error al obtener actividades económicas:', error);
            Alert.alert('Error', 'No se pudieron cargar las actividades económicas');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, descripcion: string) => {
        Alert.alert(
            'Confirmar eliminación',
            `¿Estás seguro de eliminar la actividad "${descripcion}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteActividadEconomica(id);
                            Alert.alert('Éxito', 'Actividad eliminada correctamente');
                            fetchActividades();
                        } catch (error) {
                            console.error('Error al eliminar actividad:', error);
                            Alert.alert('Error', 'No se pudo eliminar la actividad económica');
                        }
                    },
                },
            ]
        );
    };

    const handleEdit = (id: number) => {
        setIdActividadEditar(id);
        setModalEditarActividadOpen(true);
    };

    useEffect(() => {
        fetchActividades();
    }, [page, limit, search]);

    useEffect(() => {
        if (onSelect) {
            onSelect(selectedActivities);
        }
    }, [selectedActivities, onSelect]);

    const toggleSelect = (actividad: any) => {
        if (selectedActivities.some(a => a.idactividad === actividad.idactividad)) {
            setSelectedActivities(prev => prev.filter(a => a.idactividad !== actividad.idactividad));
        } else {
            setSelectedActivities(prev => [...prev, actividad]);
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
                                <Ionicons name="briefcase" size={24} color="#fff" />
                            </View>
                            <Text className="text-2xl font-bold text-white">Actividades Económicas</Text>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View className="relative">
                        <TextInput
                            placeholder="Buscar por descripción..."
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

                {/* Botón Crear Actividad */}
                <View className="px-5 mt-4 gap-3">
                    <Pressable
                        onPress={() => setModalCrearActividadOpen(true)}
                        className="active:opacity-80"
                    >
                        <LinearGradient
                            colors={['#10b981', '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="rounded-xl p-4 flex-row items-center justify-center gap-2 shadow-lg"
                        >
                            <Ionicons name="add-circle" size={22} color="#fff" />
                            <Text className="text-white font-bold text-base">Crear Actividad Económica</Text>
                        </LinearGradient>
                    </Pressable>
                </View>

                {/* Lista de Actividades */}
                <View className="px-5 mt-4">
                    {loading ? (
                        <View className="py-20 items-center justify-center">
                            <ActivityIndicator size="large" color="#3b82f6" />
                            <Text className="text-gray-500 mt-4">Cargando actividades...</Text>
                        </View>
                    ) : actividades.length === 0 ? (
                        <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
                            <Ionicons name="briefcase-outline" size={64} color="#cbd5e1" />
                            <Text className="text-gray-500 mt-4 text-center">
                                {search ? 'No se encontraron actividades' : 'No hay actividades económicas registradas'}
                            </Text>
                        </View>
                    ) : (
                        <View className="gap-3">
                            {actividades.map((actividad: any, idx: number) => (
                                <View
                                    key={actividad.idactividad}
                                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                                >
                                    {/* Info de la actividad */}
                                    <View className="flex-row items-start justify-between mb-3">
                                        <View className="flex-1 flex-row items-center gap-3">
                                            {onSelect && (
                                                <Pressable
                                                    onPress={() => toggleSelect(actividad)}
                                                    className="active:opacity-70"
                                                >
                                                    <View className={`h-6 w-6 rounded border-2 items-center justify-center ${selectedActivities.some(a => a.idactividad === actividad.idactividad) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                                                        {selectedActivities.some(a => a.idactividad === actividad.idactividad) && (
                                                            <Ionicons name="checkmark" size={16} color="#fff" />
                                                        )}
                                                    </View>
                                                </Pressable>
                                            )}
                                            <View className="flex-1">
                                                <View className="flex-row items-center gap-2 mb-1">
                                                    <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                        <Text className="text-blue-600 font-bold text-xs">
                                                            {(page - 1) * limit + idx + 1}
                                                        </Text>
                                                    </View>
                                                    <Text className="text-gray-900 font-bold text-base flex-1" numberOfLines={2}>
                                                        {actividad.descripcion}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Botones de acción */}
                                    <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
                                        <Pressable
                                            onPress={() => handleEdit(actividad.idactividad)}
                                            className="flex-1 active:opacity-70"
                                        >
                                            <View className="bg-amber-500 rounded-lg py-2.5 flex-row items-center justify-center gap-1.5">
                                                <Ionicons name="create" size={16} color="#fff" />
                                                <Text className="text-white font-semibold text-xs">Editar</Text>
                                            </View>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => handleDelete(actividad.idactividad, actividad.descripcion)}
                                            className="active:opacity-70"
                                        >
                                            <View className="bg-red-500 rounded-lg py-2.5 px-3 flex-row items-center justify-center">
                                                <Ionicons name="trash" size={16} color="#fff" />
                                            </View>
                                        </Pressable>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Paginación */}
                    {!loading && actividades.length > 0 && (
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
            <ModalsCrearActividadesEconomicas
                isOpen={modalCrearActividadOpen}
                onClose={() => setModalCrearActividadOpen(false)}
                onSuccess={fetchActividades}
            />
            <ModalsEditarActividadesEconomicas
                isOpen={modalEditarActividadOpen}
                onClose={() => setModalEditarActividadOpen(false)}
                id={idActividadEditar}
                onSuccess={fetchActividades}
            />
        </View>
    );
}
