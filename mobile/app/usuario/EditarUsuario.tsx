import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUsuarioId, updateUsuario } from '../../services/usuarios';
import ModalAdvert from '../../components/ModalAdvert';
import ModalError from '../../components/ModalError';
import ModalSuccess from '../../components/ModalSuccess';
import SelectInput from '../clientes/components/SelectInput'; // Re-using component

interface EditarUsuarioProps {
    id: number | string;
    onSuccess?: () => void;
    onClose?: () => void;
}

interface FormData {
    login: string;
    acceso: string;
    estado: string;
    nombre: string;
    apellido: string;
    telefono: string;
    password?: string;
}

const initialForm: FormData = {
    login: '',
    acceso: '',
    estado: 'activo',
    nombre: '',
    apellido: '',
    telefono: '',
};

const accesoOptions = [
    { value: 'Administrador', label: 'Administrador' },
    { value: 'Cajero', label: 'Cajero' },
    { value: 'Auditor', label: 'Auditor' },
];

const estadoOptions = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
];

const EditarUsuario = ({ id, onSuccess, onClose }: EditarUsuarioProps) => {
    const [formData, setFormData] = useState<FormData>(initialForm);
    const [cambiarPassword, setCambiarPassword] = useState(false);
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalErrorOpen, setModalErrorOpen] = useState(false);
    const [modalAdvertOpen, setModalAdvertOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(true);

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                setFormLoading(true);
                const res = await getUsuarioId(id);
                setFormData({
                    login: res.data.login || '',
                    acceso: res.data.acceso || '',
                    estado: res.data.estado || 'activo',
                    nombre: res.data.nombre || '',
                    apellido: res.data.apellido || '',
                    telefono: res.data.telefono || '',
                });
            } catch (error) {
                setModalMessage('❌ Error al obtener datos del usuario');
                setModalErrorOpen(true);
                console.error(error);
            } finally {
                setFormLoading(false);
            }
        };

        if (id) fetchUsuario();
    }, [id]);

    const handleChange = (name: string, value: string | boolean) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleConfirmSubmit = () => {
        setModalAdvertOpen(true);
    };

    const handleSubmit = async () => {
        setModalAdvertOpen(false);
        try {
            setLoading(true);
            const payload: Partial<FormData> = { ...formData };
            if (!cambiarPassword || !payload.password?.trim()) {
                delete payload.password;
            }

            await updateUsuario(id, payload);

            setModalSuccessOpen(true);
            setTimeout(() => {
                setModalSuccessOpen(false);
                if (onSuccess) onSuccess();
                if (onClose) onClose();
            }, 1500);
        } catch (error) {
            setModalMessage('❌ Error al actualizar usuario');
            setModalErrorOpen(true);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (name: keyof FormData, placeholder: string, icon: keyof typeof Ionicons.glyphMap, secureTextEntry = false) => (
        <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2 ml-1">{placeholder}</Text>
            <View className="relative">
                <View className="absolute left-4 top-3.5 z-10">
                    <Ionicons name={icon} size={20} color="#64748b" />
                </View>
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor="#94a3b8"
                    value={formData[name]}
                    onChangeText={(value) => handleChange(name, value)}
                    secureTextEntry={secureTextEntry}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-12 py-3.5 text-gray-800"
                />
            </View>
        </View>
    );

    if (formLoading) {
        return (
            <View className="flex-1 justify-center items-center p-8">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-4 text-gray-600">Cargando datos del usuario...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1">
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View className="mb-6">
                    <View className="flex-row items-center gap-3 mb-2">
                        <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                            <Ionicons name="create" size={22} color="#f59e0b" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-800">Editar Usuario</Text>
                    </View>
                    <Text className="text-gray-500 ml-1">Actualice los datos del usuario</Text>
                </View>

                {/* Formulario */}
                <View className="gap-2">
                    {renderInput('nombre', 'Nombre', 'person-outline')}
                    {renderInput('apellido', 'Apellido', 'person-outline')}
                    {renderInput('telefono', 'Teléfono', 'call-outline')}
                    {renderInput('login', 'Usuario (Login)', 'at-outline')}

                    <View className="mb-4">
                        <Text className="text-gray-700 font-semibold mb-2 ml-1">Rol / Acceso</Text>
                        <SelectInput
                            name="acceso"
                            value={formData.acceso}
                            onChange={(name, value) => handleChange(name, value as string)}
                            placeholder="Seleccionar Rol"
                            options={accesoOptions}
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 font-semibold mb-2 ml-1">Estado</Text>
                        <SelectInput
                            name="estado"
                            value={formData.estado}
                            onChange={(name, value) => handleChange(name, value as string)}
                            placeholder="Seleccionar Estado"
                            options={estadoOptions}
                        />
                    </View>

                    <View className="flex-row items-center justify-between bg-gray-50 p-3 rounded-xl my-2">
                        <Text className="text-gray-700 font-medium">¿Desea cambiar la contraseña?</Text>
                        <Switch
                            value={cambiarPassword}
                            onValueChange={setCambiarPassword}
                            trackColor={{ false: "#767577", true: "#81b0ff" }}
                            thumbColor={cambiarPassword ? "#3b82f6" : "#f4f3f4"}
                        />
                    </View>

                    {cambiarPassword && (
                        renderInput('password', 'Nueva Contraseña', 'lock-closed-outline', true)
                    )}
                </View>

                {/* Botones */}
                <View className="flex-row gap-3 mt-6 mb-4">
                    {onClose && (
                        <Pressable onPress={onClose} className="flex-1 active:opacity-70">
                            <View className="bg-gray-200 rounded-xl py-3.5 items-center justify-center">
                                <Text className="text-gray-700 font-bold">Cancelar</Text>
                            </View>
                        </Pressable>
                    )}
                    <Pressable onPress={handleConfirmSubmit} disabled={loading} className="flex-1 active:opacity-70">
                        <View className={`rounded-xl py-3.5 items-center justify-center ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white font-bold">Guardar Cambios</Text>
                            )}
                        </View>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Modales */}
            <ModalSuccess
                isOpen={modalSuccessOpen}
                onClose={() => setModalSuccessOpen(false)}
                message="Usuario actualizado con éxito ✅"
            />
            <ModalError
                isOpen={modalErrorOpen}
                onClose={() => setModalErrorOpen(false)}
                message={modalMessage}
            />
            <ModalAdvert
                isOpen={modalAdvertOpen}
                message="Estás a punto de actualizar los datos del usuario. ¿Deseas continuar?"
                onConfirm={handleSubmit}
                onClose={() => setModalAdvertOpen(false)}
            />
        </View>
    );
};

export default EditarUsuario;
