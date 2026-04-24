// components/modals/ModalsCrearFacturador.tsx
import React from "react";
import {
  Modal,
  View,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import CrearDatosFacturador from "../CrearFacturador";

interface ModalsCrearFacturadorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalsCrearFacturador({
  isOpen,
  onClose,
  onSuccess,
}: ModalsCrearFacturadorProps) {
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
            <View className="flex-1 px-6 pt-6 pb-4">
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                <CrearDatosFacturador onSuccess={onSuccess} onClose={onClose} />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
