import { View } from "react-native";
import SidebarLayout from "../../components/SidebarLayout";
import ListarUsuarios from "./ListarUsuario";

export default function Page() {
  return (
    <View style={{ flex: 1 }}>
      <SidebarLayout>
        <ListarUsuarios />
      </SidebarLayout>
    </View>
  );
}