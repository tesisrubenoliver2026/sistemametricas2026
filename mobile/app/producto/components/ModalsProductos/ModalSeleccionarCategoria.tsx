// components/modals/ModalSeleccionarCategoria.tsx
import React from "react";
import {
  Modal,
  View,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import ListarCategorias from "../../../categoria/components/ListarCategorias";

interface ModalSeleccionarCategoriaProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (categoria: any) => void;
}

export default function ModalSeleccionarCategoria({
  isOpen,
  onClose,
  onSelect,
}: ModalSeleccionarCategoriaProps) {
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
        className="flex-1 items-center justify-center bg-black/30 p-4"
      >
        {/* Panel: evita que el tap interno cierre el modal */}
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          className="w-full"
        >
          <View
            className="self-center w-full max-w-md rounded-2xl bg-white p-6"
            onStartShouldSetResponder={() => true}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <ListarCategorias onSelect={onSelect} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
