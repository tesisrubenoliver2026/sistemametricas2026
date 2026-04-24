// components/modals/ModalError.tsx
import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ProductoRow = string | { nombre_producto?: string; error?: string };

interface ModalErrorProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  showTable?: boolean;
  productos?: ProductoRow[];
}

export default function ModalError({
  isOpen,
  onClose,
  message,
  showTable = false,
  productos = [],
}: ModalErrorProps) {


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
        className="flex-1 items-center justify-center bg-black/50"
      >
        {/* Panel: evita que el tap interno cierre el modal */}
        <View
          className="w-11/12 max-w-[600px] self-center rounded-2xl bg-white p-6"
          onStartShouldSetResponder={() => true}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="alert-circle-outline" size={22} color="#dc2626" />
            <Text className="text-lg font-semibold">Error</Text>
          </View>

          <Text className="mt-2 text-sm text-gray-700">{message}</Text>

          {showTable && (
            <View className="mt-4 rounded-lg border border-gray-200 overflow-hidden">
              {/* Encabezado */}
              <View className="flex-row bg-gray-100">
                <Text className="flex-1 px-4 py-3 font-semibold text-gray-700">
                  Producto
                </Text>
                <Text className="flex-1 px-4 py-3 font-semibold text-gray-700">
                  Estado
                </Text>
              </View>

              {/* Filas (scroll si crece) */}
              <ScrollView className="max-h-64">
                {productos.length === 0 ? (
                  <View className="px-4 py-4">
                    <Text className="text-center text-gray-500">
                      No hay productos duplicados
                    </Text>
                  </View>
                ) : (
                  productos.map((producto, idx) => {
                    const nombre =
                      typeof producto === "string"
                        ? producto
                        : producto.nombre_producto ?? "—";
                    const estado =
                      typeof producto === "string"
                        ? "Producto duplicado"
                        : producto.error ?? "—";

                    return (
                      <View
                        key={`${nombre}-${idx}`}
                        className="flex-row items-start border-t border-gray-200"
                      >
                        <Text className="flex-1 px-4 py-3">{nombre}</Text>
                        <Text className="flex-1 px-4 py-3 text-red-600 font-medium">
                          {estado}
                        </Text>
                      </View>
                    );
                  })
                )}
              </ScrollView>
            </View>
          )}

          <View className="mt-4 flex-row justify-end">
            <Pressable
              onPress={onClose}
              className="rounded bg-red-600 px-4 py-2"
            >
              <Text className="text-white">Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
