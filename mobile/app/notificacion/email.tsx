'use client';

import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import {
  getEmailConfig,
  saveEmailConfig,
  testEmailConfig,
  updateEmailStatus,
  deleteEmailConfig,
  type EmailConfig,
  type EmailConfigPayload
} from '../../services/emailConfig';
import ModalSuccess from '../../components/ModalSuccess';
import ModalError from '../../components/ModalError';
import ModalAdvert from '../../components/ModalAdvert';
import SidebarLayout from '../../components/SidebarLayout';
import SelectInput from 'app/clientes/components/SelectInput';
import { 
  Mail, 
  Server, 
  Users, 
  Bell, 
  Save, 
  TestTube,
  Trash2,
  Power,
  Info,
  Shield
} from 'lucide-react-native';
import { Input, Section, Toggle } from './FormComponents';

const initialFormData: EmailConfigPayload = {
  smtp_service: 'gmail',
  smtp_host: 'smtp.gmail.com',
  smtp_port: 587,
  smtp_secure: false,
  smtp_user: '',
  smtp_password: '',
  notify_to: '',
  notify_cc: '',
  notify_bcc: '',
  email_enabled: true,
  notify_ventas_programadas: true,
  notify_ventas_credito: false,
  notify_stock_bajo: false,
};

const ConfiguracionEmail = () => {
  const [formData, setFormData] = useState<EmailConfigPayload>(initialFormData);
  const [hasConfig, setHasConfig] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Modales
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Cargar configuración existente
  useEffect(() => {
    loadEmailConfig();
  }, []);

  const loadEmailConfig = async () => {
    try {
      setLoading(true);
      const response = await getEmailConfig();

      if (response.data.success && response.data.hasConfig) {
        const config: EmailConfig = response.data.config;
        setFormData({
          smtp_service: config.smtp_service,
          smtp_host: config.smtp_host,
          smtp_port: config.smtp_port,
          smtp_secure: config.smtp_secure,
          smtp_user: config.smtp_user,
          smtp_password: '',
          notify_to: config.notify_to,
          notify_cc: config.notify_cc || '',
          notify_bcc: config.notify_bcc || '',
          email_enabled: config.email_enabled,
          notify_ventas_programadas: config.notify_ventas_programadas,
          notify_ventas_credito: config.notify_ventas_credito,
          notify_stock_bajo: config.notify_stock_bajo,
        });
        setHasConfig(true);
      } else {
        setHasConfig(false);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setHasConfig(false);
      } else {
        console.error('Error al cargar configuración:', error);
        setErrorMessage('Error al cargar configuración de email');
        setErrorModalOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceChange = (service: string) => {
    const serviceConfigs = {
      gmail: {
        smtp_service: 'gmail',
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_secure: false,
      },
      outlook: {
        smtp_service: 'outlook',
        smtp_host: 'smtp-mail.outlook.com',
        smtp_port: 587,
        smtp_secure: false,
      },
      custom: {
        smtp_service: 'custom',
      }
    };

    setFormData((prev) => ({
      ...prev,
      ...serviceConfigs[service as keyof typeof serviceConfigs],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.smtp_user || !formData.notify_to) {
      setErrorMessage('Los campos Usuario SMTP y Email de Notificación son obligatorios');
      setErrorModalOpen(true);
      return;
    }

    if (!hasConfig && !formData.smtp_password) {
      setErrorMessage('La contraseña SMTP es obligatoria al crear la configuración');
      setErrorModalOpen(true);
      return;
    }

    try {
      setSaving(true);
      const payload = { ...formData };
      
      if (hasConfig && !formData.smtp_password) {
        delete payload.smtp_password;
      }

      await saveEmailConfig(payload);

      setSuccessMessage('✅ Configuración guardada exitosamente');
      setSuccessModalOpen(true);
      setHasConfig(true);

      await loadEmailConfig();
    } catch (error: any) {
      console.error('Error al guardar:', error);
      setErrorMessage(error.response?.data?.error || 'Error al guardar configuración');
      setErrorModalOpen(true);
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!hasConfig) {
      setErrorMessage('Primero debes guardar la configuración antes de probarla');
      setErrorModalOpen(true);
      return;
    }

    try {
      setTesting(true);
      const response = await testEmailConfig();

      setSuccessMessage(`✅ ${response.data.message}`);
      setSuccessModalOpen(true);
    } catch (error: any) {
      console.error('Error al probar email:', error);
      setErrorMessage(error.response?.data?.error || 'Error al enviar email de prueba');
      setErrorModalOpen(true);
    } finally {
      setTesting(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = formData.email_enabled ? 'inactiva' : 'activa';
      await updateEmailStatus(newStatus);

      setFormData((prev) => ({
        ...prev,
        email_enabled: !prev.email_enabled,
      }));

      setSuccessMessage(`Notificaciones ${newStatus === 'activa' ? 'activadas' : 'desactivadas'} exitosamente`);
      setSuccessModalOpen(true);
    } catch (error: any) {
      console.error('Error al cambiar estado:', error);
      setErrorMessage('Error al cambiar estado de notificaciones');
      setErrorModalOpen(true);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteEmailConfig();

      setFormData(initialFormData);
      setHasConfig(false);
      setDeleteModalOpen(false);

      setSuccessMessage('✅ Configuración eliminada exitosamente');
      setSuccessModalOpen(true);
    } catch (error: any) {
      console.error('Error al eliminar:', error);
      setErrorMessage('Error al eliminar configuración');
      setErrorModalOpen(true);
    } finally {
      setDeleting(false);
    }
  };

  const serviceOptions = [
    { value: 'gmail', label: 'Gmail' },
    { value: 'outlook', label: 'Outlook' },
    { value: 'custom', label: 'Personalizado' },
  ];

  if (loading) {
    return (
      <SidebarLayout>
        <View className="flex-1 items-center justify-center bg-gray-50">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600 text-base">Cargando configuración...</Text>
        </View>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-gray-50"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Header */}
          <View className="bg-white border-b border-gray-200 px-4 py-4 pt-16">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Mail size={24} color="#1E40AF" className="mr-3" />
                <Text className="text-2xl font-bold text-blue-800">
                  Configuración de Email
                </Text>
              </View>

              {hasConfig && (
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={handleToggleStatus}
                    className={`flex-row items-center px-3 py-2 rounded-lg ${
                      formData.email_enabled ? 'bg-green-500' : 'bg-gray-500'
                    }`}
                  >
                    <Power size={16} color="white" className="mr-1" />
                    <Text className="text-white font-medium text-sm">
                      {formData.email_enabled ? 'Activado' : 'Desactivado'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setDeleteModalOpen(true)}
                    className="flex-row items-center px-3 py-2 bg-red-500 rounded-lg"
                  >
                    <Trash2 size={16} color="white" className="mr-1" />
                    <Text className="text-white font-medium text-sm">Eliminar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View className="p-4 pb-20">
            {/* Configuración SMTP */}
            <Section title="Configuración SMTP" icon={Server}>
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Servicio de Email
                </Text>
                <SelectInput
                  name="smtp_service"
                  value={formData.smtp_service}
                  onChange={handleServiceChange}
                  options={serviceOptions}
                  placeholder="Selecciona un servicio"
                />
              </View>

              <Input
                label="Usuario SMTP *"
                value={formData.smtp_user}
                onChange={(value: string) => handleChange('smtp_user', value)}
                placeholder="tu-email@gmail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                icon={Mail}
              />

              <Input
                label={`Contraseña SMTP ${hasConfig ? '(dejar vacío para no cambiar)' : ''}`}
                value={formData.smtp_password}
                onChange={(value: string) => handleChange('smtp_password', value)}
                placeholder={hasConfig ? '••••••••' : 'Contraseña de aplicación'}
                secureTextEntry={true}
                autoCapitalize="none"
                icon={Shield}
                helperText={
                  formData.smtp_service === 'gmail' 
                    ? 'Usa una contraseña de aplicación desde tu cuenta de Google'
                    : undefined
                }
              />

              {formData.smtp_service === 'custom' && (
                <>
                  <Input
                    label="Host SMTP"
                    value={formData.smtp_host}
                    onChange={(value: string) => handleChange('smtp_host', value)}
                    placeholder="smtp.tuservidor.com"
                    autoCapitalize="none"
                    icon={Server}
                  />

                  <Input
                    label="Puerto SMTP"
                    value={formData.smtp_port.toString()}
                    onChange={(value: string) => handleChange('smtp_port', parseInt(value) || 587)}
                    placeholder="587"
                    keyboardType="numeric"
                    icon={Server}
                  />

                  <Toggle
                    value={formData.smtp_secure}
                    onValueChange={(value: boolean) => handleChange('smtp_secure', value)}
                    label="Usar SSL/TLS"
                    description="Habilitar para conexiones seguras (generalmente puerto 465)"
                  />
                </>
              )}
            </Section>

            {/* Destinatarios */}
            <Section title="Destinatarios" icon={Users}>
              <Input
                label="Email Principal (Para) *"
                value={formData.notify_to}
                onChange={(value: string) => handleChange('notify_to', value)}
                placeholder="notificaciones@tuempresa.com"
                keyboardType="email-address"
                autoCapitalize="none"
                icon={Mail}
              />

              <Input
                label="Email CC (Copia)"
                value={formData.notify_cc}
                onChange={(value: string) => handleChange('notify_cc', value)}
                placeholder="opcional@tuempresa.com"
                keyboardType="email-address"
                autoCapitalize="none"
                icon={Users}
              />

              <Input
                label="Email BCC (Copia Oculta)"
                value={formData.notify_bcc}
                onChange={(value: string) => handleChange('notify_bcc', value)}
                placeholder="opcional@tuempresa.com"
                keyboardType="email-address"
                autoCapitalize="none"
                icon={Users}
              />
            </Section>

            {/* Tipos de Notificaciones */}
            <Section title="Tipos de Notificaciones" icon={Bell}>
              <Toggle
                value={formData.notify_ventas_programadas}
                onValueChange={(value: boolean) => handleChange('notify_ventas_programadas', value)}
                label="Ventas Programadas"
                description="Notificar cuando se genere una venta programada automáticamente"
              />

              <Toggle
                value={formData.notify_ventas_credito}
                onValueChange={(value: boolean) => handleChange('notify_ventas_credito', value)}
                label="Ventas a Crédito"
                description="Notificar cuando se registre una venta a crédito"
              />

              <Toggle
                value={formData.notify_stock_bajo}
                onValueChange={(value: boolean) => handleChange('notify_stock_bajo', value)}
                label="Stock Bajo"
                description="Notificar cuando un producto llegue al stock mínimo"
              />
            </Section>

            {/* Botones de acción */}
            <View className="mt-4">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={saving}
                className={`w-full py-4 rounded-xl mb-3 flex-row items-center justify-center ${
                  saving ? 'bg-blue-400' : 'bg-blue-600'
                }`}
              >
                <Save size={20} color="white" className="mr-2" />
                <Text className="text-white font-semibold text-base">
                  {saving ? 'Guardando...' : 'Guardar Configuración'}
                </Text>
              </TouchableOpacity>

              {hasConfig && (
                <TouchableOpacity
                  onPress={handleTestEmail}
                  disabled={testing}
                  className={`w-full py-4 rounded-xl flex-row items-center justify-center ${
                    testing ? 'bg-green-400' : 'bg-green-600'
                  }`}
                >
                  <TestTube size={20} color="white" className="mr-2" />
                  <Text className="text-white font-semibold text-base">
                    {testing ? 'Enviando...' : 'Probar Configuración'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Información adicional */}
            <View className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <View className="flex-row items-center mb-2">
                <Info size={18} color="#1E40AF" className="mr-2" />
                <Text className="font-semibold text-blue-900 text-base">
                  Información importante
                </Text>
              </View>
              <View className="space-y-1">
                <Text className="text-sm text-blue-800">
                  • Para Gmail, usa una contraseña de aplicación desde tu cuenta de Google
                </Text>
                <Text className="text-sm text-blue-800">
                  • Las contraseñas se almacenan encriptadas en la base de datos
                </Text>
                <Text className="text-sm text-blue-800">
                  • Prueba la configuración antes de activar las notificaciones
                </Text>
                <Text className="text-sm text-blue-800">
                  • Solo usuarios administradores pueden configurar notificaciones
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Modales */}
        <ModalSuccess
          isOpen={successModalOpen}
          onClose={() => setSuccessModalOpen(false)}
          message={successMessage}
        />

        <ModalError
          isOpen={errorModalOpen}
          onClose={() => setErrorModalOpen(false)}
          message={errorMessage}
        />

        <ModalAdvert
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          message="¿Estás seguro de que deseas eliminar la configuración de email? Esta acción no se puede deshacer."
          isLoading={deleting}
        />
      </KeyboardAvoidingView>
    </SidebarLayout>
  );
};

export default ConfiguracionEmail;