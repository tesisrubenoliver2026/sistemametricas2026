import React from 'react';
import {
  Modal,
  View,
  Pressable,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';

interface ModalPrecioCompraProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (opcion: string) => void;
  setOpcionSeleccionada?: (value: string) => void | undefined;
  opcionSeleccionada?: string;
}

const ModalPrecioCompra: React.FC<ModalPrecioCompraProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  setOpcionSeleccionada,
  opcionSeleccionada
}) => {
  const handleConfirm = () => {
    if (opcionSeleccionada) {
      onConfirm(opcionSeleccionada);
      onClose();
    }
  };

  const handleClose = () => {
    setOpcionSeleccionada && setOpcionSeleccionada('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Pressable
        onPress={handleClose}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 16 }}
      >
        <Pressable 
          style={{ width: '100%', maxWidth: 400, backgroundColor: 'white', borderRadius: 16, padding: 24 }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937' }}>
              Configuración de Precio de Compra
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: '#9ca3af', fontSize: 20, fontWeight: 'bold' }}>×</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={{ fontSize: 14, color: '#4b5563', marginBottom: 24 }}>
            Selecciona cómo deseas ingresar el precio de compra para productos por caja:
          </Text>

          <View style={{ marginBottom: 24, gap: 16 }}>
            {/* Opción 1: Precio por caja total */}
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderRadius: 8,
                padding: 16,
                borderColor: opcionSeleccionada === 'caja_total' ? '#3b82f6' : '#d1d5db',
                backgroundColor: opcionSeleccionada === 'caja_total' ? '#dbeafe' : 'white'
              }}
              onPress={() => setOpcionSeleccionada && setOpcionSeleccionada('caja_total')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: opcionSeleccionada === 'caja_total' ? '#3b82f6' : '#9ca3af',
                  backgroundColor: opcionSeleccionada === 'caja_total' ? '#3b82f6' : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 2
                }}>
                  {opcionSeleccionada === 'caja_total' && (
                    <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '500', color: '#1f2937', marginBottom: 4 }}>
                    Precio de compra por cada caja
                  </Text>
                  <Text style={{ fontSize: 14, color: '#4b5563', marginBottom: 8 }}>
                    Ingresa el precio compra que pagaste por cada caja
                  </Text>
                  <View style={{ backgroundColor: '#f9fafb', padding: 12, borderRadius: 4, borderLeftWidth: 4, borderLeftColor: '#60a5fa' }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>
                      📦 Ejemplo: Producto x caja = $35.000
                    </Text>
                    <Text style={{ fontSize: 12, color: '#4b5563', marginTop: 4 }}>
                      El sistema calculará automáticamente el precio por unidad
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Opción 2: Precio por unidad */}
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderRadius: 8,
                padding: 16,
                borderColor: opcionSeleccionada === 'por_unidad' ? '#3b82f6' : '#d1d5db',
                backgroundColor: opcionSeleccionada === 'por_unidad' ? '#dbeafe' : 'white'
              }}
              onPress={() => setOpcionSeleccionada && setOpcionSeleccionada('por_unidad')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: opcionSeleccionada === 'por_unidad' ? '#3b82f6' : '#9ca3af',
                  backgroundColor: opcionSeleccionada === 'por_unidad' ? '#3b82f6' : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 2
                }}>
                  {opcionSeleccionada === 'por_unidad' && (
                    <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '500', color: '#1f2937', marginBottom: 4 }}>
                    Precio de compra por unidad individual
                  </Text>
                  <Text style={{ fontSize: 14, color: '#4b5563', marginBottom: 8 }}>
                    Ingresas el precio de cada unidad dentro de la caja
                  </Text>
                  <View style={{ backgroundColor: '#f9fafb', padding: 12, borderRadius: 4, borderLeftWidth: 4, borderLeftColor: '#10b981' }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>
                      🔢 Ejemplo: Producto x unidad = $3.500
                    </Text>
                    <Text style={{ fontSize: 12, color: '#4b5563', marginTop: 4 }}>
                      El sistema calculará automáticamente el precio total de la caja
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'flex-end' }}>
            <TouchableOpacity
              onPress={handleClose}
              style={{ paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8 }}
            >
              <Text style={{ color: '#4b5563' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={!opcionSeleccionada}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: opcionSeleccionada ? '#3b82f6' : '#d1d5db'
              }}
            >
              <Text style={{ color: opcionSeleccionada ? 'white' : '#6b7280', fontWeight: '500' }}>
                Confirmar Selección
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ModalPrecioCompra;