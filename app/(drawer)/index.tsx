import React from "react";
import { Link } from "expo-router";
import { StyleSheet, Pressable, View } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { Text } from "react-native-paper";

export default function HomeScreen() {
	return (
		<React.Fragment>
			<View style={styles.container}>
				<Text style={styles.title}>Modal</Text>
				<View style={styles.separator} />
				<EditScreenInfo path="app/modal.tsx" />
				{/* @ts-expect-error */}
				<Link href={{ pathname: "details", params: { name: "Bacon" } }} asChild>
					<Pressable>
						<Text>Go to Details</Text>
					</Pressable>
				</Link>
			</View>
			{/* <CustomDrawer /> */}
		</React.Fragment>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
	},
	separator: {
		marginVertical: 30,
		height: 1,
		width: "80%",
	},
});
