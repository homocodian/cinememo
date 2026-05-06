import { Fragment, useEffect } from "react";
import { useNavigate } from "react-router";

import { useAuthStore } from "@/store/auth";

type PrivateRouteProps = {
  children: React.ReactNode;
};

function PrivateRoute({ children }: PrivateRouteProps) {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);
  return <Fragment>{children}</Fragment>;
}

export default PrivateRoute;
