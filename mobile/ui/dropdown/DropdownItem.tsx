// components/ui/DropdownItem.tsx
import React from "react";
import { Pressable, Text, Linking, GestureResponderEvent } from "react-native";
import { router } from "expo-router";

interface DropdownItemProps {
  tag?: "a" | "button";
  to?: string;                 // "/ruta" interna o "https://…" externa
  onClick?: () => void;
  onItemClick?: () => void;
  baseClassName?: string;      // clases NativeWind base
  className?: string;          // clases NativeWind extra
  children: React.ReactNode;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  tag = "button",
  to,
  onClick,
  onItemClick,
  baseClassName = "w-full px-4 py-2 rounded-md",
  className = "text-left bg-white text-sm text-gray-700 active:bg-gray-100",
  children,
}) => {
  const combinedClasses = `${baseClassName} ${className}`.trim();

  const isExternal = (url: string) =>
    /^(https?:\/\/|mailto:|tel:)/i.test(url);

  const handlePress = async (_e?: GestureResponderEvent) => {
    // callbacks primero (imitando el comportamiento original)
    onClick?.();
    onItemClick?.();

    if (!to) return;

    if (isExternal(to)) {
      const can = await Linking.canOpenURL(to);
      if (can) await Linking.openURL(to);
      return;
    }

    // Interno -> expo-router
    router.push(to as any);
  };

  // Si children es string, lo envolvemos en <Text> (RN no admite texto suelto en Pressable)
  const content =
    typeof children === "string" ? (
      <Text className="text-gray-700">{children}</Text>
    ) : (
      children
    );

  return (
    <Pressable
      accessibilityRole={tag === "a" || to ? "link" : "button"}
      onPress={handlePress}
      className={combinedClasses}
    >
      {content}
    </Pressable>
  );
};
