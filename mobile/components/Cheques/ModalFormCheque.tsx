// components/modals/ModalFormCheque.tsx
import React from "react";
import {
  Modal,
  View,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import FormCheque from "./FormCheque";

interface ModalFormChequeProps {
  isOpen: boolean;
  onClose: () => void;
  setDatosCheque: (data: any) => void;
  datosCheque: any;
}

export default function ModalFormCheque({
  isOpen,
  onClose,
  setDatosCheque,
  datosCheque,
}: ModalFormChequeProps) {
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
          className="w-full"
        >
          <View
            className="w-full max-w-[380px] self-center rounded-2xl bg-white p-6"
            onStartShouldSetResponder={() => true}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <FormCheque
                onClose={onClose}
                datosCheque={datosCheque}
                setDatosCheque={setDatosCheque}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
