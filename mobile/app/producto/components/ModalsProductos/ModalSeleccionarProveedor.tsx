// components/modals/ModalSeleccionarProveedor.tsx
import React from "react";
import {
  Modal,
  View,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import ListarProveedores from "../../../proveedor/components/ListarProveedores";

interface ModalSeleccionarProveedorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (proveedor: any) => void;
}

export default function ModalSeleccionarProveedor({
  isOpen,
  onClose,
  onSelect,
}: ModalSeleccionarProveedorProps) {
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
          className="w-[90%]"
        >
          <View
            className="self-center w-full max-w-md rounded-2xl bg-white p-6"
            onStartShouldSetResponder={() => true}
          >
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <ListarProveedores onSelect={onSelect} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
