import Masonry from "@mui/lab/Masonry";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import NoteSkeleton from "@/components/NoteSkeleton";
import NoteCard from "@/components/main/NoteCard";
import { fetchAPI } from "@/lib/fetch-wrapper";
import type { Note } from "@/types/notes";

import EmptyNote from "../EmptyNote";

function Notes() {
  const [searchParams] = useSearchParams();
  const { data: notes, isLoading } = useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: () => fetchAPI.get("/v1/notes")
  });

  const [searchedNotes, setSearchedNotes] = useState<Note[]>([]);

  const searchString = searchParams.get("q");

  useEffect(() => {
    const query = searchParams.get("q");

    if (!query) {
      return;
    }

    setSearchedNotes(
      (notes || []).filter((item) => {
        if (
          item.text?.toLocaleLowerCase()?.includes(query?.toLocaleLowerCase())
        ) {
          return item;
        }
      })
    );
  }, [searchParams, notes]);

  if (isLoading) {
    return <NoteSkeleton />;
  }

  return (
    <Fragment>
      {!notes ||
      notes.length <= 0 ||
      (searchedNotes.length <= 0 && searchString) ? (
        <EmptyNote />
      ) : (
        <div className="flex justify-center items-center">
          <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={1.5}>
            {(searchedNotes.length > 0 && searchParams.get("q")
              ? searchedNotes
              : notes
            ).map((note) => {
              return <NoteCard key={note.id} {...note} />;
            })}
          </Masonry>
        </div>
      )}
    </Fragment>
  );
}

export default Notes;
