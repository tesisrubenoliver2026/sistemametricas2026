import {
  Squares2X2Icon,
  BuildingStorefrontIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  BookOpenIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { type ComponentType, type SVGProps } from 'react';

interface NavItem {
  name: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  path?: string;
  subItems?: {
    name: string;
    path: string;
  }[];
}

export const generateNavItems = (userRole: string | null): NavItem[] => {
  const allItems: NavItem[] = [
    {
      name: 'General',
      icon: Squares2X2Icon,
      subItems: [
        { name: 'Inicio', path: '/dashboard' },
        { name: 'Usuarios', path: '/usuario' },
        { name: 'Funcionarios', path: '/funcionarios' },
      ],
    },
    {
      name: 'Gestion',
      icon: BuildingStorefrontIcon,
      subItems: [
        { name: 'Proveedor', path: '/proveedor' },
        { name: 'Cliente', path: '/clientes' },
        { name: 'Productos', path: '/productos' },
        { name: 'Facturador', path: '/facturador' },
      ],
    },
    {
      name: 'Finanzas',
      icon: BanknotesIcon,
      subItems: [
        { name: 'Compras', path: '/compras' },
        { name: 'Ventas', path: '/ventas' },
        { name: 'Ventas Programadas', path: '/ventas/ventaProgramada' },
        { name: 'Cobro Ventas CrÃ©dito', path: '/ventas/cobrodeuda' },
        { name: 'Pago Compras CrÃ©dito', path: '/compras/cobrodeuda' },
        { name: 'Movimientos', path: '/movimiento/cierrecaja' },
        { name: 'Ingresos Varios', path: '/movimiento/ingreso' },
        { name: 'Egresos Varios', path: '/movimiento/egreso' },
      ],
    },
    {
      name: 'Contabilidad',
      icon: BookOpenIcon,
      subItems: [{ name: 'Libros Contables', path: '/contabilidad' }],
    },
    {
      name: 'RRHH',
      icon: UserGroupIcon,
      subItems: [
        { name: 'Empleados', path: '/empleados' },
        { name: 'Salarios', path: '/salarios' },
        { name: 'Asistencias', path: '/asistencia' },
        { name: 'Horas Extras', path: '/horas-extras' },
        { name: 'Comisiones', path: '/comisiones' },
        { name: 'Amonestaciones', path: '/amonestaciones' },
        { name: 'Bonos/Descuentos', path: '/movimientos-rrhh' },
        { name: 'Liquidaciones', path: '/liquidaciones' },
      ],
    },
    {
      name: 'Configuración',
      icon: Cog6ToothIcon,
      subItems: [
        { name: 'Configuración', path: '/configuracion' },
        { name: 'Email', path: '/configuracion/email' },
      ],
    },
  ];

  if (userRole === 'Administrador') return allItems;

  if (userRole === 'Cajero' || userRole === 'Vendedor') {
    return allItems.filter((item) => item.name === 'Finanzas');
  }

  if (userRole === 'Gerente' || userRole === 'Supervisor') {
    return allItems.filter(
      (item) =>
        item.name === 'Finanzas' ||
        item.name === 'GestiÃ³n' ||
        item.name === 'Contabilidad' ||
        item.name === 'RRHH',
    );
  }

  if (userRole === 'Almacenero') {
    return allItems.filter((item) => item.name === 'GestiÃ³n');
  }

  return [];
};

export const accesoOptions = [
  { value: 'Administrador', label: 'Administrador' },
  { value: 'Cajero', label: 'Cajero' },
  { value: 'Auditor', label: 'Auditor' },
];

export const estadoOptions = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
];
