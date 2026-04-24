// src/ventas/index.tsx
import ListarVentas from "../../components/ListarVentas/ListarVentas"
import SidebarLayout from "../../components/SidebarLayout"
import ListarProveedores from "app/proveedor/components/ListarProveedores"
export default function Page() {

    return (
        <SidebarLayout>
            <ListarVentas />
        </SidebarLayout>
    )
}