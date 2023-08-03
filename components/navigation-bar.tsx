import React from "react";

// import { useAuth } from "@/context/auth";
// import { getInitials } from "@/utils/get-initials";
import {
	Appbar,
	// Avatar
} from "react-native-paper";
// import { stringToColour } from "@/utils/string-to-color";
import { getHeaderTitle } from "@react-navigation/elements";
import { DrawerHeaderProps } from "@react-navigation/drawer";

// const AVATAR_SIZE = 30;
// const AVATAR_DEFAULT_SIZE_BY_PAPER = 24;
// const CENTER_HEADER_TITLE = Math.abs(
// 	AVATAR_SIZE - AVATAR_DEFAULT_SIZE_BY_PAPER
// );

export default function NavigationBar(props: DrawerHeaderProps) {
	const title = getHeaderTitle(props.options, props.route.name);

	return (
		<Appbar.Header
		//  mode="center-aligned"
		>
			{/* <UserAvater {...props} /> */}
			<Appbar.Action icon="menu" onPress={props.navigation.toggleDrawer} />
			<Appbar.Content
				title={title}
				// titleStyle={{ marginRight: CENTER_HEADER_TITLE }}
			/>
		</Appbar.Header>
	);
}

// function UserAvater(props: DrawerHeaderProps) {
// 	const { user } = useAuth();

// 	if (!user || (user && !user.displayName && !user.email && !user.photoURL)) {
// 		return (
// 			<Appbar.Action
// 				size={AVATAR_SIZE}
// 				icon="menu"
// 				onPress={props.navigation.toggleDrawer}
// 			/>
// 		);
// 	}

// 	if (!user.photoURL) {
// 		const name = user.displayName ?? user.email ?? "Unknown";
// 		const label = getInitials(name);
// 		const bgColor = stringToColour(name);

// 		return (
// 			<Appbar.Action
// 				icon={(props) => (
// 					<Avatar.Text
// 						{...props}
// 						label={label}
// 						style={{
// 							backgroundColor: bgColor,
// 						}}
// 					/>
// 				)}
// 				size={AVATAR_SIZE}
// 				onPress={props.navigation.toggleDrawer}
// 			/>
// 		);
// 	}

// 	return (
// 		<Appbar.Action
// 			icon={(props) => (
// 				<Avatar.Image {...props} source={{ uri: user.photoURL! }} />
// 			)}
// 			size={AVATAR_SIZE}
// 			onPress={props.navigation.toggleDrawer}
// 		/>
// 	);
// }
