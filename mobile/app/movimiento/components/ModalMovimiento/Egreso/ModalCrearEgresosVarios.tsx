// components/modals/ModalCrearEgresosVarios.tsx
import React from "react";
import {
  Modal,
  View,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import CrearEgresosVarios from "../../Egreso/CrearEgresosVarios";

interface ModalCrearEgresosVariosProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ModalCrearEgresosVarios({
  isOpen,
  onClose,
  onSuccess,
}: ModalCrearEgresosVariosProps) {
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
            className="self-center rounded-2xl bg-white p-6"
            onStartShouldSetResponder={() => true}
          >
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <CrearEgresosVarios onSuccess={onSuccess} onClose={onClose} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
