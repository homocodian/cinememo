import React from "react";
import { useFonts } from "expo-font";
import { Slot, SplashScreen } from "expo-router";

import { AuthProvider } from "@/context/auth";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Material3ThemeProvider } from "@/context/material-3-theme-provider";
// Catch any errors thrown by the Layout component.
export { ErrorBoundary } from "expo-router";

import "@/styles/global.css";

export const unstable_settings = {
	initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

let splashScreenTimout: NodeJS.Timeout | undefined;

export default function RootLayout() {
	const [loaded, error] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	// Expo Router uses Error Boundaries to catch errors in the navigation tree.
	React.useEffect(() => {
		if (error) throw error;
	}, [error]);

	React.useEffect(() => {
		if (loaded) {
			splashScreenTimout = setTimeout(() => {
				SplashScreen.hideAsync();
			}, 1500);
		}

		return function cleanup() {
			if (splashScreenTimout) {
				clearTimeout(splashScreenTimout);
			}
		};
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return <RootLayoutNav />;
}

function RootLayoutNav() {
	return (
		<SafeAreaProvider>
			<Material3ThemeProvider>
				<AuthProvider>
					<Slot />
				</AuthProvider>
			</Material3ThemeProvider>
		</SafeAreaProvider>
	);
}
