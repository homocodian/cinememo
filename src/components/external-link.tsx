import React from "react";
import { Platform } from "react-native";

import { Link } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";

export function ExternalLink(
  props: Omit<React.ComponentProps<typeof Link>, "to"> & { href: string }
) {
  return (
    <Link
      {...props}
      to={props.href}
      onPress={(e) => {
        if (Platform.OS !== "web") {
          // Prevent the default behavior of linking to the default browser on native.
          e.preventDefault();
          // Open the link in an in-app browser.
          WebBrowser.openBrowserAsync(props.href as string);
        }
      }}
      target="_blank"
    />
  );
}
