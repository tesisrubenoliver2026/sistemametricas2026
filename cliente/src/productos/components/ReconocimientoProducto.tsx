import { useEffect, useRef, useState } from 'react';
import { useReconocimientoProducto } from '../../hooks/useReconocimientoProducto';
import type { ProductoReconocido } from '../../services/reconocimiento';

interface ReconocimientoProductoProps {
  isOpen: boolean;
  onClose: () => void;
  onProductoSeleccionado: (producto: ProductoReconocido) => void;
}

export const ReconocimientoProducto = ({
  isOpen,
  onClose,
  onProductoSeleccionado,
}: ReconocimientoProductoProps) => {
  const {
    imagenCapturada,
    isProcessing,
    resultado,
    error,
    videoRef,
    iniciarCamara,
    detenerCamara,
    capturarFoto,
    procesarImagen,
    seleccionarImagenArchivo,
    reiniciar,
  } = useReconocimientoProducto();

  const [modo, setModo] = useState<'camera' | 'upload'>('camera');
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      reiniciar();
      setModo('camera');
      setMostrarVistaPrevia(false);
    }
    return () => {
      if (modo === 'camera') {
        detenerCamara();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (modo === 'camera' && mostrarVistaPrevia) {
      iniciarCamara();
    } else {
      detenerCamara();
    }
  }, [modo, mostrarVistaPrevia]);

  const handleCapturar = () => {
    const foto = capturarFoto();
    if (foto) {
      setMostrarVistaPrevia(false);
    }
  };

  const handleProcesar = async () => {
    if (!imagenCapturada) return;
    await procesarImagen(imagenCapturada);
  };

  const handleArchivoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await seleccionarImagenArchivo(file);
    }
  };

  const handleSeleccionar = (producto: ProductoReconocido) => {
    onProductoSeleccionado(producto);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Reconocimiento de Producto
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!imagenCapturada && !resultado && (
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setModo('camera')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    modo === 'camera'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Usar Cámara
                </button>
                <button
                  onClick={() => setModo('upload')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    modo === 'upload'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Subir Imagen
                </button>
              </div>

              {modo === 'camera' && (
                <div className="space-y-4">
                  {!mostrarVistaPrevia ? (
                    <button
                      onClick={() => setMostrarVistaPrevia(true)}
                      className="w-full py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 transition-colors"
                    >
                      <div className="flex flex-col items-center gap-2 text-gray-600 dark:text-gray-400">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-lg font-medium">Abrir Cámara</span>
                        <span className="text-sm">Toma una foto del producto</span>
                      </div>
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative bg-black rounded-xl overflow-hidden">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCapturar}
                          className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          Capturar
                        </button>
                        <button
                          onClick={() => setMostrarVistaPrevia(false)}
                          className="py-3 px-6 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {modo === 'upload' && (
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleArchivoChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 transition-colors"
                  >
                    <div className="flex flex-col items-center gap-2 text-gray-600 dark:text-gray-400">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-lg font-medium">Seleccionar Imagen</span>
                      <span className="text-sm">Busca una foto del producto en tu dispositivo</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {imagenCapturada && !resultado && (
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-2">
                <img
                  src={`data:image/jpeg;base64,${imagenCapturada}`}
                  alt="Vista previa"
                  className="w-full h-auto max-h-64 object-contain rounded-lg"
                />
              </div>

              <button
                onClick={handleProcesar}
                disabled={isProcessing}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Procesando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Buscar Producto
                  </>
                )}
              </button>

              <button
                onClick={reiniciar}
                className="w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Tomar otra foto
              </button>

              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {resultado && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="font-semibold text-blue-800 dark:text-blue-300">Producto Reconocido:</span>
                </div>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {resultado.productoReconocido}
                </p>
              </div>

              {resultado.productos.length > 0 ? (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Productos encontrados ({resultado.productos.length}):
                  </h3>
                  <div className="max-h-80 overflow-y-auto space-y-2">
                    {resultado.productos.map((producto) => (
                      <button
                        key={producto.idproducto}
                        onClick={() => handleSeleccionar(producto)}
                        className="w-full p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {producto.nombre_producto}
                              </h4>
                              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs rounded-full">
                                {producto.similitud}% coincidencia
                              </span>
                            </div>
                            {producto.nombre_categoria && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {producto.nombre_categoria}
                              </p>
                            )}
                            <div className="flex gap-4 mt-2 text-sm">
                              {producto.cod_barra && (
                                <span className="text-gray-600 dark:text-gray-400">
                                  Código: {producto.cod_barra}
                                </span>
                              )}
                              <span className="text-gray-600 dark:text-gray-400">
                                Stock: {producto.stock}
                              </span>
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                Gs. {Number(producto.precio_venta).toLocaleString('es-PY')}
                              </span>
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-center">
                  <svg className="w-12 h-12 mx-auto text-yellow-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-yellow-800 dark:text-yellow-300">
                    No se encontraron productos coincidentes
                  </p>
                </div>
              )}

              <button
                onClick={reiniciar}
                className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Buscar otro producto
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
