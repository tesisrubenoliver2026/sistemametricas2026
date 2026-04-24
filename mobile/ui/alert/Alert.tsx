// components/ui/Alert.tsx
import React from "react";
import { View, Text, Pressable, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface AlertProps {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  showLink?: boolean;
  linkHref?: string;
  linkText?: string;
}

const VARIANT_STYLES: Record<
  AlertProps["variant"],
  { container: string; iconColor: string; iconName: keyof typeof Ionicons.glyphMap }
> = {
  success: {
    container: "border-green-500 bg-green-50",
    iconColor: "#22C55E",
    iconName: "checkmark-circle",
  },
  error: {
    container: "border-red-500 bg-red-50",
    iconColor: "#EF4444",
    iconName: "alert-circle",
  },
  warning: {
    container: "border-amber-500 bg-amber-50",
    iconColor: "#F59E0B",
    iconName: "warning",
  },
  info: {
    container: "border-sky-500 bg-sky-50",
    iconColor: "#0EA5E9",
    iconName: "information-circle",
  },
};

export default function Alert({
  variant,
  title,
  message,
  showLink = false,
  linkHref = "#",
  linkText = "Learn more",
}: AlertProps) {
  const { container, iconColor, iconName } = VARIANT_STYLES[variant];

  const handlePressLink = async () => {
    if (!linkHref || linkHref === "#") return;
    if (linkHref.startsWith("/")) {
      router.push(linkHref as any);
    } else {
      const can = await Linking.canOpenURL(linkHref);
      if (can) Linking.openURL(linkHref);
    }
  };

  return (
    <View className={`rounded-xl border p-4 ${container}`}>
      <View className="flex-row items-start gap-3">
        <View className="-mt-0.5">
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>

        <View className="flex-1">
          <Text className="mb-1 text-sm font-semibold text-gray-800">
            {title}
          </Text>
          <Text className="text-sm text-gray-600">{message}</Text>

          {showLink && (
            <Pressable onPress={handlePressLink} className="mt-3">
              <Text className="text-sm font-medium text-gray-600 underline">
                {linkText}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
