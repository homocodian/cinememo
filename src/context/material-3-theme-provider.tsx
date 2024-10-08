import React from "react";
import {
  adaptNavigationTheme,
  MD3DarkTheme,
  MD3LightTheme,
  MD3Theme,
  Provider as PaperProvider,
  ProviderProps,
  useTheme
} from "react-native-paper";

import {
  Material3Scheme,
  Material3Theme,
  useMaterial3Theme as useDefaultMaterial3Theme
} from "@pchmn/expo-material3-theme";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  Theme,
  ThemeProvider
} from "@react-navigation/native";
import { setBackgroundColorAsync } from "expo-system-ui";

import { useColorScheme } from "@/hooks/use-color-scheme";

type Material3ThemeProviderProps = {
  theme: Material3Theme;
  updateTheme: (sourceColor: string) => void;
  resetTheme: () => void;
  navigationTheme: Theme;
};

const Material3ThemeProviderContext =
  React.createContext<Material3ThemeProviderProps>(
    {} as Material3ThemeProviderProps
  );

export function Material3ThemeProvider({
  children,
  sourceColor,
  fallbackSourceColor,
  ...otherProps
}: ProviderProps & {
  sourceColor?: string;
  fallbackSourceColor?: string;
}) {
  const colorScheme = useColorScheme();

  // Material theme adaptive
  const { theme, updateTheme, resetTheme } = useDefaultMaterial3Theme({
    sourceColor,
    fallbackSourceColor
  });

  const { paperTheme, navigationTheme } = React.useMemo(() => {
    const paperThemeLight = { ...MD3DarkTheme, colors: theme.light };
    const paperThemeDark = { ...MD3LightTheme, colors: theme.dark };

    const navigationTheme = adaptNavigationTheme({
      reactNavigationLight: NavigationDefaultTheme,
      reactNavigationDark: NavigationDarkTheme,
      materialLight: paperThemeLight,
      materialDark: paperThemeDark
    });

    if (colorScheme === "dark") {
      return {
        paperTheme: paperThemeDark,
        navigationTheme: navigationTheme.DarkTheme
      };
    }

    return {
      paperTheme: paperThemeLight,
      navigationTheme: navigationTheme.LightTheme
    };
  }, [colorScheme, theme]);

  // Keep the root view background color in sync with the current theme
  React.useEffect(() => {
    setBackgroundColorAsync(navigationTheme.colors.background);
  }, [navigationTheme]);

  return (
    <Material3ThemeProviderContext.Provider
      value={{ theme, updateTheme, resetTheme, navigationTheme }}
    >
      <PaperProvider theme={paperTheme} {...otherProps}>
        <ThemeProvider value={navigationTheme}>{children}</ThemeProvider>
      </PaperProvider>
    </Material3ThemeProviderContext.Provider>
  );
}

export function useMaterial3Theme() {
  const ctx = React.useContext(Material3ThemeProviderContext);
  if (!ctx) {
    throw new Error(
      "useMaterial3Theme must be used inside Material3ThemeProvider"
    );
  }
  return ctx;
}

export const useAppTheme = useTheme<MD3Theme & { colors: Material3Scheme }>;
