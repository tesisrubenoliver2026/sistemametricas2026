// components/modals/ModalCobroDeuda.tsx
import React from "react";
import {
  Modal,
  View,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import CobroDeudaVenta from "../CobroDeudaVenta/CobroDeudaVenta";
import type { ComprobantePago } from "../interface";

interface ModalCobroDeudaProps {
  idDeuda: number;
  montoMaximo?: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  setComprobante?: (data: ComprobantePago) => void;
  setShowComprobante?: (value: boolean) => void;
}

export default function ModalCobroDeuda({
  idDeuda,
  montoMaximo,
  isOpen,
  onClose,
  onSuccess,
  setComprobante,
  setShowComprobante,
}: ModalCobroDeudaProps) {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose} // back en Android
      presentationStyle={Platform.OS === "ios" ? "overFullScreen" : undefined}
    >
      {/* Backdrop: tocar afuera para cerrar */}
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/50 p-4"
      >
        {/* Panel: evita que el tap interno cierre el modal */}
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          className="w-full h-[70%]"
        >
          <View
            className="w-full max-w-[600px]  self-center rounded-2xl bg-white p-6"
            onStartShouldSetResponder={() => true}
          >
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <CobroDeudaVenta
                montoMaximo={montoMaximo}
                iddeuda={idDeuda}
                onSuccess={onSuccess}
                onClose={onClose}
                setComprobante={setComprobante}
                setShowComprobante={setShowComprobante}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
