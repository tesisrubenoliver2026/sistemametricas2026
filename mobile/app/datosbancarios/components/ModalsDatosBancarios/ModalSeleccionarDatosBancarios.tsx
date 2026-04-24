// components/modals/ModalSeleccionarDatosBancarios.tsx
import React from "react";
import {
  Modal,
  View,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import ListarDatosBancarios from "../ListarDatosBancarios";

interface ModalSeleccionarDatosBancariosProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (categoria: any) => void;
}

export default function ModalSeleccionarDatosBancarios({
  isOpen,
  onClose,
  onSelect,
}: ModalSeleccionarDatosBancariosProps) {
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
        className="flex-1 items-center justify-center bg-black/50 p-5"
      >
        {/* Panel: evita que el tap interno cierre el modal */}
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: "height" })}
          className="w-full max-h-[90%]"
        >
          <View
            className="w-full h-full bg-white rounded-3xl overflow-hidden"
            onStartShouldSetResponder={() => true}
          >
            <ListarDatosBancarios onSelect={onSelect} />
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
