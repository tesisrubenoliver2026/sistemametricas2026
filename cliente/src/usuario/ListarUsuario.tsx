'use client';

import { useEffect, useState } from 'react';
import { FaUser, FaSearch, FaEdit, FaTrash, FaUserShield, FaInfoCircle } from 'react-icons/fa';
import ModalCrearUsuario from './Modals/ModalCrearUsuario';
import ModalEditarUsuario from './Modals/ModalEditarUsuario';
import { getUsuariosPaginated, deleteUsuario } from '../services/usuarios';
import ModalAdvert from '../components/ModalAdvert';
import ModalSuccess from '../components/ModalSuccess';
import ModalError from '../components/ModalError';
import SelectPage from '../components/SelectPage';
import ButtonGrid from '../components/ButtonGrid';
import SelectPagination from '../components/SelectPagination';
import ButtonGral from '../components/ButtonGral';
import { styleCardSmall, styleSearchDark, styleTxtCards, styleTxtLabelBold } from '../components/utils/stylesGral';
import CardText from '../ventas/components/CobroDeudaVenta/components/CardText';
import { renderTitle } from '../clientes/utils/utils';


const ListarUsuarios = () => {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [modalEditarOpen, setModalEditarOpen] = useState(false);
    const [modalCrearOpen, setModalCrearOpen] = useState(false);
    const [modalAdvertOpen, setModalAdvertOpen] = useState(false);
    const [modalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalErrorOpen, setModalErrorOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any>(null);
    const [vistaGrid, setVistaGrid] = useState(true);
    const [idusuario, setIdUsuario] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const res = await getUsuariosPaginated({ page, limit, search });
            setUsuarios(res.data.data ?? []);
            setTotalPages(res.data.totalPages ?? 1);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            setModalMessage('Error al obtener los usuarios');
            setModalErrorOpen(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, [page, limit, search]);

    const handleAnularUsuario = async () => {
        if (!usuarioSeleccionado) return;

        try {

            await deleteUsuario(usuarioSeleccionado.idusuarios);

            setModalAdvertOpen(false);
            setModalMessage('  Usuario anulado correctamente');
            setModalSuccessOpen(true);
            fetchUsuarios();
        } catch (error) {
            setModalAdvertOpen(false);
            setModalMessage('  Error al anular usuario');
            setModalErrorOpen(true);
            console.error(error);
        }
    };

    const handleEditarUsuario = (idUsuario: number) => {
        setIdUsuario(idUsuario);
        setModalEditarOpen(true);
    }

    const getEstadoBadgeColor = (estado: string) => {
        if (estado === 'activo') return 'bg-green-100 text-green-700 border-green-300';
        return 'bg-red-100 text-red-700 border-red-300';
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6 sm:py-8 px-4 sm:px-6 lg:px-8" style={{ scrollbarGutter: 'stable' }}>
            <div className="max-w-7xl mx-auto">
                {renderTitle({
                    title: "Gestión de Usuarios",
                    subtitle: "Administra los accesos y permisos",
                    icon: <FaUserShield className="text-white text-3xl sm:text-4xl" />
                })}
                {/* Search and Actions Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-5 md:mb-6">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        <div className="relative w-full md:w-96">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por login, nombre o acceso..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className={styleSearchDark}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <ButtonGral text='Nuevo Usuario' onClick={() => setModalCrearOpen(true)} />
                            <SelectPage limit={limit} setLimit={setLimit} setPage={setPage} />
                            <ButtonGrid onClick={(isGrid) => setVistaGrid(isGrid)} vistaGrid={vistaGrid} />
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && usuarios.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <FaInfoCircle className="text-gray-400 text-5xl mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {search
                                ? 'No se encontraron usuarios con ese criterio de búsqueda'
                                : 'No hay usuarios registrados'}
                        </p>
                    </div>
                )}

                {/* Vista condicional: Grid o Lista */}
                {!loading && usuarios.length > 0 && (
                    <div className={vistaGrid ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "grid grid-cols-1 gap-4"}>
                        {usuarios.map((user) => (
                            <div
                                key={user.idusuarios}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-blue-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-500"
                            >
                                {/* Header con gradiente */}
                                <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-gray-700 dark:to-gray-800 text-white">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="bg-white/20 p-2 rounded-lg">
                                                <FaUser size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0 overflow-hidden">
                                                <h3 className="font-bold text-base truncate">{user.nombre} {user.apellido}</h3>
                                                <p className="text-xs opacity-90 truncate">@{user.login}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getEstadoBadgeColor(user.estado)} border-2 flex-shrink-0`}>
                                            {user.estado}
                                        </span>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-4 space-y-3">

                                    <CardText title='Rol/Acceso' text={user.acceso} containerClass={styleCardSmall} titleClass={styleTxtCards} textClass={styleTxtLabelBold} />

                                    {/* Acciones */}
                                    <div className="pt-3 border-t border-blue-100 flex gap-2">
                                        <button
                                            onClick={() => handleEditarUsuario(user.idusuarios)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                                            title="Editar"
                                        >
                                            <FaEdit />
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => {
                                                setUsuarioSeleccionado(user);
                                                setModalAdvertOpen(true);
                                            }}
                                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
                                            title="Anular"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Paginación */}
                {!loading && usuarios.length > 0 && (
                    <div className="mt-6">
                        <SelectPagination setPage={setPage} page={page} totalPages={totalPages} />
                    </div>
                )}
            </div>

            {/* Modales */}
            <ModalCrearUsuario
                isOpen={modalCrearOpen}
                onClose={() => setModalCrearOpen(false)}
                onSuccess={fetchUsuarios}
            />
            <ModalEditarUsuario
                isOpen={modalEditarOpen}
                onClose={() => setModalEditarOpen(false)}
                id={idusuario}
                onSuccess={fetchUsuarios} />
            <ModalAdvert
                isOpen={modalAdvertOpen}
                message={`¿Deseás anular al usuario "${usuarioSeleccionado?.login}"?`}
                onConfirm={handleAnularUsuario}
                onClose={() => setModalAdvertOpen(false)}
            />
            <ModalSuccess
                isOpen={modalSuccessOpen}
                message={modalMessage}
                onClose={() => setModalSuccessOpen(false)}
            />
            <ModalError
                isOpen={modalErrorOpen}
                message={modalMessage}
                onClose={() => setModalErrorOpen(false)}
            />
        </div>
    );
};

export default ListarUsuarios;
