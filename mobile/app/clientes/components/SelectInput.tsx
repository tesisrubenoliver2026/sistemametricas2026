import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SelectInputProps {
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export default function SelectInput({ name, value, onChange, options, placeholder }: SelectInputProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder || 'Seleccionar...';

  const handleSelect = (optionValue: string) => {
    onChange(name, optionValue);
    setModalVisible(false);
  };

  return (
    <View>
      <Pressable
        onPress={() => setModalVisible(true)}
        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 flex-row items-center justify-between active:bg-gray-100"
      >
        <Text className={value ? "text-gray-800" : "text-gray-400"}>
          {selectedLabel}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#64748b" />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        presentationStyle={Platform.OS === 'ios' ? 'overFullScreen' : 'overFullScreen'}
        statusBarTranslucent
      >
        <Pressable
          onPress={() => setModalVisible(false)}
          className="flex-1 items-center justify-center bg-black/60"
          style={{ paddingHorizontal: 20 }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
            style={{ maxHeight: '70%' }}
          >
            {/* Header */}
            <View className="px-5 py-4 border-b border-gray-200 flex-row items-center justify-between bg-gray-50">
              <Text className="text-lg font-bold text-gray-800">{placeholder}</Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                className="h-8 w-8 items-center justify-center rounded-full bg-gray-200 active:bg-gray-300"
              >
                <Ionicons name="close" size={20} color="#64748b" />
              </Pressable>
            </View>

            {/* Options */}
            <ScrollView
              className=""
              showsVerticalScrollIndicator={false}
            >
              {options.map((opt, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => handleSelect(opt.value)}
                  className={`px-5 py-4 flex-row items-center justify-between active:bg-blue-50 ${
                    idx < options.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <Text className={`text-base ${value === opt.value ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                    {opt.label}
                  </Text>
                  {value === opt.value && (
                    <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
