import { useState } from "react";
import { Keyboard, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";

import { useNavigation } from "@react-navigation/native";

import { Colors } from "@/constant/colors";
import {
  SCREEN_HORIZONTAL_PADDING,
  SCREEN_VERTICAL_PADDING
} from "@/constant/screens";
import { useAppTheme } from "@/context/material-3-theme-provider";
import { API } from "@/lib/api";
import { APIError } from "@/lib/api-error";
import { toast } from "@/lib/toast";
import { validatePassword } from "@/lib/validations/password";

export function UpdateAccountPassword() {
  const theme = useAppTheme();
  const navigation = useNavigation();
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false
  });
  const [error, setError] = useState<{
    currentPassword: string | null;
    newPassword: string | null;
  }>({
    currentPassword: null,
    newPassword: null
  });
  const [isLoading, setIsLoading] = useState(false);

  function handleInputChange(key: keyof typeof passwords) {
    return (value: string) =>
      setPasswords((prev) => ({ ...prev, [key]: value }));
  }

  function handleEyePress(key: keyof typeof showPasswords) {
    return () => setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handlePasswordChange() {
    if (!passwords.currentPassword) {
      setError((prev) => ({ ...prev, currentPassword: "Required" }));
      return;
    } else {
      setError((prev) => ({ ...prev, currentPassword: null }));
    }

    if (!passwords.newPassword) {
      setError((prev) => ({ ...prev, newPassword: "Required" }));
      return;
    } else {
      setError((prev) => ({ ...prev, newPassword: null }));
    }

    const newPassword = validatePassword(passwords.newPassword);

    if (!newPassword.ok) {
      setError((prev) => ({ ...prev, newPassword: newPassword.error }));
      return;
    }

    setError({ currentPassword: null, newPassword: null });

    Keyboard.dismiss();
    setIsLoading(true);
    try {
      await API.patch("/v1/user/change-password", { data: passwords });
      toast("Password updated successfully");
      navigation.goBack();
    } catch (error) {
      if (error instanceof APIError) {
        if (error.status === 400 && error.message === "Incorrect password") {
          setError((prev) => ({ ...prev, currentPassword: error.message }));
        } else {
          setError((prev) => ({ ...prev, newPassword: error.message }));
        }
      } else {
        toast("Failed to update password. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View
      className="flex gap-6"
      style={{
        paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
        paddingVertical: SCREEN_VERTICAL_PADDING
      }}
    >
      <View className="flex space-y-2">
        <Text variant="headlineSmall" className="text-center font-bold">
          Update your password
        </Text>
        <Text
          variant="bodyMedium"
          className="text-center"
          style={{ color: theme.dark ? Colors.darkMuted : Colors.muted }}
        >
          Enter your current password and then your new password.
        </Text>
      </View>

      <View className="flex flex-col space-y-4">
        <View>
          <TextInput
            mode="outlined"
            value={passwords.currentPassword}
            onChangeText={handleInputChange("currentPassword")}
            placeholderTextColor={Colors.darkMuted}
            secureTextEntry={!showPasswords.currentPassword}
            autoCapitalize="none"
            autoCorrect={false}
            label="Current Password"
            right={
              !showPasswords.currentPassword ? (
                <TextInput.Icon
                  icon="eye"
                  onPress={handleEyePress("currentPassword")}
                />
              ) : (
                <TextInput.Icon
                  icon="eye-off"
                  onPress={handleEyePress("currentPassword")}
                />
              )
            }
            outlineStyle={{ borderRadius: theme.roundness * 2 }}
          />
          {error.currentPassword ? (
            <HelperText type="error">{error.currentPassword}</HelperText>
          ) : null}
        </View>
        <View>
          <TextInput
            mode="outlined"
            value={passwords.newPassword}
            onChangeText={handleInputChange("newPassword")}
            placeholderTextColor={Colors.darkMuted}
            secureTextEntry={!showPasswords.newPassword}
            autoComplete="off"
            importantForAutofill="no"
            autoCapitalize="none"
            autoCorrect={false}
            label="New Password"
            right={
              !showPasswords.newPassword ? (
                <TextInput.Icon
                  icon="eye"
                  onPress={handleEyePress("newPassword")}
                />
              ) : (
                <TextInput.Icon
                  icon="eye-off"
                  onPress={handleEyePress("newPassword")}
                />
              )
            }
            outlineStyle={{ borderRadius: theme.roundness * 2 }}
          />
          {error.newPassword ? (
            <HelperText type="error">{error.newPassword}</HelperText>
          ) : null}
        </View>
      </View>

      <Button
        mode="contained"
        loading={isLoading}
        onPress={handlePasswordChange}
        disabled={
          !passwords.currentPassword || !passwords.newPassword || isLoading
        }
      >
        Change Password
      </Button>
    </View>
  );
}
