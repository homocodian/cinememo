import { LoadingButton } from "@mui/lab";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  MenuItem,
  TextField,
  useMediaQuery
} from "@mui/material";
import Select from "@mui/material/Select";
import { useTheme } from "@mui/material/styles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { fetchAPI } from "@/lib/fetch-wrapper";

interface IProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

type AddNoteParams = {
  text: string;
  category: string;
};

function AddNoteModal({ open, setOpen }: IProps) {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const { mutateAsync, isPending, isError } = useMutation({
    mutationFn: (params: AddNoteParams) =>
      fetchAPI.post("/v1/notes", { data: params }),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    }
  });
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, [open]);

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const note = formData.get("note")?.toString();
    const category = formData.get("category")?.toString();

    if (note === "" || !note || !category || category === "") {
      return;
    }

    await mutateAsync({ text: note, category });
    formRef.current?.reset();
    handleClose();
  };

  return (
    <Dialog
      open={open}
      aria-labelledby="add note"
      fullScreen={fullScreen}
      fullWidth
      closeAfterTransition
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
        }
      }}
    >
      <DialogContent>
        <DialogContentText>Note</DialogContentText>
      </DialogContent>

      <DialogContent>
        <form onSubmit={onSubmit} id="note_form" ref={formRef}>
          <TextField
            id="todo"
            error={isError}
            multiline
            minRows={4}
            fullWidth
            name="note"
            label="Note"
            sx={{ marginBottom: "1rem" }}
            required
            inputRef={inputRef}
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
          >
            <MenuItem value={"general"}>General</MenuItem>
            <MenuItem value={"important"}>Important</MenuItem>
          </Select>
        </form>
      </DialogContent>

      <DialogActions>
        <Button variant="text" onClick={handleClose}>
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          form="note_form"
          variant="contained"
          loading={isPending}
          disableElevation
          ref={submitButtonRef}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export default AddNoteModal;
