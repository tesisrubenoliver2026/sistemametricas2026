// components/modals/ModalCrearCategoria.tsx
import React from "react";
import { Modal, View, Pressable, Platform } from "react-native";
import CrearCategoria from "../CrearCategoria";

interface ModalCrearCategoriaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalCrearCategoria({
  isOpen,
  onClose,
  onSuccess,
}: ModalCrearCategoriaProps) {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose} // botón back en Android
      presentationStyle={Platform.OS === "ios" ? "overFullScreen" : undefined}
    >
      {/* Backdrop */}
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/50"
      >
        {/* Evita que al tocar el panel se cierre por el Pressable padre */}
        <View
          className="w-11/12 max-w-md rounded-2xl bg-white p-6"
          // detener propagación
          onStartShouldSetResponder={() => true}
        >
          <CrearCategoria onSuccess={onSuccess} onClose={onClose} />
        </View>
      </Pressable>
    </Modal>
  );
}
