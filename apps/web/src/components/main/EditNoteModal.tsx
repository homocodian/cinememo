import { SelectChangeEvent } from "@mui/material/Select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { updateNote } from "@/lib/update-note";

import { NoteFormModel } from "./NoteFormModel";

interface IProps {
  id: number;
  text: string;
  category: string;
  open: boolean;
  closeModal: (value: boolean) => void;
  isShared?: boolean;
}

function EditNoteModal({
  open,
  closeModal,
  id,
  text,
  category,
  isShared
}: IProps) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: updateNote,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    }
  });
  const [inputError, setInputError] = useState(false);
  const [note, setNote] = useState<string>(text);
  const [updateCategory, setUpdateCategory] = useState<string>(category);

  const handleChange = (event: SelectChangeEvent) => {
    setUpdateCategory(event.target.value);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setNote(event.target.value);
  };

  const handleClose = () => {
    setInputError(false);
    closeModal(false);
  };

  const handleUpdate = () => {
    if (!note || note === "") {
      setInputError(true);
      return;
    }
    mutateAsync({
      id,
      data: {
        text: note,
        category: updateCategory
      }
    }).finally(() => {
      handleClose();
    });
  };

  return (
    <NoteFormModel
      open={open}
      onCancel={handleClose}
      textFieldProps={{
        defaultValue: text,
        autoFocus: true,
        error: inputError,
        value: note,
        onChange: handleInputChange
      }}
      title="Edit Note"
      cancelButtonText="Cancel"
      submitButtonText="Update"
      submitButtonProps={{
        loading: isPending,
        onClick: handleUpdate,
        type: "button"
      }}
      cancelButtonProps={{
        disabled: isPending
      }}
    >
      {!isShared && (
        <NoteFormModel.CategorySelector
          categories={["general", "important"]}
          selectProps={{
            value: updateCategory,
            onChange: handleChange
          }}
        />
      )}
    </NoteFormModel>
  );
}

export default EditNoteModal;
