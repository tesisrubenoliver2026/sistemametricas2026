import {
  Modal,
  View,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import ReporteProveedor from "../ReporteProveedor";

interface Proveedor {
  idproveedor: number;
  nombre: string;
  telefono: string;
  email: string;
  ruc: string;
  razon: string;
  total_compras: number;
}

interface ReporteData {
  proveedores: Proveedor[];
  estadisticas: {
    total_proveedores: number;
    total_compras_monto: number;
  };
}

interface ModalReporteProveedoresProps {
  isOpen: boolean;
  onClose: () => void;
  reporte: ReporteData;
}

export default function ModalReporteProveedores({
  isOpen,
  onClose,
  reporte,
}: ModalReporteProveedoresProps) {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
      presentationStyle={Platform.OS === "ios" ? "overFullScreen" : undefined}
    >
      {/* Backdrop */}
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/50 p-5"
      >
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: "height" })}
          className="w-full max-h-[90%]"
        >
          {/* Panel del modal con altura máxima */}
          <View
            className="w-full h-full bg-white rounded-3xl overflow-hidden"
            onStartShouldSetResponder={() => true}
          >
            <View className="flex-1 px-6 pt-6 pb-4">
              <ReporteProveedor reporte={reporte} onClose={onClose} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
