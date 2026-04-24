'use client';

import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Platform, Alert } from 'react-native';
import { CheckCircle, AlertCircle } from 'lucide-react-native';
import { getConfiguracionValor, guardarConfiguracion, getConfiguracionValorString, descargarBackup } from '../../services/configuracion';
import SidebarLayout from '../../components/SidebarLayout';
import { ArrowDownTrayIcon } from "react-native-heroicons/outline";

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const CustomSelect = ({ options, selectedValue, onValueChange, title }: any) => {
  const [modalVisible, setModalVisible] = useState(false);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      className="p-4 border-b border-gray-200"
      onPress={() => {
        onValueChange(item.value);
        setModalVisible(false);
      }}
    >
      <Text className="text-lg">{item.label}</Text>
    </TouchableOpacity>
  );

  const selectedLabel = options.find((opt: any) => opt.value === selectedValue)?.label;

  return (
    <View>
      <TouchableOpacity
        className="w-full border border-gray-300 rounded-md px-4 py-3 bg-white flex-row justify-between items-center"
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-base text-gray-700">{selectedLabel}</Text>
        <Text className="text-gray-400">▼</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-2xl p-4">
            <View className='flex-row justify-between items-center' >
              <Text className="text-xl font-bold mb-4">{title}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text className="text-2xl font-bold mb-4">X</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              renderItem={renderItem}
              keyExtractor={(item) => item.value.toString()}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};


export default function Configuracion() {
  const [valorLoteActual, setValorLoteActual] = useState<boolean | null>(null);
  const [nuevoValorLote, setNuevoValorLote] = useState<boolean>(false);

  const [valorVencimientoActual, setValorVencimientoActual] = useState<boolean | null>(null);
  const [nuevoValorVencimiento, setNuevoValorVencimiento] = useState<boolean>(false);

  const [valorVentasProgramadasActual, setValorVentasProgramadasActual] = useState<boolean | null>(null);
  const [nuevoValorVentasProgramadas, setNuevoValorVentasProgramadas] = useState<boolean>(false);

  const [mensaje, setMensaje] = useState('');

  const [templateActual, setTemplateActual] = useState<string | null>(null);
  const [nuevoTemplate, setNuevoTemplate] = useState<string>('t1');

  useEffect(() => {
    getConfiguracionValor('sistema_venta_por_lote')
      .then((res: any) => {
        setValorLoteActual(res.data.valor);
        setNuevoValorLote(res.data.valor);

      })
      .catch(() => {
        setValorLoteActual(false);
        setNuevoValorLote(false);
      });

    getConfiguracionValor('venta_fecha_vencimiento')
      .then((res: any) => {
        setValorVencimientoActual(res.data.valor);
        setNuevoValorVencimiento(res.data.valor);
      })
      .catch(() => {
        setValorVencimientoActual(false);
        setNuevoValorVencimiento(false);
      });

    getConfiguracionValor('ventas_programadas')
      .then((res: any) => {
        setValorVentasProgramadasActual(res.data.valor);
        setNuevoValorVentasProgramadas(res.data.valor);
      })
      .catch(() => {
        setValorVentasProgramadasActual(false);
        setNuevoValorVentasProgramadas(false);
      });

    getConfiguracionValorString('selectedTemplate')
      .then((res: any) => {
        setTemplateActual(res.data.valor);
        setNuevoTemplate(res.data.valor);
      })
      .catch(() => {
        setTemplateActual('t1');
        setNuevoTemplate('t1');
      });

  }, []);

  const handleBackup = async () => {
    try {
      const blob = await descargarBackup();
      const reader = new FileReader();
      reader.onload = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const filename = FileSystem.documentDirectory + 'respaldo.sql';
        await FileSystem.writeAsStringAsync(filename, base64data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (Platform.OS === "ios") {
          await Sharing.shareAsync(filename);
        } else {
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            const base64 = await FileSystem.readAsStringAsync(filename, { encoding: FileSystem.EncodingType.Base64 });
            await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, 'respaldo.sql', 'application/sql')
              .then(async (uri) => {
                await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
                Alert.alert('Descarga Completa', `El respaldo se ha guardado en tus descargas.`);
              })
              .catch((e) => {
                console.log(e);
                Alert.alert('Error', 'No se pudo guardar el archivo.');
              });
          } else {
            Alert.alert('Permiso denegado', 'No se puede guardar el archivo sin permiso.');
          }
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Error al bajar backup:', err);
      Alert.alert('Error', 'Ocurrió un error al descargar el respaldo.');
    }
  };


  const handleGuardar = async () => {
    try {
      await guardarConfiguracion('sistema_venta_por_lote', nuevoValorLote);
      await guardarConfiguracion('venta_fecha_vencimiento', nuevoValorVencimiento);
      await guardarConfiguracion('ventas_programadas', nuevoValorVentasProgramadas);
      await guardarConfiguracion('selectedTemplate', nuevoTemplate);

      setTemplateActual(nuevoTemplate);
      setValorLoteActual(nuevoValorLote);
      setValorVencimientoActual(nuevoValorVencimiento);
      setMensaje('✅ Configuraciones guardadas correctamente');

      setTimeout(() => setMensaje(''), 3000);
    } catch (err) {
      console.error(err);
      setMensaje('❌ Error al guardar configuraciones');
    }
  };

  const ConfigCard = ({
    title,
    description,
    value,
    onChange,
    current,
  }: {
    title: string;
    description: string;
    value: boolean;
    onChange: (value: boolean) => void;
    current: boolean | null;
  }) => (
    <View className="bg-white border border-gray-200 rounded-xl shadow p-6 mb-4">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold text-gray-800">{title}</Text>
        {current !== null ? (
          current ? (
            <View className="flex-row items-center">
              <CheckCircle size={18} className="text-green-600 mr-1" />
              <Text className="text-green-600 text-sm font-medium">Activado</Text>
            </View>
          ) : (
            <View className="flex-row items-center">
              <AlertCircle size={18} className="text-red-600 mr-1" />
              <Text className="text-red-600 text-sm font-medium">Desactivado</Text>
            </View>
          )
        ) : (
          <Text className="text-gray-400 text-sm">Cargando...</Text>
        )}
      </View>
      <Text className="text-sm text-gray-500 mb-4">{description}</Text>
      <CustomSelect
        title={title}
        options={[
          { label: 'Sí (Activado)', value: true },
          { label: 'No (Desactivado)', value: false },
        ]}
        selectedValue={value}
        onValueChange={onChange}
      />
    </View>
  );

  return (
    <SidebarLayout>
      <View className="flex-1 p-6 bg-gray-50">
        <Text className="text-3xl font-bold text-gray-800 mb-10 text-center mt-10">Configuración del Sistema</Text>

        <FlatList
          data={[
            { type: 'card', id: 'lote', title: "Selección Manual por Lote", description: "Permite que el usuario elija manually de qué lote vender. Si se desactiva, el sistema aplicará FIFO automáticamente.", value: nuevoValorLote, onChange: setNuevoValorLote, current: valorLoteActual },
            { type: 'card', id: 'vencimiento', title: "Validar Fecha de Vencimiento", description: "Impide vender productos con fecha de vencimiento pasada. Si se desactiva, el sistema no controlará esto.", value: nuevoValorVencimiento, onChange: setNuevoValorVencimiento, current: valorVencimientoActual },
            { type: 'card', id: 'programadas', title: "Ventas Programadas", description: "Habilita o deshabilita la automatización de ventas programadas.", value: nuevoValorVentasProgramadas, onChange: setNuevoValorVentasProgramadas, current: valorVentasProgramadasActual },
            { type: 'template', id: 'template' },
            { type: 'backup', id: 'backup' },
            { type: 'save', id: 'save' },
            { type: 'message', id: 'message' }
          ]}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            if (item.type === 'card') {
              return <ConfigCard title={item.title!} description={item.description!} value={item.value!} onChange={item.onChange!} current={item.current!} />
            }
            if (item.type === 'template') {
              return (
                <View className="bg-white border border-gray-200 rounded-xl shadow p-6 mb-4">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-lg font-semibold text-gray-800">Diseño de Comprobante</Text>
                    {templateActual ? (
                      <Text className="text-blue-600 text-sm font-medium">Actual: {templateActual.toUpperCase()}</Text>
                    ) : (
                      <Text className="text-gray-400 text-sm">Cargando...</Text>
                    )}
                  </View>
                  <Text className="text-sm text-gray-500 mb-4">Seleccioná el diseño que querés usar al imprimir comprobantes de venta.</Text>
                  <CustomSelect
                    title="Diseño de Comprobante"
                    options={[
                      { label: 'Plantilla Estándar', value: 't1' },
                      { label: 'Plantilla Formal A4', value: 't2' },
                      { label: 'Plantilla Compacta', value: 't3' },
                      { label: 'Plantilla Moderna', value: 't4' },
                    ]}
                    selectedValue={nuevoTemplate}
                    onValueChange={setNuevoTemplate}
                  />
                </View>
              )
            }
            if (item.type === 'backup') {
              return (
                <TouchableOpacity
                  onPress={handleBackup}
                  className="w-[160px] group relative mt-4 mb-4 items-center overflow-hidden bg-blue-600 rounded-lg p-3">
                  <View className='flex-row items-center' >
                  
                    <Text className='text-white font-bold' >Descargar respaldo</Text>
                  </View>
                </TouchableOpacity>
              )
            }
            if (item.type === 'save') {
              return (
                <TouchableOpacity
                  onPress={handleGuardar}
                  className="mt-6 mb-6 w-full bg-blue-600 rounded-lg p-4 items-center"
                >
                  <Text className="text-white font-semibold text-lg">Guardar configuraciones</Text>
                </TouchableOpacity>
              )
            }
            if (item.type === 'message') {
              return (
                <>
                  {mensaje && (
                    <View className="mt-6 text-center text-sm text-blue-700 bg-blue-100 border border-blue-300 rounded-md py-2 px-4">
                      <Text className='text-center' >{mensaje}</Text>
                    </View>
                  )}
                </>
              )
            }
            return null;
          }}
          ListFooterComponent={<View className="h-20" />}
        />
      </View>
    </SidebarLayout>
  );
}