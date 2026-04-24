// components/modals/ModalListarDetallesPagosDeuda.tsx
import React from "react";
import {
  Modal,
  View,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import ListarDetallesPagosDeuda from "../CobroDeudaVenta/ListarDetallesPagosDeuda";

interface ModalListarDetallesPagosDeudaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  iddeuda: number;
}

export default function ModalListarDetallesPagosDeuda({
  isOpen,
  onClose,
  onSuccess,
  iddeuda,
}: ModalListarDetallesPagosDeudaProps) {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose} // back en Android
      presentationStyle={Platform.OS === "ios" ? "overFullScreen" : undefined}
    >
      {/* Backdrop: cierra al tocar afuera */}
      <Pressable
        onPress={onClose}
        className="items-center justify-center bg-black/50 p-4"
      >
        {/* Panel: evita que el tap interno cierre el modal */}
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          className="w-full"
        >
          <View
            className="w-full max-w-[1200px] h-[95%] self-center rounded-2xl bg-white p-6"
            onStartShouldSetResponder={() => true}
          >
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <ListarDetallesPagosDeuda iddeuda={iddeuda} onSuccess={onSuccess} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
