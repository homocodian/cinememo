import Google from "@mui/icons-material/Google";
import LockIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Alert,
  Avatar,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography
} from "@mui/material";
import Container from "@mui/material/Container";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router";
import { useShallow } from "zustand/react/shallow";

import { SESSION_TOKEN_KEY } from "@/constant/auth";
import { APIError } from "@/lib/api-error";
import { fetchAPI } from "@/lib/fetch-wrapper";
import { getAuthProviderURL } from "@/lib/get-auth-provider-url";
import { useAuthStore } from "@/store/auth";

interface InputFields {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
}

export default function SignUp() {
  const [values, setValues] = useState<InputFields>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
    showConfirmPassword: false
  });
  const [isError, setIsError] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser } = useAuthStore(
    useShallow((state) => ({ user: state.user, setUser: state.setUser }))
  );
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [searchParams] = useSearchParams();

  // check for user
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user]);

  useEffect(() => {
    if (searchParams.has("error")) {
      const error = searchParams.get("error");
      if (error) toast.error(error);
    }
  }, [searchParams]);

  const handleChange =
    (prop: keyof InputFields) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues({ ...values, [prop]: event.target.value });
    };

  const handleClickShowPassword = (
    prop: "showPassword" | "showConfirmPassword"
  ) => {
    setValues({
      ...values,
      [prop]:
        prop === "showPassword"
          ? !values.showPassword
          : !values.showConfirmPassword
    });
  };

  const handleSubmit = async () => {
    setShowPasswordRules(false);
    setIsError({
      fullName: false,
      email: false,
      password: false,
      confirmPassword: false
    });

    const [fullName, email, password, confirmPassword] = [
      values.fullName,
      values.email,
      values.password,
      values.confirmPassword
    ];

    if (email === "" || password === "" || confirmPassword === "") {
      setIsError({
        fullName: false,
        email: email === "" ? true : false,
        password: password === "" ? true : false,
        confirmPassword: confirmPassword === "" ? true : false
      });
      toast.error("Please fill all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setIsError({
        fullName: false,
        email: false,
        password: true,
        confirmPassword: true
      });
      toast.error("Password does not match.");
      return;
    }

    if (password.length < 8) {
      setIsError({
        fullName: false,
        email: false,
        password: true,
        confirmPassword: true
      });
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (fullName && fullName.length < 3) {
      setIsError({
        fullName: true,
        email: false,
        password: false,
        confirmPassword: false
      });
      toast.error("Name must be at least 3 characters long");
      return;
    }

    setIsLoading(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await fetchAPI.post("/v1/auth/register", {
        data: {
          email,
          password,
          fullName
        }
      });

      if (
        !data?.sessionToken ||
        !data.id ||
        !data.email ||
        typeof data.emailVerified !== "boolean"
      ) {
        throw new Error("Invalid Session");
      }

      localStorage.setItem(SESSION_TOKEN_KEY, data.sessionToken);

      setUser({
        id: data.id,
        email: data.email,
        emailVerified: data.emailVerified,
        photoURL: data?.photoURL,
        displayName: data?.displayName
      });

      navigate("/verify");
    } catch (error: unknown) {
      if (error instanceof APIError) {
        if (error.message.includes("Invalid password"))
          setShowPasswordRules(true);
        return toast.error(error.message);
      }
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    window.location.href = getAuthProviderURL("google");
  };

  return (
    <>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "16px"
          }}
        >
          {showPasswordRules ? (
            <Alert severity="error" variant="outlined">
              <ul>
                <li>Password must be 8 characters long.</li>
                <li>At least one digit.</li>
                <li>At least one of the allowed special symbols: !@#$%*&.</li>
                <li>At least one uppercase letter.</li>
                <li>At least one lowercase letter.</li>
                <li>No whitespaces.</li>
              </ul>
            </Alert>
          ) : (
            <>
              <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                <LockIcon />
              </Avatar>
              <Typography
                component="h1"
                variant="h5"
                sx={{ color: "text.primary" }}
              >
                Sign Up
              </Typography>
            </>
          )}
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            sx={{ mt: 1, mb: 3 }}
            id="signup-form"
          >
            <TextField
              value={values.fullName}
              error={isError.fullName}
              onChange={handleChange("fullName")}
              margin="normal"
              id="fullname"
              fullWidth
              label="Name"
              name="fullname"
              autoComplete="name"
              autoFocus
            />
            <TextField
              value={values.email}
              error={isError.email}
              onChange={handleChange("email")}
              margin="normal"
              id="email"
              required
              fullWidth
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              type="email"
            />
            <TextField
              value={values.password}
              error={isError.password}
              onChange={handleChange("password")}
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={values.showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => handleClickShowPassword("showPassword")}
                      edge="end"
                    >
                      {values.showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              name="confirm-password"
              label="Confirm Password"
              error={isError.confirmPassword}
              margin="normal"
              fullWidth
              required
              value={values.confirmPassword}
              onChange={handleChange("confirmPassword")}
              type={values.showConfirmPassword ? "text" : "password"}
              id="confirm-password"
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() =>
                        handleClickShowPassword("showConfirmPassword")
                      }
                      edge="end"
                    >
                      {values.showConfirmPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <div className="flex flex-col gap-3">
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                form="signup-form"
                type="submit"
                disabled={isLoading || isGoogleLoading}
              >
                Sign Up
              </Button>
              <div className="flex justify-center items-center gap-2">
                <div className="h-px w-full bg-gray-500"></div>
                <span className="text-primary-foreground">OR</span>
                <div className="h-px w-full bg-gray-500"></div>
              </div>
              <LoadingButton
                startIcon={<Google />}
                fullWidth
                variant="contained"
                type="button"
                disabled={isGoogleLoading}
                onClick={handleGoogleLogin}
                loading={isGoogleLoading}
              >
                Google
              </LoadingButton>
            </div>
            <Grid container>
              <Grid item sx={{ mt: 2 }}>
                <Link href="/login" variant="body2">
                  Already have an account? Sign In
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}
