// components/modals/ModalEditarCliente.tsx
import React from "react";
import {
  Modal,
  View,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import EditarCliente from "../EditarCliente";

interface ModalEditarClienteProps {
  id: number | string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEditarCliente({
  id,
  isOpen,
  onClose,
  onSuccess,
}: ModalEditarClienteProps) {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
      presentationStyle={Platform.OS === "ios" ? "overFullScreen" : undefined}
    >
      {/* Backdrop */}
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-end bg-black/50"
      >
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: "height" })}
          className="w-full"
        >
          {/* Panel del modal con altura máxima */}
          <View
            className="w-full bg-white rounded-t-3xl"
            style={{ maxHeight: '90%' }}
            onStartShouldSetResponder={() => true}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              className="px-6 pt-6 pb-4"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <EditarCliente id={id} onSuccess={onSuccess} onClose={onClose} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
