import { router, useRootNavigationState, useSegments } from "expo-router";
import React from "react";

type User = {
	id: string;
	displayName: string;
	email: string;
};

type Context = {
	signIn: (User: User) => void;
	signOut: () => void;
	user: User | null;
};

const AuthContext = React.createContext({} as Context);

// This hook can be used to access the user info.
export function useAuth() {
	return React.useContext(AuthContext);
}

// This hook will protect the route access based on user authentication.
function useProtectedRoute(user: User | null) {
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
	const [user, setAuth] = React.useState<User | null>(null);

	useProtectedRoute(user);

	return (
		<AuthContext.Provider
			value={{
				signIn: (user: User) => setAuth(user),
				signOut: () => setAuth(null),
				user,
			}}
		>
			{props.children}
		</AuthContext.Provider>
	);
}
