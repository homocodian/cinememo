import { LoadingButton, LoadingButtonProps } from "@mui/lab";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  MenuItem,
  Select,
  SelectProps,
  TextField,
  TextFieldProps,
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { FormEventHandler, RefObject, useEffect, useRef } from "react";

type NoteFormModelProps = {
  title: string;
  cancelButtonText: string;
  onCancel: () => void;
  cancelButtonProps?: LoadingButtonProps;
  submitButtonText: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  open: boolean;
  submitButtonProps?: LoadingButtonProps;
  textFieldProps?: Omit<TextFieldProps, "inputProps">;
  ref?: RefObject<HTMLFormElement>;
  children?: React.ReactNode;
};

export function NoteFormModel(props: NoteFormModelProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log(inputRef.current);
      inputRef.current?.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <Dialog
      open={props.open}
      fullScreen={fullScreen}
      fullWidth
      closeAfterTransition
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          props.onCancel();
        }
      }}
    >
      <DialogContent>
        <DialogContentText>{props.title}</DialogContentText>
      </DialogContent>

      <DialogContent>
        <form onSubmit={props.onSubmit} id="note_form" ref={props.ref}>
          <TextField
            id="todo"
            multiline
            minRows={4}
            fullWidth
            name="note"
            label="Note"
            sx={{ marginBottom: "1rem" }}
            required
            inputRef={inputRef}
            {...props.textFieldProps}
            inputProps={{
              onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === "Enter") {
                  // stop propagation of the event if shift key is pressed
                  // to allow new line in the text area
                  // this is needed because something is preventing the default behavior of the text area
                  // and causing text area to prevent new line when shift+enter key is pressed
                  if (e.shiftKey) {
                    e.stopPropagation();
                    return;
                  }
                  e.preventDefault();
                  submitButtonRef.current?.click();
                }
              }
            }}
          />
          {props.children}
        </form>
      </DialogContent>

      <DialogActions>
        <Button
          variant="text"
          onClick={props.onCancel}
          {...props.cancelButtonProps}
        >
          {props.cancelButtonText}
        </Button>
        <LoadingButton
          type="submit"
          form="note_form"
          variant="contained"
          disableElevation
          ref={submitButtonRef}
          {...props.submitButtonProps}
        >
          {props.submitButtonText}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

type CategorySelectorProps = {
  categories: string[];
  selectProps?: Omit<SelectProps<string>, "inputProps" | "renderValue">;
};

function CategorySelector(props: CategorySelectorProps) {
  return (
    <Select
      sx={{ marginTop: "1rem" }}
      id="category"
      fullWidth
      name="category"
      defaultValue="general"
      inputProps={{ "aria-label": "select category" }}
      renderValue={(value) => (
        <Chip label={value} sx={{ textTransform: "capitalize" }} />
      )}
      {...props.selectProps}
    >
      {props.categories.map((category) => (
        <MenuItem key={category} value={category}>
          <span className="capitalize">{category}</span>
        </MenuItem>
      ))}
    </Select>
  );
}

NoteFormModel.CategorySelector = CategorySelector;
