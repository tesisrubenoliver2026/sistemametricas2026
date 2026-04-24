import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ModalCrearCategoria from './ModalsCategorias/ModalCrearCategoria';
import ModalEditarCategoria from './ModalsCategorias/ModalEditarCategoria';
import { deleteCategoria, getCategoriasPaginated } from '../../../services/categoria';

interface ListarCategoriasProps {
    onSelect?: (categoria: any) => void;
}

interface Categoria {
    idcategorias: number;
    categoria: string;
}

export default function ListarCategorias({ onSelect }: ListarCategoriasProps) {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [modalCrearCategoriaOpen, setModalCrearCategoriaOpen] = useState(false);
    const [modalEditarCategoriaOpen, setModalEditarCategoriaOpen] = useState(false);
    const [idCategoria, setIdCategoria] = useState<number | string>('');

    const fetchCategorias = async () => {
        try {
            setLoading(true);
            const res = await getCategoriasPaginated({ page, limit, search });
            setCategorias(res.data.data);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            Alert.alert('Error', 'No se pudieron cargar las categorías');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, nombre: string) => {
        Alert.alert(
            'Confirmar eliminación',
            `¿Estás seguro de que deseas eliminar la categoría "${nombre}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteCategoria(id);
                            Alert.alert('Éxito', 'Categoría eliminada correctamente');
                            fetchCategorias();
                        } catch (error) {
                            console.error('Error al eliminar categoría:', error);
                            Alert.alert('Error', 'No se pudo eliminar la categoría');
                        }
                    },
                },
            ]
        );
    };

    useEffect(() => {
        fetchCategorias();
    }, [page, limit, search]);

    const handleEdit = (id: number) => {
        setIdCategoria(id);
        setModalEditarCategoriaOpen(true);
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
                                <Ionicons name="pricetags" size={24} color="#fff" />
                            </View>
                            <Text className="text-2xl font-bold text-white">Categorías</Text>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View className="relative">
                        <TextInput
                            placeholder="Buscar por nombre de categoría..."
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

                {/* Botón Crear Categoría */}
                <View className="px-5 mt-4 gap-3">
                    <Pressable
                        onPress={() => setModalCrearCategoriaOpen(true)}
                        className="active:opacity-80"
                    >
                        <LinearGradient
                            colors={['#10b981', '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="rounded-xl p-4 flex-row items-center justify-center gap-2 shadow-lg"
                        >
                            <Ionicons name="add-circle" size={22} color="#fff" />
                            <Text className="text-white font-bold text-base">Crear Nueva Categoría</Text>
                        </LinearGradient>
                    </Pressable>
                </View>

                {/* Lista de Categorías */}
                <View className="px-5 mt-4">
                    {loading ? (
                        <View className="py-20 items-center justify-center">
                            <ActivityIndicator size="large" color="#3b82f6" />
                            <Text className="text-gray-500 mt-4">Cargando categorías...</Text>
                        </View>
                    ) : categorias.length === 0 ? (
                        <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
                            <Ionicons name="pricetags-outline" size={64} color="#cbd5e1" />
                            <Text className="text-gray-500 mt-4 text-center">
                                {search ? 'No se encontraron categorías' : 'No hay categorías registradas'}
                            </Text>
                        </View>
                    ) : (
                        <View className="gap-3">
                            {categorias.map((categoria: Categoria, idx: number) => (
                                <View
                                    key={categoria.idcategorias}
                                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                                >
                                    {/* Info de la categoría */}
                                    <View className="flex-row items-start justify-between mb-3">
                                        <View className="flex-1">
                                            <View className="flex-row items-center gap-2 mb-1">
                                                <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                    <Text className="text-blue-600 font-bold text-xs">
                                                        {(page - 1) * limit + idx + 1}
                                                    </Text>
                                                </View>
                                                <Text className="text-gray-900 font-bold text-base flex-1" numberOfLines={1}>
                                                    {categoria.categoria}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Botones de acción */}
                                    <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
                                        {onSelect ? (
                                            <Pressable
                                                onPress={() => onSelect(categoria)}
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
                                                    onPress={() => handleEdit(categoria.idcategorias)}
                                                    className="flex-1 active:opacity-70"
                                                >
                                                    <View className="bg-amber-500 rounded-lg py-2.5 flex-row items-center justify-center gap-1.5">
                                                        <Ionicons name="create" size={16} color="#fff" />
                                                        <Text className="text-white font-semibold text-xs">Editar</Text>
                                                    </View>
                                                </Pressable>
                                                <Pressable
                                                    onPress={() => handleDelete(categoria.idcategorias, categoria.categoria)}
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
                    {!loading && categorias.length > 0 && (
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
            <ModalCrearCategoria
                isOpen={modalCrearCategoriaOpen}
                onClose={() => setModalCrearCategoriaOpen(false)}
                onSuccess={fetchCategorias}
            />
            <ModalEditarCategoria
                isOpen={modalEditarCategoriaOpen}
                onClose={() => setModalEditarCategoriaOpen(false)}
                id={idCategoria}
                onSuccess={fetchCategorias}
            />
        </View>
    );
}
