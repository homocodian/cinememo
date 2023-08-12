import React from "react";

import { useAuth } from "@/context/auth";
import { Divider, Drawer } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { useAppTheme } from "@/context/material-3-theme-provider";

export default function DrawerContent(props: DrawerContentComponentProps) {
	const active = props.state.index;
	const insets = useSafeAreaInsets();
	const { signOut } = useAuth();
	const theme = useAppTheme();

	function navigate(screen: string) {
		props.navigation.closeDrawer();
		props.navigation.navigate(screen);
	}

	return (
		<Drawer.Section
			title="Cinememo"
			style={{
				paddingTop: insets.top,
				backgroundColor: theme.colors.background,
				flex: 1,
			}}
			showDivider={false}
			theme={theme}
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
