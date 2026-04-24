'use client';

import { useState } from 'react';
import FormularioProducto from './FormularioProducto/FormularioProducto';
import ModalConfirmarProductos from './ModalsCompraRapida/ModalConfirmarProductos';
import TablaProductos from './TablaProductos';
import ModalComprobante from './ModalsCompraRapida/ModalComprobante';
import { createCompra } from '../../../services/compras';
import ModalError from '../../../components/ModalError';
import { AlertTriangle } from 'lucide-react';
import { usuarioTieneFacturadorActivo } from '../../../services/facturador';

interface CrearCompraRapidaProps {
    onSuccess?: () => void;
    onClose?: () => void;
}

const CrearCompraRapida = ({ onSuccess, onClose }: CrearCompraRapidaProps) => {
    const [productosNuevos, setProductosNuevos] = useState<any[]>([]);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [productosError, setProductosError] = useState<any[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [comprobanteProductos, setComprobanteProductos] = useState<any[]>([]);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [comprobanteData, setComprobanteData] = useState({
        nro_factura: '',
        fecha: '',
        cantidadProductos: 0
    });

    const agregarProducto = (producto: any) => {
        const idtemp = `temp-${Date.now()}`;

        setProductosNuevos(prev => [
            ...prev,
            { ...producto, idtemp, idproveedor: 1 }
        ]);


    };

    const handleSubmit = async () => {
        try {
            const tieneFacturadorActivo = await usuarioTieneFacturadorActivo();
            if (!tieneFacturadorActivo) {
                setErrorMessage('No tenes un facturador activo para tu usuario. No se puede registrar la compra.');
                setProductosError([]);
                setErrorModalOpen(true);
                return;
            }
        } catch (error) {
            console.error('Error al validar facturador activo:', error);
            setErrorMessage('No se pudo validar el facturador activo del usuario.');
            setProductosError([]);
            setErrorModalOpen(true);
            return;
        }
        //   Validar que todos los productos tengan número de lote
        const productosSinLote = productosNuevos.filter(p => !p.numero_lote || p.numero_lote.trim() === '');
        if (productosSinLote.length > 0) {
            const nombresProductos = productosSinLote.map(p => p.nombre_producto).join(', ');
            setErrorMessage(`Los siguientes productos requieren un número de lote: ${nombresProductos}`);
            setErrorModalOpen(true);
            return;
        }

        const compra = {
            idproveedor: 1,
            nro_factura: '00001',
            fecha: new Date().toISOString().split('T')[0],
            tipo: 'contado',
            estado: 'pagado',
            descuento: 0,
            observacion: 'Inventario inicial',
            fecha_vencimiento: ''
        };

        const detallesFinales = productosNuevos.map((p) => ({
            idproducto: p.idtemp,
            cantidad: p.cantidad,
            precio: p.precio_compra,
            fecha_vencimiento: p.fecha_vencimiento || '',
            nombre_producto: p.nombre_producto,
            unidad_medida: p.unidad_medida,
            iva: p.iva,
            numero_lote: p.numero_lote || '',
            referencia_proveedor: p.referencia_proveedor || '',
            ubicacion_almacen: p.ubicacion_almacen || 'PRINCIPAL'
        }));

        try {
            await createCompra({
                compra,
                detalles: detallesFinales,
                productosNuevos,
                isNewProducto: true
            });

            onSuccess && onSuccess();
            onClose && onClose();

            setComprobanteData({
                nro_factura: compra.nro_factura,
                fecha: compra.fecha,
                cantidadProductos: productosNuevos.length
            });
            const copiaProductos = [...productosNuevos];
            setComprobanteProductos(copiaProductos);
            setSuccessModalOpen(true);
            setProductosNuevos([]);

        } catch (error: any) {
            console.error(error);

            setErrorMessage(error.response?.data.error || 'Error al registrar compra rápida');
            const productosDuplicados = error.response?.data.productosDuplicados;
            const productosConError = error.response?.data.productosConError;

            if (productosDuplicados) {
                setProductosError(productosDuplicados);
            } else if (productosConError) {
                setProductosError(productosConError);
            } else {
                setProductosError([]);
            }

            setErrorModalOpen(true);
        }
    };


    const handleEditProducto = (index: number, field: string, value: string) => {
        setProductosNuevos(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };
    const handleDeleteProducto = (index: number) => {
        setProductosNuevos(prev => prev.filter((_, i) => i !== index));

    };

    // Calcular totales
    const totalProductos = productosNuevos.length;
    const totalCantidad = productosNuevos.reduce((sum, p) => sum + (parseFloat(p.cantidad) || 0), 0);
    const totalValor = productosNuevos.reduce((sum, p) => sum + ((parseFloat(p.cantidad) || 0) * (parseFloat(p.precio_compra) || 0)), 0);
    const dataHeader = {
        totalProductos,
        totalCantidad,
        totalValor
    };

    return (
        <div className="w-full 2xl:p-3 lg:p-2 md:p-2">
            <div className="">
                <div className='flex flex-row gap-6 lg:gap-2 md:gap-2'>
                    {/* Formulario de Producto */}
                    <div className="">
                        <FormularioProducto dataHeader = {dataHeader} onAgregar={agregarProducto} onShowModalConfirm={setConfirmModalOpen} productosNuevos={productosNuevos} />
                    </div>
                    {/* Tabla de Productos */}
                    <div>
                        {productosNuevos.length > 0 ? (
                            <div className=' rounded-2xl shadow-xl overflow-hidden w-auto'>
                                <div className=" bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg p-3">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-white truncate">Productos Agregados</h3>
                                            <div className='flex flex-row gap-3'>
                                                <p className='text-sm text-white mt-1 truncate'>Productos seleccionados:</p>
                                                <p className='text-white text-sm bg-blue-600 rounded-full px-2 py-1'>{productosNuevos.length}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto h-auto max-h-[600px] mt-2">
                                    <TablaProductos
                                        productos={productosNuevos}
                                        onEditProducto={handleEditProducto}
                                        onDeleteProducto={handleDeleteProducto}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg xl:p-0 md:p-0 lg:p-0 p-0 mb-6 border-2 border-blue-200 dark:border-gray-700 text-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="bg-blue-100 dark:bg-gray-700 p-6 rounded-full">
                                        <AlertTriangle className="text-blue-500 dark:text-blue-400" size={48} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl md:text-xs lg:text-xs xl:text-xs font-bold text-slate-700 dark:text-gray-100 mb-2">No hay productos agregados</h3>
                                        <p className="text-sm md:text-xs lg:text-xs xl:text-xs text-slate-600 dark:text-gray-400">Utilizá el formulario de arriba para agregar productos al inventario</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Modales */}
                <ModalError
                    showTable={true}
                    productos={productosError}
                    isOpen={errorModalOpen}
                    onClose={() => setErrorModalOpen(false)}
                    message={errorMessage}
                />
                <ModalConfirmarProductos
                    isOpen={confirmModalOpen}
                    onClose={() => setConfirmModalOpen(false)}
                    onConfirm={() => {
                        setConfirmModalOpen(false);
                        handleSubmit();
                    }}
                    productos={productosNuevos}
                />
                <ModalComprobante
                    isOpen={successModalOpen}
                    onClose={() => setSuccessModalOpen(false)}
                    datos={comprobanteData}
                    productos={comprobanteProductos}
                />
            </div>
        </div>
    );
};

export default CrearCompraRapida;
