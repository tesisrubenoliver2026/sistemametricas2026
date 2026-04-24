import {
  Modal,
  View,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import ReporteFacturador from "../ReporteFacturador";

interface ReporteData {
  titulo: string;
  total_facturadores: number;
  facturadores_activos: number;
  facturadores_culminados: number;
  total_ventas_general: number;
  monto_total_facturado: string;
  facturadores: any[];
}

interface ModalReporteFacturadoresProps {
  isOpen: boolean;
  onClose: () => void;
  reporte: ReporteData;
}

export default function ModalReporteFacturadores({
  isOpen,
  onClose,
  reporte,
}: ModalReporteFacturadoresProps) {
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
              <ReporteFacturador reporte={reporte} onClose={onClose} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
