import React from "react";
import { Modal, View, Text, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ModalSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const ModalSuccess = ({ isOpen, onClose, message }: ModalSuccessProps) => {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
      presentationStyle={Platform.OS === "ios" ? "overFullScreen" : undefined}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/50"
      >
        <View
          className="w-11/12 max-w-sm rounded-lg bg-white p-6 shadow-lg"
          onStartShouldSetResponder={() => true}
        >
          <View className="items-center mb-4">
            <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
          </View>

          <Text className="text-xl font-semibold text-gray-800 text-center">
            {message}
          </Text>

          <Pressable
            onPress={onClose}
            className="mt-6 rounded bg-green-600 px-4 py-2 active:opacity-90"
          >
            <Text className="text-center text-white font-medium">Cerrar</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default ModalSuccess;
