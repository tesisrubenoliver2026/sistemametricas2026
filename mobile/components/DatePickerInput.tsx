// components/DatePickerInput.tsx
import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DatePickerInputProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function DatePickerInput({
  label,
  value,
  onChange,
  placeholder = 'Seleccionar fecha'
}: DatePickerInputProps) {
  const [show, setShow] = useState(false);

  const currentDate = value ? new Date(value) : new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate());

  const getCurrentYear = () => new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => getCurrentYear() - i);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

  const handleConfirm = () => {
    const date = new Date(selectedYear, selectedMonth, selectedDay);
    const formattedDate = date.toISOString().split('T')[0];
    onChange(formattedDate);
    setShow(false);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return placeholder;
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const clearDate = () => {
    onChange('');
    const today = new Date();
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth());
    setSelectedDay(today.getDate());
  };

  return (
    <View className="flex-1 min-w-[140px]">
      <Text className="text-xs font-medium text-gray-600 mb-2">{label}</Text>

      <View className="flex-row gap-2">
        <Pressable
          onPress={() => setShow(true)}
          className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2.5 flex-row items-center justify-between active:bg-gray-50"
        >
          <Text className={value ? "text-gray-800 text-sm" : "text-gray-400 text-sm"}>
            {formatDisplayDate(value)}
          </Text>
          <Ionicons name="calendar-outline" size={18} color="#6b7280" />
        </Pressable>

        {value && (
          <Pressable
            onPress={clearDate}
            className="bg-gray-100 active:bg-gray-200 px-3 rounded-lg items-center justify-center"
          >
            <Ionicons name="close-circle" size={20} color="#ef4444" />
          </Pressable>
        )}
      </View>

      <Modal
        visible={show}
        transparent
        animationType="fade"
        onRequestClose={() => setShow(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShow(false)}
        >
          <Pressable
            className="bg-white rounded-2xl w-[90%] max-w-[400px] p-6"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-lg font-semibold text-gray-800 mb-4">Seleccionar fecha</Text>

            <View className="flex-row gap-3 mb-4">
              {/* Selector de Día */}
              <View className="flex-1">
                <Text className="text-xs font-medium text-gray-600 mb-2">Día</Text>
                <ScrollView className="h-40 border border-gray-300 rounded-lg">
                  {days.map((day) => (
                    <Pressable
                      key={day}
                      onPress={() => setSelectedDay(day)}
                      className={`py-3 border-b border-gray-100 ${selectedDay === day ? 'bg-blue-50' : ''}`}
                    >
                      <Text className={`text-center ${selectedDay === day ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>
                        {day}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Selector de Mes */}
              <View className="flex-1">
                <Text className="text-xs font-medium text-gray-600 mb-2">Mes</Text>
                <ScrollView className="h-40 border border-gray-300 rounded-lg">
                  {MONTHS.map((month, index) => (
                    <Pressable
                      key={month}
                      onPress={() => setSelectedMonth(index)}
                      className={`py-3 border-b border-gray-100 ${selectedMonth === index ? 'bg-blue-50' : ''}`}
                    >
                      <Text className={`text-center text-xs ${selectedMonth === index ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>
                        {month}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Selector de Año */}
              <View className="flex-1">
                <Text className="text-xs font-medium text-gray-600 mb-2">Año</Text>
                <ScrollView className="h-40 border border-gray-300 rounded-lg">
                  {years.map((year) => (
                    <Pressable
                      key={year}
                      onPress={() => setSelectedYear(year)}
                      className={`py-3 border-b border-gray-100 ${selectedYear === year ? 'bg-blue-50' : ''}`}
                    >
                      <Text className={`text-center ${selectedYear === year ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>
                        {year}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShow(false)}
                className="flex-1 bg-gray-100 active:bg-gray-200 py-3 rounded-lg"
              >
                <Text className="text-center font-semibold text-gray-700">Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={handleConfirm}
                className="flex-1 bg-blue-600 active:bg-blue-700 py-3 rounded-lg"
              >
                <Text className="text-center font-semibold text-white">Confirmar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
