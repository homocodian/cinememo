import React from "react";
import { Portal, Snackbar } from "react-native-paper";

import { useSnackbar } from "./use-snackbar";

function SnackbarContainer() {
	const { Snackbars, dismiss } = useSnackbar();
	return (
		<Portal>
			{Snackbars.map(({ text, id, ...props }) => (
				<Snackbar
					key={id}
					{...props}
					className="mx-2"
					icon="close"
					onIconPress={() => {
						dismiss(id);
					}}
				>
					{text}
				</Snackbar>
			))}
		</Portal>
	);
}

export { SnackbarContainer };
