// components/modals/ModalFormTarjeta.tsx
import React from "react";
import {
  Modal,
  View,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import FormTarjeta from "./FormTarjeta";

interface ModalFormTarjetaProps {
  isOpen: boolean;
  onClose: () => void;
  setDatosTarjeta: (data: any) => void;
  datosTarjeta: any;
}

export default function ModalFormTarjeta({
  isOpen,
  onClose,
  setDatosTarjeta,
  datosTarjeta,
}: ModalFormTarjetaProps) {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose} // back en Android
      presentationStyle={Platform.OS === "ios" ? "overFullScreen" : undefined}
    >
      {/* Backdrop: toca afuera para cerrar */}
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/50 p-4"
      >
        {/* Panel: evita que el tap interno cierre el modal */}
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          className="w-full"
        >
          <View
            className="w-full max-w-[380px] self-center rounded-2xl bg-white p-6"
            onStartShouldSetResponder={() => true}
          >
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <FormTarjeta
                onClose={onClose}
                datosTarjeta={datosTarjeta}
                setDatosTarjeta={setDatosTarjeta}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
