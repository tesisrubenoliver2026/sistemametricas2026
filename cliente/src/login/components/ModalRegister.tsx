import RegisterUser from "./register";
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import React from 'react'

interface ModalRegistroUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;  
}

const ModalRegistroUsuario: React.FC<ModalRegistroUsuarioProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  if (!isOpen) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 flex items-center justify-center ">
          <Dialog.Panel className="w-auto h-[800px] max-w-[1390px] transform overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 p-6 text-left align-middle shadow-xl transition-all">
            {/* Componente de productos en modo selección */}
            <RegisterUser onSuccess={onSuccess}/>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ModalRegistroUsuario;
