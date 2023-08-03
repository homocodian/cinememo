import React from "react";
import {
	Image,
	View,
	Platform,
	ScrollView,
	KeyboardAvoidingView,
	Keyboard,
} from "react-native";
import { Link, useRouter } from "expo-router";

import {
	Button,
	HelperText,
	IconButton,
	Text,
	TextInput,
	Tooltip,
} from "react-native-paper";
import {
	registerAuthSchema,
	type RegisterAuthSchema,
} from "@/lib/validations/auth";
import { useAuth } from "@/context/auth";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Snackbar } from "@/components/ui/use-snackbar";
import getAlertMessage from "@/utils/get-firebase-error-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/context/material-3-theme-provider";

const keyboardBehavoir = Platform.OS === "ios" ? "padding" : "height";

function Register() {
	const insets = useSafeAreaInsets();
	const theme = useAppTheme();
	const router = useRouter();
	const { createUser, signInWithGoogle } = useAuth();
	const [isSecureEntry, setIsSecureEntry] = React.useState(true);
	const [isSecureEntryForConfirm, setIsSecureEntryForConfirm] =
		React.useState(true);
	const [isLoading, setIsLoading] = React.useState(false);
	const [loadingGoogleSignIn, setLoadingGoogleSignIn] = React.useState(false);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterAuthSchema>({
		resolver: zodResolver(registerAuthSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	function handleBackButton() {
		if (router.canGoBack()) {
			router.back();
		} else {
			router.push("/sign-in");
		}
	}

	function handleEyePress() {
		setIsSecureEntry((prev) => !prev);
	}

	function handleEyePressOfConfirm() {
		setIsSecureEntryForConfirm((prev) => !prev);
	}

	async function handleGoogleSignIn() {
		Keyboard.dismiss();
		setLoadingGoogleSignIn(true);
		try {
			await signInWithGoogle();
		} catch (error) {
			Snackbar({
				text: "Something went wrong, please try again",
			});
		} finally {
			setLoadingGoogleSignIn(false);
		}
	}

	async function onSubmit(data: RegisterAuthSchema) {
		Keyboard.dismiss();
		setIsLoading(true);

		try {
			await createUser(data.email, data.password);
		} catch (error: any) {
			const message = getAlertMessage(error);
			Snackbar({
				text: message,
			});
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<KeyboardAvoidingView
			behavior={keyboardBehavoir}
			style={{
				flex: 1,
				// Paddings to handle safe area
				paddingTop: insets.top,
				paddingBottom: insets.bottom,
				paddingLeft: insets.left,
				paddingRight: insets.right,
			}}
		>
			<View className="flex justify-start items-center flex-row bg-transparent">
				<Tooltip title="Back">
					<IconButton
						icon="chevron-left"
						size={30}
						onPress={handleBackButton}
					/>
				</Tooltip>
			</View>

			<ScrollView
				contentContainerStyle={{
					display: "flex",
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					position: "relative",
					gap: 20,
				}}
				keyboardShouldPersistTaps="handled"
			>
				<View className="flex justify-center items-center gap-3 px-5">
					<Image
						source={require("@/assets/images/icon_light.png")}
						style={{
							width: 50,
							height: 50,
							tintColor: theme.colors.primary,
						}}
					/>
					<View className="flex gap-1">
						<Text
							// variant="titleMedium"
							className="text-center text-2xl font-bold"
						>
							Cinememo
						</Text>
						<Text variant="labelLarge" className="text-center">
							Create your account
						</Text>
					</View>
				</View>
				<View className="flex justify-between items-center  self-stretch px-5">
					<View className="self-stretch">
						<Controller
							control={control}
							rules={{
								required: true,
							}}
							render={({ field: { onChange, onBlur, value } }) => (
								<TextInput
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
									mode="outlined"
									label="Email"
									className="w-full"
									keyboardType="email-address"
									autoCapitalize="none"
								/>
							)}
							name="email"
						/>
						<HelperText type="error" visible={!!errors.email}>
							{errors.email?.message}
						</HelperText>
					</View>
					<View className="self-stretch">
						<Controller
							control={control}
							rules={{
								required: true,
							}}
							render={({ field: { onChange, onBlur, value } }) => (
								<TextInput
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
									mode="outlined"
									label="Password"
									className="w-full"
									secureTextEntry={isSecureEntry}
									autoCapitalize="none"
									right={
										isSecureEntry ? (
											<TextInput.Icon icon="eye" onPress={handleEyePress} />
										) : (
											<TextInput.Icon icon="eye-off" onPress={handleEyePress} />
										)
									}
								/>
							)}
							name="password"
						/>
						<HelperText type="error" visible={!!errors.password}>
							{errors.password?.message}
						</HelperText>
					</View>

					<View className="self-stretch">
						<Controller
							control={control}
							rules={{
								required: true,
							}}
							render={({ field: { onChange, onBlur, value } }) => (
								<TextInput
									onBlur={onBlur}
									onChangeText={onChange}
									value={value}
									mode="outlined"
									label="Confirm Password"
									className="w-full"
									secureTextEntry={isSecureEntryForConfirm}
									autoCapitalize="none"
									right={
										isSecureEntryForConfirm ? (
											<TextInput.Icon
												icon="eye"
												onPress={handleEyePressOfConfirm}
											/>
										) : (
											<TextInput.Icon
												icon="eye-off"
												onPress={handleEyePressOfConfirm}
											/>
										)
									}
								/>
							)}
							name="confirmPassword"
						/>
						<HelperText type="error" visible={!!errors.confirmPassword}>
							{errors.confirmPassword?.message}
						</HelperText>
					</View>

					<Button
						mode="contained"
						onPress={handleSubmit(onSubmit)}
						className="self-stretch mt-1"
						loading={isLoading}
						disabled={isLoading}
					>
						SIGN UP
					</Button>
				</View>
				<View className="flex-row items-center">
					<View
						className="flex-1 h-[0.5px]"
						style={{ backgroundColor: theme.colors.primary }}
					/>
					<View>
						<Text className="text-center w-10">OR</Text>
					</View>
					<View
						className="flex-1 h-[0.5px]"
						style={{ backgroundColor: theme.colors.primary }}
					/>
				</View>

				<Button
					mode="contained"
					icon="google"
					className="self-stretch mx-5"
					onPress={handleGoogleSignIn}
					loading={loadingGoogleSignIn}
					disabled={loadingGoogleSignIn}
				>
					SIGN IN WITH GOOGLE
				</Button>

				{/* terms */}
				<Text className="text-center px-5">
					By singing in you accept our{" "}
					<Link href="https://notes-ashish.netlify.app/">
						<Text className="text-blue-500 ml-2 underline">Terms of use</Text>
					</Link>{" "}
					and{" "}
					<Link href="https://notes-ashish.netlify.app/">
						<Text className="text-blue-500 ml-2 underline">Privary policy</Text>
					</Link>
				</Text>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

export default Register;
