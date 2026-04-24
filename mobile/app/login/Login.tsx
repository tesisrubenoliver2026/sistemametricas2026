// app/(auth)/Login.tsx  (o donde lo tengas)
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

import ModalError from "../../components/ModalError";
import ModalSuccess from "../../components/ModalSuccess";
import { loginUsuario } from "../../services/login";
import { useUserStore } from "../../store/useUserStore";

// Si tenés el fondo en assets, ajustá la ruta:
const bgImage = require("../../assets/background_login.png");

export default function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [modalMessage, setModalMessage] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const setUserRole = useUserStore((s) => s.setUserRole);

  const handleLogin = async () => {
    if (!login || !password) {
      setModalMessage("⚠️ Usuario y contraseña son obligatorios");
      setErrorOpen(true);
      return;
    }

    try {
      const res = await loginUsuario(login, password);
      const { acceso, login: username, token } = res.data;

      await AsyncStorage.multiSet([
        ["usuario", JSON.stringify({ acceso, username })],
        ["auth_token", token],
      ]);

      setUserRole(acceso);
      setModalMessage("✅ Bienvenido");
      setSuccessOpen(true);

      setTimeout(() => {
        router.replace("/dashboard");
      }, 800);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "❌ Error al iniciar sesión";
      setModalMessage(msg);
      setErrorOpen(true);
    }
  };

  return (
    <ImageBackground source={bgImage} resizeMode="cover" className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        className="flex-1 items-center justify-center px-4"
      >
        <View className="w-full max-w-sm rounded-lg bg-white/20 p-6 shadow-lg backdrop-blur">
          <View className="items-center mb-4">
            <Ionicons name="person-circle-outline" size={80} color="#fff" />
          </View>

          <Text className="mb-6 text-center text-2xl font-bold text-white">
            Iniciar Sesión
          </Text>

          {/* Usuario */}
          <View className="mb-4 flex-row items-center rounded-md border border-gray-200 bg-white/90">
            <View className="h-10 w-16 items-center justify-center bg-gray-200">
              <Ionicons name="person-outline" size={18} color="#374151" />
            </View>
            <TextInput
              value={login}
              onChangeText={setLogin}
              placeholder="Ej: admin"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              className="flex-1 p-2 text-gray-800"
              returnKeyType="next"
            />
          </View>

          {/* Password */}
          <View className="mb-2 flex-row items-center rounded-md border border-gray-200 bg-white/90 relative">
            <View className="h-10 w-16 items-center justify-center bg-gray-200">
              <Ionicons name="lock-closed-outline" size={18} color="#374151" />
            </View>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              className="flex-1 p-2 pr-10 text-gray-800"
              onSubmitEditing={handleLogin}
            />
            <Pressable
              onPress={() => setShowPassword((s) => !s)}
              className="absolute right-3"
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#9CA3AF"
              />
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={handleLogin}
          className="mt-4 w-[300px] rounded-md bg-white/20 py-2 active:opacity-90"
        >
          <Text className="text-center font-semibold text-white">Ingresar</Text>
        </Pressable>

        <ModalSuccess
          isOpen={successOpen}
          onClose={() => setSuccessOpen(false)}
          message={modalMessage}
        />
        <ModalError
          isOpen={errorOpen}
          onClose={() => setErrorOpen(false)}
          message={modalMessage}
        />
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
