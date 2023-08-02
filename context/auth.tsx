import React from "react";
import { router, useRootNavigationState, useSegments } from "expo-router";

import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
	webClientId:
		"754355741739-t7sec02ku3v1k0dt3opc4e2mktphq8m1.apps.googleusercontent.com",
});

async function onGoogleButtonPress() {
	// Check if your device supports Google Play
	await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
	// Get the users ID token
	const { idToken } = await GoogleSignin.signIn();

	// Create a Google credential with the token
	const googleCredential = auth.GoogleAuthProvider.credential(idToken);

	// Sign-in the user with the credential
	return auth().signInWithCredential(googleCredential);
}

export type User = FirebaseAuthTypes.User | null;

type Context = {
	signIn: (
		email: string,
		password: string
	) => Promise<FirebaseAuthTypes.UserCredential>;
	signOut: () => Promise<void>;
	user: User;
	signInWithGoogle: () => Promise<FirebaseAuthTypes.UserCredential>;
	createUser: (
		email: string,
		password: string
	) => Promise<FirebaseAuthTypes.UserCredential>;
	sendPasswordResetEmail: (email: string) => Promise<void>;
};

const AuthContext = React.createContext({} as Context);

// This hook can be used to access the user info.
export function useAuth() {
	return React.useContext(AuthContext);
}

// This hook will protect the route access based on user authentication.
function useProtectedRoute(user: User) {
	const segments = useSegments();
	const navigationState = useRootNavigationState();

	React.useEffect(() => {
		if (!navigationState?.key) {
			return;
		}

		const inAuthGroup = segments[0] === "(auth)";

		if (
			// If the user is not signed in and the initial segment is not anything in the auth group.
			!user &&
			!inAuthGroup
		) {
			// Redirect to the sign-in page.
			router.replace("/sign-in");
		} else if (user && inAuthGroup) {
			// Redirect away from the sign-in page.
			router.replace("/");
		}
	}, [user, segments, navigationState]);
}

export function AuthProvider(props: { children: React.ReactNode }) {
	// Set an initializing state whilst Firebase connects
	const [initializing, setInitializing] = React.useState(true);
	const [user, setUser] = React.useState<User>(null);

	// Handle user state changes
	function onAuthStateChanged(user: User) {
		// console.log("🚀 ~ file: auth.tsx:82 ~ onAuthStateChanged ~ user:", user);
		setUser(user);
		if (initializing) setInitializing(false);
	}

	React.useEffect(() => {
		const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
		return subscriber; // unsubscribe on unmount
	}, []);

	useProtectedRoute(user);

	if (initializing) return null;

	return (
		<AuthContext.Provider
			value={{
				user,
				signIn: async (email: string, password: string) =>
					auth().signInWithEmailAndPassword(email, password),
				signOut: () => auth().signOut(),
				signInWithGoogle: () => onGoogleButtonPress(),
				createUser: (email: string, password: string) =>
					auth().createUserWithEmailAndPassword(email, password),
				sendPasswordResetEmail: (email: string) =>
					auth().sendPasswordResetEmail(email),
			}}
		>
			{props.children}
		</AuthContext.Provider>
	);
}
