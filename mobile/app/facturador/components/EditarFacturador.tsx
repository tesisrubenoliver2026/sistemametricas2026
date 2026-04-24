import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ModalsListarActividadesEconomicas from './ModalsActivEcon/ModalsListarActividadesEconomicas';
import { getFacturadorById, updateFacturador } from '../../../services/facturador';

interface EditarFacturadorProps {
    id: number | string;
    onSuccess?: () => void;
    onClose?: () => void;
}

const initialFormFacturador = {
    nombre_fantasia: '',
    titular: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    ruc: '',
    timbrado_nro: '',
    fecha_inicio_vigente: '',
    fecha_fin_vigente: '',
    nro_factura_inicial_habilitada: '',
    nro_factura_final_habilitada: '',
};

export default function EditarFacturador({ id, onSuccess, onClose }: EditarFacturadorProps) {
    const [formData, setFormData] = useState(initialFormFacturador);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedActividades, setSelectedActividades] = useState<any[]>([]);
    const [modalListarActividadesOpen, setModalListarActividadesOpen] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchFacturador = async () => {
                try {
                    setLoadingData(true);
                    const res = await getFacturadorById(id);
                    const data = res.data.data;
                    setFormData({
                        ...data,
                        fecha_inicio_vigente: data.fecha_inicio_vigente?.split('T')[0] || '',
                        fecha_fin_vigente: data.fecha_fin_vigente?.split('T')[0] || '',
                    });
                    setSelectedActividades(data.actividades_economicas || []);
                } catch (error) {
                    console.error('Error al cargar datos del facturador', error);
                    Alert.alert('Error', 'No se pudieron cargar los datos del facturador');
                } finally {
                    setLoadingData(false);
                }
            };
            fetchFacturador();
        }
    }, [id]);

    const handleRemoveActividad = (idActividad: number) => {
        setSelectedActividades((prev) => prev.filter((act) => act.idactividad !== idActividad));
    };

    const handleSubmit = async () => {
        if (!formData.nombre_fantasia.trim() || !formData.ruc.trim()) {
            Alert.alert('Error', 'El nombre fantasía y RUC son requeridos');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                actividades_economicas: selectedActividades.map((a) => a.idactividad)
            };

            await updateFacturador(id, payload);
            Alert.alert('Éxito', 'Facturador actualizado correctamente');

            onSuccess && onSuccess();
            onClose && onClose();
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.error || 'No se pudo actualizar el facturador';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <View className="py-20 items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-gray-500 mt-4">Cargando datos...</Text>
            </View>
        );
    }

    return (
        <View>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center gap-3">
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                        <Ionicons name="create" size={22} color="#f59e0b" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-800">Editar Facturador</Text>
                </View>
                <Pressable
                    onPress={onClose}
                    className="h-10 w-10 items-center justify-center rounded-xl bg-gray-200 active:opacity-70"
                >
                    <Ionicons name="close" size={20} color="#64748b" />
                </Pressable>
            </View>

                {/* Form */}
                <View className="gap-4">
                    {/* Nombre Fantasía */}
                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Nombre Fantasía *</Text>
                        <TextInput
                            placeholder="Nombre Fantasía"
                            placeholderTextColor="#94a3b8"
                            value={formData.nombre_fantasia}
                            onChangeText={(text) => setFormData({ ...formData, nombre_fantasia: text })}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800"
                        />
                    </View>

                    {/* Titular */}
                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Titular</Text>
                        <TextInput
                            placeholder="Titular"
                            placeholderTextColor="#94a3b8"
                            value={formData.titular}
                            onChangeText={(text) => setFormData({ ...formData, titular: text })}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800"
                        />
                    </View>

                    {/* Teléfono */}
                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Teléfono</Text>
                        <TextInput
                            placeholder="Teléfono"
                            placeholderTextColor="#94a3b8"
                            value={formData.telefono}
                            onChangeText={(text) => setFormData({ ...formData, telefono: text })}
                            keyboardType="phone-pad"
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800"
                        />
                    </View>

                    {/* Dirección */}
                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Dirección</Text>
                        <TextInput
                            placeholder="Dirección"
                            placeholderTextColor="#94a3b8"
                            value={formData.direccion}
                            onChangeText={(text) => setFormData({ ...formData, direccion: text })}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800"
                        />
                    </View>

                    {/* Ciudad */}
                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Ciudad</Text>
                        <TextInput
                            placeholder="Ciudad"
                            placeholderTextColor="#94a3b8"
                            value={formData.ciudad}
                            onChangeText={(text) => setFormData({ ...formData, ciudad: text })}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800"
                        />
                    </View>

                    {/* RUC */}
                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">RUC *</Text>
                        <TextInput
                            placeholder="RUC"
                            placeholderTextColor="#94a3b8"
                            value={formData.ruc}
                            onChangeText={(text) => setFormData({ ...formData, ruc: text })}
                            keyboardType="numeric"
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800"
                        />
                    </View>

                    {/* Timbrado */}
                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">N° Timbrado</Text>
                        <TextInput
                            placeholder="N° Timbrado"
                            placeholderTextColor="#94a3b8"
                            value={formData.timbrado_nro}
                            onChangeText={(text) => setFormData({ ...formData, timbrado_nro: text })}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800"
                        />
                    </View>

                    {/* Fecha Inicio Vigente */}
                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Fecha Inicio Vigente</Text>
                        <TextInput
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#94a3b8"
                            value={formData.fecha_inicio_vigente}
                            onChangeText={(text) => setFormData({ ...formData, fecha_inicio_vigente: text })}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800"
                        />
                    </View>

                    {/* Fecha Fin Vigente */}
                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Fecha Fin Vigente</Text>
                        <TextInput
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#94a3b8"
                            value={formData.fecha_fin_vigente}
                            onChangeText={(text) => setFormData({ ...formData, fecha_fin_vigente: text })}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800"
                        />
                    </View>

                    {/* Nro Factura Inicial */}
                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Nro Factura Inicial</Text>
                        <TextInput
                            placeholder="Nro Factura Inicial"
                            placeholderTextColor="#94a3b8"
                            value={formData.nro_factura_inicial_habilitada}
                            onChangeText={(text) => setFormData({ ...formData, nro_factura_inicial_habilitada: text })}
                            keyboardType="numeric"
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800"
                        />
                    </View>

                    {/* Nro Factura Final */}
                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Nro Factura Final</Text>
                        <TextInput
                            placeholder="Nro Factura Final"
                            placeholderTextColor="#94a3b8"
                            value={formData.nro_factura_final_habilitada}
                            onChangeText={(text) => setFormData({ ...formData, nro_factura_final_habilitada: text })}
                            keyboardType="numeric"
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800"
                        />
                    </View>

                    {/* Actividades Económicas */}
                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Actividades Económicas</Text>
                        <Pressable
                            onPress={() => setModalListarActividadesOpen(true)}
                            className="active:opacity-70"
                        >
                            <LinearGradient
                                colors={['#10b981', '#059669']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="rounded-xl p-3.5 flex-row items-center justify-center gap-2"
                            >
                                <Ionicons name="add-circle" size={20} color="#fff" />
                                <Text className="text-white font-bold">Seleccionar Actividades</Text>
                            </LinearGradient>
                        </Pressable>

                        {/* Lista de actividades seleccionadas */}
                        {selectedActividades.length > 0 && (
                            <View className="mt-3 gap-2">
                                {selectedActividades.map((act) => (
                                    <View key={act.idactividad} className="bg-blue-50 rounded-lg p-3 flex-row items-center justify-between">
                                        <Text className="text-blue-800 text-sm flex-1">{act.descripcion}</Text>
                                        <Pressable
                                            onPress={() => handleRemoveActividad(act.idactividad)}
                                            className="ml-2 active:opacity-70"
                                        >
                                            <Ionicons name="close-circle" size={20} color="#ef4444" />
                                        </Pressable>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* Botones */}
                <View className="flex-row gap-3 mt-6 mb-4">
                    <Pressable
                        onPress={onClose}
                        className="flex-1 active:opacity-70"
                        disabled={loading}
                    >
                        <View className="bg-gray-200 rounded-xl py-3.5 flex-row items-center justify-center gap-2">
                            <Ionicons name="close-circle" size={20} color="#64748b" />
                            <Text className="text-gray-700 font-bold">Cancelar</Text>
                        </View>
                    </Pressable>

                    <Pressable
                        onPress={handleSubmit}
                        className="flex-1 active:opacity-70"
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={loading ? ['#94a3b8', '#64748b'] : ['#f59e0b', '#d97706']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="rounded-xl py-3.5 flex-row items-center justify-center gap-2"
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Ionicons name="save" size={20} color="#fff" />
                            )}
                            <Text className="text-white font-bold">
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </Text>
                        </LinearGradient>
                    </Pressable>
                </View>

            {/* Modales */}
            <ModalsListarActividadesEconomicas
                isOpen={modalListarActividadesOpen}
                onClose={() => setModalListarActividadesOpen(false)}
                onSelect={(activities) => setSelectedActividades(activities)}
            />
        </View>
    );
}
