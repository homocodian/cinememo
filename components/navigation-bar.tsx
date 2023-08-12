import React from "react";

import { useAuth } from "@/context/auth";
import { getInitials } from "@/utils/get-initials";
import {
	Avatar,
	IconButton,
	Surface,
	Text,
	Tooltip,
	// TouchableRipple,
	useTheme,
} from "react-native-paper";
import { stringToColour } from "@/utils/string-to-color";
// import { getHeaderTitle } from "@react-navigation/elements";
import { DrawerHeaderProps } from "@react-navigation/drawer";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TOP_PADDING = 10;
const HORIZONTAL_PADDING = 10;

export default function NavigationBar(props: DrawerHeaderProps) {
	const insets = useSafeAreaInsets();
	const theme = useTheme();
	return (
		<View
			style={{
				paddingTop: insets.top + TOP_PADDING,
				paddingBottom: insets.bottom,
				paddingLeft: insets.left + HORIZONTAL_PADDING,
				paddingRight: insets.right + HORIZONTAL_PADDING,
			}}
		>
			<Surface className="flex-row items-center rounded-full overflow-hidden flex">
				<View className="self-end">
					<Tooltip title="Open navigation drawer">
						<IconButton
							icon="menu"
							onPress={() => {
								props.navigation.toggleDrawer();
							}}
						/>
					</Tooltip>
				</View>
				{/* <TouchableRipple className="absolute top-0 left-0 right-0 bottom-0"> */}
				<Text className="flex-1">Search</Text>
				{/* </TouchableRipple> */}
				<View className="self-end">
					<UserAvater {...props} />
				</View>
			</Surface>
		</View>
	);
}

const AVATAR_SIZE = 30;
// const AVATAR_DEFAULT_SIZE_BY_PAPER = 24;
// const CENTER_HEADER_TITLE = Math.abs(
// 	AVATAR_SIZE - AVATAR_DEFAULT_SIZE_BY_PAPER
// );

// export default function NavigationBar(props: DrawerHeaderProps) {
// 	const title = getHeaderTitle(props.options, props.route.name);

// 	return (
// 		<Appbar.Header
// 		//  mode="center-aligned"
// 		>
// 			{/* <UserAvater {...props} /> */}
// 			<Appbar.Action icon="menu" onPress={props.navigation.toggleDrawer} />
// 			<Appbar.Content
// 				title={title}
// 				// titleStyle={{ marginRight: CENTER_HEADER_TITLE }}
// 			/>
// 		</Appbar.Header>
// 	);
// }

function UserAvater(props: DrawerHeaderProps) {
	const { user } = useAuth();

	if (!user) {
		return <IconButton icon="account-question" />;
	}

	if (!user.photoURL) {
		const name = user.displayName ?? user.email ?? "Unknown";
		const label = getInitials(name);
		const bgColor = stringToColour(name);

		return (
			<IconButton
				icon={(props) => (
					<Avatar.Text
						{...props}
						label={label}
						style={{
							backgroundColor: bgColor,
						}}
					/>
				)}
				// size={AVATAR_SIZE}
				// onPress={props.navigation.toggleDrawer}
			/>
		);
	}

	return (
		<IconButton
			icon={() => (
				<Avatar.Image size={AVATAR_SIZE} source={{ uri: user.photoURL! }} />
			)}
			onPress={() => {}}
			// size={AVATAR_SIZE}
			// onPress={props.navigation.toggleDrawer}
		/>
	);
}
