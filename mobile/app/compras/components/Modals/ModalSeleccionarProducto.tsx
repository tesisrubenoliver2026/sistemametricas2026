import React from 'react';
import {
  Modal,
  View,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import ListarProductos from 'app/producto/components/ListarProductos';

interface ModalSeleccionarProductoProps {
  isOpen: boolean;
  isBuy: boolean;
  onClose: () => void;
  setCantidadMaximo?: (cantidad: number) => void;
  setCantidadProducto: (cantidad: number) => void;
  configVentaPorLote?: boolean;
  cantidadProducto?: number;
  detalles?: any[];
  onSelect: (producto: any) => void;
  stockVerify?: boolean;
}

const ModalSeleccionarProducto: React.FC<ModalSeleccionarProductoProps> = ({
  isOpen,
  isBuy,
  onClose,
  setCantidadMaximo,
  setCantidadProducto,
  configVentaPorLote = false,
  cantidadProducto,
  detalles,
  onSelect,
  stockVerify = false,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
      presentationStyle={Platform.OS === "ios" ? "overFullScreen" : undefined}
    >
      <Pressable
        onPress={onClose}
        className="items-center justify-center bg-black/50 p-4"
      >
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          className="h-[90%]"
        >
          <View
            className="self-center rounded-2xl bg-white p-6"
            onStartShouldSetResponder={() => true}
          >
            <ListarProductos 
              isBuy={isBuy} 
              configVentaPorLote={configVentaPorLote} 
              onSelect={onSelect} 
              detalles={detalles} 
              setCantidadProducto={setCantidadProducto} 
              cantidadProducto={cantidadProducto} 
              stockVerify={stockVerify} 
              setCantidadMaximo={setCantidadMaximo} 
            />
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

export default ModalSeleccionarProducto;