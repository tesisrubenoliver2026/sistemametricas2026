import {
  Modal,
  View,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import ReporteClientes from "../ReporteClientes";

interface Cliente {
  idcliente: number;
  nombre: string;
  apellido: string;
  tipo: string;
  numDocumento: string;
  telefono: string;
  direccion: string;
  genero: string;
  estado: string;
  tipo_cliente: string;
  total_compras?: number;
}

interface ReporteData {
  clientes: Cliente[];
  estadisticas: {
    totalClientes: number;
    activos: number;
    inactivos: number;
    totalCompras: number;
  };
}

interface ModalReporteClientesProps {
  isOpen: boolean;
  onClose: () => void;
  reporte: ReporteData;
}

export default function ModalReporteClientes({
  isOpen,
  onClose,
  reporte,
}: ModalReporteClientesProps) {
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
              <ReporteClientes reporte={reporte} onClose={onClose} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
