import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { CheckCircle } from 'lucide-react-native';

// Props para el componente Toggle
interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
  description: string;
}

// Props para el componente Input
interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  helperText?: string;
  icon?: React.ComponentType<any>;
}

// Props para el componente Section
interface SectionProps {
  title: string;
  icon?: React.ComponentType<any>;
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente Toggle para alternar entre estados activo/inactivo
 */
export const Toggle = ({ value, onValueChange, label, description }: ToggleProps) => (
  <TouchableOpacity
    onPress={() => onValueChange(!value)}
    className="flex-row items-start p-4 bg-gray-50 rounded-xl mb-3 active:bg-gray-100"
  >
    <View className={`w-6 h-6 rounded-lg mr-3 border-2 flex items-center justify-center mt-0.5 ${
      value ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'
    }`}>
      {value && <CheckCircle size={14} color="white" />}
    </View>
    <View className="flex-1">
      <Text className="text-base font-semibold text-gray-900 mb-1">
        {label}
      </Text>
      <Text className="text-sm text-gray-600 leading-5">
        {description}
      </Text>
    </View>
  </TouchableOpacity>
);

/**
 * Componente Input con icono opcional y texto de ayuda
 */
export const Input = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  secureTextEntry, 
  keyboardType, 
  autoCapitalize, 
  helperText, 
  icon: Icon 
}: InputProps) => (
  <View className="mb-4">
    <Text className="text-sm font-semibold text-gray-700 mb-2 flex-row items-center">
      {Icon && <Icon size={16} color="#374151" className="mr-1" />}
      {label}
    </Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      className="w-full border border-gray-300 px-4 py-3 rounded-xl bg-white text-base"
      placeholderTextColor="#9CA3AF"
    />
    {helperText && (
      <Text className="text-xs text-gray-500 mt-1">{helperText}</Text>
    )}
  </View>
);

/**
 * Componente Section para agrupar contenido relacionado
 */
export const Section = ({ title, icon: Icon, children, className = '' }: SectionProps) => (
  <View className={`border border-gray-200 rounded-2xl bg-white p-4 mb-4 ${className}`}>
    <View className="flex-row items-center mb-4">
      {Icon && <Icon size={20} color="#374151" className="mr-2" />}
      <Text className="text-lg font-bold text-gray-800">{title}</Text>
    </View>
    {children}
  </View>
);

/**
 * Exportación por defecto con todos los componentes
 */
export default {
  Toggle,
  Input,
  Section
};