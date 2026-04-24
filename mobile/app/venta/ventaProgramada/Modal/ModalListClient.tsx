// components/modals/ModalListClient.tsx
import React from "react";
import {
  Modal,
  View,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import ListarCliente from "../../../clientes/components/ListarCliente";

interface ModalListClientProps {
  isOpen: boolean;
  onClose: () => void;
  isReportGenerated?: boolean;
  onReportGenerated?: (idcliente: number) => void;
}

export default function ModalListClient({
  isOpen,
  onClose,
  isReportGenerated = false,
  onReportGenerated = () => {},
}: ModalListClientProps) {
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
        className="flex-1 items-center justify-center bg-black/30 p-4"
      >
        {/* Panel: evita que el tap interno cierre el modal */}
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          className="w-full"
        >
          <View
            className="w-full max-w-[980px] self-center rounded-2xl bg-white p-6"
            onStartShouldSetResponder={() => true}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <ListarCliente
                isReportGenerated={isReportGenerated}
                onReportGenerated={onReportGenerated}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
