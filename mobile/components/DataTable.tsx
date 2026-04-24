import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';

interface Column {
  key: string;
  title: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  keyExtractor: (item: any) => string | number;
}

export default function DataTable({ columns, data, keyExtractor }: DataTableProps) {
  return (
    <ScrollView horizontal className="rounded-xl shadow border border-gray-200 bg-white">
      <View>
        {/* Header */}
        <View className="flex-row bg-gray-100 border-b border-gray-200">
          {columns.map((col) => (
            <Text
              key={col.key}
              className={`px-4 py-3 text-xs font-semibold text-gray-600 uppercase ${
                col.width ? `w-${col.width}` : 'flex-1'
              } ${
                col.align === 'center' ? 'text-center' :
                col.align === 'right' ? 'text-right' : 'text-left'
              }`}
              style={{ minWidth: col.width || 100 }}
            >
              {col.title}
            </Text>
          ))}
        </View>

        {/* Body */}
        {data.map((row, idx) => (
          <View
            key={keyExtractor(row)}
            className={`flex-row border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
          >
            {columns.map((col) => (
              <View
                key={`${keyExtractor(row)}-${col.key}`}
                className={`px-4 py-3 ${col.width ? `w-${col.width}` : 'flex-1'} justify-center ${
                  col.align === 'center' ? 'items-center' :
                  col.align === 'right' ? 'items-end' : 'items-start'
                }`}
                style={{ minWidth: col.width || 100 }}
              >
                {col.render ? (
                  col.render(row[col.key], row)
                ) : (
                  <Text className="text-sm text-gray-700">{row[col.key]}</Text>
                )}
              </View>
            ))}
          </View>
        ))}

        {data.length === 0 && (
          <View className="py-8">
            <Text className="text-center text-gray-500">No hay datos para mostrar</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// Componente de Paginación
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({ currentPage, totalPages, onPageChange, disabled }: PaginationProps) {
  return (
    <View className="flex-row justify-between items-center mt-6">
      <Pressable
        onPress={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1 || disabled}
        className={`bg-blue-500 px-5 py-2 rounded-md shadow active:opacity-90 ${
          (currentPage === 1 || disabled) ? 'opacity-50' : ''
        }`}
      >
        <Text className="text-white font-medium">⬅ Anterior</Text>
      </Pressable>

      <Text className="text-sm text-gray-600">
        Página <Text className="font-bold">{currentPage}</Text> de <Text className="font-bold">{totalPages}</Text>
      </Text>

      <Pressable
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || disabled}
        className={`bg-blue-500 px-5 py-2 rounded-md shadow active:opacity-90 ${
          (currentPage >= totalPages || disabled) ? 'opacity-50' : ''
        }`}
      >
        <Text className="text-white font-medium">Siguiente ➡</Text>
      </Pressable>
    </View>
  );
}

// Componente Select/Picker simple
interface SelectOption {
  label: string;
  value: any;
}

interface SelectProps {
  value: any;
  options: SelectOption[];
  onChange: (value: any) => void;
  placeholder?: string;
}

export function Select({ value, options, onChange, placeholder }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <View className="relative">
      <Pressable
        onPress={() => setIsOpen(!isOpen)}
        className="text-sm px-4 py-2 border border-gray-300 rounded-md bg-white flex-row items-center justify-between min-w-[140px]"
      >
        <Text className="text-sm text-gray-700">
          {selectedOption?.label || placeholder || 'Seleccionar...'}
        </Text>
        <Text className="text-gray-500 ml-2">▼</Text>
      </Pressable>

      {isOpen && (
        <View className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50">
          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`px-4 py-2 border-b border-gray-100 active:bg-gray-100 ${
                option.value === value ? 'bg-blue-50' : ''
              }`}
            >
              <Text className="text-sm text-gray-700">{option.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
