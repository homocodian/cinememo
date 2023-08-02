import React from "react";
import {
	Image,
	View,
	Platform,
	ScrollView,
	KeyboardAvoidingView,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/context/material-3-theme-provider";

const keyboardVerticalOffset = Platform.OS === "ios" ? 40 : 0;
const keyboardBehavoir = Platform.OS === "ios" ? "padding" : "height";

function Register() {
	const insets = useSafeAreaInsets();
	const theme = useAppTheme();
	const router = useRouter();
	const { signIn } = useAuth();
	const [isSecureEntry, setIsSecureEntry] = React.useState(true);
	const [isSecureEntryForConfirm, setIsSecureEntryForConfirm] =
		React.useState(true);
	const [isLoading, setIsLoading] = React.useState(false);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterAuthSchema>({
		resolver: zodResolver(registerAuthSchema),
		defaultValues: {
			email: "",
			password: "",
			firstName: "",
			lastName: "",
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

	function onSubmit(data: RegisterAuthSchema) {
		signIn({
			email: data.email,
			id: "1",
			displayName: `${data.firstName} ${data.lastName}`,
		});
	}

	return (
		<KeyboardAvoidingView
			behavior={keyboardBehavoir}
			keyboardVerticalOffset={keyboardVerticalOffset}
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
									label="First Name"
									className="w-full"
								/>
							)}
							name="firstName"
						/>
						<HelperText type="error" visible={!!errors.firstName}>
							{errors.firstName?.message}
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
									label="Last Name"
									className="w-full"
								/>
							)}
							name="lastName"
						/>
						<HelperText type="error" visible={!!errors.lastName}>
							{errors.lastName?.message}
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
									label="Email"
									className="w-full"
									keyboardType="email-address"
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
				<Button mode="contained" icon="google" className="self-stretch mx-5">
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
