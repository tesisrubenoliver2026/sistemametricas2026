// components/modals/ModalAdvert.tsx
import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ModalAdvertProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  onConfirm?: () => void;
  confirmButtonText?: string;
}

export default function ModalAdvert({
  isOpen,
  onClose,
  message,
  onConfirm,
  confirmButtonText = "Confirmar",
}: ModalAdvertProps) {
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
          className="w-11/12 max-w-sm self-center rounded-2xl bg-white p-6"
          onStartShouldSetResponder={() => true}
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="warning-outline" size={24} color="#eab308" />
            <Text className="text-lg font-semibold">Advertencia</Text>
          </View>

          <Text className="mt-4 text-sm text-gray-700">{message}</Text>

          <View className="mt-6 flex-row justify-end gap-3">
            <Pressable
              onPress={onClose}
              className="rounded bg-gray-100 px-4 py-2"
            >
              <Text className="text-gray-700">Cerrar</Text>
            </Pressable>

            {onConfirm && (
              <Pressable
                onPress={onConfirm}
                className="rounded bg-yellow-500 px-4 py-2"
              >
                <Text className="text-white">{confirmButtonText}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
