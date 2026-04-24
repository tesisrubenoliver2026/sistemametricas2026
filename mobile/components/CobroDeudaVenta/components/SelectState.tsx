// components/ui/SelectState.tsx
import React, { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  FlatList,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface Option {
  id: string;
  name: string;
  disabled?: boolean;
}

interface SelectStateProps {
  value?: Option | null;
  onChange: (option: Option | null) => void;
  options: Option[];
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  widthClassName?: string; // opcional: override de ancho del botón
}

const sizeStyles = {
  sm: { btn: "py-1.5 pl-3 pr-8 text-sm", icon: 16 as const, chevronTop: 8 },
  md: { btn: "py-2 pl-3 pr-10 text-sm", icon: 20 as const, chevronTop: 10 },
  lg: { btn: "py-2.5 pl-3 pr-10 text-base", icon: 20 as const, chevronTop: 12 },
};

export default function SelectState({
  value = null,
  onChange,
  options,
  placeholder = "Seleccionar…",
  label,
  helperText,
  error,
  disabled = false,
  fullWidth = false,
  size = "md",
  className,
  widthClassName,
}: SelectStateProps) {
  const [open, setOpen] = useState(false);
  const sz = sizeStyles[size];
  const containerWidth = fullWidth ? "w-full" : widthClassName ?? "w-48";
  const data = useMemo(() => options ?? [], [options]);
  const selectedId = value?.id ?? null;

  const openIfEnabled = () => {
    if (!disabled) setOpen(true);
  };

  const handleClear = () => {
    if (!disabled) onChange(null);
  };

  const handleSelect = (opt: Option) => {
    if (opt.disabled) return;
    onChange(opt);
    setOpen(false);
  };

  return (
    <View className={`flex flex-col gap-1 ${containerWidth} ${className ?? ""}`}>
      {label ? <Text className="text-sm font-medium text-gray-700">{label}</Text> : null}

      {/* Botón */}
      <Pressable
        onPress={openIfEnabled}
        disabled={disabled}
        className={`relative rounded-md border bg-white shadow-sm ${sz.btn} ${
          disabled ? "opacity-60" : ""
        } ${error ? "border-red-300" : "border-gray-300"}`}
      >
        <Text
          className={`${
            value ? "text-gray-700" : "text-gray-400"
          }`}
          numberOfLines={1}
        >
          {value ? value.name : placeholder}
        </Text>

        {/* Limpiar */}
        {value && !disabled && (
          <Pressable
            onPress={handleClear}
            hitSlop={8}
            style={{ position: "absolute", right: 32, top: sz.chevronTop }}
          >
            <Ionicons name="close" size={sz.icon} color="#9ca3af" />
          </Pressable>
        )}

        {/* Chevron */}
        <Ionicons
          name="chevron-down"
          size={sz.icon}
          color="#9ca3af"
          style={{ position: "absolute", right: 8, top: sz.chevronTop }}
        />
      </Pressable>

      {/* Helper / Error */}
      {error ? (
        <Text className="text-sm text-red-600">{error}</Text>
      ) : helperText ? (
        <Text className="text-xs text-gray-500">{helperText}</Text>
      ) : null}

      {/* Modal de opciones */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
        presentationStyle={Platform.OS === "ios" ? "overFullScreen" : undefined}
      >
        {/* Backdrop */}
        <Pressable
          onPress={() => setOpen(false)}
          className="flex-1 items-center justify-center bg-black/30 p-4"
        >
          {/* Panel */}
          <View
            className={`rounded-md bg-white shadow-lg ring-1 ring-black/5 ${
              fullWidth ? "w-64" : "w-48"
            }`}
            onStartShouldSetResponder={() => true}
          >
            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 240 }}
              ListEmptyComponent={
                <View className="px-3 py-2">
                  <Text className="text-center text-sm text-gray-500">
                    Sin opciones
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const selected = item.id === selectedId;
                return (
                  <Pressable
                    disabled={item.disabled}
                    onPress={() => handleSelect(item)}
                    className={`flex-row items-center px-3 py-2 ${
                      selected ? "bg-green-50" : "bg-white"
                    } ${item.disabled ? "opacity-50" : ""}`}
                  >
                    <Text
                      className={`flex-1 text-sm ${
                        selected ? "text-green-900 font-medium" : "text-gray-900"
                      }`}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    {selected ? (
                      <Ionicons name="checkmark" size={16} color="#16a34a" />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
