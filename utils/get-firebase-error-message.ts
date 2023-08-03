export default function getAlertMessage(error: any) {
	if (!error?.code) {
		return "Something went wrong, please try again";
	}

	switch (error.code) {
		case "auth/wrong-password":
			return "Invalid email or password";

		case "auth/user-not-found":
			return "Invalid email or password";

		case "auth/invalid-email":
			return "Invalid email";

		case "auth/email-already-in-use":
			return "User already exists, use another email or login with the same";

		case "auth/too-many-requests":
			return "Too many attempts for this account, please try later or reset your password to immediately restore";

		default:
			return "Something went wrong, please try again";
	}
}
