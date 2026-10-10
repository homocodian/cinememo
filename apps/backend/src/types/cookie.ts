import type {
  Cookie as ElysiaCookie,
  ElysiaCookie as IElysiaCookie
} from "elysia/cookies";

export type CookieOptions = IElysiaCookie;
export type Cookie = Record<string, ElysiaCookie<unknown>> & {
  session: ElysiaCookie<string | undefined>;
};
