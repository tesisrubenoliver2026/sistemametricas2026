// components/modals/ModalDetallePagoDeuda.tsx
import React from "react";
import {
  Modal,
  View,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import DetallePagoDeudas from "./DetallePagoDeudas";

interface ModalDetallePagoDeudaProps {
  isOpen: boolean;
  onClose: () => void;
  pago: any;
}

export default function ModalDetallePagoDeuda({
  isOpen,
  onClose,
  pago,
}: ModalDetallePagoDeudaProps) {
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
        className="flex-1 items-center justify-center bg-black/20 p-4"
      >
        {/* Panel: evita que el tap interno cierre el modal */}
        <View
          className="w-full max-w-[680px] self-center rounded-2xl bg-white p-6"
          onStartShouldSetResponder={() => true}
        >
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <DetallePagoDeudas pago={pago} />
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}
