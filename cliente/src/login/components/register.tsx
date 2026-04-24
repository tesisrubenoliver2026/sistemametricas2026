import React, { useState } from "react";
import { crearUsuario } from "../../services/usuarios";
import ModalSuccess from "../../components/ModalSuccess";
import ModalAdvert from "../../components/ModalAdvert";
import ModalError from "../../components/ModalError";
import { FaUsers } from "react-icons/fa";
import PhoneField from "./PhoneField";

interface RegisterUser {
  login: string;
  password: string;
  acceso: string;
  estado: string;
  nombre: string;
  apellido: string;
  telefono: string;
}

const initialValue: RegisterUser = {
  login: "",
  password: "",
  acceso: "",
  estado: "",
  nombre: "",
  apellido: "",
  telefono: "",
};

interface RegistrarUser {
  onSuccess?: () => void;
}

const RegisterUser: React.FC<RegistrarUser> = ({ onSuccess }) => {
  const [registerUser, setRegisterUser] = useState<RegisterUser>(initialValue);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAdvertModal, setShowAdvertModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setRegisterUser((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const required = [
      ["login", "nombre de usuario"],
      ["password", "contraseña"],
      ["nombre", "nombre"],
      ["apellido", "apellido"],
      ["telefono", "teléfono"],
    ];
    for (const [key, label] of required) {
      if (!registerUser[key as keyof RegisterUser]?.trim()) {
        setModalMessage(`Por favor, ingrese ${label}`);
        setShowAdvertModal(true);
        return false;
      }
    }
    if (registerUser.password.length < 6) {
      setModalMessage("La contraseña debe tener al menos 6 caracteres");
      setShowAdvertModal(true);
      return false;
    }
    return true;
  };

  const postRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      setRegisterUser((prev) => ({ ...prev, acceso: "Administrador", estado: "activo" }));
      await crearUsuario(registerUser);
      setModalMessage("Usuario creado correctamente");
      setShowSuccessModal(true);
      setRegisterUser(initialValue);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Error al crear el usuario. Intente nuevamente.";
      setModalMessage(errorMessage);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setTimeout(() => onSuccess?.(), 300);
  };

  const labelStyle = "block mb-2 text-sm font-bold text-white ";
  const inputStyle = "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
  return (
    <>
      <div className=" flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 px-4 py-5 rounded-md">
        <div
          className="relative bg-white/15 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.2)] max-w-lg w-full p-10 border border-white/30"
        >
          {/* Logo */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 p-[3px] rounded-full">
            <div className=" p-3 rounded-full border-4 border-white ">
              <FaUsers className="text-white text-4xl"/>
            </div>
          </div>

          {/* Título */}
          <div className="text-center mt-6 mb-8">
            <h2 className="text-3xl font-extrabold text-white drop-shadow-md">
              Crear Usuario
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Complete los campos para registrar un nuevo usuario
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={postRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className={labelStyle}>
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={registerUser.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Juan"
                  required
                  className={inputStyle}
                />
              </div>

              {/* Apellido */}
              <div>
                <label className={labelStyle}>
                  Apellido
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={registerUser.apellido}
                  onChange={handleChange}
                  placeholder="Ej: Pérez"
                  required
                  className={inputStyle}
                />
              </div>
            </div>

            {/* Usuario */}
            <div>
              <label className={labelStyle}>
                Usuario
              </label>
              <input
                type="text"
                name="login"
                value={registerUser.login}
                onChange={handleChange}
                placeholder="Nombre de usuario"
                required
                className={inputStyle}
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className={labelStyle}>
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={registerUser.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                required
                className={inputStyle}
              />
            </div>

            {/* Teléfono */}
            <div>
          
              <PhoneField
                value={registerUser.telefono}
                onChange={(phone) =>
                  setRegisterUser((prev) => ({
                    ...prev,
                    telefono: phone || "", 
                  }))
                }
              />

            </div>
            <button
              disabled={loading}
              type="submit"
              className={`w-full mt-6 py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg ${loading
                  ? "bg-blue-600/70 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
                }`}
            >
              {loading ? "Guardando..." : "Registrar Usuario"}
            </button>
          </form>
        </div>
      </div>

      {/* Modales */}
      <ModalSuccess
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        message={modalMessage}
      />
      <ModalAdvert
        isOpen={showAdvertModal}
        onClose={() => setShowAdvertModal(false)}
        message={modalMessage}
      />
      <ModalError
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={modalMessage}
      />
    </>
  );
};

export default RegisterUser;
