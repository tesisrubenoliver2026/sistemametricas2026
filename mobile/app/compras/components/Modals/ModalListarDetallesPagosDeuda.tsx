import React from 'react';
import {
  Modal,
  View,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import ListarDetallesPagosDeuda from '../CobroDeudaCompra/ListarDetallesPagosDeuda';

interface ModalListarDetallesPagosDeudaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  iddeuda: number;
}

const ModalListarDetallesPagosDeuda: React.FC<ModalListarDetallesPagosDeudaProps> = ({
  isOpen,
  onClose,
  onSuccess,
  iddeuda
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
        className="flex-1 items-center justify-center bg-black/50 p-4"
      >
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          className="w-full"
        >
          <View
            className="w-full max-w-[1200px] self-center rounded-2xl bg-white p-6"
            onStartShouldSetResponder={() => true}
          >
            <ListarDetallesPagosDeuda 
              iddeuda={iddeuda} 
              onSuccess={onSuccess} 
            />
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

export default ModalListarDetallesPagosDeuda;