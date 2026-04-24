// components/modals/ModalEditarCategoria.tsx
import React from "react";
import { Modal, View, Pressable, Platform } from "react-native";
import EditarCategoria from "../EditarCategoria";

interface ModalEditarCategoriaProps {
  id: number | string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEditarCategoria({
  id,
  isOpen,
  onClose,
  onSuccess,
}: ModalEditarCategoriaProps) {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose} // back en Android
      presentationStyle={Platform.OS === "ios" ? "overFullScreen" : undefined}
    >
      {/* Backdrop que cierra al tocar afuera */}
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/50"
      >
        {/* Panel: bloquea el cierre al interactuar adentro */}
        <View
          className="w-11/12 max-w-md rounded-2xl bg-white p-6"
          onStartShouldSetResponder={() => true}
        >
          <EditarCategoria id={id} onSuccess={onSuccess} onClose={onClose} />
        </View>
      </Pressable>
    </Modal>
  );
}
