import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router";

import Loading from "@/components/Loading";
import { SESSION_TOKEN_KEY } from "@/constant/auth";
import { useAuthStore } from "@/store/auth";

export default function AuthRedirect() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user]);

  useEffect(() => {
    if (searchParams.has("error")) {
      const error = searchParams.get("error");
      if (error) toast.error(error);
      return;
    }

    const sessionToken = searchParams.get("sessionToken");
    const user = searchParams.get("user");

    if (sessionToken && user) {
      try {
        const userJson = JSON.parse(user);

        if (
          !userJson?.id ||
          !userJson?.email ||
          typeof userJson?.emailVerified !== "boolean" ||
          typeof userJson?.photoURL !== "string" ||
          (typeof userJson?.displayName !== "undefined" &&
            typeof userJson?.displayName !== "string") ||
          (typeof userJson?.photoURL !== "undefined" &&
            typeof userJson?.photoURL !== "string")
        ) {
          throw new Error("Invalid User");
        }
        localStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
        setUser(JSON.parse(user));
      } catch (error: unknown) {
        toast.error("Invalid User");
      }
    }
  }, [searchParams]);

  return <Loading />;
}
