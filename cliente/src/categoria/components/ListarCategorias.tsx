'use client';

import { useEffect, useState } from 'react';
import { getCategoryPaginated, deleteCategory } from '../../services/categorias';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaInfoCircle, FaCheck, FaTag } from 'react-icons/fa';
import ModalCrearCategoria from './ModalsCategorias/ModalCrearCategoria';
import ModalEditarCategoria from './ModalsCategorias/ModalEditarCategoria';
import ModalError from '../../components/ModalError';
import ModalSuccess from '../../components/ModalSuccess';
import ModalAdvert from '../../components/ModalAdvert';
import CardText from '../../ventas/components/CobroDeudaVenta/components/CardText';
import ButtonGrid from '../../components/ButtonGrid';
import SelectPage from '../../components/SelectPage';
import SelectPagination from '../../components/SelectPagination';
import { renderTitle } from '../../clientes/utils/utils';
import { styleSearchDark } from '../../components/utils/stylesGral';

interface ListarCategoriasProps {
    onSelect?: (categoria: any) => void;
}

const ListarCategorias = ({ onSelect }: ListarCategoriasProps) => {
    const [modalCrearCategoriaOpen, setModalCrearCategoriaOpen] = useState(false);
    const [categorias, setCategorias] = useState<any[]>([]);
    const [idCategoria, setIdCategoria] = useState<number | string>("");
    const [showEditModal, setShowEditModal] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [vistaGrid, setVistaGrid] = useState(true);
    const [loading, setLoading] = useState(false);

    const [modalAdvertOpen, setModalAdvertOpen] = useState(false);
    const [advertMessage, setAdvertMessage] = useState("");
    const [categoriaAEliminar, setCategoriaAEliminar] = useState<number | null>(null);


    const fetchCategorias = async () => {
        setLoading(true);
        try {
            const res = await getCategoryPaginated({ page, limit, search });
            setCategorias(res.data.data);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Error al obtener categorias:', error);
            setErrorMessage('Error al obtener las categorías');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        setCategoriaAEliminar(id);
        setAdvertMessage('¿Estás seguro de que deseas eliminar esta categoría?');
        setModalAdvertOpen(true);
    };

    const confirmarEliminacion = async () => {
        if (categoriaAEliminar === null) return;

        try {
            await deleteCategory(categoriaAEliminar);
            setSuccessMessage('  Categoría eliminada exitosamente');
            fetchCategorias();
        } catch (error) {
            console.error('Error al eliminar categoria:', error);
            setErrorMessage('  No se pudo eliminar la categoría');
        } finally {
            setModalAdvertOpen(false);
            setCategoriaAEliminar(null);
        }
    };

    const handleEdit = (id: number) => {
        setIdCategoria(id);
        setShowEditModal(true);
    };

    useEffect(() => {
        fetchCategorias();
    }, [page, limit, search]);

    return (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-6 sm:py-8 px-4 sm:px-6 lg:px-8" style={{ scrollbarGutter: 'stable' }}>
            <div className="max-w-7xl mx-auto">
                {renderTitle({
                    title: "Gestión de Categorías",
                    subtitle: "Administra las categorías de productos",
                    icon: <FaTag className="text-white text-3xl sm:text-4xl" />
                })}
                {/* Search and Actions Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-5 md:mb-6">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        <div className="relative w-full md:w-96">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre de categoría..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className={styleSearchDark}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setModalCrearCategoriaOpen(true)}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all font-medium"
                            >
                                <FaPlus />
                                Nueva Categoría
                            </button>
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
                {!loading && categorias.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <FaInfoCircle className="text-gray-400 text-5xl mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">
                            {search
                                ? 'No se encontraron categorías con ese criterio de búsqueda'
                                : 'No hay categorías registradas'}
                        </p>
                    </div>
                )}

                {/* Vista condicional: Grid o Lista */}
                {!loading && categorias.length > 0 && (
                    <div className={vistaGrid ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "grid grid-cols-1 gap-4"}>
                        {categorias.map((cat, idx) => (
                            <div
                                key={cat.idcategorias}
                                 className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-blue-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-500"
                            >
                                {/* Header con gradiente */}
                                <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-gray-700 dark:to-gray-800 text-white">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="bg-white/20 p-2 rounded-lg">
                                                <FaTag className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1 min-w-0 overflow-hidden">
                                                <h3 className="font-bold text-base truncate">{cat.categoria}</h3>
                                                <p className="text-xs opacity-90 truncate">#{(page - 1) * limit + idx + 1}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-4 space-y-3">
                                    {/* Datos con CardText */}
                                    <div className="grid grid-cols-1 gap-2">
                                        <CardText
                                            title="Nombre de Categoría"
                                            text={cat.categoria}
                                        />
                                    </div>

                                    {/* Acciones */}
                                    <div className="pt-3 border-t border-blue-100 flex gap-2">
                                        {onSelect ? (
                                            <button
                                                onClick={() => onSelect(cat)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                                            >
                                                <FaCheck />
                                                Seleccionar
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(cat.idcategorias)}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                                                    title="Editar"
                                                >
                                                    <FaEdit />
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.idcategorias)}
                                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
                                                    title="Eliminar"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Paginación */}
                {!loading && categorias.length > 0 && (
                    <div className="mt-6">
                        <SelectPagination setPage={setPage} page={page} totalPages={totalPages} />
                    </div>
                )}
            </div>

            {/* Modales */}
            <ModalCrearCategoria
                isOpen={modalCrearCategoriaOpen}
                onClose={() => setModalCrearCategoriaOpen(false)}
                onSuccess={() => {
                    fetchCategorias();
                    setSuccessMessage('  Categoría creada exitosamente');
                }}
            />
            <ModalEditarCategoria
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                id={idCategoria}
                onSuccess={() => {
                    fetchCategorias();
                    setSuccessMessage('  Categoría actualizada exitosamente');
                }}
            />

            <ModalAdvert
                isOpen={modalAdvertOpen}
                onClose={() => setModalAdvertOpen(false)}
                onConfirm={confirmarEliminacion}
                message={advertMessage}
                confirmButtonText="Sí, Eliminar"
            />

            <ModalSuccess
                isOpen={!!successMessage}
                onClose={() => setSuccessMessage("")}
                message={successMessage}
            />

            <ModalError
                isOpen={!!errorMessage}
                onClose={() => setErrorMessage("")}
                message={errorMessage}
            />
        </div>
    );
};

export default ListarCategorias;
