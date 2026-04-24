import React from 'react';
import {
  Modal,
  View,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import CrearCompraRapida from '../CompraRapida/CrearCompraRapida';

interface ModalCrearCompraRapidaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalCrearCompraRapida: React.FC<ModalCrearCompraRapidaProps> = ({
  isOpen,
  onClose,
  onSuccess
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
            <CrearCompraRapida onSuccess={onSuccess} onClose={onClose} />
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

export default ModalCrearCompraRapida;