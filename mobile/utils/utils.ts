export const formatPY = (
  value: string | number | null | undefined,
  withGs = true
): string => {
  if (value === null || value === undefined || value === '') return '--';


  const n = Number(value);

  if (isNaN(n)) return '--';           
  return n.toLocaleString('es-PY') + (withGs ? ' Gs' : '');
};

export const initialForm = {
    nombre: '',
    telefono: '',
    direccion: '',
    ruc: '',
    razon: '',
    estado: 'activo',
  };

 export const styleButton = "w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition";
// Configuración de selects para clientes
export const selectFieldsConfig = [
  {
    name: 'tipo',
    placeholder: 'Seleccione tipo de persona',
    options: [
      { value: 'FISICA', label: 'Física' },
      { value: 'JURIDICA', label: 'Jurídica' }
    ]
  },
  {
    name: 'genero',
    placeholder: 'Seleccione género',
    options: [
      { value: 'M', label: 'Masculino' },
      { value: 'F', label: 'Femenino' }
    ]
  },
  {
    name: 'tipo_cliente',
    placeholder: 'Seleccione tipo de cliente',
    options: [
      { value: 'MAYORISTA', label: 'Mayorista' },
      { value: 'MINORISTA', label: 'Minorista' }
    ]
  }
];

// Formulario inicial para clientes
export const initialFormCliente = {
  nombre: '',
  apellido: '',
  tipo: 'FISICA',
  numDocumento: '',
  telefono: '',
  direccion: '',
  genero: 'M',
  estado: 'activo',
  descripcion: '',
  tipo_cliente: 'MINORISTA',
};
