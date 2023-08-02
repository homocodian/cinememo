import React from "react";
import { SnackbarProps } from "react-native-paper";

const SNACKBAR_LIMIT = 1;
const SNACKBAR_REMOVE_DELAY = 1000000;

type ToasterSnackbar = Pick<
	SnackbarProps,
	| "visible"
	| "action"
	| "icon"
	| "onIconPress"
	| "iconAccessibilityLabel"
	| "onDismiss"
	| "elevation"
	| "wrapperStyle"
	| "style"
	| "theme"
> & {
	id: string;
	text: string;
};

const actionTypes = {
	ADD_SNACKBAR: "ADD_SNACKBAR",
	UPDATE_SNACKBAR: "UPDATE_SNACKBAR",
	DISMISS_SNACKBAR: "DISMISS_SNACKBAR",
	REMOVE_SNACKBAR: "REMOVE_SNACKBAR",
} as const;

let count = 0;

function genId() {
	count = (count + 1) % Number.MAX_VALUE;
	return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
	| {
			type: ActionType["ADD_SNACKBAR"];
			Snackbar: ToasterSnackbar;
	  }
	| {
			type: ActionType["UPDATE_SNACKBAR"];
			Snackbar: Partial<ToasterSnackbar>;
	  }
	| {
			type: ActionType["DISMISS_SNACKBAR"];
			SnackbarId?: ToasterSnackbar["id"];
	  }
	| {
			type: ActionType["REMOVE_SNACKBAR"];
			SnackbarId?: ToasterSnackbar["id"];
	  };

interface State {
	Snackbars: ToasterSnackbar[];
}

const SnackbarTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (SnackbarId: string) => {
	if (SnackbarTimeouts.has(SnackbarId)) {
		return;
	}

	const timeout = setTimeout(() => {
		SnackbarTimeouts.delete(SnackbarId);
		dispatch({
			type: "REMOVE_SNACKBAR",
			SnackbarId: SnackbarId,
		});
	}, SNACKBAR_REMOVE_DELAY);

	SnackbarTimeouts.set(SnackbarId, timeout);
};

export const reducer = (state: State, action: Action): State => {
	switch (action.type) {
		case "ADD_SNACKBAR":
			return {
				...state,
				Snackbars: [action.Snackbar, ...state.Snackbars].slice(
					0,
					SNACKBAR_LIMIT
				),
			};

		case "UPDATE_SNACKBAR":
			return {
				...state,
				Snackbars: state.Snackbars.map((t) =>
					t.id === action.Snackbar.id ? { ...t, ...action.Snackbar } : t
				),
			};

		case "DISMISS_SNACKBAR": {
			const { SnackbarId } = action;

			// ! Side effects ! - This could be extracted into a dismissSnackbar() action,
			// but I'll keep it here for simplicity
			if (SnackbarId) {
				addToRemoveQueue(SnackbarId);
			} else {
				state.Snackbars.forEach((Snackbar) => {
					addToRemoveQueue(Snackbar.id);
				});
			}

			return {
				...state,
				Snackbars: state.Snackbars.map((t) =>
					t.id === SnackbarId || SnackbarId === undefined
						? {
								...t,
								visible: false,
						  }
						: t
				),
			};
		}
		case "REMOVE_SNACKBAR":
			if (action.SnackbarId === undefined) {
				return {
					...state,
					Snackbars: [],
				};
			}
			return {
				...state,
				Snackbars: state.Snackbars.filter((t) => t.id !== action.SnackbarId),
			};
	}
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { Snackbars: [] };

function dispatch(action: Action) {
	memoryState = reducer(memoryState, action);
	listeners.forEach((listener) => {
		listener(memoryState);
	});
}

interface Snackbar
	extends Omit<ToasterSnackbar, "id" | "visible" | "onDismiss" | "close"> {}

function Snackbar({ ...props }: Snackbar) {
	const id = genId();

	const update = (props: ToasterSnackbar) =>
		dispatch({
			type: "UPDATE_SNACKBAR",
			Snackbar: { ...props, id },
		});

	const dismiss = () => dispatch({ type: "DISMISS_SNACKBAR", SnackbarId: id });

	dispatch({
		type: "ADD_SNACKBAR",
		Snackbar: {
			...props,
			id,
			visible: true,
			onDismiss: () => dismiss(),
		},
	});

	return {
		id: id,
		dismiss,
		update,
	};
}

function useSnackbar() {
	const [state, setState] = React.useState<State>(memoryState);

	React.useEffect(() => {
		listeners.push(setState);
		return () => {
			const index = listeners.indexOf(setState);
			if (index > -1) {
				listeners.splice(index, 1);
			}
		};
	}, [state]);

	return {
		...state,
		Snackbar,
		dismiss: (SnackbarId?: string) =>
			dispatch({ type: "DISMISS_SNACKBAR", SnackbarId }),
	};
}

export { useSnackbar, Snackbar };
