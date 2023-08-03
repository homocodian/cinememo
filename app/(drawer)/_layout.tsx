import { Drawer } from "expo-router/drawer";

import DrawerContent from "@/components/drawer-content";
import NavigationBar from "@/components/navigation-bar";

export default function AppLayout() {
	return (
		<Drawer
			screenOptions={{
				header(props) {
					return <NavigationBar {...props} />;
				},
			}}
			drawerContent={DrawerContent}
			initialRouteName="index"
		>
			<Drawer.Screen name="index" options={{ title: "Home" }} />
			<Drawer.Screen name="details" options={{ title: "Details" }} />
		</Drawer>
	);
}
