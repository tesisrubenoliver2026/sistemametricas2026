// components/modals/ModalListarClienteDVenta.tsx
import React from "react";
import {
  Modal,
  View,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import ListarClienteDVenta from "../CobroDeudaVenta/ListarClienteDVenta";
import ListarProveedores from "app/proveedor/components/ListarProveedores";
interface ModalListarClienteDVentaProps {
  isOpen: boolean;
  onClose: () => void;
  nombreCliente: string;

  disableSearch?: boolean;
  setEstadoCliente?: (estado: string) => void;
  generateReport?: () => void;
}

export default function ModalListarClienteDVenta({
  isOpen,
  onClose,
  nombreCliente,
  disableSearch = false,
  setEstadoCliente,
  generateReport,
}: ModalListarClienteDVentaProps) {
  console.log("ModalListarClienteDVenta renderizado", nombreCliente);
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
        className=" flex-1 items-center justify-center bg-black/50 p-4"
      >
        {/* Panel: evita que el tap interno cierre el modal */}
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          className="w-full"
        >
          <View
            className="w-full max-w-[1200px] max-h-[85%] rounded-2xl bg-white overflow-hidden"
            onStartShouldSetResponder={() => true}
          >
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            <ListarClienteDVenta
                nombreCliente={nombreCliente}
                disableSearch={disableSearch}
                setEstadoCliente={setEstadoCliente}
                generateReport={generateReport}
              />

            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
