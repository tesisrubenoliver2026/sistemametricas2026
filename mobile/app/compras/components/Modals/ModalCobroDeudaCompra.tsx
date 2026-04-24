import React from 'react';
import CobroDeudaCompra from '../CobroDeudaCompra/CobroDeudaCompra';
import {
  Modal,
  View,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { ComprobantePago } from 'components/interface';

interface ModalCobroDeudaProps {
  idDeuda: number;
  montoMaximo?: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  setComprobante?: (data: ComprobantePago) => void;
  setShowComprobante?: (value: boolean) => void;
}

const ModalCobroDeuda: React.FC<ModalCobroDeudaProps> = ({
  idDeuda,
  montoMaximo,
  isOpen,
  onClose,
  onSuccess,
  setComprobante,
  setShowComprobante
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
            className="w-full max-w-[700px] self-center rounded-2xl bg-white p-6"
            onStartShouldSetResponder={() => true}
          >
            <CobroDeudaCompra montoMaximo={montoMaximo} iddeuda={idDeuda} onSuccess={onSuccess} onClose={onClose} setComprobante={setComprobante} setShowComprobante={setShowComprobante} />
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

export default ModalCobroDeuda;
