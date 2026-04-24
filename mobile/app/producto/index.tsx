import SidebarLayout from '../../components/SidebarLayout';
import ListarProveedores from 'app/proveedor/components/ListarProveedores';
import ListarProductos from 'app/producto/components/ListarProductos';
export default function Page() {
  return (
    <SidebarLayout>
      <ListarProductos />
    </SidebarLayout>
  );
}
