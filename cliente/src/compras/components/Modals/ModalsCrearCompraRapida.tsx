'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import CrearCompraRapida from '../CompraRapida/CrearCompraRapida';
import { styleBoxModal } from '../../../components/utils/stylesGral';

interface ModalCrearCrearCompraRapidaProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;   
}

const ModalCrearCompraRapida = ({ isOpen, onClose, onSuccess }: ModalCrearCrearCompraRapidaProps) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <div className="fixed inset-0 flex items-center justify-center 2xl:justify-center xl:justify-end md:justify-end">
                    <Dialog.Panel className={styleBoxModal}>
                        <CrearCompraRapida onSuccess={onSuccess} onClose={onClose} />
                    </Dialog.Panel>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ModalCrearCompraRapida;
