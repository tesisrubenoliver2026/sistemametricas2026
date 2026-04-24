import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ModalCrearUsuario from './Modals/ModalCrearUsuario';
import ModalEditarUsuario from './Modals/ModalEditarUsuario';
import { getUsuariosPaginated, deleteUsuario } from '../../services/usuarios';

export default function ListarUsuarios() {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const [modalEditarOpen, setModalEditarOpen] = useState(false);
    const [modalCrearOpen, setModalCrearOpen] = useState(false);
    const [idusuario, setIdUsuario] = useState<number>(0);

    const fetchUsuarios = async () => {
        try {
            setLoading(true);
            const res = await getUsuariosPaginated({ page, limit, search });
            setUsuarios(res.data.data ?? []);
            setTotalPages(res.data.totalPages ?? 1);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            Alert.alert('Error', 'No se pudieron cargar los usuarios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, [page, limit, search]);

    const handleDelete = (id: number, login: string) => {
        Alert.alert(
            'Confirmar eliminación',
            `¿Estás seguro de eliminar al usuario "${login}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteUsuario(id);
                            Alert.alert('Éxito', 'Usuario eliminado correctamente');
                            fetchUsuarios();
                        } catch (err) {
                            console.error(err);
                            Alert.alert('Error', 'No se pudo eliminar el usuario');
                        }
                    },
                },
            ]
        );
    };

    const handleEdit = (id: number) => {
        setIdUsuario(id);
        setModalEditarOpen(true);
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
                    colors={['#6366f1', '#4f46e5']}
                    className="px-5 pt-6 pb-8 rounded-b-3xl shadow-lg"
                >
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-3">
                            <View className="h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                                <Ionicons name="people" size={24} color="#fff" />
                            </View>
                            <Text className="text-2xl font-bold text-white">Usuarios</Text>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View className="relative">
                        <TextInput
                            placeholder="Buscar por login, nombre, apellido..."
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

                {/* Botón Crear Usuario */}
                <View className="px-5 mt-4 gap-3">
                    <Pressable
                        onPress={() => setModalCrearOpen(true)}
                        className="active:opacity-80"
                    >
                        <LinearGradient
                            colors={['#6366f1', '#4f46e5']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="rounded-xl p-4 flex-row items-center justify-center gap-2 shadow-lg"
                        >
                            <Ionicons name="add-circle" size={22} color="#fff" />
                            <Text className="text-white font-bold text-base">Crear Usuario</Text>
                        </LinearGradient>
                    </Pressable>
                </View>

                {/* Lista de Usuarios */}
                <View className="px-5 mt-4">
                    {loading ? (
                        <View className="py-20 items-center justify-center">
                            <ActivityIndicator size="large" color="#6366f1" />
                            <Text className="text-gray-500 mt-4">Cargando usuarios...</Text>
                        </View>
                    ) : usuarios.length === 0 ? (
                        <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
                            <Ionicons name="people-outline" size={64} color="#cbd5e1" />
                            <Text className="text-gray-500 mt-4 text-center">
                                {search ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                            </Text>
                        </View>
                    ) : (
                        <View className="gap-3">
                            {usuarios.map((user: any, idx: number) => (
                                <View
                                    key={user.idusuarios}
                                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                                >
                                    {/* Info del usuario */}
                                    <View className="flex-row items-start justify-between mb-3">
                                        <View className="flex-1">
                                            <View className="flex-row items-center gap-2 mb-2">
                                                <View className="h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                                                    <Text className="text-indigo-600 font-bold text-xs">
                                                        {(page - 1) * limit + idx + 1}
                                                    </Text>
                                                </View>
                                                <Text className="text-gray-900 font-bold text-base flex-1" numberOfLines={1}>
                                                    {user.nombre} {user.apellido}
                                                </Text>
                                                <View className={`px-2 py-1 rounded-full ${user.estado === 'activo' ? 'bg-green-100' : 'bg-red-100'}`}>
                                                    <Text className={`text-xs font-semibold ${user.estado === 'activo' ? 'text-green-700' : 'text-red-700'}`}>
                                                        {user.estado}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View className="gap-1.5 ml-10">
                                                <View className="flex-row items-center gap-2">
                                                    <Ionicons name="person-outline" size={16} color="#64748b" />
                                                    <Text className="text-gray-600 text-sm">Login: {user.login}</Text>
                                                </View>
                                                <View className="flex-row items-center gap-2">
                                                    <Ionicons name="shield-checkmark-outline" size={16} color="#64748b" />
                                                    <Text className="text-gray-600 text-sm">Rol: {user.acceso}</Text>
                                                </View>
                                                {user.telefono && (
                                                    <View className="flex-row items-center gap-2">
                                                        <Ionicons name="call-outline" size={16} color="#64748b" />
                                                        <Text className="text-gray-600 text-sm">{user.telefono}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>

                                    {/* Botones de acción */}
                                    <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
                                        <Pressable
                                            onPress={() => handleEdit(user.idusuarios)}
                                            className="flex-1 active:opacity-70"
                                        >
                                            <View className="bg-amber-500 rounded-lg py-2.5 flex-row items-center justify-center gap-1.5">
                                                <Ionicons name="create" size={16} color="#fff" />
                                                <Text className="text-white font-semibold text-xs">Editar</Text>
                                            </View>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => handleDelete(user.idusuarios, user.login)}
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
                    {!loading && usuarios.length > 0 && (
                        <View className="mt-6 mb-4">
                            <View className="flex-row items-center justify-between mb-3">
                                <Pressable
                                    onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={page === 1}
                                    className="flex-1 mr-2"
                                >
                                    <View className={`rounded-xl py-3 flex-row items-center justify-center gap-2 ${page === 1 ? 'bg-gray-200' : 'bg-indigo-500'}`}>
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
                                    <View className={`rounded-xl py-3 flex-row items-center justify-center gap-2 ${page >= totalPages ? 'bg-gray-200' : 'bg-indigo-500'}`}>
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
            <ModalCrearUsuario
                isOpen={modalCrearOpen}
                onClose={() => setModalCrearOpen(false)}
                onSuccess={fetchUsuarios}
            />
            <ModalEditarUsuario
                isOpen={modalEditarOpen}
                onClose={() => setModalEditarOpen(false)}
                id={idusuario}
                onSuccess={fetchUsuarios}
            />
        </View>
    );
}
