// components/modals/ModalResumenCaja.tsx
import React from "react";
import {
  Modal,
  View,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import CajaResumen from "../../CierreCaja/CajaResumen";

interface ModalResumenCajaProps {
  isOpen: boolean;
  idmovimiento: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ModalResumenCaja({
  isOpen,
  onClose,
  onSuccess,
  idmovimiento,
}: ModalResumenCajaProps) {
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
        className="flex-1 items-center justify-center bg-black/50 p-4"
      >
        {/* Panel: evita que el tap interno cierre el modal */}
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          className="w-full h-[80%]"
        >
          <View
            className="w-full max-w-[1380px] self-center rounded-2xl bg-white p-6"
            onStartShouldSetResponder={() => true}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <CajaResumen
                idmovimiento={idmovimiento}
                onClose={onClose}
                onSuccess={onSuccess}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
