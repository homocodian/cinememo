import { Masonry } from "@mui/lab";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import EmptyNote from "@/components/EmptyNote";
import NoteSkeleton from "@/components/NoteSkeleton";
import { NoteCard } from "@/components/main";
import { fetchAPI } from "@/lib/fetch-wrapper";
import { Note } from "@/types/notes";

function General() {
  const { data, isLoading } = useQuery<Note[]>({
    queryKey: ["notes", "general"],
    queryFn: () =>
      fetchAPI.get("/v1/notes", {
        query: {
          category: "general"
        }
      })
  });
  const [searchedNotes, setSearchedNotes] = useState<Note[]>([]);
  const [searchParams] = useSearchParams();

  const searchString = searchParams.get("q");

  useEffect(() => {
    const query = searchParams.get("q");

    if (!query || !data) {
      return;
    }

    setSearchedNotes(
      data.filter((item) => {
        if (item.text.toLocaleLowerCase().includes(query.toLocaleLowerCase())) {
          return item;
        }
      })
    );
  }, [searchParams, data]);

  return (
    <>
      {isLoading ? (
        <NoteSkeleton />
      ) : !data ||
        data.length <= 0 ||
        (searchedNotes.length <= 0 && searchString) ? (
        <EmptyNote />
      ) : (
        <div className="flex justify-center items-center">
          <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={2}>
            {(searchedNotes.length > 0 && searchParams.get("q")
              ? searchedNotes
              : data
            ).map((note) => {
              return <NoteCard key={note.id} {...note} />;
            })}
          </Masonry>
        </div>
      )}
    </>
  );
}

export default General;
