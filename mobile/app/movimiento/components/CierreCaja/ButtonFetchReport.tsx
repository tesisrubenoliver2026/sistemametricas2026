// components/modals/ModalButtonFetch.tsx
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { shareAsync } from "expo-sharing";

import { getIngresosPorMovimiento, getIngresosyEgresosPorMovimiento } from "../../../../services/ingreso";
import { getEgresosPorMovimiento } from "../../../../services/egreso";

interface ModalButtonFetchProps {
  idMovimiento: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalButtonFetch({
  idMovimiento,
  isOpen,
  onClose,
}: ModalButtonFetchProps) {
  const [loading, setLoading] = useState<null | "ingreso" | "egreso" | "resumen">(null);

  const openPdfBase64 = async (base64: string) => {
    try {
      if (Platform.OS === "web") {
        const url = `data:application/pdf;base64,${base64}`;
        const win = window.open(url, "_blank");
        if (!win) alert("Habilitá los pop-ups para ver el PDF.");
        return;
      }
      const path = FileSystem.cacheDirectory + `reporte-${Date.now()}.pdf`;
      await FileSystem.writeAsStringAsync(path, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await shareAsync(path, {
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
        dialogTitle: "Abrir reporte",
      });
    } catch (e) {
      console.error("Error abriendo PDF:", e);
    }
  };

  const handleFetch =
    (tipo: "ingreso" | "egreso" | "resumen") => async (id: number) => {
      try {
        setLoading(tipo);
        let res: any;
        if (tipo === "ingreso") res = await getIngresosPorMovimiento(id);
        else if (tipo === "egreso") res = await getEgresosPorMovimiento(id);
        else res = await getIngresosyEgresosPorMovimiento(id);

        const base64: string | undefined = res?.data?.comprobanteBase64;
        if (base64) {
          await openPdfBase64(base64);
        } else {
          alert("No se encontró el comprobante.");
        }
      } catch (err) {
        console.error("Error al generar el reporte:", err);
        alert("Ocurrió un error al generar el reporte.");
      } finally {
        setLoading(null);
      }
    };

  const baseBtn =
    "w-full flex-row items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium shadow active:scale-95";

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
      presentationStyle={Platform.OS === "ios" ? "overFullScreen" : undefined}
    >
      {/* Backdrop: cierra al tocar afuera */}
      <Pressable onPress={onClose} className="flex-1 items-center justify-center bg-black/40 p-4">
        {/* Panel: evita que el tap interno cierre el modal */}
        <View
          className="w-full max-w-md self-center rounded-2xl bg-white p-6"
          onStartShouldSetResponder={() => true}
        >
          <Text className="mb-4 text-lg font-semibold text-gray-800">
            Generar reporte
          </Text>

          <View className="space-y-3">
            {/* INGRESOS */}
            <Pressable
              className={`${baseBtn} bg-emerald-600 ${loading === "ingreso" ? "opacity-70" : ""}`}
              onPress={() => handleFetch("ingreso")(idMovimiento)}
              disabled={!!loading}
            >
              <Ionicons name="cash-outline" size={18} color="#fff" />
              <Text className="text-white">
                {loading === "ingreso" ? "Generando..." : "Movimientos Ingresos"}
              </Text>
            </Pressable>

            {/* EGRESOS */}
            <Pressable
              className={`${baseBtn} bg-rose-600 ${loading === "egreso" ? "opacity-70" : ""}`}
              onPress={() => handleFetch("egreso")(idMovimiento)}
              disabled={!!loading}
            >
              <Ionicons name="trending-down-outline" size={18} color="#fff" />
              <Text className="text-white">
                {loading === "egreso" ? "Generando..." : "Movimientos Egresos"}
              </Text>
            </Pressable>

            {/* RESUMEN */}
            <Pressable
              className={`${baseBtn} bg-indigo-600 ${loading === "resumen" ? "opacity-70" : ""}`}
              onPress={() => handleFetch("resumen")(idMovimiento)}
              disabled={!!loading}
            >
              <Ionicons name="swap-horizontal-outline" size={18} color="#fff" />
              <Text className="text-white">
                {loading === "resumen" ? "Generando..." : "Movimientos Resumen"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
