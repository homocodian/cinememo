import ArrowBack from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router";

function NotFound() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        paddingTop: 15,
        display: "flex",
        flexDirection: "column",
        justifyItems: "center",
        alignItems: "center",
        gap: "1.5rem"
      }}
    >
      <Typography variant="h4" color={theme.palette.primary.main}>
        404
      </Typography>
      <Typography
        variant="h3"
        fontWeight="bold"
        color={theme.palette.text.primary}
      >
        Page not found
      </Typography>
      <Typography variant="body2" color={theme.palette.text.secondary}>
        Sorry, we couldn't find the page you're looking for or you are not
        authorized to see this page.
      </Typography>
      <Link to="/">
        <Button variant="contained" startIcon={<ArrowBack />}>
          Go back home
        </Button>
      </Link>
    </Box>
  );
}

export default NotFound;
