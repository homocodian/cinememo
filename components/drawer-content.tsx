import React from "react";

import { Divider, Drawer } from "react-native-paper";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { getStatusBarHeight } from "@/utils/statusbar-height";
import { useAuth } from "@/context/auth";

const StatusBarHeight = getStatusBarHeight();

export default function DrawerContent(props: DrawerContentComponentProps) {
	const active = props.state.index;
	const { signOut } = useAuth();

	function navigate(screen: string) {
		props.navigation.closeDrawer();
		props.navigation.navigate(screen);
	}

	return (
		<Drawer.Section
			title="Cinememo"
			style={{ marginTop: StatusBarHeight }}
			showDivider={false}
		>
			<Drawer.Item
				label="Home"
				icon="home"
				active={active === 0}
				onPress={() => {
					navigate("index");
				}}
			/>
			<Drawer.Item
				label="Details"
				icon="details"
				active={active === 1}
				onPress={() => {
					navigate("details");
				}}
			/>
			<Divider className="my-2" />
			<Drawer.Item label="Sign Out" icon="logout" onPress={signOut} />
		</Drawer.Section>
	);
}
