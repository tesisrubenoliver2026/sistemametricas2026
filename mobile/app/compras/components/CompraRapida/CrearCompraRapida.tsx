import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import FormularioProducto from './FormularioProducto/FormularioProducto';
import ModalConfirmarProductos from './ModalsCompraRapida/ModalConfirmarProductos';
import TablaProductos from './TablaProductos';
import ModalComprobante from './ModalsCompraRapida/ModalComprobante';
import { createCompra } from 'services/compras';
import ModalError from 'components/ModalError';

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
            iva: p.iva
        }));

        try {
            await createCompra({
                compra,
                detalles: detallesFinales,
                productosNuevos,
                isNewProducto: true
            });

            onSuccess?.();
            onClose?.();

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

    return (
      <View className="bg-white h-[90%]" >
            <ScrollView 
                className=""
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
                showsVerticalScrollIndicator={true}
            >
                <View className="p-4">
                    <View className="flex-row items-center mb-4">
                        <Text className="text-3xl font-bold text-blue-800">Cargar Productos</Text>
                    </View>

                    <FormularioProducto onAgregar={agregarProducto} />

                    <TablaProductos
                        productos={productosNuevos}
                        onEditProducto={handleEditProducto}
                        onDeleteProducto={handleDeleteProducto}
                    />
                </View>
            </ScrollView>

            {/* Botón fijo en la parte inferior */}

                <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                    <View className="max-w-[1200px] mx-auto w-full">
                        <TouchableOpacity
                            onPress={() => setConfirmModalOpen(true)}
                            className="bg-green-600 px-6 py-3 rounded-lg shadow-md w-full items-center"
                        >
                            <Text className="text-white font-medium text-base">
                                💾 Registrar Producto(s) ({productosNuevos.length})
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

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
        </View>
    );
};

export default CrearCompraRapida;