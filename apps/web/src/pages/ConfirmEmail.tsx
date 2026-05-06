import ArrowForward from "@mui/icons-material/ArrowForward";
import { Box, IconButton } from "@mui/material";
import { styled } from "@mui/material";
import Typography from "@mui/material/Typography";
import React from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";

import { OTP } from "@/components/OtpInput";
import { APIError } from "@/lib/api-error";
import { fetchAPI } from "@/lib/fetch-wrapper";

const StyledLink = styled(Link)(({ theme }) => ({
  // Access theme properties here
  color: theme.palette.primary.main,
  "&:hover": {
    textDecoration: "underline"
  }
}));

function ConfirmEmail() {
  const [otp, setOtp] = React.useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = React.useCallback(async (code: string) => {
    if (!code) {
      toast.error("Please enter the code.");
      return;
    }

    if (code.length !== 8) {
      toast.error("Please enter a valid code.");
      return;
    }

    setIsLoading(true);
    try {
      await fetchAPI.post("/v1/auth/email-verification", {
        data: { code },
        responseType: "none"
      });
      navigate("/");
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (otp.length === 8) {
      handleSubmit(otp);
    }
  }, [otp]);

  return (
    <div className="h-full flex gap-12 flex-col justify-center items-center max-w-lg mx-auto">
      <div className="text-center">
        <Typography component="h1" variant="h3" sx={{ color: "text.primary" }}>
          Confirm your email
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            pt: "1.5rem"
          }}
        >
          <Typography
            component="p"
            variant="subtitle1"
            className="mt-4"
            sx={{ color: "text.primary" }}
          >
            We have sent you an email to confirm your email address.
          </Typography>
          <Typography
            component="p"
            variant="subtitle1"
            className="mt-4"
            sx={{ color: "text.primary" }}
          >
            Please check your inbox and enter your 8 digit code here.
          </Typography>
        </Box>
      </div>
      <OTP
        separator={
          <Typography component="span" sx={{ color: "text.primary" }}>
            -
          </Typography>
        }
        value={otp}
        onChange={setOtp}
        length={8}
        disabled={isLoading}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          paddingLeft: "1rem"
        }}
      >
        <StyledLink to="/">Skip</StyledLink>
        <Box
          sx={{
            height: "3em",
            width: "4em",
            display: "grid",
            placeContent: "center"
          }}
        >
          {isLoading ? (
            <LoadingElement />
          ) : (
            <IconButton aria-label="submit" onClick={() => handleSubmit(otp)}>
              <ArrowForward />
            </IconButton>
          )}
        </Box>
      </Box>
    </div>
  );
}

export default ConfirmEmail;

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025"
};

const LoadingElement = styled("span")(
  ({ theme }) => `
  border-radius: 50%;
  width: 2.5em;
  height: 2.5em;
  animation-fill-mode: both;
  animation: bblFadInOut 1.8s infinite ease-in-out;
  color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  font-size: 7px;
  position: relative;
  text-indent: -9999em;
  transform: translateZ(0);
  animation-delay: -0.16s;

  &:before, &:after {
    border-radius: 50%;
    width: 2.5em;
    height: 2.5em;
    animation-fill-mode: both;
    animation: bblFadInOut 1.8s infinite ease-in-out;
    content: '';
    position: absolute;
    top: 0;
  }

  &:before {
    left: -3.5em;
    animation-delay: -0.32s;
  }

  &:after {
    left: 3.5em;
  }

  @keyframes bblFadInOut {
    0%, 80%, 100% { box-shadow: 0 2.5em 0 -1.3em }
    40% { box-shadow: 0 2.5em 0 0 }
  }`
);
