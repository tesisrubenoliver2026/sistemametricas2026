import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getCargoUsuario } from 'services/usuarios';
import { listarVentasProgramadas, anularVentaProgramada, getVentasProgramadasPorCliente } from 'services/ventas';
import ModalCrearVenta from '../Modal/ModalCrearVentaPr';
import ModalListClient from '../Modal/ModalListClient';
import ModalAdvert from '../../../../components/ModalAdvert';
import ModalError from '../../../../components/ModalError';
import ModalSuccess from '../../../../components/ModalSuccess';

interface VentaProgramada {
  idprogramacion: number;
  cliente_nombre: string;
  cliente_apellido: string;
  nombre_producto: string;
  fecha_inicio: string;
  dia_programado: number;
  ultima_fecha_venta: string | null;
  estado: string;
}

const ListarVentasProgramadas = () => {
  const [ventas, setVentas] = useState<VentaProgramada[]>([]);
  const [search, setSearch] = useState('');
  const [showModalCliente, setShowModalCliente] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModalVenta, setShowModalVenta] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showAdvertModal, setShowAdvertModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [idVentaAAnular, setIdVentaAAnular] = useState<number | null>(null);
  const [cargo, setCargo] = useState('');

  const fetchCargo = async () => {
    try {
      const { data } = await getCargoUsuario();
      setCargo(data.acceso);
    } catch (error) {
      console.error('Error al obtener cargo:', error);
    }
  };

  useEffect(() => {
    fetchCargo();
  }, []);

  const isAdmin = cargo === 'Administrador';

  const fetchVentas = async () => {
    try {
      setLoading(true);
      console.log('Fetching ventas programadas...', { page, limit, search });
      const res = await listarVentasProgramadas({ page, limit, search });
      console.log('Ventas recibidas:', res.data);
      setVentas(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error('Error al obtener ventas programadas:', error);
      setVentas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReporteCliente = async (idcliente: number) => {
    try {
      const res = await getVentasProgramadasPorCliente(idcliente);
      const base64PDF = res.data.reportePDFBase64;

      if (!base64PDF) {
        Alert.alert('Error', 'No se recibió el PDF del servidor');
        return;
      }

      // Generar nombre de archivo con fecha
      const fecha = new Date().toLocaleDateString().replace(/\//g, '-');
      const filename = FileSystem.documentDirectory + `Reporte-Ventas-Programadas-Cliente-${fecha}.pdf`;

      // Escribir archivo
      await FileSystem.writeAsStringAsync(filename, base64PDF, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (Platform.OS === "ios") {
        // En iOS, compartir directamente
        await Sharing.shareAsync(filename);
      } else {
        // En Android, solicitar permisos y guardar en descargas
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            `Reporte-Ventas-Programadas-Cliente-${fecha}.pdf`,
            'application/pdf'
          )
            .then(async (uri) => {
              await FileSystem.writeAsStringAsync(uri, base64PDF, {
                encoding: FileSystem.EncodingType.Base64
              });
              Alert.alert('Descarga Completa', 'El reporte se ha guardado en tus descargas.');
            })
            .catch((e) => {
              console.log(e);
              Alert.alert('Error', 'No se pudo guardar el archivo');
            });
        } else {
          // Si no se otorgan permisos, compartir de todas formas
          await Sharing.shareAsync(filename);
        }
      }
    } catch (error) {
      console.error('Error al generar reporte del cliente:', error);
      Alert.alert('Error', 'No se pudo generar el reporte');
    }
  };

  useEffect(() => {
    console.log('Component mounted - ListarVentasProgramadas');
    fetchVentas();
  }, [page, limit, search]);

  const handleDelete = (id: number) => {
    setIdVentaAAnular(id);
    setModalMessage('¿Estás seguro de que deseas anular esta venta programada?');
    setShowAdvertModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!idVentaAAnular) return;
    try {
      await anularVentaProgramada(idVentaAAnular);
      setModalMessage('Venta programada anulada correctamente.');
      setShowSuccessModal(true);
      setShowAdvertModal(false);
      fetchVentas();
    } catch (error) {
      console.error('Error al anular venta programada:', error);
      setModalMessage('Ocurrió un error al anular la venta programada.');
      setShowErrorModal(true);
    } finally {
      setIdVentaAAnular(null);
    }
  };

  console.log('Rendering component', { loading, ventasCount: ventas.length });

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <LinearGradient
          colors={['#3b82f6', '#2563eb']}
          style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ height: 48, width: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <Ionicons name="calendar" size={24} color="#fff" />
              </View>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>Ventas Programadas</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={{ position: 'relative' }}>
            <TextInput
              placeholder="Buscar por cliente, producto..."
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                setPage(1);
              }}
              style={{ backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 48, paddingVertical: 12, color: '#1f2937' }}
            />
            <View style={{ position: 'absolute', left: 16, top: 14 }}>
              <Ionicons name="search" size={20} color="#64748b" />
            </View>
            {search.length > 0 && (
              <Pressable
                onPress={() => setSearch('')}
                style={{ position: 'absolute', right: 16, top: 14 }}
              >
                <Ionicons name="close-circle" size={20} color="#64748b" />
              </Pressable>
            )}
          </View>
        </LinearGradient>

        {/* Botones de acción */}
        <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 12 }}>
          <Pressable
            onPress={() => setShowModalVenta(true)}
            style={{ opacity: 1 }}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Ionicons name="add-circle" size={22} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Crear Venta Programada</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => setShowModalCliente(true)}
            style={{ opacity: 1 }}
          >
            <LinearGradient
              colors={['#9333ea', '#7e22ce']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Ionicons name="document-text" size={22} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Reporte por Cliente</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Lista de Ventas Programadas */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          {loading ? (
            <View style={{ paddingVertical: 80, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={{ color: '#6b7280', marginTop: 16 }}>Cargando ventas programadas...</Text>
            </View>
          ) : ventas.length === 0 ? (
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
              <Text style={{ color: '#6b7280', marginTop: 16, textAlign: 'center' }}>
                {search ? 'No se encontraron ventas programadas' : 'No hay ventas programadas registradas'}
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {ventas.map((venta: VentaProgramada, idx: number) => (
                <View
                  key={venta.idprogramacion}
                  style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#f3f4f6' }}
                >
                  {/* Encabezado de la card */}
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <View style={{ height: 32, width: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#dbeafe' }}>
                          <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 12 }}>
                            {(page - 1) * limit + idx + 1}
                          </Text>
                        </View>
                        <Text style={{ color: '#111827', fontWeight: 'bold', fontSize: 16, flex: 1 }} numberOfLines={1}>
                          {venta.cliente_nombre} {venta.cliente_apellido}
                        </Text>
                      </View>

                      {/* Estado badge */}
                      <View style={{ flexDirection: 'row', marginTop: 8 }}>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16, backgroundColor: venta.estado === 'activo' ? '#dcfce7' : '#fee2e2' }}>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: venta.estado === 'activo' ? '#15803d' : '#991b1b' }}>
                            {venta.estado.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Detalles de la venta */}
                  <View style={{ gap: 8, marginTop: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons name="cube-outline" size={16} color="#64748b" />
                      <Text style={{ color: '#4b5563', fontSize: 14, flex: 1 }} numberOfLines={2}>
                        {venta.nombre_producto}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons name="calendar-outline" size={16} color="#64748b" />
                      <Text style={{ color: '#4b5563', fontSize: 14 }}>
                        Inicio: {new Date(venta.fecha_inicio).toLocaleDateString()}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons name="time-outline" size={16} color="#64748b" />
                      <Text style={{ color: '#4b5563', fontSize: 14 }}>
                        Día programado: {venta.dia_programado}
                      </Text>
                    </View>

                    {venta.ultima_fecha_venta && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="checkmark-circle-outline" size={16} color="#64748b" />
                        <Text style={{ color: '#4b5563', fontSize: 14 }}>
                          Última venta: {new Date(venta.ultima_fecha_venta).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Botones de acción */}
                  {isAdmin && (
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' }}>
                      <Pressable
                        onPress={() => handleDelete(venta.idprogramacion)}
                        style={{ flex: 1 }}
                      >
                        <View style={{ backgroundColor: '#ef4444', borderRadius: 8, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <Ionicons name="trash" size={16} color="#fff" />
                          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>Anular</Text>
                        </View>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Paginación */}
          {!loading && ventas.length > 0 && (
            <View style={{ marginTop: 24, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Pressable
                  onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  style={{ flex: 1, marginRight: 8 }}
                >
                  <View style={{ borderRadius: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: page === 1 ? '#e5e7eb' : '#3b82f6' }}>
                    <Ionicons name="chevron-back" size={18} color={page === 1 ? '#9ca3af' : '#fff'} />
                    <Text style={{ fontWeight: '600', color: page === 1 ? '#9ca3af' : '#fff' }}>Anterior</Text>
                  </View>
                </Pressable>

                <View style={{ paddingHorizontal: 16 }}>
                  <Text style={{ color: '#4b5563', fontWeight: '500', textAlign: 'center' }}>
                    Página {page} de {totalPages}
                  </Text>
                </View>

                <Pressable
                  onPress={() => setPage((prev) => prev + 1)}
                  disabled={page >= totalPages}
                  style={{ flex: 1, marginLeft: 8 }}
                >
                  <View style={{ borderRadius: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: page >= totalPages ? '#e5e7eb' : '#3b82f6' }}>
                    <Text style={{ fontWeight: '600', color: page >= totalPages ? '#9ca3af' : '#fff' }}>Siguiente</Text>
                    <Ionicons name="chevron-forward" size={18} color={page >= totalPages ? '#9ca3af' : '#fff'} />
                  </View>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modales */}
      {showModalVenta && (
        <ModalCrearVenta
          isOpen={showModalVenta}
          onClose={() => setShowModalVenta(false)}
          onSuccess={fetchVentas}
        />
      )}
      {showSuccessModal && (
        <ModalSuccess
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          message={modalMessage}
        />
      )}
      {showErrorModal && (
        <ModalError
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          message={modalMessage}
        />
      )}
      {showAdvertModal && (
        <ModalAdvert
          isOpen={showAdvertModal}
          onClose={() => setShowAdvertModal(false)}
          onConfirm={handleDeleteConfirmed}
          message={modalMessage}
          confirmButtonText="Sí, Anular"
        />
      )}
      {showModalCliente && (
        <ModalListClient
          isOpen={showModalCliente}
          isReportGenerated={showModalCliente}
          onReportGenerated={handleGenerateReporteCliente}
          onClose={() => setShowModalCliente(false)}
        />
      )}
    </View>
  );
};

export default ListarVentasProgramadas;
