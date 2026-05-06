import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

import { fetchAPI } from "@/lib/fetch-wrapper";

import { NoteFormModel } from "./NoteFormModel";

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
  const { mutateAsync, isPending, isError } = useMutation({
    mutationFn: (params: AddNoteParams) =>
      fetchAPI.post("/v1/notes", { data: params }),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    }
  });
  const formRef = useRef<HTMLFormElement | null>(null);

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
    <NoteFormModel
      ref={formRef}
      onSubmit={onSubmit}
      onCancel={handleClose}
      open={open}
      title="Add Note"
      cancelButtonText="Cancel"
      submitButtonText="Submit"
      submitButtonProps={{ loading: isPending }}
      textFieldProps={{
        error: isError
      }}
    >
      <NoteFormModel.CategorySelector categories={["general", "important"]} />
    </NoteFormModel>
  );
}

export default AddNoteModal;
