import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Slot, SplashScreen } from "expo-router";

import {
	DarkTheme as NavigationDarkTheme,
	DefaultTheme as NavigationDefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { AuthProvider } from "@/context/auth";
import { PaperProvider, adaptNavigationTheme } from "react-native-paper";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useColorModeValue } from "@/utils/use-color-mode-value";
import { SafeAreaProvider } from "react-native-safe-area-context";

import "@/styles/global.css";

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from "expo-router";

const { LightTheme, DarkTheme } = adaptNavigationTheme({
	reactNavigationLight: NavigationDefaultTheme,
	reactNavigationDark: NavigationDarkTheme,
});

export const unstable_settings = {
	initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

let splashScreenTimout: NodeJS.Timeout | undefined;

export default function RootLayout() {
	const [loaded, error] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
		...FontAwesome.font,
	});

	// Expo Router uses Error Boundaries to catch errors in the navigation tree.
	useEffect(() => {
		if (error) throw error;
	}, [error]);

	useEffect(() => {
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
	const theme = useColorModeValue(LightTheme, DarkTheme);

	return (
		<PaperProvider>
			<ThemeProvider value={theme}>
				<SafeAreaProvider>
					<AuthProvider>
						<Slot />
					</AuthProvider>
				</SafeAreaProvider>
			</ThemeProvider>
		</PaperProvider>
	);
}
