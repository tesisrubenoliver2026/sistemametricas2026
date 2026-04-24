// components/modals/ModalListarTiposEgreso.tsx
import React from "react";
import {
  Modal,
  View,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import ListarTiposEgresoList from "../../Egreso/ListarTiposEgresoList";

interface ModalListarTiposEgresoProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (proveedor: any) => void;
}

export default function ModalListarTiposEgreso({
  isOpen,
  onClose,
  onSelect,
}: ModalListarTiposEgresoProps) {
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
            className="self-center w-full max-w-md rounded-2xl bg-white p-6"
            onStartShouldSetResponder={() => true}
          >
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {/* Listado en modo selección */}
              <ListarTiposEgresoList onSelect={onSelect} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
