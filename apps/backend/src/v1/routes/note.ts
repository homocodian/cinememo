import bearer from "@elysiajs/bearer";
import Elysia from "elysia";
import { rateLimit } from "elysia-rate-limit";

import { rateLimiterkeyGenerator } from "@/libs/rate-limiter-key-generator";

import { createNote } from "../controllers/notes/create";
import { deleteNote } from "../controllers/notes/delete";
import { getNotes } from "../controllers/notes/get";
import { unshareNote } from "../controllers/notes/shared/delete";
import { getSharedNotes } from "../controllers/notes/shared/get";
import { getSharedWithByNoteId } from "../controllers/notes/shared/get-by-note-id";
import { removeUserFromSharedNote } from "../controllers/notes/shared/remove";
import { removeSharedNoteForMe } from "../controllers/notes/shared/remove-me";
import { shareNote } from "../controllers/notes/shared/share";
import { updateNote } from "../controllers/notes/update";
import { errorHandlerInstance } from "../utils/error-handler";
import { deriveUser } from "../utils/note/derive-user";
import {
  createNoteSchema,
  patchShareNoteWithUsersBody,
  shareNoteParams,
  shareNoteWithUsersSchema,
  updateNoteParamsSchema,
  updateNoteSchema
} from "../validations/note";

export const noteRoute = new Elysia({ prefix: "/notes" })
  .use(errorHandlerInstance)
  .use(bearer())
  .use(
    rateLimit({
      max: 50,
      scoping: "scoped",
      generator: rateLimiterkeyGenerator
    })
  )
  .derive(deriveUser)
  .get("/", getNotes)
  .get("/shared", getSharedNotes)
  .post("/", createNote, { body: createNoteSchema })
  .patch("/:id", updateNote, {
    body: updateNoteSchema,
    params: updateNoteParamsSchema
  })
  .delete("/:id", deleteNote, {
    params: updateNoteParamsSchema
  })
  .get("/:id/share", getSharedWithByNoteId, {})
  .post("/:id/share", shareNote, {
    body: shareNoteWithUsersSchema,
    params: shareNoteParams
  })
  .patch("/:id/share", removeUserFromSharedNote, {
    body: patchShareNoteWithUsersBody,
    params: shareNoteParams
  })
  .delete("/:id/share", unshareNote, {
    params: shareNoteParams
  })
  .delete("/:id/share/me", removeSharedNoteForMe, {
    params: shareNoteParams
  });
